"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[10334],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>s});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var o=a.createContext({}),u=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},m=function(e){var t=u(e.components);return a.createElement(o.Provider,{value:t},e.children)},c="mdxType",y={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),c=u(r),f=n,s=c["".concat(o,".").concat(f)]||c[f]||y[f]||i;return r?a.createElement(s,p(p({ref:t},m),{},{components:r})):a.createElement(s,p({ref:t},m))}));function s(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,p=new Array(i);p[0]=f;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[c]="string"==typeof e?e:n,p[1]=l;for(var u=2;u<i;u++)p[u]=r[u];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},99675:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>M,contentTitle:()=>b,default:()=>O,frontMatter:()=>s,metadata:()=>d,toc:()=>v});var a=r(3905),n=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))o.call(t,r)&&m(e,r,t[r]);if(l)for(var r of l(t))u.call(t,r)&&m(e,r,t[r]);return e},y=(e,t)=>i(e,p(t)),f=(e,t)=>{var r={};for(var a in e)o.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&l)for(var a of l(e))t.indexOf(a)<0&&u.call(e,a)&&(r[a]=e[a]);return r};const s={title:"MultiMap.NonEmpty<K,V>",slug:"/rimbu/multimap/MultiMap/NonEmpty/interface"},b="interface MultiMap.NonEmpty<K,V>",d={unversionedId:"rimbu_multimap/MultiMap/NonEmpty.interface",id:"rimbu_multimap/MultiMap/NonEmpty.interface",title:"MultiMap.NonEmpty<K,V>",description:"A non-empty type-invariant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the MultiMap documentation and the MultiMap API documentation",source:"@site/api/rimbu_multimap/MultiMap/NonEmpty.interface.mdx",sourceDirName:"rimbu_multimap/MultiMap",slug:"/rimbu/multimap/MultiMap/NonEmpty/interface",permalink:"/api/rimbu/multimap/MultiMap/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiMap.NonEmpty<K,V>",slug:"/rimbu/multimap/MultiMap/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"MultiMap.Context<UK,UV>",permalink:"/api/rimbu/multimap/MultiMap/Context/interface"},next:{title:"MultiMap.Types",permalink:"/api/rimbu/multimap/MultiMap/Types/interface"}},M={},v=[{value:"Type parameters",id:"type-parameters",level:2}],k={toc:v},h="wrapper";function O(e){var t=e,{components:r}=t,n=f(t,["components"]);return(0,a.kt)(h,y(c(c({},k),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"interface-multimapnonemptykv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface MultiMap.NonEmpty<K,V>")),(0,a.kt)("p",null,"A non-empty type-invariant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/multimap/MultiMap/interface"}),"MultiMap API documentation")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",c({parentName:"p"},{href:"/api/rimbu/multimap/MultiMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"MultiMap<K,V>"))),(0,a.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}O.isMDXComponent=!0}}]);