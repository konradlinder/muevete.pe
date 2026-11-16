/* Footer común (igual al del inicio) para todas las páginas internas.
   Uso: <script src="js/pie.js"></script> al final del <body>. */
(function(){
  if (document.querySelector('.pc')) return;
  var LINKS = {
    bases:    'bases.html',
    ronda1:   'ronda.html?ronda=1',
    ronda2:   'ronda.html?ronda=2',
    terminos: 'terminos.html',
    admin:    'admin.html',
    owner:    'https://www.muevete.pe/owner'
  };
  var SEDE = 'Uma Arena';
  var ALIADOS = [
    { nombre:'Arena Voleibol Club', url:'https://www.instagram.com/arena_voleibolclub/', logo:'img/sponsor-arena.svg' },
    { nombre:'Electrolife',         url:'https://www.instagram.com/electrolifeperu/',    logo:'img/sponsor-electrolife.svg' },
    { nombre:'Diablo Atelier',      url:'https://www.instagram.com/diabloatelier/',      logo:'img/sponsor-diablo-atelier.svg' }
  ];

  if (!document.querySelector('link[href*="family=Roboto"]')) {
    var f = document.createElement('link'); f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
    document.head.appendChild(f);
  }

  var css = document.createElement('style');
  css.textContent = [
    '.pc{background:#0046B8;color:#F7F7F7;margin-top:40px;font-family:"Roboto",sans-serif}',
    '.pc *{box-sizing:border-box}',
    '.pc-in{max-width:1366px;margin:0 auto}',
    '.pc-logo{display:flex;justify-content:center;padding:44px 0 0}',
    '.pc-logo img{width:260px;height:auto}',
    '.pc-f{display:grid;grid-template-columns:1fr 2fr 1fr;align-items:start;padding:12px 44px 46px;font-weight:700;font-size:16px}',
    '.pc-f a{color:inherit;text-decoration:underline;text-underline-offset:2px}',
    '.pc-f a:hover{color:#FFDB03}',
    '.pc-links{display:grid;gap:6px;justify-items:start}',
    '.pc-links .sep{height:12px}',
    '.pc-spons{display:grid;grid-template-columns:repeat(3,1fr);align-items:center;justify-items:center;gap:20px;padding-top:4px}',
    '.pc-spons a{display:flex;align-items:center;justify-content:center;height:80px;text-decoration:none}',
    '.pc-spons img{height:72px;width:auto;max-width:190px;object-fit:contain;transition:opacity .15s}',
    '.pc-spons a:hover img{opacity:.8}',
    '.pc-spons a:nth-child(3) img{height:54px}',
    '.pc-admin{display:grid;gap:6px;justify-items:end;text-align:right}',
    '.pc-admin .copy{margin-top:16px}',
    '@media (max-width:760px){',
    '  .pc-logo img{width:170px}',
    '  .pc-f{grid-template-columns:1fr 1fr;column-gap:12px;row-gap:44px;padding:44px 12px calc(24px + env(safe-area-inset-bottom,0px));font-size:15px;font-weight:400}',
    '  .pc-spons{grid-column:1 / -1;grid-row:1;gap:10px;padding:0}',
    '  .pc-spons a{height:50px}',
    '  .pc-spons img{height:46px;max-width:29vw}',
    '  .pc-spons a:nth-child(3) img{height:34px}',
    '  .pc-links{grid-column:1;grid-row:2;gap:8px}',
    '  .pc-links .sep{height:10px}',
    '  .pc-links > :nth-child(1){order:3}.pc-links > :nth-child(2){order:1}.pc-links > :nth-child(3){order:2}.pc-links > :nth-child(4){order:4}.pc-links > :nth-child(5){order:5}',
    '  .pc-admin{grid-column:2;grid-row:2;gap:8px}',
    '  .pc-admin .copy{margin-top:10px}',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  var esc = function(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var pie = document.createElement('div');
  pie.className = 'pc';
  pie.innerHTML =
    '<div class="pc-in">' +
      '<div class="pc-logo"><img src="img/logo-muevete.png" alt="logo muévete" loading="lazy"></div>' +
      '<footer class="pc-f">' +
        '<div class="pc-links">' +
          '<a href="' + LINKS.bases + '">bases ' + esc(SEDE) + '</a>' +
          '<a href="' + LINKS.ronda1 + '">partidos ronda 1</a>' +
          '<a href="' + LINKS.ronda2 + '">partidos ronda 2</a>' +
          '<span class="sep"></span>' +
          '<a href="' + LINKS.terminos + '">Términos y condiciones</a>' +
        '</div>' +
        '<div class="pc-spons">' + ALIADOS.map(function(a){
          return '<a href="' + a.url + '" target="_blank" rel="noopener" aria-label="' + esc(a.nombre) + '"><img src="' + a.logo + '" alt="' + esc(a.nombre) + '" loading="lazy"></a>';
        }).join('') + '</div>' +
        '<div class="pc-admin">' +
          '<a href="' + LINKS.admin + '">admin sombrillas</a>' +
          '<a href="' + LINKS.owner + '">owner</a>' +
          '<span class="copy">© ' + new Date().getFullYear() + ' by muévete.pe</span>' +
        '</div>' +
      '</footer>' +
    '</div>';
  document.body.appendChild(pie);
})();
