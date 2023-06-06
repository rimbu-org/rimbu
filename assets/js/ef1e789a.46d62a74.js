"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[85562],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var o=a.createContext({}),u=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},c=function(e){var t=u(e.components);return a.createElement(o.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),s=u(r),d=n,f=s["".concat(o,".").concat(d)]||s[d]||m[d]||i;return r?a.createElement(f,p(p({ref:t},c),{},{components:r})):a.createElement(f,p({ref:t},c))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,p=new Array(i);p[0]=d;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[s]="string"==typeof e?e:n,p[1]=l;for(var u=2;u<i;u++)p[u]=r[u];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}d.displayName="MDXCreateElement"},81646:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>y,contentTitle:()=>h,default:()=>k,frontMatter:()=>f,metadata:()=>b,toc:()=>O});var a=r(3905),n=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))o.call(t,r)&&c(e,r,t[r]);if(l)for(var r of l(t))u.call(t,r)&&c(e,r,t[r]);return e},m=(e,t)=>i(e,p(t)),d=(e,t)=>{var r={};for(var a in e)o.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&l)for(var a of l(e))t.indexOf(a)<0&&u.call(e,a)&&(r[a]=e[a]);return r};const f={title:"HashMap.Builder<K,V>",slug:"/rimbu/hashed/map/HashMap/Builder/interface"},h="interface HashMap.Builder<K,V>",b={unversionedId:"rimbu_hashed/map/HashMap/Builder.interface",id:"rimbu_hashed/map/HashMap/Builder.interface",title:"HashMap.Builder<K,V>",description:"A mutable HashMap builder used to efficiently create new immutable instances. See the Map documentation and the HashMap.Builder API documentation",source:"@site/api/rimbu_hashed/map/HashMap/Builder.interface.mdx",sourceDirName:"rimbu_hashed/map/HashMap",slug:"/rimbu/hashed/map/HashMap/Builder/interface",permalink:"/api/rimbu/hashed/map/HashMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashMap.Builder<K,V>",slug:"/rimbu/hashed/map/HashMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"HashMap (namespace)",permalink:"/api/rimbu/hashed/map/HashMap/namespace"},next:{title:"HashMap.Context<UK>",permalink:"/api/rimbu/hashed/map/HashMap/Context/interface"}},y={},O=[{value:"Type parameters",id:"type-parameters",level:2}],v={toc:O},g="wrapper";function k(e){var t=e,{components:r}=t,n=d(t,["components"]);return(0,a.kt)(g,m(s(s({},v),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",s({},{id:"interface-hashmapbuilderkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface HashMap.Builder<K,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"HashMap")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/api/rimbu/hashed/HashMap/Builder/interface"}),"HashMap.Builder API documentation")),(0,a.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the value type")))))}k.isMDXComponent=!0}}]);