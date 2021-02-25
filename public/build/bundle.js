var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function r(t){t.forEach(e)}function o(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(e){return e&&o(e.destroy)?e.destroy:t}function a(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n||null)}function l(t){t.parentNode.removeChild(t)}function u(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function h(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function p(){return f(" ")}function d(){return f("")}function m(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function g(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function v(t){return""===t?null:+t}function y(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function $(t,e){t.value=null==e?"":e}let w;function b(t){w=t}function x(){if(!w)throw new Error("Function called outside component initialization");return w}function _(t){x().$$.on_mount.push(t)}const k=[],E=[],C=[],O=[],L=Promise.resolve();let q=!1;function R(t){C.push(t)}let S=!1;const T=new Set;function A(){if(!S){S=!0;do{for(let t=0;t<k.length;t+=1){const e=k[t];b(e),j(e.$$)}for(b(null),k.length=0;E.length;)E.pop()();for(let t=0;t<C.length;t+=1){const e=C[t];T.has(e)||(T.add(e),e())}C.length=0}while(k.length);for(;O.length;)O.pop()();q=!1,S=!1,T.clear()}}function j(t){if(null!==t.fragment){t.update(),r(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(R)}}const U=new Set;let N;function B(){N={r:0,c:[],p:N}}function P(){N.r||r(N.c),N=N.p}function H(t,e){t&&t.i&&(U.delete(t),t.i(e))}function M(t,e,n,r){if(t&&t.o){if(U.has(t))return;U.add(t),N.c.push((()=>{U.delete(t),r&&(n&&t.d(1),r())})),t.o(e)}}function I(t,e){const n=e.token={};function r(t,r,o,i){if(e.token!==n)return;e.resolved=i;let s=e.ctx;void 0!==o&&(s=s.slice(),s[o]=i);const a=t&&(e.current=t)(s);let c=!1;e.block&&(e.blocks?e.blocks.forEach(((t,n)=>{n!==r&&t&&(B(),M(t,1,1,(()=>{e.blocks[n]===t&&(e.blocks[n]=null)})),P())})):e.block.d(1),a.c(),H(a,1),a.m(e.mount(),e.anchor),c=!0),e.block=a,e.blocks&&(e.blocks[r]=a),c&&A()}if((o=t)&&"object"==typeof o&&"function"==typeof o.then){const n=x();if(t.then((t=>{b(n),r(e.then,1,e.value,t),b(null)}),(t=>{if(b(n),r(e.catch,2,e.error,t),b(null),!e.hasCatch)throw t})),e.current!==e.pending)return r(e.pending,0),!0}else{if(e.current!==e.then)return r(e.then,1,e.value,t),!0;e.resolved=t}var o}function F(t,e){t.d(1),e.delete(t.key)}function z(t,e){M(t,1,1,(()=>{e.delete(t.key)}))}function G(t,e,n,r,o,i,s,a,c,l,u,h){let f=t.length,p=i.length,d=f;const m={};for(;d--;)m[t[d].key]=d;const g=[],v=new Map,y=new Map;for(d=p;d--;){const t=h(o,i,d),a=n(t);let c=s.get(a);c?r&&c.p(t,e):(c=l(a,t),c.c()),v.set(a,g[d]=c),a in m&&y.set(a,Math.abs(d-m[a]))}const $=new Set,w=new Set;function b(t){H(t,1),t.m(a,u),s.set(t.key,t),u=t.first,p--}for(;f&&p;){const e=g[p-1],n=t[f-1],r=e.key,o=n.key;e===n?(u=e.first,f--,p--):v.has(o)?!s.has(r)||$.has(r)?b(e):w.has(o)?f--:y.get(r)>y.get(o)?(w.add(r),b(e)):($.add(o),f--):(c(n,s),f--)}for(;f--;){const e=t[f];v.has(e.key)||c(e,s)}for(;p;)b(g[p-1]);return g}function D(t){t&&t.c()}function Y(t,n,i){const{fragment:s,on_mount:a,on_destroy:c,after_update:l}=t.$$;s&&s.m(n,i),R((()=>{const n=a.map(e).filter(o);c?c.push(...n):r(n),t.$$.on_mount=[]})),l.forEach(R)}function K(t,e){const n=t.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function V(t,e){-1===t.$$.dirty[0]&&(k.push(t),q||(q=!0,L.then(A)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function X(e,o,i,s,a,c,u=[-1]){const h=w;b(e);const f=e.$$={fragment:null,ctx:null,props:c,update:t,not_equal:a,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(h?h.$$.context:[]),callbacks:n(),dirty:u,skip_bound:!1};let p=!1;if(f.ctx=i?i(e,o.props||{},((t,n,...r)=>{const o=r.length?r[0]:n;return f.ctx&&a(f.ctx[t],f.ctx[t]=o)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](o),p&&V(e,t)),n})):[],f.update(),p=!0,r(f.before_update),f.fragment=!!s&&s(f.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);f.fragment&&f.fragment.l(t),t.forEach(l)}else f.fragment&&f.fragment.c();o.intro&&H(e.$$.fragment),Y(e,o.target,o.anchor),A()}b(h)}class Z{$destroy(){K(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const J=window.location,Q=`${J.protocol}//${J.hostname}/api`,W={"Content-Type":"application/json"},tt=(t,e,n)=>{const r={method:e,headers:W};n&&(r.body=JSON.stringify(n));return fetch(Q+t,r)},et=t=>tt(t,"GET"),nt=t=>{let e=0;const n=[],r=[];t.forEach((t=>{e+=t.amount,t.amount>0?r.push(t):n.push(t)})),n.sort(((t,e)=>t.amount-e.amount)),r.sort(((t,e)=>e.amount-t.amount));return{sortedEntries:[...r,...n],total:e}};var rt=async t=>{let e="/entry/specific/?";for(const n in t)if("date"===n){const r=t[n];e+=`year=${r.getFullYear()}&month=${r.getMonth()+1}&`}else e+=`${n}=${t[n]}&`;const n=await et(e),r=await n.json();if(200!==n.status)throw new Error(r.message);return r},ot=async t=>{let e;e=Array.isArray(t)?{entries:t}:{entries:[t]};const n=await((t,e)=>tt(t,"POST",e))("/entry/new",e),r=await n.json();if(201!==n.status)throw new Error(r.message);return r},it=async()=>{const t=await et("/default"),e=await t.json();if(200!==t.status)throw new Error(e.message);return e},st=async t=>{const e=await(n=`/entry/update/${t.id}`,r={entry:t},tt(n,"PATCH",r));var n,r;const o=await e.json();if(200!==e.status)throw new Error(o.message);return o};function at(t,e,n){const r=t.slice();return r[4]=e[n],r}function ct(t){let e,n,r,o,i;return{c(){e=h("p"),e.textContent="No data?",n=p(),r=h("p"),o=f("category = "),i=f(t[1])},m(t,s){c(t,e,s),c(t,n,s),c(t,r,s),a(r,o),a(r,i)},p(t,e){2&e&&y(i,t[1])},d(t){t&&l(e),t&&l(n),t&&l(r)}}}function lt(t){let e,n,r,o,i,s,u,d,m,v,$,w=[],b=new Map,x=t[2];const _=t=>t[4].id;for(let e=0;e<x.length;e+=1){let n=at(t,x,e),r=_(n);b.set(r,w[e]=ut(r,n))}return{c(){e=h("h3"),n=f(t[1]),r=p(),o=h("table"),i=h("tr"),i.innerHTML='<th>Beskrivning</th> \n\t\t\t<th class="right">Belopp</th>',s=p();for(let t=0;t<w.length;t+=1)w[t].c();u=p(),d=h("tr"),m=h("td"),m.textContent="Totalt",v=p(),$=h("td"),$.textContent=`${t[3]<0?t[3]:"+"+t[3]}`,g(e,"class","entries-header"),g(i,"class","svelte-3mphah"),g($,"class","right"),g(d,"class","svelte-3mphah"),g(o,"class","svelte-3mphah")},m(t,l){c(t,e,l),a(e,n),c(t,r,l),c(t,o,l),a(o,i),a(o,s);for(let t=0;t<w.length;t+=1)w[t].m(o,null);a(o,u),a(o,d),a(d,m),a(d,v),a(d,$)},p(t,e){2&e&&y(n,t[1]),4&e&&(x=t[2],w=G(w,e,_,1,t,x,b,o,F,ut,u,at))},d(t){t&&l(e),t&&l(r),t&&l(o);for(let t=0;t<w.length;t+=1)w[t].d()}}}function ut(t,e){let n,r,o,i,s,u,d=e[4].description+"",m=e[4].amount+"";return{key:t,first:null,c(){n=h("tr"),r=h("td"),o=f(d),i=p(),s=h("td"),u=f(m),g(s,"class","right"),g(n,"class","svelte-3mphah"),this.first=n},m(t,e){c(t,n,e),a(n,r),a(r,o),a(n,i),a(n,s),a(s,u)},p(t,n){e=t},d(t){t&&l(n)}}}function ht(e){let n;function r(t,e){return void 0!==t[0]?lt:ct}let o=r(e),i=o(e);return{c(){i.c(),n=d()},m(t,e){i.m(t,e),c(t,n,e)},p(t,[e]){o===(o=r(t))&&i?i.p(t,e):(i.d(1),i=o(t),i&&(i.c(),i.m(n.parentNode,n)))},i:t,o:t,d(t){i.d(t),t&&l(n)}}}function ft(t,e,n){let{entries:r}=e,{category:o}=e;const{sortedEntries:i,total:s}=nt(r);return t.$$set=t=>{"entries"in t&&n(0,r=t.entries),"category"in t&&n(1,o=t.category)},[r,o,i,s]}class pt extends Z{constructor(t){super(),X(this,t,ft,ht,i,{entries:0,category:1})}}function dt(t){let e,n,r,o;return{c(){e=h("td"),n=f(t[0])},m(i,s){c(i,e,s),a(e,n),r||(o=m(e,"click",t[3]),r=!0)},p(t,e){1&e&&y(n,t[0])},d(t){t&&l(e),r=!1,o()}}}function mt(t){let e,n,o;return{c(){e=h("input"),e.required=t[1],g(e,"class","svelte-1lhsa3f")},m(r,i){c(r,e,i),$(e,t[0]),n||(o=[m(e,"input",t[6]),m(e,"blur",t[4]),s(vt.call(null,e))],n=!0)},p(t,n){2&n&&(e.required=t[1]),1&n&&e.value!==t[0]&&$(e,t[0])},d(t){t&&l(e),n=!1,r(o)}}}function gt(e){let n;function r(t,e){return t[2]?mt:dt}let o=r(e),i=o(e);return{c(){i.c(),n=d()},m(t,e){i.m(t,e),c(t,n,e)},p(t,[e]){o===(o=r(t))&&i?i.p(t,e):(i.d(1),i=o(t),i&&(i.c(),i.m(n.parentNode,n)))},i:t,o:t,d(t){i.d(t),t&&l(n)}}}function vt(t){t.focus()}function yt(t,e,n){let r,{value:o}=e,{required:i=!0}=e,{onSubmit:s}=e,a=!1;return _((()=>{r=o})),t.$$set=t=>{"value"in t&&n(0,o=t.value),"required"in t&&n(1,i=t.required),"onSubmit"in t&&n(5,s=t.onSubmit)},[o,i,a,function(){n(2,a=!0)},function(){o!==r&&s(o),n(2,a=!1)},s,function(){o=this.value,n(0,o)}]}class $t extends Z{constructor(t){super(),X(this,t,yt,gt,i,{value:0,required:1,onSubmit:5})}}function wt(){}function bt(t){return t()}function xt(){return Object.create(null)}function _t(t){t.forEach(bt)}function kt(t){return"function"==typeof t}function Et(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function Ct(t,e){t.appendChild(e)}function Ot(t){t.parentNode.removeChild(t)}function Lt(t){return document.createElement(t)}function qt(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}let Rt;function St(t){Rt=t}const Tt=[],At=[],jt=[],Ut=[],Nt=Promise.resolve();let Bt=!1;function Pt(t){jt.push(t)}let Ht=!1;const Mt=new Set;function It(){if(!Ht){Ht=!0;do{for(let t=0;t<Tt.length;t+=1){const e=Tt[t];St(e),Ft(e.$$)}for(Tt.length=0;At.length;)At.pop()();for(let t=0;t<jt.length;t+=1){const e=jt[t];Mt.has(e)||(Mt.add(e),e())}jt.length=0}while(Tt.length);for(;Ut.length;)Ut.pop()();Bt=!1,Ht=!1,Mt.clear()}}function Ft(t){if(null!==t.fragment){t.update(),_t(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(Pt)}}const zt=new Set;function Gt(t,e){-1===t.$$.dirty[0]&&(Tt.push(t),Bt||(Bt=!0,Nt.then(It)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Dt(t,e,n,r,o,i,s=[-1]){const a=Rt;St(t);const c=e.props||{},l=t.$$={fragment:null,ctx:null,props:i,update:wt,not_equal:o,bound:xt(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(a?a.$$.context:[]),callbacks:xt(),dirty:s};let u=!1;if(l.ctx=n?n(t,c,((e,n,...r)=>{const i=r.length?r[0]:n;return l.ctx&&o(l.ctx[e],l.ctx[e]=i)&&(l.bound[e]&&l.bound[e](i),u&&Gt(t,e)),n})):[],l.update(),u=!0,_t(l.before_update),l.fragment=!!r&&r(l.ctx),e.target){if(e.hydrate){const t=function(t){return Array.from(t.childNodes)}(e.target);l.fragment&&l.fragment.l(t),t.forEach(Ot)}else l.fragment&&l.fragment.c();e.intro&&((h=t.$$.fragment)&&h.i&&(zt.delete(h),h.i(f))),function(t,e,n){const{fragment:r,on_mount:o,on_destroy:i,after_update:s}=t.$$;r&&r.m(e,n),Pt((()=>{const e=o.map(bt).filter(kt);i?i.push(...e):_t(e),t.$$.on_mount=[]})),s.forEach(Pt)}(t,e.target,e.anchor),It()}var h,f;St(a)}function Yt(t){let e,n,r,o,i;return{c(){var s;e=Lt("div"),n=Lt("div"),s=t[0],r=document.createTextNode(s),qt(n,"class",o="toast "+t[1]+" svelte-3qemlt"),qt(e,"class",i="toast-container "+t[2]+" svelte-3qemlt")},m(t,o){!function(t,e,n){t.insertBefore(e,n||null)}(t,e,o),Ct(e,n),Ct(n,r)},p(t,[s]){1&s&&function(t,e){e=""+e,t.data!==e&&(t.data=e)}(r,t[0]),2&s&&o!==(o="toast "+t[1]+" svelte-3qemlt")&&qt(n,"class",o),4&s&&i!==(i="toast-container "+t[2]+" svelte-3qemlt")&&qt(e,"class",i)},i:wt,o:wt,d(t){t&&Ot(e)}}}function Kt(t,e,n){let r,{msg:o=""}=e,{type:i=""}=e,{position:s="bottom-center"}=e;return t.$set=t=>{"msg"in t&&n(0,o=t.msg),"type"in t&&n(1,i=t.type),"position"in t&&n(3,s=t.position)},t.$$.update=()=>{8&t.$$.dirty&&n(2,r=s.split("-").join(" "))},[o,i,r,s]}class Vt extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(_t(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=wt}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}{constructor(t){var e;super(),document.getElementById("svelte-3qemlt-style")||((e=Lt("style")).id="svelte-3qemlt-style",e.textContent=".toast-container.svelte-3qemlt{position:fixed;z-index:999}.top.svelte-3qemlt{top:15px}.bottom.svelte-3qemlt{bottom:15px}.left.svelte-3qemlt{left:15px}.right.svelte-3qemlt{right:15px}.center.svelte-3qemlt{left:50%;transform:translateX(-50%);-webkit-transform:translateX(-50%)}.toast.svelte-3qemlt{height:38px;line-height:38px;padding:0 20px;box-shadow:0 1px 3px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .24);color:#FFF;-webkit-transition:opacity 0.2s, -webkit-transform 0.2s;transition:opacity 0.2s, transform 0.2s, -webkit-transform 0.2s;-webkit-transform:translateY(35px);transform:translateY(35px);opacity:0;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.info.svelte-3qemlt{background-color:#0091EA}.success.svelte-3qemlt{background-color:#4CAF50}.error.svelte-3qemlt{background-color:#F44336}.default.svelte-3qemlt{background-color:#353535}.anim.svelte-3qemlt{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}",Ct(document.head,e)),Dt(this,t,Kt,Yt,Et,{msg:0,type:1,position:3})}}class Xt{constructor(t){this.opts=Object.assign({position:"bottom-center",duration:2e3},t)}show(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"default")}info(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"info")}success(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"success")}error(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"error")}_show(t,e,n){var r=Object.assign({},this.opts,e),o=new Vt({target:document.querySelector("body"),props:{msg:t,type:n,position:r.position}});setTimeout((()=>{o.$set({type:n+" anim"})}),0),setTimeout((()=>{o.$destroy()}),r.duration)}}function Zt(t,e,n){const r=t.slice();return r[11]=e[n],r}function Jt(e){let n,r,o,i,s;return{c(){n=h("p"),n.textContent="No data?",r=p(),o=h("p"),i=f("category = "),s=f(e[1])},m(t,e){c(t,n,e),c(t,r,e),c(t,o,e),a(o,i),a(o,s)},p(t,e){2&e&&y(s,t[1])},i:t,o:t,d(t){t&&l(n),t&&l(r),t&&l(o)}}}function Qt(t){let e,n,r,o,i,s,u,d,v,$,w,b,x,_,k,E,C=[],O=new Map,L=t[4];const q=t=>t[11].id;for(let e=0;e<L.length;e+=1){let n=Zt(t,L,e),r=q(n);O.set(r,C[e]=Wt(r,n))}return{c(){e=h("h3"),n=f(t[1]),r=p(),o=h("table"),i=h("tr"),i.innerHTML='<th>Beskrivning</th> \n\t\t\t<th class="right">Belopp</th>',s=p();for(let t=0;t<C.length;t+=1)C[t].c();u=p(),d=h("tr"),v=h("td"),v.textContent="Totalt",$=p(),w=h("td"),w.textContent=`${t[5]<=-1?t[5]:"+"+t[5]}`,b=p(),x=h("button"),x.textContent="Uppdatera",g(e,"class","entries-header"),g(i,"class","svelte-3mphah"),g(w,"class","right"),g(d,"class","svelte-3mphah"),g(o,"class","svelte-3mphah")},m(l,h){c(l,e,h),a(e,n),c(l,r,h),c(l,o,h),a(o,i),a(o,s);for(let t=0;t<C.length;t+=1)C[t].m(o,null);a(o,u),a(o,d),a(d,v),a(d,$),a(d,w),c(l,b,h),c(l,x,h),_=!0,k||(E=m(x,"click",t[8]),k=!0)},p(t,e){(!_||2&e)&&y(n,t[1]),20&e&&(L=t[4],B(),C=G(C,e,q,1,t,L,O,o,z,Wt,u,Zt),P())},i(t){if(!_){for(let t=0;t<L.length;t+=1)H(C[t]);_=!0}},o(t){for(let t=0;t<C.length;t+=1)M(C[t]);_=!1},d(t){t&&l(e),t&&l(r),t&&l(o);for(let t=0;t<C.length;t+=1)C[t].d();t&&l(b),t&&l(x),k=!1,E()}}}function Wt(t,e){let n,r,o,i,s;return r=new $t({props:{value:e[11].description,onSubmit:function(...t){return e[6](e[11],...t)}}}),i=new $t({props:{value:e[11].amount,onSubmit:function(...t){return e[7](e[11],...t)}}}),{key:t,first:null,c(){n=h("tr"),D(r.$$.fragment),o=p(),D(i.$$.fragment),g(n,"class","svelte-3mphah"),this.first=n},m(t,e){c(t,n,e),Y(r,n,null),a(n,o),Y(i,n,null),s=!0},p(t,n){e=t},i(t){s||(H(r.$$.fragment,t),H(i.$$.fragment,t),s=!0)},o(t){M(r.$$.fragment,t),M(i.$$.fragment,t),s=!1},d(t){t&&l(n),K(r),K(i)}}}function te(t){let e,n,r,o;const i=[Qt,Jt],s=[];function a(t,e){return void 0!==t[0]?0:1}return e=a(t),n=s[e]=i[e](t),{c(){n.c(),r=d()},m(t,n){s[e].m(t,n),c(t,r,n),o=!0},p(t,[o]){let c=e;e=a(t),e===c?s[e].p(t,o):(B(),M(s[c],1,1,(()=>{s[c]=null})),P(),n=s[e],n?n.p(t,o):(n=s[e]=i[e](t),n.c()),H(n,1),n.m(r.parentNode,r))},i(t){o||(H(n),o=!0)},o(t){M(n),o=!1},d(t){s[e].d(t),t&&l(r)}}}function ee(t,e,n){const r=new Xt;let{entries:o}=e,{category:i}=e,s=[];const a=(t,e,n)=>{e?t.description=n:t.amount=n;let r=s.findIndex((e=>e.id==t.id));r>0?s[r]=t:s.push(t)},c=async()=>{let t=!0;s.forEach((e=>{try{st(e)}catch(n){r.error(`Kunde inte uppdatera: ${e.description}`),t=!1}})),t&&r.success(`Uppdaterade ${s.length} rader.`)},{sortedEntries:l,total:u}=nt(o);return t.$$set=t=>{"entries"in t&&n(0,o=t.entries),"category"in t&&n(1,i=t.category)},[o,i,a,c,l,u,(t,e)=>a(t,!0,e),(t,e)=>a(t,!1,e),()=>c()]}class ne extends Z{constructor(t){super(),X(this,t,ee,te,i,{entries:0,category:1})}}function re(t,e,n){const r=t.slice();return r[5]=e[n],r}function oe(t){let e,n,r,o;var i=t[2];function s(t){return{props:{entries:t[1][t[5]],category:t[5]}}}return i&&(n=new i(s(t))),{c(){e=h("div"),n&&D(n.$$.fragment),r=p(),g(e,"class","category svelte-ayxflb")},m(t,i){c(t,e,i),n&&Y(n,e,null),a(e,r),o=!0},p(t,o){const a={};if(3&o&&(a.entries=t[1][t[5]]),1&o&&(a.category=t[5]),i!==(i=t[2])){if(n){B();const t=n;M(t.$$.fragment,1,0,(()=>{K(t,1)})),P()}i?(n=new i(s(t)),D(n.$$.fragment),H(n.$$.fragment,1),Y(n,e,r)):n=null}else i&&n.$set(a)},i(t){o||(n&&H(n.$$.fragment,t),o=!0)},o(t){n&&M(n.$$.fragment,t),o=!1},d(t){t&&l(e),n&&K(n)}}}function ie(t){let e,n,r=t[0].categories,o=[];for(let e=0;e<r.length;e+=1)o[e]=oe(re(t,r,e));const i=t=>M(o[t],1,1,(()=>{o[t]=null}));return{c(){for(let t=0;t<o.length;t+=1)o[t].c();e=d()},m(t,r){for(let e=0;e<o.length;e+=1)o[e].m(t,r);c(t,e,r),n=!0},p(t,[n]){if(7&n){let s;for(r=t[0].categories,s=0;s<r.length;s+=1){const i=re(t,r,s);o[s]?(o[s].p(i,n),H(o[s],1)):(o[s]=oe(i),o[s].c(),H(o[s],1),o[s].m(e.parentNode,e))}for(B(),s=r.length;s<o.length;s+=1)i(s);P()}},i(t){if(!n){for(let t=0;t<r.length;t+=1)H(o[t]);n=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)M(o[t]);n=!1},d(t){u(o,t),t&&l(e)}}}function se(t,e,n){let{view:r}=e,{data:o}=e,i=r?pt:ne;const s=o.categories.indexOf("Gemensamma");if(s>0){let t=o.categories[0];o.categories[0]=o.categories[s],o.categories[s]=t}let a=[];return o.categories.forEach((t=>{n(1,a[t]=o.result.filter((e=>e.Category.name===t)),a)})),t.$$set=t=>{"view"in t&&n(3,r=t.view),"data"in t&&n(0,o=t.data)},[o,a,i,r]}class ae extends Z{constructor(t){super(),X(this,t,se,ie,i,{view:3,data:0})}}function ce(e){return{c:t,m:t,p:t,i:t,o:t,d:t}}function le(t){let e,n,r,o,i,s,u,d,v;return s=new ae({props:{data:t[2],view:t[1]}}),{c(){e=h("div"),n=h("h2"),r=f("Budget "),o=h("input"),i=p(),D(s.$$.fragment),g(o,"id","datepicker"),g(o,"type","date"),g(o,"class","svelte-1m3r5e7"),g(e,"class","budget")},m(l,h){c(l,e,h),a(e,n),a(n,r),a(n,o),$(o,t[0]),a(e,i),Y(s,e,null),u=!0,d||(v=m(o,"input",t[4]),d=!0)},p(t,e){1&e&&$(o,t[0]);const n={};4&e&&(n.data=t[2]),2&e&&(n.view=t[1]),s.$set(n)},i(t){u||(H(s.$$.fragment,t),u=!0)},o(t){M(s.$$.fragment,t),u=!1},d(t){t&&l(e),K(s),d=!1,v()}}}function ue(e){let n;return{c(){n=h("p"),n.textContent="Hämtar budgetar"},m(t,e){c(t,n,e)},p:t,i:t,o:t,d(t){t&&l(n)}}}function he(t){let e,n,r,o={ctx:t,current:null,token:null,hasCatch:!1,pending:ue,then:le,catch:ce,value:2,blocks:[,,,]};return I(n=t[2],o),{c(){e=h("div"),o.block.c(),g(e,"class","flex-container svelte-1m3r5e7")},m(t,n){c(t,e,n),o.block.m(e,o.anchor=null),o.mount=()=>e,o.anchor=null,r=!0},p(e,[r]){if(t=e,o.ctx=t,4&r&&n!==(n=t[2])&&I(n,o));else{const e=t.slice();e[2]=o.resolved,o.block.p(e,r)}},i(t){r||(H(o.block),r=!0)},o(t){for(let t=0;t<3;t+=1){M(o.blocks[t])}r=!1},d(t){t&&l(e),o.block.d(),o.token=null,o=null}}}function fe(t,e,n){let{viewOrEdit:r}=e,o=!0;"view"===r?o=!0:"edit"===r&&(o=!1);let i,s=(new Date).toISOString().slice(0,10);return t.$$set=t=>{"viewOrEdit"in t&&n(3,r=t.viewOrEdit)},t.$$.update=()=>{1&t.$$.dirty&&n(2,i=rt({date:new Date(s)}))},[s,o,i,r,function(){s=this.value,n(0,s)}]}class pe extends Z{constructor(t){super(),X(this,t,fe,he,i,{viewOrEdit:3})}}function de(e){let n,r;return n=new pe({props:{viewOrEdit:"edit"}}),{c(){D(n.$$.fragment)},m(t,e){Y(n,t,e),r=!0},p:t,i(t){r||(H(n.$$.fragment,t),r=!0)},o(t){M(n.$$.fragment,t),r=!1},d(t){K(n,t)}}}class me extends Z{constructor(t){super(),X(this,t,null,de,i,{})}}function ge(e){let n,r;return n=new pe({props:{viewOrEdit:"view"}}),{c(){D(n.$$.fragment)},m(t,e){Y(n,t,e),r=!0},p:t,i(t){r||(H(n.$$.fragment,t),r=!0)},o(t){M(n.$$.fragment,t),r=!1},d(t){K(n,t)}}}class ve extends Z{constructor(t){super(),X(this,t,null,ge,i,{})}}const ye=[];const $e=function(e,n=t){let r;const o=[];function s(t){if(i(e,t)&&(e=t,r)){const t=!ye.length;for(let t=0;t<o.length;t+=1){const n=o[t];n[1](),ye.push(n,e)}if(t){for(let t=0;t<ye.length;t+=2)ye[t][0](ye[t+1]);ye.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(i,a=t){const c=[i,a];return o.push(c),1===o.length&&(r=n(s)||t),i(e),()=>{const t=o.indexOf(c);-1!==t&&o.splice(t,1),0===o.length&&(r(),r=null)}}}}(0);function we(t){const e=e=>{!t||t.contains(e.target)||e.defaultPrevented||t.dispatchEvent(new CustomEvent("click_outside",t))};return document.addEventListener("click",e,!0),{destroy(){document.removeEventListener("click",e,!0)}}}function be(t,e,n){const r=t.slice();return r[11]=e[n],r[12]=e,r[13]=n,r}function xe(t){let e,n,o,i,s,u;function f(){t[4].call(n,t[12],t[13])}function d(){t[5].call(i,t[12],t[13])}return{c(){e=h("div"),n=h("input"),o=p(),i=h("input"),g(n,"type","text"),g(n,"placeholder","Beskrivning"),g(n,"class","description svelte-1n6yju0"),g(i,"type","number"),g(i,"placeholder","Belopp"),g(i,"class","amount svelte-1n6yju0"),g(e,"class","entry-container svelte-1n6yju0")},m(r,l){c(r,e,l),a(e,n),$(n,t[11].description),a(e,o),a(e,i),$(i,t[11].amount),s||(u=[m(n,"input",f),m(i,"input",d)],s=!0)},p(e,r){t=e,1&r&&n.value!==t[11].description&&$(n,t[11].description),1&r&&v(i.value)!==t[11].amount&&$(i,t[11].amount)},d(t){t&&l(e),s=!1,r(u)}}}function _e(e){let n,o,i,d,w,b,x,_,k,E,C,O=e[0],L=[];for(let t=0;t<O.length;t+=1)L[t]=xe(be(e,O,t));return{c(){n=h("h4"),o=f(e[1]),i=p(),d=h("form");for(let t=0;t<L.length;t+=1)L[t].c();w=p(),b=h("div"),x=h("input"),_=p(),k=h("input"),x.disabled=!0,g(x,"type","text"),x.value="Totalt",g(x,"class","description svelte-1n6yju0"),k.disabled=!0,g(k,"type","number"),g(k,"class","amount svelte-1n6yju0"),g(b,"class","entry-container svelte-1n6yju0")},m(t,r){c(t,n,r),a(n,o),c(t,i,r),c(t,d,r);for(let t=0;t<L.length;t+=1)L[t].m(d,null);a(d,w),a(d,b),a(b,x),a(b,_),a(b,k),$(k,e[2]),E||(C=[m(k,"input",e[6]),s(we.call(null,d)),m(d,"click_outside",e[3])],E=!0)},p(t,[e]){if(2&e&&y(o,t[1]),1&e){let n;for(O=t[0],n=0;n<O.length;n+=1){const r=be(t,O,n);L[n]?L[n].p(r,e):(L[n]=xe(r),L[n].c(),L[n].m(d,w))}for(;n<L.length;n+=1)L[n].d(1);L.length=O.length}4&e&&v(k.value)!==t[2]&&$(k,t[2])},i:t,o:t,d(t){t&&l(n),t&&l(i),t&&l(d),u(L,t),E=!1,r(C)}}}function ke(t,e,n){let{entries:r}=e,{category:o}=e,i=0,s=0;if("HALF_OF_GEMENSAMMA"===r[0].description){let t=r[0];s=t.amount;let e="Halva gemensamma";s>0?e+=` (+${s})`:s<0&&(e+=` (${s})`),t.description=e,$e.subscribe((e=>{t.amount=e/2-s}))}const a=t=>null==t||0==t.length,c=()=>{l(),n(2,i=0),r.forEach((t=>{n(2,i+=t.amount)})),r.sort(((t,e)=>t.amount-e.amount)),"Gemensamma"===o&&$e.set(i)},l=()=>{n(0,r=r.filter((t=>!a(t.description)&&!a(t.amount))))};return _((()=>{c()})),t.$$set=t=>{"entries"in t&&n(0,r=t.entries),"category"in t&&n(1,o=t.category)},t.$$.update=()=>{if(1&t.$$.dirty){let t=r.length,e=r[t-1];a(e.description)||a(e.amount)||(()=>{let t={Category:r[0].Category,description:"",amount:"",date:new Date};n(0,r=[...r,t])})()}},[r,o,i,c,function(t,e){t[e].description=this.value,n(0,r)},function(t,e){t[e].amount=v(this.value),n(0,r)},function(){i=v(this.value),n(2,i)}]}class Ee extends Z{constructor(t){super(),X(this,t,ke,_e,i,{entries:0,category:1})}}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var Ce,Oe=(function(t,e){t.exports=function(){var t=Array.isArray||function(t){return"[object Array]"==Object.prototype.toString.call(t)},e=y,n=a,r=c,o=l,i=v,s=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))"].join("|"),"g");function a(t){for(var e,n=[],r=0,o=0,i="";null!=(e=s.exec(t));){var a=e[0],c=e[1],l=e.index;if(i+=t.slice(o,l),o=l+a.length,c)i+=c[1];else{i&&(n.push(i),i="");var u=e[2],f=e[3],p=e[4],d=e[5],m=e[6],g=e[7],v="+"===m||"*"===m,y="?"===m||"*"===m,$=u||"/",w=p||d||(g?".*":"[^"+$+"]+?");n.push({name:f||r++,prefix:u||"",delimiter:$,optional:y,repeat:v,pattern:h(w)})}}return o<t.length&&(i+=t.substr(o)),i&&n.push(i),n}function c(t){return l(a(t))}function l(e){for(var n=new Array(e.length),r=0;r<e.length;r++)"object"==typeof e[r]&&(n[r]=new RegExp("^"+e[r].pattern+"$"));return function(r){for(var o="",i=r||{},s=0;s<e.length;s++){var a=e[s];if("string"!=typeof a){var c,l=i[a.name];if(null==l){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to be defined')}if(t(l)){if(!a.repeat)throw new TypeError('Expected "'+a.name+'" to not repeat, but received "'+l+'"');if(0===l.length){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to not be empty')}for(var u=0;u<l.length;u++){if(c=encodeURIComponent(l[u]),!n[s].test(c))throw new TypeError('Expected all "'+a.name+'" to match "'+a.pattern+'", but received "'+c+'"');o+=(0===u?a.prefix:a.delimiter)+c}}else{if(c=encodeURIComponent(l),!n[s].test(c))throw new TypeError('Expected "'+a.name+'" to match "'+a.pattern+'", but received "'+c+'"');o+=a.prefix+c}}else o+=a}return o}}function u(t){return t.replace(/([.+*?=^!:${}()[\]|\/])/g,"\\$1")}function h(t){return t.replace(/([=!:$\/()])/g,"\\$1")}function f(t,e){return t.keys=e,t}function p(t){return t.sensitive?"":"i"}function d(t,e){var n=t.source.match(/\((?!\?)/g);if(n)for(var r=0;r<n.length;r++)e.push({name:r,prefix:null,delimiter:null,optional:!1,repeat:!1,pattern:null});return f(t,e)}function m(t,e,n){for(var r=[],o=0;o<t.length;o++)r.push(y(t[o],e,n).source);return f(new RegExp("(?:"+r.join("|")+")",p(n)),e)}function g(t,e,n){for(var r=a(t),o=v(r,n),i=0;i<r.length;i++)"string"!=typeof r[i]&&e.push(r[i]);return f(o,e)}function v(t,e){for(var n=(e=e||{}).strict,r=!1!==e.end,o="",i=t[t.length-1],s="string"==typeof i&&/\/$/.test(i),a=0;a<t.length;a++){var c=t[a];if("string"==typeof c)o+=u(c);else{var l=u(c.prefix),h=c.pattern;c.repeat&&(h+="(?:"+l+h+")*"),o+=h=c.optional?l?"(?:"+l+"("+h+"))?":"("+h+")?":l+"("+h+")"}}return n||(o=(s?o.slice(0,-2):o)+"(?:\\/(?=$))?"),o+=r?"$":n&&s?"":"(?=\\/|$)",new RegExp("^"+o,p(e))}function y(e,n,r){return t(n=n||[])?r||(r={}):(r=n,n=[]),e instanceof RegExp?d(e,n):t(e)?m(e,n,r):g(e,n,r)}e.parse=n,e.compile=r,e.tokensToFunction=o,e.tokensToRegExp=i;var $,w="undefined"!=typeof document,b="undefined"!=typeof window,x="undefined"!=typeof history,_="undefined"!=typeof process,k=w&&document.ontouchstart?"touchstart":"click",E=b&&!(!window.history.location&&!window.location);function C(){this.callbacks=[],this.exits=[],this.current="",this.len=0,this._decodeURLComponents=!0,this._base="",this._strict=!1,this._running=!1,this._hashbang=!1,this.clickHandler=this.clickHandler.bind(this),this._onpopstate=this._onpopstate.bind(this)}function O(){var t=new C;function e(){return L.apply(t,arguments)}return e.callbacks=t.callbacks,e.exits=t.exits,e.base=t.base.bind(t),e.strict=t.strict.bind(t),e.start=t.start.bind(t),e.stop=t.stop.bind(t),e.show=t.show.bind(t),e.back=t.back.bind(t),e.redirect=t.redirect.bind(t),e.replace=t.replace.bind(t),e.dispatch=t.dispatch.bind(t),e.exit=t.exit.bind(t),e.configure=t.configure.bind(t),e.sameOrigin=t.sameOrigin.bind(t),e.clickHandler=t.clickHandler.bind(t),e.create=O,Object.defineProperty(e,"len",{get:function(){return t.len},set:function(e){t.len=e}}),Object.defineProperty(e,"current",{get:function(){return t.current},set:function(e){t.current=e}}),e.Context=S,e.Route=T,e}function L(t,e){if("function"==typeof t)return L.call(this,"*",t);if("function"==typeof e)for(var n=new T(t,null,this),r=1;r<arguments.length;++r)this.callbacks.push(n.middleware(arguments[r]));else"string"==typeof t?this["string"==typeof e?"redirect":"show"](t,e):this.start(t)}function q(t){if(!t.handled){var e=this,n=e._window;(e._hashbang?E&&this._getBase()+n.location.hash.replace("#!",""):E&&n.location.pathname+n.location.search)!==t.canonicalPath&&(e.stop(),t.handled=!1,E&&(n.location.href=t.canonicalPath))}}function R(t){return t.replace(/([.+*?=^!:${}()[\]|/\\])/g,"\\$1")}function S(t,e,n){var r=this.page=n||L,o=r._window,i=r._hashbang,s=r._getBase();"/"===t[0]&&0!==t.indexOf(s)&&(t=s+(i?"#!":"")+t);var a=t.indexOf("?");this.canonicalPath=t;var c=new RegExp("^"+R(s));if(this.path=t.replace(c,"")||"/",i&&(this.path=this.path.replace("#!","")||"/"),this.title=w&&o.document.title,this.state=e||{},this.state.path=t,this.querystring=~a?r._decodeURLEncodedURIComponent(t.slice(a+1)):"",this.pathname=r._decodeURLEncodedURIComponent(~a?t.slice(0,a):t),this.params={},this.hash="",!i){if(!~this.path.indexOf("#"))return;var l=this.path.split("#");this.path=this.pathname=l[0],this.hash=r._decodeURLEncodedURIComponent(l[1])||"",this.querystring=this.querystring.split("#")[0]}}function T(t,n,r){var o=this.page=r||A,i=n||{};i.strict=i.strict||o._strict,this.path="*"===t?"(.*)":t,this.method="GET",this.regexp=e(this.path,this.keys=[],i)}C.prototype.configure=function(t){var e=t||{};this._window=e.window||b&&window,this._decodeURLComponents=!1!==e.decodeURLComponents,this._popstate=!1!==e.popstate&&b,this._click=!1!==e.click&&w,this._hashbang=!!e.hashbang;var n=this._window;this._popstate?n.addEventListener("popstate",this._onpopstate,!1):b&&n.removeEventListener("popstate",this._onpopstate,!1),this._click?n.document.addEventListener(k,this.clickHandler,!1):w&&n.document.removeEventListener(k,this.clickHandler,!1),this._hashbang&&b&&!x?n.addEventListener("hashchange",this._onpopstate,!1):b&&n.removeEventListener("hashchange",this._onpopstate,!1)},C.prototype.base=function(t){if(0===arguments.length)return this._base;this._base=t},C.prototype._getBase=function(){var t=this._base;if(t)return t;var e=b&&this._window&&this._window.location;return b&&this._hashbang&&e&&"file:"===e.protocol&&(t=e.pathname),t},C.prototype.strict=function(t){if(0===arguments.length)return this._strict;this._strict=t},C.prototype.start=function(t){var e=t||{};if(this.configure(e),!1!==e.dispatch){var n;if(this._running=!0,E){var r=this._window.location;n=this._hashbang&&~r.hash.indexOf("#!")?r.hash.substr(2)+r.search:this._hashbang?r.search+r.hash:r.pathname+r.search+r.hash}this.replace(n,null,!0,e.dispatch)}},C.prototype.stop=function(){if(this._running){this.current="",this.len=0,this._running=!1;var t=this._window;this._click&&t.document.removeEventListener(k,this.clickHandler,!1),b&&t.removeEventListener("popstate",this._onpopstate,!1),b&&t.removeEventListener("hashchange",this._onpopstate,!1)}},C.prototype.show=function(t,e,n,r){var o=new S(t,e,this),i=this.prevContext;return this.prevContext=o,this.current=o.path,!1!==n&&this.dispatch(o,i),!1!==o.handled&&!1!==r&&o.pushState(),o},C.prototype.back=function(t,e){var n=this;if(this.len>0){var r=this._window;x&&r.history.back(),this.len--}else t?setTimeout((function(){n.show(t,e)})):setTimeout((function(){n.show(n._getBase(),e)}))},C.prototype.redirect=function(t,e){var n=this;"string"==typeof t&&"string"==typeof e&&L.call(this,t,(function(t){setTimeout((function(){n.replace(e)}),0)})),"string"==typeof t&&void 0===e&&setTimeout((function(){n.replace(t)}),0)},C.prototype.replace=function(t,e,n,r){var o=new S(t,e,this),i=this.prevContext;return this.prevContext=o,this.current=o.path,o.init=n,o.save(),!1!==r&&this.dispatch(o,i),o},C.prototype.dispatch=function(t,e){var n=0,r=0,o=this;function i(){var t=o.exits[r++];if(!t)return s();t(e,i)}function s(){var e=o.callbacks[n++];if(t.path===o.current)return e?void e(t,s):q.call(o,t);t.handled=!1}e?i():s()},C.prototype.exit=function(t,e){if("function"==typeof t)return this.exit("*",t);for(var n=new T(t,null,this),r=1;r<arguments.length;++r)this.exits.push(n.middleware(arguments[r]))},C.prototype.clickHandler=function(t){if(1===this._which(t)&&!(t.metaKey||t.ctrlKey||t.shiftKey||t.defaultPrevented)){var e=t.target,n=t.path||(t.composedPath?t.composedPath():null);if(n)for(var r=0;r<n.length;r++)if(n[r].nodeName&&"A"===n[r].nodeName.toUpperCase()&&n[r].href){e=n[r];break}for(;e&&"A"!==e.nodeName.toUpperCase();)e=e.parentNode;if(e&&"A"===e.nodeName.toUpperCase()){var o="object"==typeof e.href&&"SVGAnimatedString"===e.href.constructor.name;if(!e.hasAttribute("download")&&"external"!==e.getAttribute("rel")){var i=e.getAttribute("href");if((this._hashbang||!this._samePath(e)||!e.hash&&"#"!==i)&&!(i&&i.indexOf("mailto:")>-1)&&!(o?e.target.baseVal:e.target)&&(o||this.sameOrigin(e.href))){var s=o?e.href.baseVal:e.pathname+e.search+(e.hash||"");s="/"!==s[0]?"/"+s:s,_&&s.match(/^\/[a-zA-Z]:\//)&&(s=s.replace(/^\/[a-zA-Z]:\//,"/"));var a=s,c=this._getBase();0===s.indexOf(c)&&(s=s.substr(c.length)),this._hashbang&&(s=s.replace("#!","")),(!c||a!==s||E&&"file:"===this._window.location.protocol)&&(t.preventDefault(),this.show(a))}}}}},C.prototype._onpopstate=($=!1,b?(w&&"complete"===document.readyState?$=!0:window.addEventListener("load",(function(){setTimeout((function(){$=!0}),0)})),function(t){if($){var e=this;if(t.state){var n=t.state.path;e.replace(n,t.state)}else if(E){var r=e._window.location;e.show(r.pathname+r.search+r.hash,void 0,void 0,!1)}}}):function(){}),C.prototype._which=function(t){return null==(t=t||b&&this._window.event).which?t.button:t.which},C.prototype._toURL=function(t){var e=this._window;if("function"==typeof URL&&E)return new URL(t,e.location.toString());if(w){var n=e.document.createElement("a");return n.href=t,n}},C.prototype.sameOrigin=function(t){if(!t||!E)return!1;var e=this._toURL(t),n=this._window.location;return n.protocol===e.protocol&&n.hostname===e.hostname&&(n.port===e.port||""===n.port&&(80==e.port||443==e.port))},C.prototype._samePath=function(t){if(!E)return!1;var e=this._window.location;return t.pathname===e.pathname&&t.search===e.search},C.prototype._decodeURLEncodedURIComponent=function(t){return"string"!=typeof t?t:this._decodeURLComponents?decodeURIComponent(t.replace(/\+/g," ")):t},S.prototype.pushState=function(){var t=this.page,e=t._window,n=t._hashbang;t.len++,x&&e.history.pushState(this.state,this.title,n&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},S.prototype.save=function(){var t=this.page;x&&t._window.history.replaceState(this.state,this.title,t._hashbang&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},T.prototype.middleware=function(t){var e=this;return function(n,r){if(e.match(n.path,n.params))return n.routePath=e.path,t(n,r);r()}},T.prototype.match=function(t,e){var n=this.keys,r=t.indexOf("?"),o=~r?t.slice(0,r):t,i=this.regexp.exec(decodeURIComponent(o));if(!i)return!1;delete e[0];for(var s=1,a=i.length;s<a;++s){var c=n[s-1],l=this.page._decodeURLEncodedURIComponent(i[s]);void 0===l&&hasOwnProperty.call(e,c.name)||(e[c.name]=l)}return!0};var A=O(),j=A,U=A;return j.default=U,j}()}(Ce={exports:{}},Ce.exports),Ce.exports);function Le(t,e,n){const r=t.slice();return r[7]=e[n],r[8]=e,r[9]=n,r}function qe(t){let e,n,o,i,s,f,d,v,y,w,b,x,_,k,E=t[2].categories,C=[];for(let e=0;e<E.length;e+=1)C[e]=Se(Le(t,E,e));const O=t=>M(C[t],1,1,(()=>{C[t]=null}));return{c(){e=h("div");for(let t=0;t<C.length;t+=1)C[t].c();n=p(),o=h("div"),i=h("label"),s=h("p"),s.textContent="Vilken månad gäller budgeten?",f=p(),d=h("input"),v=p(),y=h("br"),w=p(),b=h("button"),b.textContent="Skicka",g(e,"class","budget-container svelte-zudtch"),g(d,"class","input-date svelte-zudtch"),g(d,"type","date"),g(b,"class","btn waves-effect waves-light indigo"),g(o,"class","center")},m(r,l){c(r,e,l);for(let t=0;t<C.length;t+=1)C[t].m(e,null);c(r,n,l),c(r,o,l),a(o,i),a(i,s),a(i,f),a(i,d),$(d,t[0]),a(o,v),a(o,y),a(o,w),a(o,b),x=!0,_||(k=[m(d,"input",t[5]),m(b,"click",t[3])],_=!0)},p(t,n){if(6&n){let r;for(E=t[2].categories,r=0;r<E.length;r+=1){const o=Le(t,E,r);C[r]?(C[r].p(o,n),H(C[r],1)):(C[r]=Se(o),C[r].c(),H(C[r],1),C[r].m(e,null))}for(B(),r=E.length;r<C.length;r+=1)O(r);P()}1&n&&$(d,t[0])},i(t){if(!x){for(let t=0;t<E.length;t+=1)H(C[t]);x=!0}},o(t){C=C.filter(Boolean);for(let t=0;t<C.length;t+=1)M(C[t]);x=!1},d(t){t&&l(e),u(C,t),t&&l(n),t&&l(o),_=!1,r(k)}}}function Re(e){let n;return{c(){n=h("p"),n.textContent="Hämtar standard raderna..."},m(t,e){c(t,n,e)},p:t,i:t,o:t,d(t){t&&l(n)}}}function Se(t){let e,n,r,o,i;function s(e){t[4].call(null,e,t[7])}let u={category:t[7]};return void 0!==t[1][t[7]]&&(u.entries=t[1][t[7]]),n=new Ee({props:u}),E.push((()=>function(t,e,n){const r=t.$$.props[e];void 0!==r&&(t.$$.bound[r]=n,n(t.$$.ctx[r]))}(n,"entries",s))),{c(){e=h("div"),D(n.$$.fragment),o=p(),g(e,"class","budget svelte-zudtch")},m(t,r){c(t,e,r),Y(n,e,null),a(e,o),i=!0},p(e,o){t=e;const i={};4&o&&(i.category=t[7]),!r&&6&o&&(r=!0,i.entries=t[1][t[7]],function(t){O.push(t)}((()=>r=!1))),n.$set(i)},i(t){i||(H(n.$$.fragment,t),i=!0)},o(t){M(n.$$.fragment,t),i=!1},d(t){t&&l(e),K(n)}}}function Te(t){let e,n,r,o;const i=[Re,qe],s=[];function a(t,e){return void 0===t[2]?0:1}return n=a(t),r=s[n]=i[n](t),{c(){e=h("div"),r.c(),g(e,"id","new-budget-wrapper"),g(e,"class","svelte-zudtch")},m(t,r){c(t,e,r),s[n].m(e,null),o=!0},p(t,[o]){let c=n;n=a(t),n===c?s[n].p(t,o):(B(),M(s[c],1,1,(()=>{s[c]=null})),P(),r=s[n],r?r.p(t,o):(r=s[n]=i[n](t),r.c()),H(r,1),r.m(e,null))},i(t){o||(H(r),o=!0)},o(t){M(r),o=!1},d(t){t&&l(e),s[n].d()}}}function Ae(t,e,n){const r=new Xt;let o,i=(new Date).toISOString().slice(0,10),s=[];return it().then((t=>{const e=t.categories.indexOf("Gemensamma");if(e>0){let n=t.categories[0];t.categories[0]=t.categories[e],t.categories[e]=n}t.categories.forEach((e=>{n(1,s[e]=t.result.filter((t=>t.Category.name===e)),s)})),n(2,o=t)})),[i,s,o,async function(){let t=[];o.categories.forEach((e=>{t=[...t,...s[e]]})),t=t.filter((t=>""!==t.value&&""!==t.description)),t.forEach((t=>{t.date=new Date(i)}));try{console.dir(t),await ot(t),r.success("Budget sparad!"),Oe("/")}catch(t){r.error("Något gick fel."),console.error(t.message)}},function(t,e){s[e]=t,n(1,s)},function(){i=this.value,n(0,i)}]}class je extends Z{constructor(t){super(),X(this,t,Ae,Te,i,{})}}function Ue(e){let n;return{c(){n=h("nav"),n.innerHTML='<div class="nav-wrapper"><ul id="nav-mobile" class="left"><li><a href="/" class="svelte-1u6n4gp">Hem</a></li> \n\t\t\t<li><a href="/new" class="svelte-1u6n4gp">Ny budget</a></li> \n\t\t\t<li><a href="/edit" class="svelte-1u6n4gp">Ändra budget</a></li></ul></div>',g(n,"class","indigo darken-3")},m(t,e){c(t,n,e)},p:t,i:t,o:t,d(t){t&&l(n)}}}class Ne extends Z{constructor(t){super(),X(this,t,null,Ue,i,{})}}function Be(t){let e,n,r,o,i,s,a,u;o=new Ne({});var f=t[0];return f&&(s=new f({})),{c(){e=p(),n=h("link"),r=p(),D(o.$$.fragment),i=p(),s&&D(s.$$.fragment),a=d(),document.title="Budget planeraren 2000",g(n,"rel","stylesheet"),g(n,"href","/build/base.css")},m(t,l){c(t,e,l),c(t,n,l),c(t,r,l),Y(o,t,l),c(t,i,l),s&&Y(s,t,l),c(t,a,l),u=!0},p(t,[e]){if(f!==(f=t[0])){if(s){B();const t=s;M(t.$$.fragment,1,0,(()=>{K(t,1)})),P()}f?(s=new f({}),D(s.$$.fragment),H(s.$$.fragment,1),Y(s,a.parentNode,a)):s=null}},i(t){u||(H(o.$$.fragment,t),s&&H(s.$$.fragment,t),u=!0)},o(t){M(o.$$.fragment,t),s&&M(s.$$.fragment,t),u=!1},d(t){t&&l(e),t&&l(n),t&&l(r),K(o,t),t&&l(i),t&&l(a),s&&K(s,t)}}}function Pe(t,e,n){let r=ve;return Oe("/",(()=>{n(0,r=ve)})),Oe("/new",(()=>{n(0,r=je)})),Oe("/edit",(()=>{n(0,r=me)})),Oe.start(),[r]}return new class extends Z{constructor(t){super(),X(this,t,Pe,Be,i,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
