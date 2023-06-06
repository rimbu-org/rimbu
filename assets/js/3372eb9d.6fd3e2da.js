"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[83202],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>d});var a=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,a,i=function(e,t){if(null==e)return{};var r,a,i={},n=Object.keys(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var o=a.createContext({}),p=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},c=function(e){var t=p(e.components);return a.createElement(o.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,i=e.mdxType,n=e.originalType,o=e.parentName,c=u(e,["components","mdxType","originalType","parentName"]),s=p(r),f=i,d=s["".concat(o,".").concat(f)]||s[f]||m[f]||n;return r?a.createElement(d,l(l({ref:t},c),{},{components:r})):a.createElement(d,l({ref:t},c))}));function d(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var n=r.length,l=new Array(n);l[0]=f;var u={};for(var o in t)hasOwnProperty.call(t,o)&&(u[o]=t[o]);u.originalType=e,u[s]="string"==typeof e?e:i,l[1]=u;for(var p=2;p<n;p++)l[p]=r[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},65231:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>h,contentTitle:()=>b,default:()=>v,frontMatter:()=>d,metadata:()=>y,toc:()=>M});var a=r(3905),i=Object.defineProperty,n=Object.defineProperties,l=Object.getOwnPropertyDescriptors,u=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))o.call(t,r)&&c(e,r,t[r]);if(u)for(var r of u(t))p.call(t,r)&&c(e,r,t[r]);return e},m=(e,t)=>n(e,l(t)),f=(e,t)=>{var r={};for(var a in e)o.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&u)for(var a of u(e))t.indexOf(a)<0&&p.call(e,a)&&(r[a]=e[a]);return r};const d={title:"HashBiMultiMap.Builder<K,V>",slug:"/rimbu/core/HashBiMultiMap/Builder/interface"},b="interface HashBiMultiMap.Builder<K,V>",y={unversionedId:"rimbu_core/HashBiMultiMap/Builder.interface",id:"rimbu_core/HashBiMultiMap/Builder.interface",title:"HashBiMultiMap.Builder<K,V>",description:"A mutable HashBiMultiMap builder used to efficiently create new immutable instances. See the BiMultiMap documentation and the HashBiMultiMap.Builder API documentation",source:"@site/api/rimbu_core/HashBiMultiMap/Builder.interface.mdx",sourceDirName:"rimbu_core/HashBiMultiMap",slug:"/rimbu/core/HashBiMultiMap/Builder/interface",permalink:"/api/rimbu/core/HashBiMultiMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashBiMultiMap.Builder<K,V>",slug:"/rimbu/core/HashBiMultiMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"HashBiMultiMap (namespace)",permalink:"/api/rimbu/core/HashBiMultiMap/namespace"},next:{title:"HashBiMultiMap.Context<UK,UV>",permalink:"/api/rimbu/core/HashBiMultiMap/Context/interface"}},h={},M=[{value:"Type parameters",id:"type-parameters",level:2}],B={toc:M},O="wrapper";function v(e){var t=e,{components:r}=t,i=f(t,["components"]);return(0,a.kt)(O,m(s(s({},B),i),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",s({},{id:"interface-hashbimultimapbuilderkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface HashBiMultiMap.Builder<K,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"HashBiMultiMap")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,a.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/Builder/interface"}),"HashBiMultiMap.Builder API documentation")),(0,a.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the value type")))))}v.isMDXComponent=!0}}]);