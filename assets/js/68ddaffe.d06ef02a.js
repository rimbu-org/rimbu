"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[45809],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>h});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var o=r.createContext({}),u=function(e){var t=r.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=u(e.components);return r.createElement(o.Provider,{value:t},e.children)},c="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),c=u(a),d=n,h=c["".concat(o,".").concat(d)]||c[d]||s[d]||i;return a?r.createElement(h,l(l({ref:t},m),{},{components:a})):r.createElement(h,l({ref:t},m))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=d;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p[c]="string"==typeof e?e:n,l[1]=p;for(var u=2;u<i;u++)l[u]=a[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},16352:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>M,contentTitle:()=>f,default:()=>g,frontMatter:()=>h,metadata:()=>b,toc:()=>y});var r=a(3905),n=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,c=(e,t)=>{for(var a in t||(t={}))o.call(t,a)&&m(e,a,t[a]);if(p)for(var a of p(t))u.call(t,a)&&m(e,a,t[a]);return e},s=(e,t)=>i(e,l(t)),d=(e,t)=>{var a={};for(var r in e)o.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&p)for(var r of p(e))t.indexOf(r)<0&&u.call(e,r)&&(a[r]=e[r]);return a};const h={title:"HashBiMultiMap (namespace)",slug:"/rimbu/core/HashBiMultiMap/namespace"},f="namespace HashBiMultiMap",b={unversionedId:"rimbu_core/HashBiMultiMap/index",id:"rimbu_core/HashBiMultiMap/index",title:"HashBiMultiMap (namespace)",description:"A type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. Its keys and values are hashed. See the BiMultiMap documentation and the HashBiMultiMap API documentation",source:"@site/api/rimbu_core/HashBiMultiMap/index.mdx",sourceDirName:"rimbu_core/HashBiMultiMap",slug:"/rimbu/core/HashBiMultiMap/namespace",permalink:"/api/rimbu/core/HashBiMultiMap/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"HashBiMultiMap (namespace)",slug:"/rimbu/core/HashBiMultiMap/namespace"},sidebar:"defaultSidebar",previous:{title:"Graph<N>",permalink:"/api/rimbu/core/Graph/interface"},next:{title:"HashBiMultiMap.Builder<K,V>",permalink:"/api/rimbu/core/HashBiMultiMap/Builder/interface"}},M={},y=[{value:"Interfaces",id:"interfaces",level:2}],k={toc:y},v="wrapper";function g(e){var t=e,{components:a}=t,n=d(t,["components"]);return(0,r.kt)(v,s(c(c({},k),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",c({},{id:"namespace-hashbimultimap"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace HashBiMultiMap")),(0,r.kt)("p",null,"A type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. Its keys and values are hashed. See the ",(0,r.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,r.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/interface"}),"HashBiMultiMap API documentation")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/core/HashBiMultiMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap<K,V>"))),(0,r.kt)("h2",c({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),(0,r.kt)("a",c({parentName:"td"},{href:"/api/rimbu/core/HashBiMultiMap/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.Builder<K,V>"))),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"A mutable ",(0,r.kt)("inlineCode",{parentName:"td"},"HashBiMultiMap")," builder used to efficiently create new immutable instances. See the ",(0,r.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,r.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/Builder/interface"}),"HashBiMultiMap.Builder API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),(0,r.kt)("a",c({parentName:"td"},{href:"/api/rimbu/core/HashBiMultiMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.Context<UK,UV>"))),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"The HashBiMultiMap's Context instance that serves as a factory for all related immutable instances and builders.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),(0,r.kt)("a",c({parentName:"td"},{href:"/api/rimbu/core/HashBiMultiMap/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.NonEmpty<K,V>"))),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. Its keys and values are hashed. See the ",(0,r.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,r.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/interface"}),"HashBiMultiMap API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),(0,r.kt)("a",c({parentName:"td"},{href:"/api/rimbu/core/HashBiMultiMap/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.Types"))),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))))}g.isMDXComponent=!0}}]);