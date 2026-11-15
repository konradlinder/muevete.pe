/* Burbuja del menú que se desliza entre páginas (solo escritorio, con View Transitions) */
(function(){
  var menu=document.querySelector('.menu');
  if(!menu) return;
  var on=menu.querySelector('a.on');
  if(!on) return;
  var pill=document.createElement('span');
  pill.className='menu-pill';
  pill.setAttribute('aria-hidden','true');
  menu.insertBefore(pill,menu.firstChild);
  menu.classList.add('con-pill');
  function ubicar(){
    pill.style.left=on.offsetLeft+'px';
    pill.style.width=on.offsetWidth+'px';
  }
  ubicar();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(ubicar);
  addEventListener('resize',ubicar);
})();
