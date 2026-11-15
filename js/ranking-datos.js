/* Carga del ranking: desde Supabase si está configurado (js/config.js),
   si no, desde data/ranking.json. Devuelve siempre el mismo formato. */
(function(){
  // Fotos de Wix en miniatura (en vez de la foto original de varios MB)
  window.fotoChica = window.fotoChica || function(url, px = 96){
    if (!url) return '';
    let m = /^wix:image:\/\/v1\/([^/#]+)/.exec(url);
    let id = m ? m[1] : null;
    if (!id){ m = /^https:\/\/static\.wixstatic\.com\/media\/([^/?#]+)$/.exec(url); id = m ? m[1] : null; }
    if (!id) return url;
    const ext = (/\.(png|webp|gif)$/i.exec(id) || [,'jpg'])[1];
    return `https://static.wixstatic.com/media/${id}/v1/fill/w_${px},h_${px},al_c,q_80,enc_auto/foto.${ext}`;
  };
  window.fotoOriginal = function(url){
    const m = /^wix:image:\/\/v1\/([^/#]+)/.exec(url||'');
    return m ? 'https://static.wixstatic.com/media/' + m[1] : (url||'');
  };

  const COLS = 'puesto,jugador,top_8,menor_top8,kings_jugados,kings_ganados,promedio,movimiento,foto_perfil,genero,categoria';

  async function desdeSupabase(db, limite){
    const p = new URLSearchParams({
      select: COLS,
      temporada: 'eq.' + db.temporada,
      eliminado: 'is.false',
      order: 'puesto.asc'
    });
    if (limite) p.set('limit', String(limite));
    // Las claves nuevas (sb_publishable_...) van solo en "apikey".
    // Las anon antiguas (JWT, empiezan con "eyJ") también van en Authorization.
    const headers = { apikey: db.anonKey };
    if (db.anonKey.startsWith('eyJ')) headers.Authorization = 'Bearer ' + db.anonKey;
    const r = await fetch(db.url.replace(/\/$/,'') + '/rest/v1/ranking?' + p, { headers });
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
    foto: j.foto_perfil ? window.fotoChica(j.foto_perfil) : '',
    fotoGrande: j.foto_perfil ? window.fotoOriginal(j.foto_perfil) : '',
    tendencia: j.movimiento > 0 ? 'sube' : j.movimiento < 0 ? 'baja' : '',
    movimiento: j.movimiento,
    top8: j.top_8,
    menorTop8: j.menor_top8,
    jugados: j.kings_jugados,
    ganados: j.kings_ganados,
    promedio: j.promedio,
    genero: j.genero || '',
    categoria: j.categoria || '',
    perfil: ''
  });

  // Guarda la última copia en el navegador para mostrarla al instante en la próxima visita
  const CLAVE = 'muevete.ranking.v2';
  const leerCache = limite => {
    try {
      const c = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (!c || !Array.isArray(c.filas)) return null;
      return limite ? c.filas.slice(0, limite) : c.filas;
    } catch (e) { return null; }
  };
  const guardarCache = filas => { try { localStorage.setItem(CLAVE, JSON.stringify({ t: Date.now(), filas })); } catch (e) {} };

  async function traer(limite){
    const db = window.MUEVETE_DB || {};
    let filas;
    if (db.url && db.anonKey) {
      try { filas = await desdeSupabase(db, limite); }
      catch (e) { console.warn('No se pudo leer Supabase, uso respaldo:', e); filas = await desdeArchivo(limite); }
    } else {
      filas = await desdeArchivo(limite);
    }
    filas = filas.map(normalizar);
    if (!limite) guardarCache(filas);
    return filas;
  }

  /* cargarRanking({ limite, alActualizar })
     - Si hay una copia guardada, la devuelve al instante y luego trae la versión nueva;
       si cambió, llama a alActualizar(filasNuevas).
     - Si no hay copia, espera a la base de datos. */
  window.cargarRanking = async function({ limite, alActualizar } = {}){
    const cache = leerCache(limite);
    if (cache && cache.length) {
      traer(limite).then(nuevas => {
        if (alActualizar && JSON.stringify(nuevas) !== JSON.stringify(cache)) alActualizar(nuevas);
      }).catch(() => {});
      return cache;
    }
    return traer(limite);
  };
})();
