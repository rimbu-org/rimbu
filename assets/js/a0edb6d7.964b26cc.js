"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[9842],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>h});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function p(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?p(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function l(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},p=Object.keys(e);for(a=0;a<p.length;a++)t=p[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(a=0;a<p.length;a++)t=p[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var o=a.createContext({}),u=function(e){var r=a.useContext(o),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},c=function(e){var r=u(e.components);return a.createElement(o.Provider,{value:r},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},f=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,p=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=u(t),f=n,h=m["".concat(o,".").concat(f)]||m[f]||d[f]||p;return t?a.createElement(h,i(i({ref:r},c),{},{components:t})):a.createElement(h,i({ref:r},c))}));function h(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var p=t.length,i=new Array(p);i[0]=f;var l={};for(var o in r)hasOwnProperty.call(r,o)&&(l[o]=r[o]);l.originalType=e,l[m]="string"==typeof e?e:n,i[1]=l;for(var u=2;u<p;u++)i[u]=t[u];return a.createElement.apply(null,i)}return a.createElement.apply(null,t)}f.displayName="MDXCreateElement"},24127:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>s,default:()=>k,frontMatter:()=>h,metadata:()=>b,toc:()=>g});var a=t(3905),n=Object.defineProperty,p=Object.defineProperties,i=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))o.call(r,t)&&c(e,t,r[t]);if(l)for(var t of l(r))u.call(r,t)&&c(e,t,r[t]);return e},d=(e,r)=>p(e,i(r)),f=(e,r)=>{var t={};for(var a in e)o.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&l)for(var a of l(e))r.indexOf(a)<0&&u.call(e,a)&&(t[a]=e[a]);return t};const h={title:"ValuedGraph<N,V>",slug:"/rimbu/graph/ValuedGraph/interface"},s="interface ValuedGraph<N,V>",b={unversionedId:"rimbu_graph/ValuedGraph.interface",id:"rimbu_graph/ValuedGraph.interface",title:"ValuedGraph<N,V>",description:"An type-invariant immutable valued graph. See the Graph documentation and the ValuedGraph API documentation",source:"@site/api/rimbu_graph/ValuedGraph.interface.mdx",sourceDirName:"rimbu_graph",slug:"/rimbu/graph/ValuedGraph/interface",permalink:"/api/rimbu/graph/ValuedGraph/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ValuedGraph<N,V>",slug:"/rimbu/graph/ValuedGraph/interface"},sidebar:"defaultSidebar",previous:{title:"ValuedGraph.Types",permalink:"/api/rimbu/graph/ValuedGraph/Types/interface"},next:{title:"VariantGraph (namespace)",permalink:"/api/rimbu/graph/VariantGraph/namespace"}},y={},g=[{value:"Type parameters",id:"type-parameters",level:2}],v={toc:g},O="wrapper";function k(e){var r=e,{components:t}=r,n=f(r,["components"]);return(0,a.kt)(O,d(m(m({},v),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",m({},{id:"interface-valuedgraphnv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface ValuedGraph<N,V>")),(0,a.kt)("p",null,"An type-invariant immutable valued graph. See the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ValuedGraph/interface"}),"ValuedGraph API documentation")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/graph/ValuedGraph/namespace"}),"ValuedGraph")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/graph/ValuedGraph/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ValuedGraph.NonEmpty<N,V>"))),(0,a.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"N"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the node type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the connection value type")))))}k.isMDXComponent=!0}}]);