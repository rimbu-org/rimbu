"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[44696],{3905:(e,r,t)=>{t.d(r,{Zo:()=>d,kt:()=>h});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)t=o[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)t=o[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var l=a.createContext({}),c=function(e){var r=a.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},d=function(e){var r=c(e.components);return a.createElement(l.Provider,{value:r},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},s=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,o=e.originalType,l=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),m=c(t),s=n,h=m["".concat(l,".").concat(s)]||m[s]||u[s]||o;return t?a.createElement(h,i(i({ref:r},d),{},{components:t})):a.createElement(h,i({ref:r},d))}));function h(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var o=t.length,i=new Array(o);i[0]=s;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p[m]="string"==typeof e?e:n,i[1]=p;for(var c=2;c<o;c++)i[c]=t[c];return a.createElement.apply(null,i)}return a.createElement.apply(null,t)}s.displayName="MDXCreateElement"},87082:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>f,default:()=>N,frontMatter:()=>h,metadata:()=>b,toc:()=>w});var a=t(3905),n=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,d=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&d(e,t,r[t]);if(p)for(var t of p(r))c.call(r,t)&&d(e,t,r[t]);return e},u=(e,r)=>o(e,i(r)),s=(e,r)=>{var t={};for(var a in e)l.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&p)for(var a of p(e))r.indexOf(a)<0&&c.call(e,a)&&(t[a]=e[a]);return t};const h={title:"ArrowGraphSorted (namespace)",slug:"/rimbu/core/ArrowGraphSorted/namespace"},f="namespace ArrowGraphSorted",b={unversionedId:"rimbu_core/ArrowGraphSorted/index",id:"rimbu_core/ArrowGraphSorted/index",title:"ArrowGraphSorted (namespace)",description:"An type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the Graph documentation and the ArrowGraphSorted API documentation",source:"@site/api/rimbu_core/ArrowGraphSorted/index.mdx",sourceDirName:"rimbu_core/ArrowGraphSorted",slug:"/rimbu/core/ArrowGraphSorted/namespace",permalink:"/api/rimbu/core/ArrowGraphSorted/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"ArrowGraphSorted (namespace)",slug:"/rimbu/core/ArrowGraphSorted/namespace"},sidebar:"defaultSidebar",previous:{title:"ArrowGraphHashed",permalink:"/api/rimbu/core/ArrowGraphHashed/var"},next:{title:"ArrowGraphSorted.Builder<N>",permalink:"/api/rimbu/core/ArrowGraphSorted/Builder/interface"}},y={},w=[{value:"Interfaces",id:"interfaces",level:2}],g={toc:w},k="wrapper";function N(e){var r=e,{components:t}=r,n=s(r,["components"]);return(0,a.kt)(k,u(m(m({},g),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",m({},{id:"namespace-arrowgraphsorted"}),(0,a.kt)("inlineCode",{parentName:"h1"},"namespace ArrowGraphSorted")),(0,a.kt)("p",null,"An type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/interface"}),"ArrowGraphSorted API documentation")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/ArrowGraphSorted/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted<N>"))),(0,a.kt)("h2",m({},{id:"interfaces"}),"Interfaces"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/ArrowGraphSorted/Builder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.Builder<N>"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"A mutable ",(0,a.kt)("inlineCode",{parentName:"td"},"ArrowGraphSorted")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/Builder/interface"}),"ArrowGraphSorted.Builder API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/ArrowGraphSorted/Context/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.Context<UN>"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"The ArrowGraphSorted's Context instance that serves as a factory for all related immutable instances and builders.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/ArrowGraphSorted/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.NonEmpty<N>"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the ",(0,a.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/interface"}),"ArrowGraphSorted API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/ArrowGraphSorted/Types/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.Types"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))))}N.isMDXComponent=!0}}]);