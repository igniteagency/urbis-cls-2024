"use strict";(()=>{var r="scriptsLoaded";var c="jsEnv";window.SCRIPTS_ENV=w();window.setScriptSource=o=>{if(o!=="local"&&o!=="cdn"){console.error("Invalid environment. Pass `local` or `cdn`");return}localStorage.setItem(c,o),window.SCRIPTS_ENV=o,console.log(`Environment successfully set to ${o}`)};function w(){return localStorage.getItem(c)||"cdn"}var l="http://localhost:3000/";window.PRODUCTION_BASE="https://cdn.jsdelivr.net/gh/igniteagency/urbis-cls-2024/dist/prod/";window.JS_SCRIPTS=new Set;var s=[];window.addEventListener("DOMContentLoaded",p);function p(){console.debug(`Current script mode: ${window.SCRIPTS_ENV}`),window.SCRIPTS_ENV==="local"?(console.debug("To run JS scripts from production CDN, execute `window.setScriptSource('cdn')` in the browser console"),u()):(console.debug("To run JS scripts from localhost, execute `window.setScriptSource('local')` in the browser console"),i())}function i(){var e;let o=window.SCRIPTS_ENV==="local"?l:window.PRODUCTION_BASE;(e=window.JS_SCRIPTS)==null||e.forEach(n=>{let t=document.createElement("script");t.src=o+n,t.defer=!0;let S=new Promise((d,a)=>{t.onload=d,t.onerror=()=>{console.error(`Failed to load script: ${n}`)}});s.push(S),document.body.appendChild(t)}),Promise.allSettled(s).then(()=>{console.debug("All scripts loaded"),setTimeout(()=>{window.dispatchEvent(new CustomEvent(r))},50)})}function u(){let e=new AbortController,n=setTimeout(()=>{e.abort()},300);fetch(l,{signal:e.signal}).then(t=>{if(!t.ok)throw console.error({response:t}),new Error("localhost response not ok")}).catch(()=>{console.error("localhost not resolved. Switching to production"),window.setScriptSource("cdn")}).finally(()=>{clearTimeout(n),i()})}})();