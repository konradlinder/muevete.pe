/* Selector de fecha moderno para escritorio.
   En celulares y tablets se deja el selector nativo (iOS / Android ya se ven modernos).
   Uso: <input type="date" data-selector-fecha name="..." id="..."> */
(function(){
  var MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS=['L','M','M','J','V','S','D'];
  var tactil=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
  if(tactil) return;

  var css=document.createElement('style');
  css.textContent=[
    '.sf{position:relative;display:block}',
    '.sf input.sf-txt{width:100%;padding-right:44px}',
    '.sf-btn{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:0;border-radius:999px;background:transparent;display:grid;place-items:center;cursor:pointer;color:#3A3F47}',
    '.sf-btn:hover{background:#EEF2F9;color:var(--azul-menu,#0069DC)}',
    '.sf-btn svg{width:18px;height:18px}',
    '.sf-pop{position:absolute;z-index:50;top:calc(100% + 8px);left:0;width:300px;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(16,24,40,.18),0 2px 6px rgba(16,24,40,.08);padding:14px 14px 12px;font-family:Poppins,system-ui,sans-serif;animation:sf-in .14s ease-out}',
    '@keyframes sf-in{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}',
    '.sf-cab{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}',
    '.sf-sel{display:flex;gap:2px}',
    '.sf-sel select{height:34px!important;border:0!important;box-shadow:none!important;background-color:transparent!important;font-size:15px!important;font-weight:700!important;padding:0 26px 0 8px!important;border-radius:999px!important;background-position:right 9px center!important;width:auto!important}',
    '.sf-sel select:hover{background-color:#EEF2F9!important}',
    '.sf-sel select:first-child{text-transform:capitalize}',
    '.sf-nav{display:flex;gap:2px}',
    '.sf-nav button{width:34px;height:34px;border:0;border-radius:999px;background:transparent;cursor:pointer;display:grid;place-items:center;color:var(--azul-menu,#0069DC)}',
    '.sf-nav button:hover{background:#EEF2F9}',
    '.sf-nav button:disabled{color:#C5CAD3;background:transparent;cursor:default}',
    '.sf-nav svg{width:16px;height:16px}',
    '.sf-grid{display:grid;grid-template-columns:repeat(7,1fr);row-gap:2px;text-align:center}',
    '.sf-grid .sf-d{font-size:11px;font-weight:600;color:#9AA1AC;height:26px;line-height:26px}',
    '.sf-grid button{width:36px;height:36px;margin:0 auto;border:0;border-radius:999px;background:transparent;font:500 14px Poppins,system-ui,sans-serif;color:#1A1D21;cursor:pointer}',
    '.sf-grid button:hover{background:#EEF2F9}',
    '.sf-grid button.hoy{color:var(--azul-menu,#0069DC);font-weight:700}',
    '.sf-grid button.sel{background:var(--azul-menu,#0069DC);color:#fff;font-weight:700}',
    '.sf-grid button:disabled{color:#D0D4DB;background:transparent;cursor:default}',
    '.sf-grid button:focus-visible,.sf-nav button:focus-visible,.sf-btn:focus-visible{outline:2px solid var(--azul-menu,#0069DC);outline-offset:1px}',
    '.sf-pie{display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #EEF0F3}',
    '.sf-pie button{border:0;background:transparent;border-radius:999px;padding:6px 12px;font:600 13px Poppins,system-ui,sans-serif;color:var(--azul-menu,#0069DC);cursor:pointer}',
    '.sf-pie button:hover{background:#EEF2F9}',
    '.sf-pie .sf-borrar{color:#7A808A}'
  ].join('\n');
  document.head.appendChild(css);

  var ICAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  var IIZQ='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  var IDER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';

  function dos(n){return (n<10?'0':'')+n}
  function iso(a,m,d){return a+'-'+dos(m+1)+'-'+dos(d)}
  function deIso(v){var p=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');return p?{a:+p[1],m:+p[2]-1,d:+p[3]}:null}
  function aTexto(v){var f=deIso(v);return f?dos(f.d)+'/'+dos(f.m+1)+'/'+f.a:''}
  function deTexto(t){
    var p=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((t||'').trim());if(!p) return '';
    var d=+p[1],m=+p[2]-1,a=+p[3],x=new Date(a,m,d);
    return (x.getFullYear()===a&&x.getMonth()===m&&x.getDate()===d)?iso(a,m,d):'';
  }

  function mejorar(orig){
    var hoy=new Date(), futuro=orig.hasAttribute('data-futuro');
    var max=orig.max||(futuro?(hoy.getFullYear()+3)+'-12-31':iso(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()));
    var min=orig.min||(futuro?(hoy.getFullYear()-2)+'-01-01':'1920-01-01');
    var fMax=deIso(max), fMin=deIso(min);

    // campo oculto que guarda el valor real (AAAA-MM-DD) con el mismo name
    var oculto=document.createElement('input');
    oculto.type='hidden'; oculto.name=orig.name; oculto.value=orig.value;
    orig.removeAttribute('name');
    orig.type='text';
    orig.classList.add('sf-txt');
    orig.placeholder='dd/mm/aaaa';
    orig.inputMode='numeric';
    orig.maxLength=10;
    orig.autocomplete='off';
    orig.value=aTexto(oculto.value);

    var caja=document.createElement('div'); caja.className='sf';
    orig.parentNode.insertBefore(caja,orig);
    caja.appendChild(orig); caja.appendChild(oculto);
    var btn=document.createElement('button');
    btn.type='button'; btn.className='sf-btn'; btn.innerHTML=ICAL;
    btn.setAttribute('aria-label','Abrir calendario');
    caja.appendChild(btn);

    // permite leer y escribir el valor desde otros scripts: input.valorFecha
    Object.defineProperty(orig,'valorFecha',{get:function(){return oculto.value},set:function(v){oculto.value=v||'';orig.value=aTexto(oculto.value)}});

    var pop=null, vista=null;

    function fijar(v){
      oculto.value=v; orig.value=aTexto(v);
      oculto.dispatchEvent(new Event('change',{bubbles:true}));
      orig.dispatchEvent(new CustomEvent('fecha',{bubbles:true,detail:v}));
    }

    function abrir(foco){
      if(pop) return;
      var f=deIso(oculto.value)||(futuro?{a:hoy.getFullYear(),m:hoy.getMonth()}:{a:Math.min(fMax.a,hoy.getFullYear()-25),m:0});
      vista={a:f.a,m:f.m};
      pop=document.createElement('div'); pop.className='sf-pop'; pop.setAttribute('role','dialog'); pop.setAttribute('aria-label','Elegir fecha');
      caja.appendChild(pop);
      pintar();
      if(foco){var s=pop.querySelector('button.sel')||pop.querySelector('.sf-grid button:not(:disabled)');if(s) s.focus();}
      setTimeout(function(){document.addEventListener('mousedown',fuera);},0);
    }
    function cerrar(foco){
      if(!pop) return;
      pop.remove(); pop=null;
      document.removeEventListener('mousedown',fuera);
      if(foco) orig.focus();
    }
    function fuera(e){ if(!caja.contains(e.target)) cerrar(false); }

    function pintar(){
      var a=vista.a,m=vista.m,sel=oculto.value,hoyIso=iso(hoy.getFullYear(),hoy.getMonth(),hoy.getDate());
      var h='<div class="sf-cab"><div class="sf-sel"><select aria-label="Mes">';
      for(var i=0;i<12;i++) h+='<option value="'+i+'"'+(i===m?' selected':'')+'>'+MESES[i]+'</option>';
      h+='</select><select aria-label="Año">';
      for(var y=fMax.a;y>=fMin.a;y--) h+='<option'+(y===a?' selected':'')+'>'+y+'</option>';
      h+='</select></div><div class="sf-nav"><button type="button" data-n="-1" aria-label="Mes anterior">'+IIZQ+'</button><button type="button" data-n="1" aria-label="Mes siguiente">'+IDER+'</button></div></div>';
      h+='<div class="sf-grid">';
      DIAS.forEach(function(d){h+='<span class="sf-d">'+d+'</span>'});
      var primero=(new Date(a,m,1).getDay()+6)%7, total=new Date(a,m+1,0).getDate();
      for(i=0;i<primero;i++) h+='<span></span>';
      for(var d=1;d<=total;d++){
        var v=iso(a,m,d), fuera_=v>max||v<min;
        h+='<button type="button" data-v="'+v+'"'+(v===sel?' class="sel" aria-pressed="true"':(v===hoyIso?' class="hoy"':''))+(fuera_?' disabled':'')+' aria-label="'+d+' de '+MESES[m]+' de '+a+'">'+d+'</button>';
      }
      h+='</div><div class="sf-pie"><button type="button" class="sf-borrar">Borrar</button><button type="button" class="sf-listo">Listo</button></div>';
      pop.innerHTML=h;
      var ss=pop.querySelectorAll('.sf-sel select');
      ss[0].onchange=function(){vista.m=+this.value;pintar()};
      ss[1].onchange=function(){vista.a=+this.value;pintar()};
      var nav=pop.querySelectorAll('.sf-nav button');
      nav[0].disabled=(a<fMin.a||(a===fMin.a&&m<=fMin.m));
      nav[1].disabled=(a>fMax.a||(a===fMax.a&&m>=fMax.m));
      nav.forEach(function(b){b.onclick=function(){mover(+b.dataset.n)}});
      pop.querySelectorAll('.sf-grid button').forEach(function(b){
        b.onclick=function(){fijar(b.dataset.v);cerrar(true)};
      });
      pop.querySelector('.sf-borrar').onclick=function(){fijar('');cerrar(true)};
      pop.querySelector('.sf-listo').onclick=function(){cerrar(true)};
    }
    function mover(n){
      var x=new Date(vista.a,vista.m+n,1); vista={a:x.getFullYear(),m:x.getMonth()}; pintar();
    }

    btn.onclick=function(){pop?cerrar(true):abrir(true)};
    orig.addEventListener('click',function(){abrir(false)});
    orig.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'&&!pop){e.preventDefault();abrir(true)}
      if(e.key==='Escape') cerrar(true);
    });
    caja.addEventListener('keydown',function(e){
      if(!pop) return;
      if(e.key==='Escape'){e.preventDefault();cerrar(true);return}
      var t=document.activeElement;
      if(!t||!t.dataset||!t.dataset.v) return;
      var paso={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];
      if(!paso) return;
      e.preventDefault();
      var f=deIso(t.dataset.v),x=new Date(f.a,f.m,f.d+paso),v=iso(x.getFullYear(),x.getMonth(),x.getDate());
      if(v>max||v<min) return;
      vista={a:x.getFullYear(),m:x.getMonth()}; pintar();
      var b=pop.querySelector('[data-v="'+v+'"]'); if(b) b.focus();
    });
    // escribir a mano: dd/mm/aaaa con barras automáticas
    orig.addEventListener('input',function(e){
      var n=orig.value.replace(/\D/g,'').slice(0,8);
      if(e.inputType&&e.inputType.indexOf('delete')===0){ orig.value=orig.value.replace(/[^\d\/]/g,''); }
      else orig.value=n.length>4?n.slice(0,2)+'/'+n.slice(2,4)+'/'+n.slice(4):n.length>2?n.slice(0,2)+'/'+n.slice(2):n;
      var v=deTexto(orig.value);
      if(v&&v<=max&&v>=min){ oculto.value=v; orig.dispatchEvent(new CustomEvent('fecha',{bubbles:true,detail:v})); if(pop){var f=deIso(v);vista={a:f.a,m:f.m};pintar()} }
      else if(!orig.value) oculto.value='';
    });
    orig.addEventListener('blur',function(){
      if(pop&&caja.contains(document.activeElement)) return;
      var v=deTexto(orig.value);
      if(orig.value&&!(v&&v<=max&&v>=min)) orig.value=aTexto(oculto.value);
    });
  }

  function iniciar(){document.querySelectorAll('input[type=date][data-selector-fecha]').forEach(mejorar)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar); else iniciar();
})();
