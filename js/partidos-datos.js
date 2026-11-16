/* Partidos de las rondas (lectura pública, sin DNI). Requiere js/config.js. */
(function(){
  const limpiar = t => (t || '').replace(/\s+/g, ' ').trim();

  window.cargarPartidos = async function({ ronda = 1, campo = null, playa = 'sombrillas1' } = {}){
    const db = window.MUEVETE_DB || {};
    if (!db.url || !db.anonKey) throw new Error('Supabase no configurado');
    const p = new URLSearchParams({
      select: 'id,ronda,campo,partido,jugador_a1,jugador_a2,score_a,score_b,jugador_b1,jugador_b2,jugadores,finalizado,finalizado_en,en_vivo,vivo_por,vivo_en,updated_at',
      ronda: 'eq.' + ronda,
      playa: 'eq.' + playa,
      order: 'campo.asc,partido.asc'
    });
    if (campo != null) p.set('campo', 'eq.' + campo);
    const h = { apikey: db.anonKey };
    if (db.anonKey.startsWith('eyJ')) h.Authorization = 'Bearer ' + db.anonKey;
    const r = await fetch(db.url.replace(/\/$/, '') + '/rest/v1/partidos?' + p, { headers: h, cache: 'no-store' });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    return (await r.json()).map(x => ({
      id: x.id,
      ronda: x.ronda,
      campo: x.campo,
      n: x.partido,
      a: [limpiar(x.jugador_a1), limpiar(x.jugador_a2)].filter(Boolean),
      b: [limpiar(x.jugador_b1), limpiar(x.jugador_b2)].filter(Boolean),
      pa: x.score_a,
      pb: x.score_b,
      fin: !!x.finalizado,
      jugadores: (x.jugadores || '').split(',').map(limpiar).filter(Boolean),
      finEn: x.finalizado_en ? Date.parse(x.finalizado_en) : null,
      vivo: !!x.en_vivo && !x.finalizado,
      vivoPor: x.vivo_por || '',
      vivoEn: x.vivo_en ? Date.parse(x.vivo_en) : null,
      act: x.updated_at
    }));
  };

  // Jugadores de un campo: los de la columna "jugadores" o, si falta, los que aparecen en los partidos
  window.jugadoresDelCampo = function(partidos){
    const conLista = partidos.find(p => p.jugadores.length);
    if (conLista) return conLista.jugadores;
    const s = new Set(); partidos.forEach(p => [...p.a, ...p.b].forEach(j => s.add(j)));
    return [...s];
  };
})();
