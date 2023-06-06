"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[31784],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>h});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=a.createContext({}),c=function(e){var t=a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},d=function(e){var t=c(e.components);return a.createElement(l.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),m=c(r),s=n,h=m["".concat(l,".").concat(s)]||m[s]||u[s]||i;return r?a.createElement(h,p(p({ref:t},d),{},{components:r})):a.createElement(h,p({ref:t},d))}));function h(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,p=new Array(i);p[0]=s;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[m]="string"==typeof e?e:n,p[1]=o;for(var c=2;c<i;c++)p[c]=r[c];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}s.displayName="MDXCreateElement"},38057:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>E,frontMatter:()=>h,metadata:()=>g,toc:()=>y});var a=r(3905),n=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,d=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&d(e,r,t[r]);if(o)for(var r of o(t))c.call(t,r)&&d(e,r,t[r]);return e},u=(e,t)=>i(e,p(t)),s=(e,t)=>{var r={};for(var a in e)l.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&o)for(var a of o(e))t.indexOf(a)<0&&c.call(e,a)&&(r[a]=e[a]);return r};const h={title:"EdgeGraph (namespace)",slug:"/rimbu/core/EdgeGraph/namespace"},f="namespace EdgeGraph",g={unversionedId:"rimbu_core/EdgeGraph/index",id:"rimbu_core/EdgeGraph/index",title:"EdgeGraph (namespace)",description:"An type-invariant immutable edge (undirected) graph. See the Graph documentation and the EdgeGraph API documentation",source:"@site/api/rimbu_core/EdgeGraph/index.mdx",sourceDirName:"rimbu_core/EdgeGraph",slug:"/rimbu/core/EdgeGraph/namespace",permalink:"/api/rimbu/core/EdgeGraph/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"EdgeGraph (namespace)",slug:"/rimbu/core/EdgeGraph/namespace"},sidebar:"defaultSidebar",previous:{title:"Deep.WithType<T>",permalink:"/api/rimbu/core/Deep/WithType/interface"},next:{title:"EdgeGraph.Builder<N>",permalink:"/api/rimbu/core/EdgeGraph/Builder/interface"}},b={},y=[{value:"Interfaces",id:"interfaces",level:2}],k={toc:y},N="wrapper";function E(e){var t=e,{components:r}=t,n=s(t,["components"]);return(0,a.kt)(N,u(m(m({},k),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",m({},{id:"namespace-edgegraph"}),(0,a.kt)("inlineCode",{parentName:"h1"},"namespace EdgeGraph")),(0,a.kt)("p",null,"An type-invariant immutable edge (undirected) graph. See the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/EdgeGraph/interface"}),"EdgeGraph API documentation")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/EdgeGraph/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraph<N>"))),(0,a.kt)("h2",m({},{id:"interfaces"}),"Interfaces"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/EdgeGraph/Builder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraph.Builder<N>"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"A mutable ",(0,a.kt)("inlineCode",{parentName:"td"},"EdgeGraph")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,a.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/graph/EdgeGraph/Builder/interface"}),"EdgeGraph.Builder API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/EdgeGraph/Context/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraph.Context<UN>"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"The EdgeGraph's Context instance that serves as a factory for all related immutable instances and builders.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/EdgeGraph/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraph.NonEmpty<N>"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable edge (undirected) graph.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),(0,a.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/EdgeGraph/Types/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraph.Types"))),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))))}E.isMDXComponent=!0}}]);