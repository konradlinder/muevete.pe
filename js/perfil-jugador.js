/* Perfil público del jugador (popup).
   Uso: abrirPerfil({ nombre, foto, fotoGrande, puesto, top8, menorTop8, promedio, ganados })
        o abrirPerfil('Nombre Apellido') → busca sus datos en el ranking (requiere js/ranking-datos.js). */
(function(){
  var LOGO = '/img/logo-muevete.png';

  var css = document.createElement('style');
  css.textContent = [
    '.pj-fondo{position:fixed;inset:0;z-index:200;background:rgba(10,20,45,.55);display:grid;place-items:center;padding:20px;opacity:0;transition:opacity .2s;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}',
    '.pj-fondo.on{opacity:1}',
    '.pj{position:relative;width:100%;max-width:380px;max-height:calc(100vh - 40px);overflow:auto;background:#0058CA;color:#fff;border-radius:26px;padding:34px 28px 26px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.35);transform:translateY(12px) scale(.98);transition:transform .2s;font-family:Poppins,system-ui,sans-serif}',
    '.pj-fondo.on .pj{transform:none}',
    '.pj-x{position:absolute;top:14px;right:14px;width:42px;height:42px;border:0;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;display:grid;place-items:center;cursor:pointer;transition:background .15s}',
    '.pj-x:hover{background:rgba(255,255,255,.26)}',
    '.pj-x svg{width:20px;height:20px}',
    '.pj-foto{width:190px;height:190px;margin:0 auto;border-radius:50%;overflow:hidden;background:#3B73D6;box-shadow:0 0 0 5px rgba(255,255,255,.16)}',
    '.pj-foto img{width:100%;height:100%;object-fit:cover;display:block}',
    '.pj h2{font-size:28px;font-weight:700;line-height:1.15;margin:20px 0 18px;letter-spacing:-.01em}',
    '.pj-datos{display:grid;gap:6px;text-align:left}',
    '.pj-dato{display:flex;align-items:center;justify-content:space-between;gap:12px;background:rgba(255,255,255,.08);border-radius:12px;height:46px;padding:0 16px;font-size:16px;font-weight:600}',
    '.pj-dato b{color:#FFDD00;font-size:18px;font-weight:700}',
    '.pj-sin{background:rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;font-size:14px;font-weight:500;color:#D6E2FA}',
    '.pj-logo{width:130px;height:auto;margin:22px auto 0;display:block}',
    '@media (max-width:420px){.pj{padding:30px 20px 22px}.pj-foto{width:160px;height:160px}.pj h2{font-size:25px}}'
  ].join('\n');
  document.head.appendChild(css);

  var sinTildes = function(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim().toLowerCase(); };
  var num = function(n){ return (n===''||n==null||isNaN(n)) ? '–' : Number(n).toLocaleString('es-PE',{maximumFractionDigits:0,useGrouping:false}); };
  var esc = function(t){ return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); };

  var ranking = null;
  function buscar(nombre){
    if (!window.cargarRanking) return Promise.resolve(null);
    var p = ranking ? Promise.resolve(ranking) : window.cargarRanking().then(function(r){ ranking = r; return r; });
    return p.then(function(r){
      var k = sinTildes(nombre);
      return r.find(function(j){ return sinTildes(j.nombre) === k; }) || null;
    }).catch(function(){ return null; });
  }

  var abierto = null, anterior = null;
  function cerrar(){
    if (!abierto) return;
    var f = abierto; abierto = null;
    f.classList.remove('on');
    document.removeEventListener('keydown', tecla);
    setTimeout(function(){ f.remove(); document.documentElement.style.overflow=''; }, 200);
    if (anterior && anterior.focus) anterior.focus();
  }
  function tecla(e){ if (e.key === 'Escape') cerrar(); }

  function pintar(fondo, j, cargando){
    var foto = j.fotoGrande || j.foto || '/img/avatar.png';
    var datos = (j.puesto != null)
      ? '<div class="pj-datos">' +
          '<div class="pj-dato">Puesto <b>' + num(j.puesto) + '</b></div>' +
          '<div class="pj-dato">Top 8 Umas <b>' + num(j.top8) + '</b></div>' +
          '<div class="pj-dato">Menor Top 8 <b>' + num(j.menorTop8) + '</b></div>' +
          '<div class="pj-dato">Prom. temporada <b>' + num(j.promedio) + '</b></div>' +
          '<div class="pj-dato">Umas ganados <b>' + num(j.ganados) + '</b></div>' +
        '</div>'
      : '<div class="pj-sin">' + (cargando ? 'Cargando…' : 'Todavía no tiene puntaje en el ranking de esta temporada.') + '</div>';
    fondo.querySelector('.pj-cuerpo').innerHTML =
      '<div class="pj-foto"><img alt="" src="' + esc(foto) + '"></div>' +
      '<h2 id="pj-nombre">' + esc(j.nombre || 'Jugador') + '</h2>' + datos;
    var img = fondo.querySelector('.pj-foto img');
    img.onerror = function(){ if (j.foto && img.getAttribute('src') !== j.foto) { img.src = j.foto; } else { img.onerror = null; img.src = '/img/avatar.png'; } };
  }

  window.abrirPerfil = function(j){
    if (typeof j === 'string') j = { nombre: j };
    cerrar();
    anterior = document.activeElement;
    var fondo = document.createElement('div');
    fondo.className = 'pj-fondo';
    fondo.innerHTML =
      '<div class="pj" role="dialog" aria-modal="true" aria-labelledby="pj-nombre">' +
        '<button class="pj-x" type="button" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="pj-cuerpo"></div>' +
        '<img class="pj-logo" src="' + LOGO + '" alt="muévete.pe">' +
      '</div>';
    document.body.appendChild(fondo);
    abierto = fondo;
    document.documentElement.style.overflow = 'hidden';
    fondo.addEventListener('click', function(e){ if (e.target === fondo) cerrar(); });
    fondo.querySelector('.pj-x').onclick = cerrar;
    document.addEventListener('keydown', tecla);

    var completo = j.puesto != null;
    pintar(fondo, j, !completo);
    requestAnimationFrame(function(){ fondo.classList.add('on'); fondo.querySelector('.pj-x').focus(); });

    if (!completo) {
      buscar(j.nombre).then(function(r){
        if (abierto !== fondo) return;
        var m = r ? Object.assign({}, r, { foto: j.foto || r.foto, fotoGrande: r.fotoGrande || j.fotoGrande }) : j;
        if (!r) m.puesto = null;
        pintar(fondo, m, false);
      });
    }
  };
})();
