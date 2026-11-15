/* Datos de inscripciones (lectura pública: solo nombre, foto y estado de próximas fechas) */
(function(){
  const headersDe = key => {
    const h = { apikey: key };
    if (key.startsWith('eyJ')) h.Authorization = 'Bearer ' + key;
    return h;
  };

  // Próxima fecha del calendario (data/fechas.json). Una fecha "pasa" después de horaFin.
  window.proximaFecha = async function(horaFin = '14:00'){
    const r = await fetch('data/fechas.json', { cache: 'no-cache' });
    const lista = (await r.json()).map(x => x.fecha).sort();
    const [h, m] = horaFin.split(':').map(Number), ahora = new Date();
    return lista.find(f => { const [y,mo,d] = f.split('-').map(Number); return ahora < new Date(y, mo-1, d, h, m); }) || null;
  };

  // Configuración de una playa (tabla configuraciones) + estado de mantenimiento
  window.cargarConfig = async function(playa = 'sombrillas1'){
    const db = window.MUEVETE_DB || {};
    if (!db.url || !db.anonKey) throw new Error('Supabase no configurado');
    const p = new URLSearchParams({
      select: 'title,playa,ubicacion,evento,is_active,siguiente_fecha,asistencia_mesa,num_jugadores,num_espera',
      playa: 'in.(' + playa + ',"general mantenimiento")'
    });
    const r = await fetch(db.url.replace(/\/$/,'') + '/rest/v1/configuraciones?' + p, { headers: headersDe(db.anonKey) });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    const filas = await r.json();
    const c = filas.find(x => x.playa === playa) || null;
    const mant = filas.find(x => x.playa === 'general mantenimiento');
    return c && { ...c, mantenimiento: !!(mant && mant.is_active) };
  };

  // "06:30:00" -> "6:30 a. m."
  window.horaBonita = function(t){
    if (!t) return '';
    let [h, m] = t.split(':').map(Number); const pm = h >= 12; h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${pm ? 'p. m.' : 'a. m.'}`;
  };

  // Inscripciones no canceladas de una fecha y playa, en orden de llegada
  window.cargarInscritos = async function({ fecha, playa = 'sombrillas1' }){
    const db = window.MUEVETE_DB || {};
    if (!db.url || !db.anonKey) throw new Error('Supabase no configurado');
    const p = new URLSearchParams({
      select: 'id,jugador,profile_picture,lista_espera,created_at',
      fecha_evento: 'eq.' + fecha,
      playa: 'eq.' + playa,
      cancelado: 'is.false',
      order: 'created_at.asc'
    });
    const r = await fetch(db.url.replace(/\/$/,'') + '/rest/v1/inscripciones?' + p, { headers: headersDe(db.anonKey) });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    return (await r.json()).map(x => ({ id: x.id, nombre: x.jugador, foto: x.profile_picture || '', creado: x.created_at }));
  };
})();
