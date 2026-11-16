/* muévete.pe como web app:
   - registra el service worker (funciona sin conexión lo básico, ej. Uma Go)
   - con la app instalada en iPhone, el video de la portada ocupa también la franja de la hora;
     en el resto de páginas (y al bajar de la portada) esa franja queda azul
   - en la portada muestra "Instalar app" junto al ícono de arriba a la izquierda */
(function(){
  var AZUL = '#0051C2';
  var html = document.documentElement;

  // 1. Service worker
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); });
  }

  var instalada = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var esIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var portada = function(){ return document.getElementById('inicio'); };

  var css = document.createElement('style');
  css.textContent =
    '.franja-app{position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top,0px);background:' + AZUL + ';z-index:200;pointer-events:none;transition:opacity .2s}' +
    'html.sobre-portada .franja-app{opacity:0}' +
    '.instalar{position:fixed;z-index:21;top:calc(34px + env(safe-area-inset-top,0px));left:calc(92px + env(safe-area-inset-left,0px));display:flex;align-items:center;gap:6px;animation:instEntra .35s ease}' +
    '@keyframes instEntra{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}' +
    '.instalar .inst-btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px 0 13px;border:0;border-radius:999px;background:#FFDB03;color:#000;font:700 14px Poppins,system-ui,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.25);cursor:pointer;white-space:nowrap}' +
    '.instalar .inst-btn svg{width:18px;height:18px}' +
    '.instalar .inst-x{width:30px;height:30px;border:0;border-radius:50%;background:rgba(0,0,0,.35);color:#fff;display:grid;place-items:center;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.instalar .inst-x svg{width:13px;height:13px}' +
    '.inst-ayuda{position:fixed;z-index:22;left:calc(16px + env(safe-area-inset-left,0px));right:16px;top:calc(92px + env(safe-area-inset-top,0px));max-width:360px;background:#fff;color:#1A1D22;border-radius:18px;padding:16px 18px;box-shadow:0 12px 32px rgba(0,0,0,.25);font:500 14px/1.5 Poppins,system-ui,sans-serif}' +
    '.inst-ayuda b{font-weight:700}.inst-ayuda ol{margin:8px 0 0 18px;padding:0}.inst-ayuda li{margin:4px 0}' +
    '.inst-ayuda svg{width:17px;height:17px;vertical-align:-3px;color:' + AZUL + '}' +
    '.inst-ayuda .cerrar{display:block;margin:10px 0 0 auto;background:none;border:0;color:' + AZUL + ';font:700 14px Poppins,system-ui,sans-serif;cursor:pointer}' +
    '@media (max-width:980px){.instalar{top:calc(30px + env(safe-area-inset-top,0px));left:calc(80px + env(safe-area-inset-left,0px))}}';
  document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded', function(){
    // 2. Franja de la barra de estado (solo con la app instalada)
    if (instalada) {
      html.classList.add('app');
      var f = document.createElement('div'); f.className = 'franja-app'; f.setAttribute('aria-hidden', 'true');
      document.body.appendChild(f);
      var hero = portada();
      if (hero) {
        var revisar = function(){ html.classList.toggle('sobre-portada', window.scrollY < hero.offsetHeight - 40); };
        addEventListener('scroll', revisar, { passive: true }); addEventListener('resize', revisar); revisar();
      }
    }
    // 3. Aviso para instalar (solo en la portada)
    if (!instalada && portada()) prepararAviso();
  });

  var CLAVE = 'muevete.instalar.oculto';
  function ocultoReciente(){ try { return Date.now() - (+localStorage.getItem(CLAVE) || 0) < 14 * 864e5; } catch(e){ return false; } }

  var diferido = null;
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); diferido = e; if (portada() && !ocultoReciente()) mostrarAviso(); });
  window.addEventListener('appinstalled', function(){ quitar(); });

  function prepararAviso(){ if (esIOS && !ocultoReciente()) mostrarAviso(); }

  var ICO_DESCARGA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>';
  var ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICO_COMPARTIR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';

  var caja = null, ayuda = null;
  function mostrarAviso(){
    if (caja || !document.body) return;
    caja = document.createElement('div'); caja.className = 'instalar';
    caja.innerHTML = '<button class="inst-btn" type="button">' + ICO_DESCARGA + 'Instalar app</button>' +
                     '<button class="inst-x" type="button" aria-label="Ocultar">' + ICO_X + '</button>';
    document.body.appendChild(caja);
    caja.querySelector('.inst-btn').onclick = function(){
      if (diferido) { diferido.prompt(); diferido.userChoice.then(function(r){ if (r.outcome === 'accepted') quitar(); diferido = null; }); }
      else verAyudaIOS();
    };
    caja.querySelector('.inst-x').onclick = function(){ try { localStorage.setItem(CLAVE, Date.now()); } catch(e){} quitar(); };
  }
  function verAyudaIOS(){
    if (ayuda) { ayuda.remove(); ayuda = null; return; }
    ayuda = document.createElement('div'); ayuda.className = 'inst-ayuda'; ayuda.setAttribute('role', 'dialog');
    ayuda.innerHTML = '<b>Instala muévete.pe en tu iPhone</b><ol>' +
      '<li>Toca <b>Compartir</b> ' + ICO_COMPARTIR + ' en la barra del navegador.</li>' +
      '<li>Elige <b>Agregar a inicio</b> (desliza si no lo ves).</li>' +
      '<li>Toca <b>Agregar</b>. La app aparecerá en tu pantalla de inicio.</li></ol>' +
      '<button class="cerrar" type="button">entendido</button>';
    document.body.appendChild(ayuda);
    ayuda.querySelector('.cerrar').onclick = function(){ ayuda.remove(); ayuda = null; };
  }
  function quitar(){ if (caja) { caja.remove(); caja = null; } if (ayuda) { ayuda.remove(); ayuda = null; } }
})();
