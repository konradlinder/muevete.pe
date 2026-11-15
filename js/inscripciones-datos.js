/* Datos de inscripciones (lectura pública: solo nombre, foto y estado de próximas fechas) */
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
  const headersDe = key => {
    const h = { apikey: key };
    if (key.startsWith('eyJ')) h.Authorization = 'Bearer ' + key;
    return h;
  };

  // Próxima fecha del calendario (proximos_eventos; respaldo data/fechas.json)
  window.proximaFecha = async function(){
    const ev = await window.cargarEventos({ limite: 1 });
    return ev.length ? ev[0].fecha : null;
  };

  // Configuración de una playa (tabla configuraciones) + estado de mantenimiento
  window.cargarConfig = async function(playa = 'sombrillas1'){
    const db = window.MUEVETE_DB || {};
    if (!db.url || !db.anonKey) throw new Error('Supabase no configurado');
    const p = new URLSearchParams({
      select: 'title,playa,ubicacion,evento,is_active,siguiente_fecha,asistencia_mesa,hora_fin,num_jugadores,num_espera',
      playa: 'in.(' + playa + ',"general mantenimiento")'
    });
    const r = await fetch(db.url.replace(/\/$/,'') + '/rest/v1/configuraciones?' + p, { headers: headersDe(db.anonKey) });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    const filas = await r.json();
    const c = filas.find(x => x.playa === playa) || null;
    const mant = filas.find(x => x.playa === 'general mantenimiento');
    return c && { ...c, mantenimiento: !!(mant && mant.is_active) };
  };

  // Fecha de hoy en Lima (AAAA-MM-DD)
  const hoyLima = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());

  // Próximos eventos (tabla proximos_eventos): no caducados, de hoy en adelante
  window.cargarEventos = async function({ limite = 5 } = {}){
    const db = window.MUEVETE_DB || {}, hoy = hoyLima();
    if (db.url && db.anonKey) {
      try {
        const p = new URLSearchParams({ select: 'fecha,dia,estado', caducado: 'is.false', fecha: 'gte.' + hoy, order: 'fecha.asc', limit: String(limite) });
        const r = await fetch(db.url.replace(/\/$/,'') + '/rest/v1/proximos_eventos?' + p, { headers: headersDe(db.anonKey) });
        if (!r.ok) throw new Error('Supabase ' + r.status);
        return (await r.json()).map(x => ({ fecha: x.fecha, dia: x.dia, evento: x.estado }));
      } catch (e) { console.warn('No se pudo leer proximos_eventos, uso respaldo:', e); }
    }
    const r = await fetch('data/fechas.json', { cache: 'no-cache' });
    return (await r.json()).filter(x => x.fecha >= hoy).sort((a,b) => a.fecha.localeCompare(b.fecha)).slice(0, limite);
  };

  // "06:30:00" -> "6:30 a. m."
  window.horaBonita = function(t){
    if (!t) return '';
    let [h, m] = t.split(':').map(Number); const pm = h >= 12; h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${pm ? 'p. m.' : 'a. m.'}`;
  };

  // ("06:30","10:30") -> "6:30 – 10:30 a. m."   ·   ("10:00","13:00") -> "10:00 a. m. – 1:00 p. m."
  window.horaRango = function(ini, fin){
    if (!fin) return window.horaBonita(ini);
    const a = window.horaBonita(ini), b = window.horaBonita(fin), sa = a.slice(-5), sb = b.slice(-5);
    return sa === sb ? `${a.slice(0,-6)} – ${b}` : `${a} – ${b}`;
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
    return (await r.json()).map(x => ({ id: x.id, nombre: x.jugador, foto: x.profile_picture ? window.fotoChica(x.profile_picture) : '', creado: x.created_at }));
  };

  // Cuántos inscritos activos hay (número público, sin datos de jugadores)
  window.contarInscritos = async function({ fecha, playa = 'sombrillas1' }){
    const db = window.MUEVETE_DB || {};
    if (!db.url || !db.anonKey) throw new Error('Supabase no configurado');
    const h = Object.assign({ 'Content-Type': 'application/json' }, headersDe(db.anonKey));
    const r = await fetch(db.url.replace(/\/$/,'') + '/rest/v1/rpc/conteo_inscritos', { method: 'POST', headers: h, body: JSON.stringify({ p_fecha: fecha, p_playa: playa }) });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    return +(await r.json());
  };
})();
