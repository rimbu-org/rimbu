"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[86924],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>y});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=a.createContext({}),u=function(e){var t=a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},m=function(e){var t=u(e.components);return a.createElement(l.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),c=u(r),s=n,y=c["".concat(l,".").concat(s)]||c[s]||d[s]||i;return r?a.createElement(y,p(p({ref:t},m),{},{components:r})):a.createElement(y,p({ref:t},m))}));function y(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,p=new Array(i);p[0]=s;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[c]="string"==typeof e?e:n,p[1]=o;for(var u=2;u<i;u++)p[u]=r[u];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}s.displayName="MDXCreateElement"},59045:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>M,contentTitle:()=>b,default:()=>O,frontMatter:()=>y,metadata:()=>f,toc:()=>v});var a=r(3905),n=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&m(e,r,t[r]);if(o)for(var r of o(t))u.call(t,r)&&m(e,r,t[r]);return e},d=(e,t)=>i(e,p(t)),s=(e,t)=>{var r={};for(var a in e)l.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&o)for(var a of o(e))t.indexOf(a)<0&&u.call(e,a)&&(r[a]=e[a]);return r};const y={title:"SortedBiMultiMap.NonEmpty<K,V>",slug:"/rimbu/bimultimap/SortedBiMultiMap/NonEmpty/interface"},b="interface SortedBiMultiMap.NonEmpty<K,V>",f={unversionedId:"rimbu_bimultimap/SortedBiMultiMap/NonEmpty.interface",id:"rimbu_bimultimap/SortedBiMultiMap/NonEmpty.interface",title:"SortedBiMultiMap.NonEmpty<K,V>",description:"A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. Its keys and values are sorted. See the BiMultiMap documentation and the HashBiMultiMap API documentation",source:"@site/api/rimbu_bimultimap/SortedBiMultiMap/NonEmpty.interface.mdx",sourceDirName:"rimbu_bimultimap/SortedBiMultiMap",slug:"/rimbu/bimultimap/SortedBiMultiMap/NonEmpty/interface",permalink:"/api/rimbu/bimultimap/SortedBiMultiMap/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedBiMultiMap.NonEmpty<K,V>",slug:"/rimbu/bimultimap/SortedBiMultiMap/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"SortedBiMultiMap.Context<UK,UV>",permalink:"/api/rimbu/bimultimap/SortedBiMultiMap/Context/interface"},next:{title:"SortedBiMultiMap.Types",permalink:"/api/rimbu/bimultimap/SortedBiMultiMap/Types/interface"}},M={},v=[{value:"Type parameters",id:"type-parameters",level:2}],k={toc:v},h="wrapper";function O(e){var t=e,{components:r}=t,n=s(t,["components"]);return(0,a.kt)(h,d(c(c({},k),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"interface-sortedbimultimapnonemptykv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface SortedBiMultiMap.NonEmpty<K,V>")),(0,a.kt)("p",null,"A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. Its keys and values are sorted. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/bimultimap/SortedBiMultiMap/interface"}),"HashBiMultiMap API documentation")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/SortedBiMultiMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"SortedBiMultiMap<K,V>"))),(0,a.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}O.isMDXComponent=!0}}]);