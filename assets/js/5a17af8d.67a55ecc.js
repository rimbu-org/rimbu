"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[22503],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>f});var a=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,a,i=function(e,t){if(null==e)return{};var r,a,i={},n=Object.keys(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var u=a.createContext({}),o=function(e){var t=a.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},m=function(e){var t=o(e.components);return a.createElement(u.Provider,{value:t},e.children)},c="mdxType",b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var r=e.components,i=e.mdxType,n=e.originalType,u=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),c=o(r),s=i,f=c["".concat(u,".").concat(s)]||c[s]||b[s]||n;return r?a.createElement(f,p(p({ref:t},m),{},{components:r})):a.createElement(f,p({ref:t},m))}));function f(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var n=r.length,p=new Array(n);p[0]=s;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l[c]="string"==typeof e?e:i,p[1]=l;for(var o=2;o<n;o++)p[o]=r[o];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}s.displayName="MDXCreateElement"},60158:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>M,contentTitle:()=>y,default:()=>g,frontMatter:()=>f,metadata:()=>d,toc:()=>v});var a=r(3905),i=Object.defineProperty,n=Object.defineProperties,p=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))u.call(t,r)&&m(e,r,t[r]);if(l)for(var r of l(t))o.call(t,r)&&m(e,r,t[r]);return e},b=(e,t)=>n(e,p(t)),s=(e,t)=>{var r={};for(var a in e)u.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&l)for(var a of l(e))t.indexOf(a)<0&&o.call(e,a)&&(r[a]=e[a]);return r};const f={title:"BiMultiMap<K,V>",slug:"/rimbu/bimultimap/BiMultiMap/interface"},y="interface BiMultiMap<K,V>",d={unversionedId:"rimbu_bimultimap/BiMultiMap.interface",id:"rimbu_bimultimap/BiMultiMap.interface",title:"BiMultiMap<K,V>",description:"A type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. See the BiMultiMap documentation and the BiMultiMap API documentation",source:"@site/api/rimbu_bimultimap/BiMultiMap.interface.mdx",sourceDirName:"rimbu_bimultimap",slug:"/rimbu/bimultimap/BiMultiMap/interface",permalink:"/api/rimbu/bimultimap/BiMultiMap/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"BiMultiMap<K,V>",slug:"/rimbu/bimultimap/BiMultiMap/interface"},sidebar:"defaultSidebar",previous:{title:"BiMultiMap.Types",permalink:"/api/rimbu/bimultimap/BiMultiMap/Types/interface"},next:{title:"HashBiMultiMap (namespace)",permalink:"/api/rimbu/bimultimap/HashBiMultiMap/namespace"}},M={},v=[{value:"Type parameters",id:"type-parameters",level:2}],k={toc:v},h="wrapper";function g(e){var t=e,{components:r}=t,i=s(t,["components"]);return(0,a.kt)(h,b(c(c({},k),i),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"interface-bimultimapkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface BiMultiMap<K,V>")),(0,a.kt)("p",null,"A type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/interface"}),"BiMultiMap API documentation")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,a.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/BiMultiMap/namespace"}),"BiMultiMap")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/BiMultiMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"BiMultiMap.NonEmpty<K,V>"))),(0,a.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}g.isMDXComponent=!0}}]);