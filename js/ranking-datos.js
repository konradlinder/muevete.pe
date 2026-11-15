/* Carga del ranking: desde Supabase si está configurado (js/config.js),
   si no, desde data/ranking.json. Devuelve siempre el mismo formato. */
(function(){
  const COLS = 'puesto,jugador,top_8,menor_top8,kings_jugados,kings_ganados,promedio,movimiento,foto_perfil,genero,categoria';

  async function desdeSupabase(db, limite){
    const p = new URLSearchParams({
      select: COLS,
      temporada: 'eq.' + db.temporada,
      eliminado: 'is.false',
      order: 'puesto.asc'
    });
    if (limite) p.set('limit', String(limite));
    const r = await fetch(db.url.replace(/\/$/,'') + '/rest/v1/ranking?' + p, {
      headers: { apikey: db.anonKey, Authorization: 'Bearer ' + db.anonKey }
    });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    return r.json();
  }

  async function desdeArchivo(limite){
    const r = await fetch('data/ranking.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('JSON ' + r.status);
    const d = (await r.json()).sort((a,b)=>a.puesto-b.puesto);
    return limite ? d.slice(0, limite) : d;
  }

  // Formato común para las páginas
  const normalizar = j => ({
    puesto: j.puesto,
    nombre: j.jugador,
    foto: j.foto_perfil || '',
    tendencia: j.movimiento > 0 ? 'sube' : j.movimiento < 0 ? 'baja' : '',
    movimiento: j.movimiento,
    top8: j.top_8,
    jugados: j.kings_jugados,
    ganados: j.kings_ganados,
    promedio: j.promedio,
    genero: j.genero || '',
    categoria: j.categoria || '',
    perfil: ''
  });

  window.cargarRanking = async function({ limite } = {}){
    const db = window.MUEVETE_DB || {};
    let filas;
    if (db.url && db.anonKey) {
      try { filas = await desdeSupabase(db, limite); }
      catch (e) { console.warn('No se pudo leer Supabase, uso respaldo:', e); filas = await desdeArchivo(limite); }
    } else {
      filas = await desdeArchivo(limite);
    }
    return filas.map(normalizar);
  };
})();
