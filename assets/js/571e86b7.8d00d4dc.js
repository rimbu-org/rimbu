"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[87852],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>f});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function p(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var c=r.createContext({}),l=function(e){var t=r.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):p(p({},t),e)),a},d=function(e){var t=l(e.components);return r.createElement(c.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,c=e.parentName,d=i(e,["components","mdxType","originalType","parentName"]),m=l(a),s=n,f=m["".concat(c,".").concat(s)]||m[s]||u[s]||o;return a?r.createElement(f,p(p({ref:t},d),{},{components:a})):r.createElement(f,p({ref:t},d))}));function f(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,p=new Array(o);p[0]=s;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i[m]="string"==typeof e?e:n,p[1]=i;for(var l=2;l<o;l++)p[l]=a[l];return r.createElement.apply(null,p)}return r.createElement.apply(null,a)}s.displayName="MDXCreateElement"},30977:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>h,contentTitle:()=>y,default:()=>S,frontMatter:()=>f,metadata:()=>b,toc:()=>k});var r=a(3905),n=Object.defineProperty,o=Object.defineProperties,p=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,d=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,m=(e,t)=>{for(var a in t||(t={}))c.call(t,a)&&d(e,a,t[a]);if(i)for(var a of i(t))l.call(t,a)&&d(e,a,t[a]);return e},u=(e,t)=>o(e,p(t)),s=(e,t)=>{var a={};for(var r in e)c.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&i)for(var r of i(e))t.indexOf(r)<0&&l.call(e,r)&&(a[r]=e[r]);return a};const f={title:"SortedMap (namespace)",slug:"/rimbu/core/SortedMap/namespace"},y="namespace SortedMap",b={unversionedId:"rimbu_core/SortedMap/index",id:"rimbu_core/SortedMap/index",title:"SortedMap (namespace)",description:"A type-invariant immutable Map of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the Map documentation and the SortedMap API documentation",source:"@site/api/rimbu_core/SortedMap/index.mdx",sourceDirName:"rimbu_core/SortedMap",slug:"/rimbu/core/SortedMap/namespace",permalink:"/api/rimbu/core/SortedMap/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedMap (namespace)",slug:"/rimbu/core/SortedMap/namespace"},sidebar:"defaultSidebar",previous:{title:"SortedBiMultiMap",permalink:"/api/rimbu/core/SortedBiMultiMap/var"},next:{title:"SortedMap.Builder<K,V>",permalink:"/api/rimbu/core/SortedMap/Builder/interface"}},h={},k=[{value:"Interfaces",id:"interfaces",level:2}],M={toc:k},v="wrapper";function S(e){var t=e,{components:a}=t,n=s(t,["components"]);return(0,r.kt)(v,u(m(m({},M),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",m({},{id:"namespace-sortedmap"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace SortedMap")),(0,r.kt)("p",null,"A type-invariant immutable Map of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/sorted/map/SortedMap/interface"}),"SortedMap API documentation"),"  "),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/SortedMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap<K,V>"))),(0,r.kt)("h2",m({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/SortedMap/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.Builder<K,V>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A mutable ",(0,r.kt)("inlineCode",{parentName:"td"},"SortedMap")," builder used to efficiently create new immutable instances. See the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/sorted/map/SortedMap/Builder/interface"}),"SortedMap.Builder API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/SortedMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.Context<UK>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A context instance for a HashMap that acts as a factory for every instance of this type of collection.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/SortedMap/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.NonEmpty<K,V>"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable Map of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,r.kt)("a",m({parentName:"td"},{href:"https://rimbu.org/api/rimbu/sorted/map/SortedMap/interface"}),"SortedMap API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/core/SortedMap/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.Types"))),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))))}S.isMDXComponent=!0}}]);