"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[6295],{3905:(e,r,t)=>{t.d(r,{Zo:()=>d,kt:()=>u});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function p(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?p(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},p=Object.keys(e);for(a=0;a<p.length;a++)t=p[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(a=0;a<p.length;a++)t=p[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var l=a.createContext({}),c=function(e){var r=a.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},d=function(e){var r=c(e.components);return a.createElement(l.Provider,{value:r},e.children)},s="mdxType",h={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},m=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,p=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),s=c(t),m=n,u=s["".concat(l,".").concat(m)]||s[m]||h[m]||p;return t?a.createElement(u,i(i({ref:r},d),{},{components:t})):a.createElement(u,i({ref:r},d))}));function u(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var p=t.length,i=new Array(p);i[0]=m;var o={};for(var l in r)hasOwnProperty.call(r,l)&&(o[l]=r[l]);o.originalType=e,o[s]="string"==typeof e?e:n,i[1]=o;for(var c=2;c<p;c++)i[c]=t[c];return a.createElement.apply(null,i)}return a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},69228:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>b,contentTitle:()=>g,default:()=>O,frontMatter:()=>u,metadata:()=>f,toc:()=>y});var a=t(3905),n=Object.defineProperty,p=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,d=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,s=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&d(e,t,r[t]);if(o)for(var t of o(r))c.call(r,t)&&d(e,t,r[t]);return e},h=(e,r)=>p(e,i(r)),m=(e,r)=>{var t={};for(var a in e)l.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&o)for(var a of o(e))r.indexOf(a)<0&&c.call(e,a)&&(t[a]=e[a]);return t};const u={title:"EdgeGraphHashed<N>",slug:"/rimbu/graph/EdgeGraphHashed/interface"},g="interface EdgeGraphHashed<N>",f={unversionedId:"rimbu_graph/EdgeGraphHashed.interface",id:"rimbu_graph/EdgeGraphHashed.interface",title:"EdgeGraphHashed<N>",description:"An type-invariant immutable valued edge (undirected) graph. The connections are internally maintained using hashed collections See the Graph documentation and the EdgeGraphHashed API documentation",source:"@site/api/rimbu_graph/EdgeGraphHashed.interface.mdx",sourceDirName:"rimbu_graph",slug:"/rimbu/graph/EdgeGraphHashed/interface",permalink:"/api/rimbu/graph/EdgeGraphHashed/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"EdgeGraphHashed<N>",slug:"/rimbu/graph/EdgeGraphHashed/interface"},sidebar:"defaultSidebar",previous:{title:"EdgeGraphHashed.Types",permalink:"/api/rimbu/graph/EdgeGraphHashed/Types/interface"},next:{title:"EdgeGraphSorted (namespace)",permalink:"/api/rimbu/graph/EdgeGraphSorted/namespace"}},b={},y=[{value:"Type parameters",id:"type-parameters",level:2}],v={toc:y},E="wrapper";function O(e){var r=e,{components:t}=r,n=m(r,["components"]);return(0,a.kt)(E,h(s(s({},v),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",s({},{id:"interface-edgegraphhashedn"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface EdgeGraphHashed<N>")),(0,a.kt)("p",null,"An type-invariant immutable valued edge (undirected) graph. The connections are internally maintained using hashed collections See the ",(0,a.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/EdgeGraphHashed/interface"}),"EdgeGraphHashed API documentation")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/graph/EdgeGraphHashed/namespace"}),"EdgeGraphHashed")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/graph/EdgeGraphHashed/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraphHashed.NonEmpty<N>"))),(0,a.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"N"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the node type")))),(0,a.kt)("admonition",s({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"const g1 = EdgeGraphHashed.empty<number>()\nconst g2 = EdgeGraphHashed.of([1], [2, 3], [2, 4])\n"))))}O.isMDXComponent=!0}}]);