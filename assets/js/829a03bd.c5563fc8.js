"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[5092],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>h});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var u=r.createContext({}),p=function(e){var t=r.useContext(u),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},c=function(e){var t=p(e.components);return r.createElement(u.Provider,{value:t},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,u=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),m=p(a),d=n,h=m["".concat(u,".").concat(d)]||m[d]||s[d]||i;return a?r.createElement(h,l(l({ref:t},c),{},{components:a})):r.createElement(h,l({ref:t},c))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=d;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o[m]="string"==typeof e?e:n,l[1]=o;for(var p=2;p<i;p++)l[p]=a[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},53598:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>g,frontMatter:()=>h,metadata:()=>M,toc:()=>y});var r=a(3905),n=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,c=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,m=(e,t)=>{for(var a in t||(t={}))u.call(t,a)&&c(e,a,t[a]);if(o)for(var a of o(t))p.call(t,a)&&c(e,a,t[a]);return e},s=(e,t)=>i(e,l(t)),d=(e,t)=>{var a={};for(var r in e)u.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&o)for(var r of o(e))t.indexOf(r)<0&&p.call(e,r)&&(a[r]=e[r]);return a};const h={title:"HashMultiMapSortedValue (namespace)",slug:"/rimbu/core/HashMultiMapSortedValue/namespace"},f="namespace HashMultiMapSortedValue",M={unversionedId:"rimbu_core/HashMultiMapSortedValue/index",id:"rimbu_core/HashMultiMapSortedValue/index",title:"HashMultiMapSortedValue (namespace)",description:"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the MultiMap documentation and the HashMultiMapSortedValue API documentation",source:"@site/api/rimbu_core/HashMultiMapSortedValue/index.mdx",sourceDirName:"rimbu_core/HashMultiMapSortedValue",slug:"/rimbu/core/HashMultiMapSortedValue/namespace",permalink:"/api/rimbu/core/HashMultiMapSortedValue/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"HashMultiMapSortedValue (namespace)",slug:"/rimbu/core/HashMultiMapSortedValue/namespace"},sidebar:"defaultSidebar",previous:{title:"HashMultiMapHashValue",permalink:"/api/rimbu/core/HashMultiMapHashValue/var"},next:{title:"HashMultiMapSortedValue.Builder<K,V>",permalink:"/api/rimbu/core/HashMultiMapSortedValue/Builder/interface"}},b={},y=[{value:"Interfaces",id:"interfaces",level:2}],k={toc:y},v="wrapper";function g(e){var t=e,{components:a}=t,n=d(t,["components"]);return(0,r.kt)(v,s(m(m({},k),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",m({},{id:"namespace-hashmultimapsortedvalue"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace HashMultiMapSortedValue")),(0,r.kt)("p",null,"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/interface"}),"HashMultiMapSortedValue API documentation")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/HashMultiMapSortedValue/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapSortedValue<K,V>"))),(0,r.kt)("h2",m({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/HashMultiMapSortedValue/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapSortedValue.Builder<K,V>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A mutable ",(0,r.kt)("inlineCode",{parentName:"td"},"HashMultiMapSortedValue")," builder used to efficiently create new immutable instances. See the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/Builder/interface"}),"HashMultiMapSortedValue.Builder API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/HashMultiMapSortedValue/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapSortedValue.Context<UK,UV>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A context instance for an ",(0,r.kt)("inlineCode",{parentName:"td"},"HashMultiMapSortedValue")," that acts as a factory for every instance of this type of collection.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/HashMultiMapSortedValue/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapSortedValue.NonEmpty<K,V>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/interface"}),"HashMultiMapSortedValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/HashMultiMapSortedValue/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapSortedValue.Types"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))))}g.isMDXComponent=!0}}]);