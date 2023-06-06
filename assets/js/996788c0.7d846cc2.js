"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[25195],{3905:(t,e,a)=>{a.d(e,{Zo:()=>o,kt:()=>h});var r=a(67294);function n(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}function i(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,r)}return a}function l(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?i(Object(a),!0).forEach((function(e){n(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function p(t,e){if(null==t)return{};var a,r,n=function(t,e){if(null==t)return{};var a,r,n={},i=Object.keys(t);for(r=0;r<i.length;r++)a=i[r],e.indexOf(a)>=0||(n[a]=t[a]);return n}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)a=i[r],e.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(t,a)&&(n[a]=t[a])}return n}var u=r.createContext({}),m=function(t){var e=r.useContext(u),a=e;return t&&(a="function"==typeof t?t(e):l(l({},e),t)),a},o=function(t){var e=m(t.components);return r.createElement(u.Provider,{value:e},t.children)},d="mdxType",c={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},s=r.forwardRef((function(t,e){var a=t.components,n=t.mdxType,i=t.originalType,u=t.parentName,o=p(t,["components","mdxType","originalType","parentName"]),d=m(a),s=n,h=d["".concat(u,".").concat(s)]||d[s]||c[s]||i;return a?r.createElement(h,l(l({ref:e},o),{},{components:a})):r.createElement(h,l({ref:e},o))}));function h(t,e){var a=arguments,n=e&&e.mdxType;if("string"==typeof t||n){var i=a.length,l=new Array(i);l[0]=s;var p={};for(var u in e)hasOwnProperty.call(e,u)&&(p[u]=e[u]);p.originalType=t,p[d]="string"==typeof t?t:n,l[1]=p;for(var m=2;m<i;m++)l[m]=a[m];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}s.displayName="MDXCreateElement"},10335:(t,e,a)=>{a.r(e),a.d(e,{assets:()=>b,contentTitle:()=>M,default:()=>g,frontMatter:()=>h,metadata:()=>k,toc:()=>f});var r=a(3905),n=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,o=(t,e,a)=>e in t?n(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a,d=(t,e)=>{for(var a in e||(e={}))u.call(e,a)&&o(t,a,e[a]);if(p)for(var a of p(e))m.call(e,a)&&o(t,a,e[a]);return t},c=(t,e)=>i(t,l(e)),s=(t,e)=>{var a={};for(var r in t)u.call(t,r)&&e.indexOf(r)<0&&(a[r]=t[r]);if(null!=t&&p)for(var r of p(t))e.indexOf(r)<0&&m.call(t,r)&&(a[r]=t[r]);return a};const h={title:"@rimbu/multimap",slug:"/rimbu/multimap"},M="package @rimbu/multimap",k={unversionedId:"rimbu_multimap/index",id:"rimbu_multimap/index",title:"@rimbu/multimap",description:"The @rimbu/multimap package provides implementations for various MultiMaps.",source:"@site/api/rimbu_multimap/index.mdx",sourceDirName:"rimbu_multimap",slug:"/rimbu/multimap",permalink:"/api/rimbu/multimap",draft:!1,tags:[],version:"current",frontMatter:{title:"@rimbu/multimap",slug:"/rimbu/multimap"},sidebar:"defaultSidebar",previous:{title:"Tree<T,TS,TB,C>",permalink:"/api/rimbu/list/custom/Tree/interface"},next:{title:"HashMultiMapHashValue (namespace)",permalink:"/api/rimbu/multimap/HashMultiMapHashValue/namespace"}},b={},f=[{value:"Interfaces",id:"interfaces",level:2},{value:"Namespaces",id:"namespaces",level:2}],y={toc:f},N="wrapper";function g(t){var e=t,{components:a}=e,n=s(e,["components"]);return(0,r.kt)(N,c(d(d({},y),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",d({},{id:"package-rimbumultimap"}),(0,r.kt)("inlineCode",{parentName:"h1"},"package @rimbu/multimap")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"@rimbu/multimap")," package provides implementations for various MultiMaps."),(0,r.kt)("p",null," See the ",(0,r.kt)("a",d({parentName:"p"},{href:"/docs/collections/multimap"}),"Rimbu docs MultiMap page")," for more information."),(0,r.kt)("h2",d({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/HashMultiMapHashValue/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapHashValue<K,V>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/HashMultiMapHashValue/interface"}),"HashMultiMapHashValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/HashMultiMapSortedValue/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapSortedValue<K,V>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/interface"}),"HashMultiMapSortedValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/MultiMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiMap<K,V>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/MultiMap/interface"}),"MultiMap API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/SortedMultiMapHashValue/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMultiMapHashValue<K,V>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/SortedMultiMapHashValue/interface"}),"SortedMultiMapHashValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/SortedMultiMapSortedValue/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMultiMapSortedValue<K,V>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/SortedMultiMapSortedValue/interface"}),"SortedMultiMapSortedValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/VariantMultiMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"VariantMultiMap<K,V>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-variant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/VariantMultiMap/interface"}),"VariantMultiMap API documentation"))))),(0,r.kt)("h2",d({},{id:"namespaces"}),"Namespaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/HashMultiMapHashValue/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapHashValue"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/HashMultiMapHashValue/interface"}),"HashMultiMapHashValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/HashMultiMapSortedValue/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashMultiMapSortedValue"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/interface"}),"HashMultiMapSortedValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/MultiMap/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiMap"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/MultiMap/interface"}),"MultiMap API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/SortedMultiMapHashValue/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMultiMapHashValue"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/SortedMultiMapHashValue/interface"}),"SortedMultiMapHashValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/SortedMultiMapSortedValue/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMultiMapSortedValue"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable MultiMap of key type K, and value type V. In the MultiMap, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/SortedMultiMapSortedValue/interface"}),"SortedMultiMapSortedValue API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multimap/VariantMultiMap/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"VariantMultiMap"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A type-variant immutable MultiMap of key type K, and value type V. In the Map, each key has at least one value. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/multimap/VariantMultiMap/interface"}),"VariantMultiMap API documentation"))))))}g.isMDXComponent=!0}}]);