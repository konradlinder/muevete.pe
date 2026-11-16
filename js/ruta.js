/* Rutas de muévete.pe
   - Comunidad (sin playa): /  /mi-cuenta  /ranking  /uma-go  /terminos-y-condiciones
   - Por playa:             /{playa}/inscripciones  /{playa}/bases  /{playa}/admin
                            /{playa}/ronda1  /{playa}/ronda1/campo3
   - Cortas (playa principal): /inscripciones  /bases  /admin  /ronda1  /ronda1/campo3
   {playa} es el campo "playa" de la tabla configuraciones (ej. sombrillas).
   Este archivo va primero en el <head> de todas las páginas. */
(function(){
  var PRINCIPAL = 'sombrillas';
  var SECCIONES = ['ronda','campo','index','inscripciones','bases','admin','ronda1','ronda2','mi-cuenta','ranking','uma-go','terminos-y-condiciones'];
  var partes = location.pathname.replace(/\.html$/,'').split('/').filter(Boolean).map(decodeURIComponent);
  var playa = PRINCIPAL;
  if (partes.length && SECCIONES.indexOf(partes[0]) < 0 && !/^(index)$/.test(partes[0])) { playa = partes.shift().toLowerCase(); }
  var q = new URLSearchParams(location.search);
  var ronda = null, campo = null, m;
  if (partes[0] && (m = /^ronda(\d+)$/.exec(partes[0]))) ronda = +m[1];
  if (partes[1] && (m = /^campo(\d+)$/.exec(partes[1]))) campo = +m[1];
  // compatibilidad con los enlaces antiguos (ronda.html?ronda=1&campo=3)
  if (!ronda && q.get('ronda')) ronda = +q.get('ronda');
  if (!campo && q.get('campo')) campo = +q.get('campo');
  if (q.get('playa')) playa = q.get('playa');

  var base = '/' + encodeURIComponent(playa);
  window.RUTA = {
    playa: playa,
    principal: PRINCIPAL,
    ronda: ronda,
    campo: campo,
    base: base,
    // RUTA.url('inscripciones') -> /sombrillas/inscripciones
    url: function(seccion){ return base + '/' + seccion; },
    ronda_url: function(r){ return base + '/ronda' + r; },
    campo_url: function(r, c){ return base + '/ronda' + r + '/campo' + c; }
  };

  // Los enlaces del HTML apuntan a la playa principal; si estamos en otra playa, se ajustan.
  if (playa !== PRINCIPAL) {
    var ajustar = function(){
      var pre = '/' + PRINCIPAL + '/';
      document.querySelectorAll('a[href^="' + pre + '"]').forEach(function(a){
        a.setAttribute('href', base + '/' + a.getAttribute('href').slice(pre.length));
      });
    };
    document.addEventListener('DOMContentLoaded', ajustar);
    window.addEventListener('load', ajustar);
  }

  // Si alguien empezó a crear o activar su cuenta y no terminó, lo llevamos a completarla
  try{
    if(localStorage.getItem('muevete.pendiente') && localStorage.getItem('muevete.sesion') && !/^\/mi-cuenta(\.html)?\/?$/.test(location.pathname)){
      location.replace('/mi-cuenta');
    }
  }catch(e){}
})();
