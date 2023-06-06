"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[63370],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>s});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function p(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var l=a.createContext({}),u=function(e){var r=a.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):p(p({},r),e)),t},c=function(e){var r=u(e.components);return a.createElement(l.Provider,{value:r},e.children)},m="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},d=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),m=u(t),d=n,s=m["".concat(l,".").concat(d)]||m[d]||f[d]||i;return t?a.createElement(s,p(p({ref:r},c),{},{components:t})):a.createElement(s,p({ref:r},c))}));function s(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=t.length,p=new Array(i);p[0]=d;var o={};for(var l in r)hasOwnProperty.call(r,l)&&(o[l]=r[l]);o.originalType=e,o[m]="string"==typeof e?e:n,p[1]=o;for(var u=2;u<i;u++)p[u]=t[u];return a.createElement.apply(null,p)}return a.createElement.apply(null,t)}d.displayName="MDXCreateElement"},78179:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>b,default:()=>k,frontMatter:()=>s,metadata:()=>h,toc:()=>g});var a=t(3905),n=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&c(e,t,r[t]);if(o)for(var t of o(r))u.call(r,t)&&c(e,t,r[t]);return e},f=(e,r)=>i(e,p(r)),d=(e,r)=>{var t={};for(var a in e)l.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&o)for(var a of o(e))r.indexOf(a)<0&&u.call(e,a)&&(t[a]=e[a]);return t};const s={title:"Graph.Builder<N>",slug:"/rimbu/graph/Graph/Builder/interface"},b="interface Graph.Builder<N>",h={unversionedId:"rimbu_graph/Graph/Builder.interface",id:"rimbu_graph/Graph/Builder.interface",title:"Graph.Builder<N>",description:"A mutable Graph builder used to efficiently create new immutable instances. See the Graph documentation and the Graph.Builder API documentation",source:"@site/api/rimbu_graph/Graph/Builder.interface.mdx",sourceDirName:"rimbu_graph/Graph",slug:"/rimbu/graph/Graph/Builder/interface",permalink:"/api/rimbu/graph/Graph/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"Graph.Builder<N>",slug:"/rimbu/graph/Graph/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"Graph (namespace)",permalink:"/api/rimbu/graph/Graph/namespace"},next:{title:"Graph.Context<UN>",permalink:"/api/rimbu/graph/Graph/Context/interface"}},y={},g=[{value:"Type parameters",id:"type-parameters",level:2}],O={toc:g},v="wrapper";function k(e){var r=e,{components:t}=r,n=d(r,["components"]);return(0,a.kt)(v,f(m(m({},O),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",m({},{id:"interface-graphbuildern"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface Graph.Builder<N>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"Graph")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/Graph/Builder/interface"}),"Graph.Builder API documentation")),(0,a.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"N"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the node type")))))}k.isMDXComponent=!0}}]);