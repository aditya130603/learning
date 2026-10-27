/* Loaded before curriculum modules. Legacy storage stays with the first learner. */
(function(root){'use strict';
const nativeGet=Storage.prototype.getItem, nativeSet=Storage.prototype.setItem, nativeRemove=Storage.prototype.removeItem;
const registryKey='wm-profile-registry';
let registry;try{registry=JSON.parse(nativeGet.call(localStorage,registryKey));}catch(_){}
if(!registry||!Array.isArray(registry.items)||!registry.items.length)registry={active:'legacy',items:[{id:'legacy',name:'Learner 1'}]};
if(!registry.items.some(p=>p.id===registry.active))registry.active='legacy';
const scoped=k=>/^(little-letters-|wm-|word-)/.test(k)&&k!==registryKey&&!k.startsWith('wm-profile:');
const key=k=>scoped(String(k))&&registry.active!=='legacy'?'wm-profile:'+registry.active+':'+k:k;
Storage.prototype.getItem=function(k){return nativeGet.call(this,this===localStorage?key(k):k);};
Storage.prototype.setItem=function(k,v){return nativeSet.call(this,this===localStorage?key(k):k,v);};
Storage.prototype.removeItem=function(k){return nativeRemove.call(this,this===localStorage?key(k):k);};
function persist(){nativeSet.call(localStorage,registryKey,JSON.stringify(registry));}
root.Learners={list:()=>registry.items.slice(),active:()=>registry.active,
 select(id){if(!registry.items.some(p=>p.id===id))return;registry.active=id;persist();location.reload();},
 add(name){name=String(name||'').trim().slice(0,30);if(!name||registry.items.length>=8)return false;const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);registry.items.push({id,name});registry.active=id;persist();location.reload();return true;}};
persist();
})(window);
