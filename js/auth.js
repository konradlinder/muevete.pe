/* Sesión de usuario con Supabase Auth (sin librerías: usa la API directamente).
   Requiere js/config.js antes (window.MUEVETE_DB con url y anonKey). */
(function(){
  var DB=window.MUEVETE_DB||{};
  var CLAVE='muevete.sesion';
  var URL_AUTH=DB.url+'/auth/v1';

  function base(){
    var h={'apikey':DB.anonKey,'Content-Type':'application/json'};
    return h;
  }
  function guardar(s){
    if(!s||!s.access_token) return null;
    var ses={
      access_token:s.access_token,
      refresh_token:s.refresh_token,
      expires_at:s.expires_at||Math.floor(Date.now()/1000)+(+s.expires_in||3600),
      user:s.user||null
    };
    try{localStorage.setItem(CLAVE,JSON.stringify(ses))}catch(e){}
    return ses;
  }
  function leer(){ try{return JSON.parse(localStorage.getItem(CLAVE)||'null')}catch(e){return null} }
  function borrar(){ try{localStorage.removeItem(CLAVE)}catch(e){} }

  function mensaje(j,status){
    var c=(j&&(j.error_code||j.code||j.error))||'';
    var m=(j&&(j.msg||j.message||j.error_description))||'';
    if(c==='invalid_credentials'||/invalid login/i.test(m)) return 'Correo o contraseña incorrectos.';
    if(c==='email_not_confirmed') return 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.';
    if(c==='over_email_send_rate_limit'||status===429) return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
    if(c==='weak_password'||/password should/i.test(m)) return 'La contraseña es muy corta (mínimo 6 caracteres).';
    if(c==='same_password') return 'La nueva contraseña debe ser distinta a la anterior.';
    return m||'No se pudo completar. Intenta de nuevo.';
  }
  async function pedir(ruta,opc){
    var r;
    try{ r=await fetch(URL_AUTH+ruta,opc); }
    catch(e){ throw new Error('Sin conexión. Revisa tu internet.'); }
    var j=null; try{ j=await r.json(); }catch(e){}
    if(!r.ok) throw new Error(mensaje(j,r.status));
    return j;
  }

  // Si el usuario vuelve desde el correo de "recuperar contraseña"
  var recuperando=false;
  (function(){
    var h=location.hash.slice(1); if(!h) return;
    var p=new URLSearchParams(h);
    if(p.get('access_token')){
      guardar({access_token:p.get('access_token'),refresh_token:p.get('refresh_token'),expires_in:p.get('expires_in')});
      recuperando=p.get('type')==='recovery';
      history.replaceState(null,'',location.pathname+location.search);
    } else if(p.get('error_description')){
      window.MUEVETE_AUTH_ERROR=p.get('error_description').replace(/\+/g,' ');
      history.replaceState(null,'',location.pathname+location.search);
    }
  })();

  var refrescando=null;
  async function refrescar(ses){
    if(!refrescando){
      refrescando=pedir('/token?grant_type=refresh_token',{method:'POST',headers:base(),body:JSON.stringify({refresh_token:ses.refresh_token})})
        .then(guardar)
        .catch(function(){ borrar(); return null; })
        .finally(function(){ refrescando=null; });
    }
    return refrescando;
  }

  window.MUEVETE_AUTH={
    recuperando:function(){return recuperando},

    // Devuelve la sesión vigente (la renueva si está por vencer) o null
    sesion:async function(){
      var s=leer(); if(!s) return null;
      if(s.expires_at-60<Date.now()/1000) s=await refrescar(s);
      if(s&&!s.user){
        try{ s.user=await pedir('/user',{headers:Object.assign(base(),{'Authorization':'Bearer '+s.access_token})}); guardar(s); }
        catch(e){ borrar(); return null; }
      }
      return s;
    },

    entrar:async function(correo,clave){
      var j=await pedir('/token?grant_type=password',{method:'POST',headers:base(),body:JSON.stringify({email:correo.trim(),password:clave})});
      return guardar(j);
    },

    salir:async function(){
      var s=leer(); borrar(); try{localStorage.removeItem('muevete.pendiente')}catch(e){}
      if(s) try{ await fetch(URL_AUTH+'/logout',{method:'POST',headers:Object.assign(base(),{'Authorization':'Bearer '+s.access_token})}); }catch(e){}
    },

    recuperar:async function(correo){
      var vuelta=location.origin+location.pathname;
      await pedir('/recover?redirect_to='+encodeURIComponent(vuelta),{method:'POST',headers:base(),body:JSON.stringify({email:correo.trim()})});
    },

    cambiarClave:async function(nueva){
      var s=await this.sesion(); if(!s) throw new Error('La sesión venció. Vuelve a pedir el correo.');
      await pedir('/user',{method:'PUT',headers:Object.assign(base(),{'Authorization':'Bearer '+s.access_token}),body:JSON.stringify({password:nueva})});
      recuperando=false;
    },

    // Guarda una sesión que llegó de la función "cuenta" (DNI + PIN)
    usarSesion:function(j){ return guardar(j); },

    // Llama a la Edge Function "cuenta" (ingreso con DNI + PIN)
    cuenta:async function(datos,conSesion){
      var h=base();
      if(conSesion){ var s=await this.sesion(); if(!s) throw new Error('sin-sesion'); h.Authorization='Bearer '+s.access_token; }
      var r;
      try{ r=await fetch(DB.url+'/functions/v1/cuenta',{method:'POST',headers:h,body:JSON.stringify(datos)}); }
      catch(e){ throw new Error('Sin conexión. Revisa tu internet.'); }
      var j=null; try{ j=await r.json(); }catch(e){}
      if(!r.ok){ var err=new Error((j&&j.error)||'No se pudo completar. Intenta de nuevo.'); err.status=r.status; err.datos=j||{}; throw err; }
      return j;
    },

    // fetch a la base de datos (PostgREST) con la sesión del usuario
    db:async function(ruta,opc){
      var s=await this.sesion(); if(!s) throw new Error('sin-sesion');
      opc=opc||{};
      opc.headers=Object.assign(base(),{'Authorization':'Bearer '+s.access_token},opc.headers||{});
      var r=await fetch(DB.url+'/rest/v1/'+ruta,opc);
      if(r.status===401){ borrar(); throw new Error('sin-sesion'); }
      var j=null; try{ j=await r.json(); }catch(e){}
      if(!r.ok) throw new Error((j&&j.message)||'Error al conectar con la base de datos.');
      return j;
    }
  };
})();
