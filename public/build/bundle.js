var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e){t.appendChild(e)}function a(t,e,n){t.insertBefore(e,n||null)}function c(t){t.parentNode.removeChild(t)}function l(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function u(t){return document.createElement(t)}function h(t){return document.createTextNode(t)}function f(){return h(" ")}function p(){return h("")}function d(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function g(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function m(t){return""===t?null:+t}function v(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function y(t,e){t.value=null==e?"":e}let b;function w(t){b=t}function $(){if(!b)throw new Error("Function called outside component initialization");return b}const x=[],_=[],k=[],E=[],C=Promise.resolve();let q=!1;function L(t){k.push(t)}let R=!1;const O=new Set;function A(){if(!R){R=!0;do{for(let t=0;t<x.length;t+=1){const e=x[t];w(e),j(e.$$)}for(w(null),x.length=0;_.length;)_.pop()();for(let t=0;t<k.length;t+=1){const e=k[t];O.has(e)||(O.add(e),e())}k.length=0}while(x.length);for(;E.length;)E.pop()();q=!1,R=!1,O.clear()}}function j(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(L)}}const T=new Set;let U;function S(){U={r:0,c:[],p:U}}function N(){U.r||o(U.c),U=U.p}function P(t,e){t&&t.i&&(T.delete(t),t.i(e))}function B(t,e,n,o){if(t&&t.o){if(T.has(t))return;T.add(t),U.c.push((()=>{T.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function H(t,e){const n=e.token={};function o(t,o,r,i){if(e.token!==n)return;e.resolved=i;let s=e.ctx;void 0!==r&&(s=s.slice(),s[r]=i);const a=t&&(e.current=t)(s);let c=!1;e.block&&(e.blocks?e.blocks.forEach(((t,n)=>{n!==o&&t&&(S(),B(t,1,1,(()=>{e.blocks[n]===t&&(e.blocks[n]=null)})),N())})):e.block.d(1),a.c(),P(a,1),a.m(e.mount(),e.anchor),c=!0),e.block=a,e.blocks&&(e.blocks[o]=a),c&&A()}if((r=t)&&"object"==typeof r&&"function"==typeof r.then){const n=$();if(t.then((t=>{w(n),o(e.then,1,e.value,t),w(null)}),(t=>{if(w(n),o(e.catch,2,e.error,t),w(null),!e.hasCatch)throw t})),e.current!==e.pending)return o(e.pending,0),!0}else{if(e.current!==e.then)return o(e.then,1,e.value,t),!0;e.resolved=t}var r}function I(t,e){t.d(1),e.delete(t.key)}function M(t){t&&t.c()}function F(t,n,i){const{fragment:s,on_mount:a,on_destroy:c,after_update:l}=t.$$;s&&s.m(n,i),L((()=>{const n=a.map(e).filter(r);c?c.push(...n):o(n),t.$$.on_mount=[]})),l.forEach(L)}function G(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Y(t,e){-1===t.$$.dirty[0]&&(x.push(t),q||(q=!0,C.then(A)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function z(e,r,i,s,a,l,u=[-1]){const h=b;w(e);const f=e.$$={fragment:null,ctx:null,props:l,update:t,not_equal:a,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(h?h.$$.context:[]),callbacks:n(),dirty:u,skip_bound:!1};let p=!1;if(f.ctx=i?i(e,r.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return f.ctx&&a(f.ctx[t],f.ctx[t]=r)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](r),p&&Y(e,t)),n})):[],f.update(),p=!0,o(f.before_update),f.fragment=!!s&&s(f.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);f.fragment&&f.fragment.l(t),t.forEach(c)}else f.fragment&&f.fragment.c();r.intro&&P(e.$$.fragment),F(e,r.target,r.anchor),A()}w(h)}class D{$destroy(){G(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const K=window.location,V=`${K.protocol}//${K.hostname}/api`,X={"Content-Type":"application/json"},Z=(t,e,n)=>{const o={method:e,headers:X};n&&(o.body=JSON.stringify(n));const r=fetch(V+t,o);return console.log(r),r},J=t=>Z(t,"GET");var Q=async t=>{let e="/entry/specific/?";for(const n in t)if("date"===n){const o=t[n];e+=`year=${o.getFullYear()}&month=${o.getMonth()+1}&`}else e+=`${n}=${t[n]}&`;const n=await J(e),o=await n.json();if(200!==n.status)throw new Error(o.message);return o},W=async t=>{let e;e=Array.isArray(t)?{entries:t}:{entries:[t]};const n=await((t,e)=>Z(t,"POST",e))("/entry/new",e),o=await n.json();if(201!==n.status)throw new Error(o.message);return o},tt=async()=>{const t=await J("/default"),e=await t.json();if(200!==t.status)throw new Error(e.message);return e};function et(t,e,n){const o=t.slice();return o[6]=e[n],o}function nt(t){let e,n,o,r,i;return{c(){e=u("p"),e.textContent="No data?",n=f(),o=u("p"),r=h("category = "),i=h(t[1])},m(t,c){a(t,e,c),a(t,n,c),a(t,o,c),s(o,r),s(o,i)},p(t,e){2&e&&v(i,t[1])},d(t){t&&c(e),t&&c(n),t&&c(o)}}}function ot(t){let e,n,o,r,i,l,p,d,m,y,b,w,$=[],x=new Map,_=(t[2]<0?t[2]:"+"+t[2])+"",k=t[3];const E=t=>t[6].id;for(let e=0;e<k.length;e+=1){let n=et(t,k,e),o=E(n);x.set(o,$[e]=rt(o,n))}return{c(){e=u("h3"),n=h(t[1]),o=f(),r=u("table"),i=u("tr"),i.innerHTML='<th>Beskrivning</th> \n\t\t\t<th class="right">Belopp</th>',l=f();for(let t=0;t<$.length;t+=1)$[t].c();p=f(),d=u("tr"),m=u("td"),m.textContent="Totalt",y=f(),b=u("td"),w=h(_),g(e,"class","entries-header"),g(i,"class","svelte-3mphah"),g(b,"class","right"),g(d,"class","svelte-3mphah"),g(r,"class","svelte-3mphah")},m(t,c){a(t,e,c),s(e,n),a(t,o,c),a(t,r,c),s(r,i),s(r,l);for(let t=0;t<$.length;t+=1)$[t].m(r,null);s(r,p),s(r,d),s(d,m),s(d,y),s(d,b),s(b,w)},p(t,e){2&e&&v(n,t[1]),8&e&&(k=t[3],$=function(t,e,n,o,r,i,s,a,c,l,u,h){let f=t.length,p=i.length,d=f;const g={};for(;d--;)g[t[d].key]=d;const m=[],v=new Map,y=new Map;for(d=p;d--;){const t=h(r,i,d),a=n(t);let c=s.get(a);c?o&&c.p(t,e):(c=l(a,t),c.c()),v.set(a,m[d]=c),a in g&&y.set(a,Math.abs(d-g[a]))}const b=new Set,w=new Set;function $(t){P(t,1),t.m(a,u),s.set(t.key,t),u=t.first,p--}for(;f&&p;){const e=m[p-1],n=t[f-1],o=e.key,r=n.key;e===n?(u=e.first,f--,p--):v.has(r)?!s.has(o)||b.has(o)?$(e):w.has(r)?f--:y.get(o)>y.get(r)?(w.add(o),$(e)):(b.add(r),f--):(c(n,s),f--)}for(;f--;){const e=t[f];v.has(e.key)||c(e,s)}for(;p;)$(m[p-1]);return m}($,e,E,1,t,k,x,r,I,rt,p,et)),4&e&&_!==(_=(t[2]<0?t[2]:"+"+t[2])+"")&&v(w,_)},d(t){t&&c(e),t&&c(o),t&&c(r);for(let t=0;t<$.length;t+=1)$[t].d()}}}function rt(t,e){let n,o,r,i,l,p,d=e[6].description+"",m=e[6].amount+"";return{key:t,first:null,c(){n=u("tr"),o=u("td"),r=h(d),i=f(),l=u("td"),p=h(m),g(l,"class","right"),g(n,"class","svelte-3mphah"),this.first=n},m(t,e){a(t,n,e),s(n,o),s(o,r),s(n,i),s(n,l),s(l,p)},p(t,n){e=t},d(t){t&&c(n)}}}function it(e){let n;function o(t,e){return void 0!==t[0]?ot:nt}let r=o(e),i=r(e);return{c(){i.c(),n=p()},m(t,e){i.m(t,e),a(t,n,e)},p(t,[e]){r===(r=o(t))&&i?i.p(t,e):(i.d(1),i=r(t),i&&(i.c(),i.m(n.parentNode,n)))},i:t,o:t,d(t){i.d(t),t&&c(n)}}}function st(t,e,n){let{entries:o}=e,{category:r}=e,i=0,s=[],a=[];o.forEach((t=>{n(2,i+=t.amount),t.amount>0?a.push(t):s.push(t)})),s.sort(((t,e)=>t.amount-e.amount)),a.sort(((t,e)=>e.amount-t.amount));let c=[...a,...s];return t.$$set=t=>{"entries"in t&&n(0,o=t.entries),"category"in t&&n(1,r=t.category)},[o,r,i,c]}class at extends D{constructor(t){super(),z(this,t,st,it,i,{entries:0,category:1})}}function ct(t,e,n){const o=t.slice();return o[3]=e[n],o}function lt(t){let e,n,o,r;return n=new at({props:{entries:t[1][t[3]],category:t[3]}}),{c(){e=u("div"),M(n.$$.fragment),o=f(),g(e,"class","category svelte-ayxflb")},m(t,i){a(t,e,i),F(n,e,null),s(e,o),r=!0},p(t,e){const o={};3&e&&(o.entries=t[1][t[3]]),1&e&&(o.category=t[3]),n.$set(o)},i(t){r||(P(n.$$.fragment,t),r=!0)},o(t){B(n.$$.fragment,t),r=!1},d(t){t&&c(e),G(n)}}}function ut(t){let e,n,o=t[0].categories,r=[];for(let e=0;e<o.length;e+=1)r[e]=lt(ct(t,o,e));const i=t=>B(r[t],1,1,(()=>{r[t]=null}));return{c(){for(let t=0;t<r.length;t+=1)r[t].c();e=p()},m(t,o){for(let e=0;e<r.length;e+=1)r[e].m(t,o);a(t,e,o),n=!0},p(t,[n]){if(3&n){let s;for(o=t[0].categories,s=0;s<o.length;s+=1){const i=ct(t,o,s);r[s]?(r[s].p(i,n),P(r[s],1)):(r[s]=lt(i),r[s].c(),P(r[s],1),r[s].m(e.parentNode,e))}for(S(),s=o.length;s<r.length;s+=1)i(s);N()}},i(t){if(!n){for(let t=0;t<o.length;t+=1)P(r[t]);n=!0}},o(t){r=r.filter(Boolean);for(let t=0;t<r.length;t+=1)B(r[t]);n=!1},d(t){l(r,t),t&&c(e)}}}function ht(t,e,n){let{data:o}=e;const r=o.categories.indexOf("Gemensamma");if(r>0){let t=o.categories[0];o.categories[0]=o.categories[r],o.categories[r]=t}let i=[];return o.categories.forEach((t=>{n(1,i[t]=o.result.filter((e=>e.Category.name===t)),i)})),t.$$set=t=>{"data"in t&&n(0,o=t.data)},[o,i]}class ft extends D{constructor(t){super(),z(this,t,ht,ut,i,{data:0})}}function pt(e){return{c:t,m:t,p:t,i:t,o:t,d:t}}function dt(t){let e,n,o,r,i,l,p,m,v;return l=new ft({props:{data:t[1]}}),{c(){e=u("div"),n=u("h2"),o=h("Budget "),r=u("input"),i=f(),M(l.$$.fragment),g(r,"id","datepicker"),g(r,"type","date"),g(r,"class","svelte-1m3r5e7"),g(e,"class","budget")},m(c,u){a(c,e,u),s(e,n),s(n,o),s(n,r),y(r,t[0]),s(e,i),F(l,e,null),p=!0,m||(v=d(r,"input",t[2]),m=!0)},p(t,e){1&e&&y(r,t[0]);const n={};2&e&&(n.data=t[1]),l.$set(n)},i(t){p||(P(l.$$.fragment,t),p=!0)},o(t){B(l.$$.fragment,t),p=!1},d(t){t&&c(e),G(l),m=!1,v()}}}function gt(e){let n;return{c(){n=u("p"),n.textContent="Hämtar budgetar"},m(t,e){a(t,n,e)},p:t,i:t,o:t,d(t){t&&c(n)}}}function mt(t){let e,n,o,r={ctx:t,current:null,token:null,hasCatch:!1,pending:gt,then:dt,catch:pt,value:1,blocks:[,,,]};return H(n=t[1],r),{c(){e=u("div"),r.block.c(),g(e,"class","flex-container svelte-1m3r5e7")},m(t,n){a(t,e,n),r.block.m(e,r.anchor=null),r.mount=()=>e,r.anchor=null,o=!0},p(e,[o]){if(t=e,r.ctx=t,2&o&&n!==(n=t[1])&&H(n,r));else{const e=t.slice();e[1]=r.resolved,r.block.p(e,o)}},i(t){o||(P(r.block),o=!0)},o(t){for(let t=0;t<3;t+=1){B(r.blocks[t])}o=!1},d(t){t&&c(e),r.block.d(),r.token=null,r=null}}}function vt(t,e,n){let o,r=(new Date).toISOString().slice(0,10);return t.$$.update=()=>{1&t.$$.dirty&&n(1,o=Q({date:new Date(r)}))},[r,o,function(){r=this.value,n(0,r)}]}class yt extends D{constructor(t){super(),z(this,t,vt,mt,i,{})}}const bt=[];const wt=function(e,n=t){let o;const r=[];function s(t){if(i(e,t)&&(e=t,o)){const t=!bt.length;for(let t=0;t<r.length;t+=1){const n=r[t];n[1](),bt.push(n,e)}if(t){for(let t=0;t<bt.length;t+=2)bt[t][0](bt[t+1]);bt.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(i,a=t){const c=[i,a];return r.push(c),1===r.length&&(o=n(s)||t),i(e),()=>{const t=r.indexOf(c);-1!==t&&r.splice(t,1),0===r.length&&(o(),o=null)}}}}(0);function $t(t){const e=e=>{!t||t.contains(e.target)||e.defaultPrevented||t.dispatchEvent(new CustomEvent("click_outside",t))};return document.addEventListener("click",e,!0),{destroy(){document.removeEventListener("click",e,!0)}}}function xt(t,e,n){const o=t.slice();return o[10]=e[n],o[11]=e,o[12]=n,o}function _t(t){let e,n,r,i,l,h;function p(){t[4].call(n,t[11],t[12])}function v(){t[5].call(i,t[11],t[12])}return{c(){e=u("div"),n=u("input"),r=f(),i=u("input"),g(n,"type","text"),g(n,"placeholder","Beskrivning"),g(n,"class","description svelte-1n6yju0"),g(i,"type","number"),g(i,"placeholder","Belopp"),g(i,"class","amount svelte-1n6yju0"),g(e,"class","entry-container svelte-1n6yju0")},m(o,c){a(o,e,c),s(e,n),y(n,t[10].description),s(e,r),s(e,i),y(i,t[10].amount),l||(h=[d(n,"input",p),d(i,"input",v)],l=!0)},p(e,o){t=e,1&o&&n.value!==t[10].description&&y(n,t[10].description),1&o&&m(i.value)!==t[10].amount&&y(i,t[10].amount)},d(t){t&&c(e),l=!1,o(h)}}}function kt(e){let n,i,p,b,w,$,x,_,k,E,C,q=e[0],L=[];for(let t=0;t<q.length;t+=1)L[t]=_t(xt(e,q,t));return{c(){n=u("h4"),i=h(e[1]),p=f(),b=u("form");for(let t=0;t<L.length;t+=1)L[t].c();w=f(),$=u("div"),x=u("input"),_=f(),k=u("input"),x.disabled=!0,g(x,"type","text"),x.value="Totalt",g(x,"class","description svelte-1n6yju0"),k.disabled=!0,g(k,"type","number"),g(k,"class","amount svelte-1n6yju0"),g($,"class","entry-container svelte-1n6yju0")},m(o,c){a(o,n,c),s(n,i),a(o,p,c),a(o,b,c);for(let t=0;t<L.length;t+=1)L[t].m(b,null);var l;s(b,w),s(b,$),s($,x),s($,_),s($,k),y(k,e[2]),E||(C=[d(k,"input",e[6]),(l=$t.call(null,b),l&&r(l.destroy)?l.destroy:t),d(b,"click_outside",e[3])],E=!0)},p(t,[e]){if(2&e&&v(i,t[1]),1&e){let n;for(q=t[0],n=0;n<q.length;n+=1){const o=xt(t,q,n);L[n]?L[n].p(o,e):(L[n]=_t(o),L[n].c(),L[n].m(b,w))}for(;n<L.length;n+=1)L[n].d(1);L.length=q.length}4&e&&m(k.value)!==t[2]&&y(k,t[2])},i:t,o:t,d(t){t&&c(n),t&&c(p),t&&c(b),l(L,t),E=!1,o(C)}}}function Et(t,e,n){let{entries:o}=e,{category:r}=e,i=0,s=0;if("HALF_OF_GEMENSAMMA"===o[0].description){let t=o[0];s=t.amount;let e="Halva gemensamma";s>0?e+=` (+${s})`:s<0&&(e+=` (${s})`),t.description=e,wt.subscribe((e=>{t.amount=e/2-s}))}const a=t=>null==t||0==t.length,c=()=>{n(2,i=0);let t=[];o.forEach((e=>{a(e.description)&&a(e.amount)?t.push(e):n(2,i+=parseInt(e.amount))})),"Gemensamma"===r&&wt.set(i),n(0,o=o.filter((e=>!t.includes(e)))),o.sort(((t,e)=>t.amount-e.amount))};var l;return l=()=>{c()},$().$$.on_mount.push(l),t.$$set=t=>{"entries"in t&&n(0,o=t.entries),"category"in t&&n(1,r=t.category)},t.$$.update=()=>{if(1&t.$$.dirty){let t=o.length,e=o[t-1];a(e.description)||a(e.amount)||o.push({category:o[0].Category.id,date:new Date,description:"",amount:""})}},[o,r,i,c,function(t,e){t[e].description=this.value,n(0,o)},function(t,e){t[e].amount=m(this.value),n(0,o)},function(){i=m(this.value),n(2,i)}]}class Ct extends D{constructor(t){super(),z(this,t,Et,kt,i,{entries:0,category:1})}}function qt(){}function Lt(t){return t()}function Rt(){return Object.create(null)}function Ot(t){t.forEach(Lt)}function At(t){return"function"==typeof t}function jt(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function Tt(t,e){t.appendChild(e)}function Ut(t){t.parentNode.removeChild(t)}function St(t){return document.createElement(t)}function Nt(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}let Pt;function Bt(t){Pt=t}const Ht=[],It=[],Mt=[],Ft=[],Gt=Promise.resolve();let Yt=!1;function zt(t){Mt.push(t)}let Dt=!1;const Kt=new Set;function Vt(){if(!Dt){Dt=!0;do{for(let t=0;t<Ht.length;t+=1){const e=Ht[t];Bt(e),Xt(e.$$)}for(Ht.length=0;It.length;)It.pop()();for(let t=0;t<Mt.length;t+=1){const e=Mt[t];Kt.has(e)||(Kt.add(e),e())}Mt.length=0}while(Ht.length);for(;Ft.length;)Ft.pop()();Yt=!1,Dt=!1,Kt.clear()}}function Xt(t){if(null!==t.fragment){t.update(),Ot(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(zt)}}const Zt=new Set;function Jt(t,e){-1===t.$$.dirty[0]&&(Ht.push(t),Yt||(Yt=!0,Gt.then(Vt)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Qt(t,e,n,o,r,i,s=[-1]){const a=Pt;Bt(t);const c=e.props||{},l=t.$$={fragment:null,ctx:null,props:i,update:qt,not_equal:r,bound:Rt(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(a?a.$$.context:[]),callbacks:Rt(),dirty:s};let u=!1;if(l.ctx=n?n(t,c,((e,n,...o)=>{const i=o.length?o[0]:n;return l.ctx&&r(l.ctx[e],l.ctx[e]=i)&&(l.bound[e]&&l.bound[e](i),u&&Jt(t,e)),n})):[],l.update(),u=!0,Ot(l.before_update),l.fragment=!!o&&o(l.ctx),e.target){if(e.hydrate){const t=function(t){return Array.from(t.childNodes)}(e.target);l.fragment&&l.fragment.l(t),t.forEach(Ut)}else l.fragment&&l.fragment.c();e.intro&&((h=t.$$.fragment)&&h.i&&(Zt.delete(h),h.i(f))),function(t,e,n){const{fragment:o,on_mount:r,on_destroy:i,after_update:s}=t.$$;o&&o.m(e,n),zt((()=>{const e=r.map(Lt).filter(At);i?i.push(...e):Ot(e),t.$$.on_mount=[]})),s.forEach(zt)}(t,e.target,e.anchor),Vt()}var h,f;Bt(a)}function Wt(t){let e,n,o,r,i;return{c(){var s;e=St("div"),n=St("div"),s=t[0],o=document.createTextNode(s),Nt(n,"class",r="toast "+t[1]+" svelte-3qemlt"),Nt(e,"class",i="toast-container "+t[2]+" svelte-3qemlt")},m(t,r){!function(t,e,n){t.insertBefore(e,n||null)}(t,e,r),Tt(e,n),Tt(n,o)},p(t,[s]){1&s&&function(t,e){e=""+e,t.data!==e&&(t.data=e)}(o,t[0]),2&s&&r!==(r="toast "+t[1]+" svelte-3qemlt")&&Nt(n,"class",r),4&s&&i!==(i="toast-container "+t[2]+" svelte-3qemlt")&&Nt(e,"class",i)},i:qt,o:qt,d(t){t&&Ut(e)}}}function te(t,e,n){let o,{msg:r=""}=e,{type:i=""}=e,{position:s="bottom-center"}=e;return t.$set=t=>{"msg"in t&&n(0,r=t.msg),"type"in t&&n(1,i=t.type),"position"in t&&n(3,s=t.position)},t.$$.update=()=>{8&t.$$.dirty&&n(2,o=s.split("-").join(" "))},[r,i,o,s]}class ee extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(Ot(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=qt}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}{constructor(t){var e;super(),document.getElementById("svelte-3qemlt-style")||((e=St("style")).id="svelte-3qemlt-style",e.textContent=".toast-container.svelte-3qemlt{position:fixed;z-index:999}.top.svelte-3qemlt{top:15px}.bottom.svelte-3qemlt{bottom:15px}.left.svelte-3qemlt{left:15px}.right.svelte-3qemlt{right:15px}.center.svelte-3qemlt{left:50%;transform:translateX(-50%);-webkit-transform:translateX(-50%)}.toast.svelte-3qemlt{height:38px;line-height:38px;padding:0 20px;box-shadow:0 1px 3px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .24);color:#FFF;-webkit-transition:opacity 0.2s, -webkit-transform 0.2s;transition:opacity 0.2s, transform 0.2s, -webkit-transform 0.2s;-webkit-transform:translateY(35px);transform:translateY(35px);opacity:0;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.info.svelte-3qemlt{background-color:#0091EA}.success.svelte-3qemlt{background-color:#4CAF50}.error.svelte-3qemlt{background-color:#F44336}.default.svelte-3qemlt{background-color:#353535}.anim.svelte-3qemlt{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}",Tt(document.head,e)),Qt(this,t,te,Wt,jt,{msg:0,type:1,position:3})}}class ne{constructor(t){this.opts=Object.assign({position:"bottom-center",duration:2e3},t)}show(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"default")}info(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"info")}success(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"success")}error(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._show(t,e,"error")}_show(t,e,n){var o=Object.assign({},this.opts,e),r=new ee({target:document.querySelector("body"),props:{msg:t,type:n,position:o.position}});setTimeout((()=>{r.$set({type:n+" anim"})}),0),setTimeout((()=>{r.$destroy()}),o.duration)}}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var oe,re=(function(t,e){t.exports=function(){var t=Array.isArray||function(t){return"[object Array]"==Object.prototype.toString.call(t)},e=y,n=a,o=c,r=l,i=v,s=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))"].join("|"),"g");function a(t){for(var e,n=[],o=0,r=0,i="";null!=(e=s.exec(t));){var a=e[0],c=e[1],l=e.index;if(i+=t.slice(r,l),r=l+a.length,c)i+=c[1];else{i&&(n.push(i),i="");var u=e[2],f=e[3],p=e[4],d=e[5],g=e[6],m=e[7],v="+"===g||"*"===g,y="?"===g||"*"===g,b=u||"/",w=p||d||(m?".*":"[^"+b+"]+?");n.push({name:f||o++,prefix:u||"",delimiter:b,optional:y,repeat:v,pattern:h(w)})}}return r<t.length&&(i+=t.substr(r)),i&&n.push(i),n}function c(t){return l(a(t))}function l(e){for(var n=new Array(e.length),o=0;o<e.length;o++)"object"==typeof e[o]&&(n[o]=new RegExp("^"+e[o].pattern+"$"));return function(o){for(var r="",i=o||{},s=0;s<e.length;s++){var a=e[s];if("string"!=typeof a){var c,l=i[a.name];if(null==l){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to be defined')}if(t(l)){if(!a.repeat)throw new TypeError('Expected "'+a.name+'" to not repeat, but received "'+l+'"');if(0===l.length){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to not be empty')}for(var u=0;u<l.length;u++){if(c=encodeURIComponent(l[u]),!n[s].test(c))throw new TypeError('Expected all "'+a.name+'" to match "'+a.pattern+'", but received "'+c+'"');r+=(0===u?a.prefix:a.delimiter)+c}}else{if(c=encodeURIComponent(l),!n[s].test(c))throw new TypeError('Expected "'+a.name+'" to match "'+a.pattern+'", but received "'+c+'"');r+=a.prefix+c}}else r+=a}return r}}function u(t){return t.replace(/([.+*?=^!:${}()[\]|\/])/g,"\\$1")}function h(t){return t.replace(/([=!:$\/()])/g,"\\$1")}function f(t,e){return t.keys=e,t}function p(t){return t.sensitive?"":"i"}function d(t,e){var n=t.source.match(/\((?!\?)/g);if(n)for(var o=0;o<n.length;o++)e.push({name:o,prefix:null,delimiter:null,optional:!1,repeat:!1,pattern:null});return f(t,e)}function g(t,e,n){for(var o=[],r=0;r<t.length;r++)o.push(y(t[r],e,n).source);return f(new RegExp("(?:"+o.join("|")+")",p(n)),e)}function m(t,e,n){for(var o=a(t),r=v(o,n),i=0;i<o.length;i++)"string"!=typeof o[i]&&e.push(o[i]);return f(r,e)}function v(t,e){for(var n=(e=e||{}).strict,o=!1!==e.end,r="",i=t[t.length-1],s="string"==typeof i&&/\/$/.test(i),a=0;a<t.length;a++){var c=t[a];if("string"==typeof c)r+=u(c);else{var l=u(c.prefix),h=c.pattern;c.repeat&&(h+="(?:"+l+h+")*"),r+=h=c.optional?l?"(?:"+l+"("+h+"))?":"("+h+")?":l+"("+h+")"}}return n||(r=(s?r.slice(0,-2):r)+"(?:\\/(?=$))?"),r+=o?"$":n&&s?"":"(?=\\/|$)",new RegExp("^"+r,p(e))}function y(e,n,o){return t(n=n||[])?o||(o={}):(o=n,n=[]),e instanceof RegExp?d(e,n):t(e)?g(e,n,o):m(e,n,o)}e.parse=n,e.compile=o,e.tokensToFunction=r,e.tokensToRegExp=i;var b,w="undefined"!=typeof document,$="undefined"!=typeof window,x="undefined"!=typeof history,_="undefined"!=typeof process,k=w&&document.ontouchstart?"touchstart":"click",E=$&&!(!window.history.location&&!window.location);function C(){this.callbacks=[],this.exits=[],this.current="",this.len=0,this._decodeURLComponents=!0,this._base="",this._strict=!1,this._running=!1,this._hashbang=!1,this.clickHandler=this.clickHandler.bind(this),this._onpopstate=this._onpopstate.bind(this)}function q(){var t=new C;function e(){return L.apply(t,arguments)}return e.callbacks=t.callbacks,e.exits=t.exits,e.base=t.base.bind(t),e.strict=t.strict.bind(t),e.start=t.start.bind(t),e.stop=t.stop.bind(t),e.show=t.show.bind(t),e.back=t.back.bind(t),e.redirect=t.redirect.bind(t),e.replace=t.replace.bind(t),e.dispatch=t.dispatch.bind(t),e.exit=t.exit.bind(t),e.configure=t.configure.bind(t),e.sameOrigin=t.sameOrigin.bind(t),e.clickHandler=t.clickHandler.bind(t),e.create=q,Object.defineProperty(e,"len",{get:function(){return t.len},set:function(e){t.len=e}}),Object.defineProperty(e,"current",{get:function(){return t.current},set:function(e){t.current=e}}),e.Context=A,e.Route=j,e}function L(t,e){if("function"==typeof t)return L.call(this,"*",t);if("function"==typeof e)for(var n=new j(t,null,this),o=1;o<arguments.length;++o)this.callbacks.push(n.middleware(arguments[o]));else"string"==typeof t?this["string"==typeof e?"redirect":"show"](t,e):this.start(t)}function R(t){if(!t.handled){var e=this,n=e._window;(e._hashbang?E&&this._getBase()+n.location.hash.replace("#!",""):E&&n.location.pathname+n.location.search)!==t.canonicalPath&&(e.stop(),t.handled=!1,E&&(n.location.href=t.canonicalPath))}}function O(t){return t.replace(/([.+*?=^!:${}()[\]|/\\])/g,"\\$1")}function A(t,e,n){var o=this.page=n||L,r=o._window,i=o._hashbang,s=o._getBase();"/"===t[0]&&0!==t.indexOf(s)&&(t=s+(i?"#!":"")+t);var a=t.indexOf("?");this.canonicalPath=t;var c=new RegExp("^"+O(s));if(this.path=t.replace(c,"")||"/",i&&(this.path=this.path.replace("#!","")||"/"),this.title=w&&r.document.title,this.state=e||{},this.state.path=t,this.querystring=~a?o._decodeURLEncodedURIComponent(t.slice(a+1)):"",this.pathname=o._decodeURLEncodedURIComponent(~a?t.slice(0,a):t),this.params={},this.hash="",!i){if(!~this.path.indexOf("#"))return;var l=this.path.split("#");this.path=this.pathname=l[0],this.hash=o._decodeURLEncodedURIComponent(l[1])||"",this.querystring=this.querystring.split("#")[0]}}function j(t,n,o){var r=this.page=o||T,i=n||{};i.strict=i.strict||r._strict,this.path="*"===t?"(.*)":t,this.method="GET",this.regexp=e(this.path,this.keys=[],i)}C.prototype.configure=function(t){var e=t||{};this._window=e.window||$&&window,this._decodeURLComponents=!1!==e.decodeURLComponents,this._popstate=!1!==e.popstate&&$,this._click=!1!==e.click&&w,this._hashbang=!!e.hashbang;var n=this._window;this._popstate?n.addEventListener("popstate",this._onpopstate,!1):$&&n.removeEventListener("popstate",this._onpopstate,!1),this._click?n.document.addEventListener(k,this.clickHandler,!1):w&&n.document.removeEventListener(k,this.clickHandler,!1),this._hashbang&&$&&!x?n.addEventListener("hashchange",this._onpopstate,!1):$&&n.removeEventListener("hashchange",this._onpopstate,!1)},C.prototype.base=function(t){if(0===arguments.length)return this._base;this._base=t},C.prototype._getBase=function(){var t=this._base;if(t)return t;var e=$&&this._window&&this._window.location;return $&&this._hashbang&&e&&"file:"===e.protocol&&(t=e.pathname),t},C.prototype.strict=function(t){if(0===arguments.length)return this._strict;this._strict=t},C.prototype.start=function(t){var e=t||{};if(this.configure(e),!1!==e.dispatch){var n;if(this._running=!0,E){var o=this._window.location;n=this._hashbang&&~o.hash.indexOf("#!")?o.hash.substr(2)+o.search:this._hashbang?o.search+o.hash:o.pathname+o.search+o.hash}this.replace(n,null,!0,e.dispatch)}},C.prototype.stop=function(){if(this._running){this.current="",this.len=0,this._running=!1;var t=this._window;this._click&&t.document.removeEventListener(k,this.clickHandler,!1),$&&t.removeEventListener("popstate",this._onpopstate,!1),$&&t.removeEventListener("hashchange",this._onpopstate,!1)}},C.prototype.show=function(t,e,n,o){var r=new A(t,e,this),i=this.prevContext;return this.prevContext=r,this.current=r.path,!1!==n&&this.dispatch(r,i),!1!==r.handled&&!1!==o&&r.pushState(),r},C.prototype.back=function(t,e){var n=this;if(this.len>0){var o=this._window;x&&o.history.back(),this.len--}else t?setTimeout((function(){n.show(t,e)})):setTimeout((function(){n.show(n._getBase(),e)}))},C.prototype.redirect=function(t,e){var n=this;"string"==typeof t&&"string"==typeof e&&L.call(this,t,(function(t){setTimeout((function(){n.replace(e)}),0)})),"string"==typeof t&&void 0===e&&setTimeout((function(){n.replace(t)}),0)},C.prototype.replace=function(t,e,n,o){var r=new A(t,e,this),i=this.prevContext;return this.prevContext=r,this.current=r.path,r.init=n,r.save(),!1!==o&&this.dispatch(r,i),r},C.prototype.dispatch=function(t,e){var n=0,o=0,r=this;function i(){var t=r.exits[o++];if(!t)return s();t(e,i)}function s(){var e=r.callbacks[n++];if(t.path===r.current)return e?void e(t,s):R.call(r,t);t.handled=!1}e?i():s()},C.prototype.exit=function(t,e){if("function"==typeof t)return this.exit("*",t);for(var n=new j(t,null,this),o=1;o<arguments.length;++o)this.exits.push(n.middleware(arguments[o]))},C.prototype.clickHandler=function(t){if(1===this._which(t)&&!(t.metaKey||t.ctrlKey||t.shiftKey||t.defaultPrevented)){var e=t.target,n=t.path||(t.composedPath?t.composedPath():null);if(n)for(var o=0;o<n.length;o++)if(n[o].nodeName&&"A"===n[o].nodeName.toUpperCase()&&n[o].href){e=n[o];break}for(;e&&"A"!==e.nodeName.toUpperCase();)e=e.parentNode;if(e&&"A"===e.nodeName.toUpperCase()){var r="object"==typeof e.href&&"SVGAnimatedString"===e.href.constructor.name;if(!e.hasAttribute("download")&&"external"!==e.getAttribute("rel")){var i=e.getAttribute("href");if((this._hashbang||!this._samePath(e)||!e.hash&&"#"!==i)&&!(i&&i.indexOf("mailto:")>-1)&&!(r?e.target.baseVal:e.target)&&(r||this.sameOrigin(e.href))){var s=r?e.href.baseVal:e.pathname+e.search+(e.hash||"");s="/"!==s[0]?"/"+s:s,_&&s.match(/^\/[a-zA-Z]:\//)&&(s=s.replace(/^\/[a-zA-Z]:\//,"/"));var a=s,c=this._getBase();0===s.indexOf(c)&&(s=s.substr(c.length)),this._hashbang&&(s=s.replace("#!","")),(!c||a!==s||E&&"file:"===this._window.location.protocol)&&(t.preventDefault(),this.show(a))}}}}},C.prototype._onpopstate=(b=!1,$?(w&&"complete"===document.readyState?b=!0:window.addEventListener("load",(function(){setTimeout((function(){b=!0}),0)})),function(t){if(b){var e=this;if(t.state){var n=t.state.path;e.replace(n,t.state)}else if(E){var o=e._window.location;e.show(o.pathname+o.search+o.hash,void 0,void 0,!1)}}}):function(){}),C.prototype._which=function(t){return null==(t=t||$&&this._window.event).which?t.button:t.which},C.prototype._toURL=function(t){var e=this._window;if("function"==typeof URL&&E)return new URL(t,e.location.toString());if(w){var n=e.document.createElement("a");return n.href=t,n}},C.prototype.sameOrigin=function(t){if(!t||!E)return!1;var e=this._toURL(t),n=this._window.location;return n.protocol===e.protocol&&n.hostname===e.hostname&&(n.port===e.port||""===n.port&&(80==e.port||443==e.port))},C.prototype._samePath=function(t){if(!E)return!1;var e=this._window.location;return t.pathname===e.pathname&&t.search===e.search},C.prototype._decodeURLEncodedURIComponent=function(t){return"string"!=typeof t?t:this._decodeURLComponents?decodeURIComponent(t.replace(/\+/g," ")):t},A.prototype.pushState=function(){var t=this.page,e=t._window,n=t._hashbang;t.len++,x&&e.history.pushState(this.state,this.title,n&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},A.prototype.save=function(){var t=this.page;x&&t._window.history.replaceState(this.state,this.title,t._hashbang&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},j.prototype.middleware=function(t){var e=this;return function(n,o){if(e.match(n.path,n.params))return n.routePath=e.path,t(n,o);o()}},j.prototype.match=function(t,e){var n=this.keys,o=t.indexOf("?"),r=~o?t.slice(0,o):t,i=this.regexp.exec(decodeURIComponent(r));if(!i)return!1;delete e[0];for(var s=1,a=i.length;s<a;++s){var c=n[s-1],l=this.page._decodeURLEncodedURIComponent(i[s]);void 0===l&&hasOwnProperty.call(e,c.name)||(e[c.name]=l)}return!0};var T=q(),U=T,S=T;return U.default=S,U}()}(oe={exports:{}},oe.exports),oe.exports);function ie(t,e,n){const o=t.slice();return o[4]=e[n],o}function se(t){let e,n,o,r,i,h,p,m=t[1].categories,v=[];for(let e=0;e<m.length;e+=1)v[e]=ce(ie(t,m,e));const y=t=>B(v[t],1,1,(()=>{v[t]=null}));return{c(){e=u("div");for(let t=0;t<v.length;t+=1)v[t].c();n=f(),o=u("div"),r=u("button"),r.textContent="Skicka",g(e,"class","budget-container svelte-1q5qesb"),g(r,"class","btn waves-effect waves-light indigo"),g(o,"class","center")},m(c,l){a(c,e,l);for(let t=0;t<v.length;t+=1)v[t].m(e,null);a(c,n,l),a(c,o,l),s(o,r),i=!0,h||(p=d(r,"click",t[2]),h=!0)},p(t,n){if(3&n){let o;for(m=t[1].categories,o=0;o<m.length;o+=1){const r=ie(t,m,o);v[o]?(v[o].p(r,n),P(v[o],1)):(v[o]=ce(r),v[o].c(),P(v[o],1),v[o].m(e,null))}for(S(),o=m.length;o<v.length;o+=1)y(o);N()}},i(t){if(!i){for(let t=0;t<m.length;t+=1)P(v[t]);i=!0}},o(t){v=v.filter(Boolean);for(let t=0;t<v.length;t+=1)B(v[t]);i=!1},d(t){t&&c(e),l(v,t),t&&c(n),t&&c(o),h=!1,p()}}}function ae(e){let n;return{c(){n=u("p"),n.textContent="Hämtar standard raderna..."},m(t,e){a(t,n,e)},p:t,i:t,o:t,d(t){t&&c(n)}}}function ce(t){let e,n,o,r;return n=new Ct({props:{entries:t[0][t[4]],category:t[4]}}),{c(){e=u("div"),M(n.$$.fragment),o=f(),g(e,"class","budget svelte-1q5qesb")},m(t,i){a(t,e,i),F(n,e,null),s(e,o),r=!0},p(t,e){const o={};3&e&&(o.entries=t[0][t[4]]),2&e&&(o.category=t[4]),n.$set(o)},i(t){r||(P(n.$$.fragment,t),r=!0)},o(t){B(n.$$.fragment,t),r=!1},d(t){t&&c(e),G(n)}}}function le(t){let e,n,o,r;const i=[ae,se],s=[];function l(t,e){return void 0===t[1]?0:1}return n=l(t),o=s[n]=i[n](t),{c(){e=u("div"),o.c(),g(e,"id","new-budget-wrapper"),g(e,"class","svelte-1q5qesb")},m(t,o){a(t,e,o),s[n].m(e,null),r=!0},p(t,[r]){let a=n;n=l(t),n===a?s[n].p(t,r):(S(),B(s[a],1,1,(()=>{s[a]=null})),N(),o=s[n],o?o.p(t,r):(o=s[n]=i[n](t),o.c()),P(o,1),o.m(e,null))},i(t){r||(P(o),r=!0)},o(t){B(o),r=!1},d(t){t&&c(e),s[n].d()}}}function ue(t,e,n){const o=new ne;let r,i=[];return tt().then((t=>{const e=t.categories.indexOf("Gemensamma");if(e>0){let n=t.categories[0];t.categories[0]=t.categories[e],t.categories[e]=n}t.categories.forEach((e=>{n(0,i[e]=t.result.filter((t=>t.Category.name===e)),i)})),n(1,r=t)})),[i,r,async function(){let t=[];r.categories.forEach((e=>{t=[...t,...i[e]]})),t=t.filter((t=>""!==t.value&&""!==t.description));try{await W(t),o.success("Budget sparad!"),re("/")}catch(t){o.error("Något gick fel."),console.error(t.message)}}]}class he extends D{constructor(t){super(),z(this,t,ue,le,i,{})}}function fe(e){let n;return{c(){n=u("nav"),n.innerHTML='<div class="nav-wrapper"><ul id="nav-mobile" class="left"><li><a href="/" class="svelte-1u6n4gp">Hem</a></li> \n\t\t\t<li><a href="/new" class="svelte-1u6n4gp">Ny budget</a></li></ul></div>',g(n,"class","indigo darken-3")},m(t,e){a(t,n,e)},p:t,i:t,o:t,d(t){t&&c(n)}}}class pe extends D{constructor(t){super(),z(this,t,null,fe,i,{})}}function de(t){let e,n,o,r,i,s,l,h;r=new pe({});var d=t[0];return d&&(s=new d({})),{c(){e=f(),n=u("link"),o=f(),M(r.$$.fragment),i=f(),s&&M(s.$$.fragment),l=p(),document.title="Budget planeraren 2000",g(n,"rel","stylesheet"),g(n,"href","/build/base.css")},m(t,c){a(t,e,c),a(t,n,c),a(t,o,c),F(r,t,c),a(t,i,c),s&&F(s,t,c),a(t,l,c),h=!0},p(t,[e]){if(d!==(d=t[0])){if(s){S();const t=s;B(t.$$.fragment,1,0,(()=>{G(t,1)})),N()}d?(s=new d({}),M(s.$$.fragment),P(s.$$.fragment,1),F(s,l.parentNode,l)):s=null}},i(t){h||(P(r.$$.fragment,t),s&&P(s.$$.fragment,t),h=!0)},o(t){B(r.$$.fragment,t),s&&B(s.$$.fragment,t),h=!1},d(t){t&&c(e),t&&c(n),t&&c(o),G(r,t),t&&c(i),t&&c(l),s&&G(s,t)}}}function ge(t,e,n){let o=yt;return re("/",(()=>{n(0,o=yt)})),re("/new",(()=>{n(0,o=he)})),re.start(),[o]}return new class extends D{constructor(t){super(),z(this,t,ge,de,i,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map