"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[98857],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>f});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function p(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var o=r.createContext({}),u=function(e){var t=r.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):p(p({},t),e)),a},c=function(e){var t=u(e.components);return r.createElement(o.Provider,{value:t},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=u(a),d=n,f=m["".concat(o,".").concat(d)]||m[d]||s[d]||i;return a?r.createElement(f,p(p({ref:t},c),{},{components:a})):r.createElement(f,p({ref:t},c))}));function f(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,p=new Array(i);p[0]=d;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[m]="string"==typeof e?e:n,p[1]=l;for(var u=2;u<i;u++)p[u]=a[u];return r.createElement.apply(null,p)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},48913:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>y,contentTitle:()=>M,default:()=>g,frontMatter:()=>f,metadata:()=>b,toc:()=>h});var r=a(3905),n=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,m=(e,t)=>{for(var a in t||(t={}))o.call(t,a)&&c(e,a,t[a]);if(l)for(var a of l(t))u.call(t,a)&&c(e,a,t[a]);return e},s=(e,t)=>i(e,p(t)),d=(e,t)=>{var a={};for(var r in e)o.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&u.call(e,r)&&(a[r]=e[r]);return a};const f={title:"MultiMap (namespace)",slug:"/rimbu/core/MultiMap/namespace"},M="namespace MultiMap",b={unversionedId:"rimbu_core/MultiMap/index",id:"rimbu_core/MultiMap/index",title:"MultiMap (namespace)",description:"A type-invariant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the MultiMap documentation and the MultiMap API documentation",source:"@site/api/rimbu_core/MultiMap/index.mdx",sourceDirName:"rimbu_core/MultiMap",slug:"/rimbu/core/MultiMap/namespace",permalink:"/api/rimbu/core/MultiMap/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiMap (namespace)",slug:"/rimbu/core/MultiMap/namespace"},sidebar:"defaultSidebar",previous:{title:"List",permalink:"/api/rimbu/core/List/var"},next:{title:"MultiMap.Builder<K,V>",permalink:"/api/rimbu/core/MultiMap/Builder/interface"}},y={},h=[{value:"Interfaces",id:"interfaces",level:2}],k={toc:h},v="wrapper";function g(e){var t=e,{components:a}=t,n=d(t,["components"]);return(0,r.kt)(v,s(m(m({},k),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",m({},{id:"namespace-multimap"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace MultiMap")),(0,r.kt)("p",null,"A type-invariant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/multimap/MultiMap/interface"}),"MultiMap API documentation")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/MultiMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiMap<K,V>"))),(0,r.kt)("h2",m({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/MultiMap/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiMap.Builder<K,V>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A mutable ",(0,r.kt)("inlineCode",{parentName:"td"},"MultiMap")," builder used to efficiently create new immutable instances. See the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/MultiMap/Builder/interface"}),"MultiMap.Builder API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/MultiMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiMap.Context<UK,UV>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A context instance for ",(0,r.kt)("inlineCode",{parentName:"td"},"MultiMap")," implementations that acts as a factory for every instance of this type of collection.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/MultiMap/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiMap.NonEmpty<K,V>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/MultiMap/interface"}),"MultiMap API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/MultiMap/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiMap.Types"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))))}g.isMDXComponent=!0}}]);