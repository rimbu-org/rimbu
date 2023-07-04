"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[35095],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var a=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,a,i=function(e,t){if(null==e)return{};var r,a,i={},n=Object.keys(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var p=a.createContext({}),o=function(e){var t=a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},c=function(e){var t=o(e.components);return a.createElement(p.Provider,{value:t},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},b=a.forwardRef((function(e,t){var r=e.components,i=e.mdxType,n=e.originalType,p=e.parentName,c=u(e,["components","mdxType","originalType","parentName"]),m=o(r),b=i,f=m["".concat(p,".").concat(b)]||m[b]||s[b]||n;return r?a.createElement(f,l(l({ref:t},c),{},{components:r})):a.createElement(f,l({ref:t},c))}));function f(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var n=r.length,l=new Array(n);l[0]=b;var u={};for(var p in t)hasOwnProperty.call(t,p)&&(u[p]=t[p]);u.originalType=e,u[m]="string"==typeof e?e:i,l[1]=u;for(var o=2;o<n;o++)l[o]=r[o];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}b.displayName="MDXCreateElement"},56024:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>h,contentTitle:()=>d,default:()=>v,frontMatter:()=>f,metadata:()=>y,toc:()=>M});var a=r(3905),i=Object.defineProperty,n=Object.defineProperties,l=Object.getOwnPropertyDescriptors,u=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&c(e,r,t[r]);if(u)for(var r of u(t))o.call(t,r)&&c(e,r,t[r]);return e},s=(e,t)=>n(e,l(t)),b=(e,t)=>{var r={};for(var a in e)p.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&u)for(var a of u(e))t.indexOf(a)<0&&o.call(e,a)&&(r[a]=e[a]);return r};const f={title:"HashBiMultiMap.Builder<K,V>",slug:"/rimbu/bimultimap/HashBiMultiMap/Builder/interface"},d="interface HashBiMultiMap.Builder<K,V>",y={unversionedId:"rimbu_bimultimap/HashBiMultiMap/Builder.interface",id:"rimbu_bimultimap/HashBiMultiMap/Builder.interface",title:"HashBiMultiMap.Builder<K,V>",description:"A mutable HashBiMultiMap builder used to efficiently create new immutable instances. See the BiMultiMap documentation and the HashBiMultiMap.Builder API documentation",source:"@site/api/rimbu_bimultimap/HashBiMultiMap/Builder.interface.mdx",sourceDirName:"rimbu_bimultimap/HashBiMultiMap",slug:"/rimbu/bimultimap/HashBiMultiMap/Builder/interface",permalink:"/api/rimbu/bimultimap/HashBiMultiMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashBiMultiMap.Builder<K,V>",slug:"/rimbu/bimultimap/HashBiMultiMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"HashBiMultiMap (namespace)",permalink:"/api/rimbu/bimultimap/HashBiMultiMap/namespace"},next:{title:"HashBiMultiMap.Context<UK,UV>",permalink:"/api/rimbu/bimultimap/HashBiMultiMap/Context/interface"}},h={},M=[{value:"Type parameters",id:"type-parameters",level:2}],B={toc:M},O="wrapper";function v(e){var t=e,{components:r}=t,i=b(t,["components"]);return(0,a.kt)(O,s(m(m({},B),i),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",m({},{id:"interface-hashbimultimapbuilderkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface HashBiMultiMap.Builder<K,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"HashBiMultiMap")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/Builder/interface"}),"HashBiMultiMap.Builder API documentation")),(0,a.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))))}v.isMDXComponent=!0}}]);