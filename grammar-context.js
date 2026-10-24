/* GrammarCore contextual n-gram statistics. This is a trained COUNT sketch, not
 * a generative neural model. Load on demand to keep initial UI fast, even on old
 * Android WebViews. The 24 MiB binary stays on-device with the APK. */
(function(root){
'use strict';
var SIZE=1048576,MASK=SIZE-1,buf=null,loading=null,state='idle',error='';
function hash(words){var h=2166136261;for(var i=0;i<words.length;i++){var s=words[i];for(var j=0;j<s.length;j++){h=Math.imul((h^s.charCodeAt(j)),16777619)>>>0;}h=Math.imul((h^32),16777619)>>>0;}return h>>>0;}
function idx(words,order){var h=hash(words),other=Math.imul((h^0x9e3779b9),0x85ebca6b)>>>0;other^=other>>>13;other=Math.imul(other,0xc2b2ae35)>>>0;other^=other>>>16;var base=(order-1)*2*SIZE;return [base+(h&MASK),base+SIZE+(other&MASK)];}
function clean(text){var matches=String(text||'').toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g);return matches||[];}
function rank(text){if(!buf)return null;var ts=clean(text),total=0;if(ts.length<2)return null;
for(var order=2;order<=3;order++)for(var i=0;i+order<=ts.length;i++){var pair=idx(ts.slice(i,i+order),order);total+=(order===2?0.6:1)*Math.log(1+Math.min(buf[pair[0]],buf[pair[1]]));}
return Number((total/Math.max(1,ts.length-1)).toFixed(5));}
function load(){if(loading)return loading;if(typeof fetch!=='function'){state='unavailable';return Promise.resolve(false);}state='loading';loading=fetch('./grammar-context.bin').then(function(r){if(!r.ok)throw new Error('No corpus asset ('+r.status+')');return r.arrayBuffer()}).then(function(bytes){if(bytes.byteLength!==24*1024*1024)throw new Error('Corpus model size mismatch');buf=new Uint32Array(bytes);state='ready';return true}).catch(function(e){error=String(e.message||e);state='unavailable';return false});return loading;}
root.GrammarContext={load:load,rank:rank,status:function(){return {state:state,error:error,size:buf?buf.byteLength:0};},explain:'Context rankings estimate usage frequency, NOT correctness.'};
})(typeof window!=='undefined'?window:globalThis);
