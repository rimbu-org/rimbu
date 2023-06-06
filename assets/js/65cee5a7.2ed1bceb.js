"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[38904],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>s});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function l(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var u=a.createContext({}),p=function(e){var r=a.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):l(l({},r),e)),t},c=function(e){var r=p(e.components);return a.createElement(u.Provider,{value:r},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},f=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,i=e.originalType,u=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=p(t),f=n,s=d["".concat(u,".").concat(f)]||d[f]||m[f]||i;return t?a.createElement(s,l(l({ref:r},c),{},{components:t})):a.createElement(s,l({ref:r},c))}));function s(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=t.length,l=new Array(i);l[0]=f;var o={};for(var u in r)hasOwnProperty.call(r,u)&&(o[u]=r[u]);o.originalType=e,o[d]="string"==typeof e?e:n,l[1]=o;for(var p=2;p<i;p++)l[p]=t[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,t)}f.displayName="MDXCreateElement"},2938:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>b,default:()=>k,frontMatter:()=>s,metadata:()=>h,toc:()=>O});var a=t(3905),n=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,c=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,d=(e,r)=>{for(var t in r||(r={}))u.call(r,t)&&c(e,t,r[t]);if(o)for(var t of o(r))p.call(r,t)&&c(e,t,r[t]);return e},m=(e,r)=>i(e,l(r)),f=(e,r)=>{var t={};for(var a in e)u.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&o)for(var a of o(e))r.indexOf(a)<0&&p.call(e,a)&&(t[a]=e[a]);return t};const s={title:"ValuedGraph.Builder<N,V>",slug:"/rimbu/core/ValuedGraph/Builder/interface"},b="interface ValuedGraph.Builder<N,V>",h={unversionedId:"rimbu_core/ValuedGraph/Builder.interface",id:"rimbu_core/ValuedGraph/Builder.interface",title:"ValuedGraph.Builder<N,V>",description:"A mutable ValuedGraph builder used to efficiently create new immutable instances. See the Graph documentation and the ValuedGraph.Builder API documentation",source:"@site/api/rimbu_core/ValuedGraph/Builder.interface.mdx",sourceDirName:"rimbu_core/ValuedGraph",slug:"/rimbu/core/ValuedGraph/Builder/interface",permalink:"/api/rimbu/core/ValuedGraph/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ValuedGraph.Builder<N,V>",slug:"/rimbu/core/ValuedGraph/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"ValuedGraph (namespace)",permalink:"/api/rimbu/core/ValuedGraph/namespace"},next:{title:"ValuedGraph.Context<UN>",permalink:"/api/rimbu/core/ValuedGraph/Context/interface"}},y={},O=[{value:"Type parameters",id:"type-parameters",level:2}],g={toc:O},v="wrapper";function k(e){var r=e,{components:t}=r,n=f(r,["components"]);return(0,a.kt)(v,m(d(d({},g),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",d({},{id:"interface-valuedgraphbuildernv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface ValuedGraph.Builder<N,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"ValuedGraph")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",d({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",d({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ValuedGraph/Builder/interface"}),"ValuedGraph.Builder API documentation")),(0,a.kt)("h2",d({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",d({parentName:"tr"},{align:null}),"N"),(0,a.kt)("td",d({parentName:"tr"},{align:null}),"the node type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",d({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",d({parentName:"tr"},{align:null}),"the connection value type")))))}k.isMDXComponent=!0}}]);