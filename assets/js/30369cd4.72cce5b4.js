"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[27056],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>b});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=a.createContext({}),m=function(e){var t=a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},c=function(e){var t=m(e.components);return a.createElement(l.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,l=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),d=m(r),s=n,b=d["".concat(l,".").concat(s)]||d[s]||u[s]||o;return r?a.createElement(b,p(p({ref:t},c),{},{components:r})):a.createElement(b,p({ref:t},c))}));function b(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,p=new Array(o);p[0]=s;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i[d]="string"==typeof e?e:n,p[1]=i;for(var m=2;m<o;m++)p[m]=r[m];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}s.displayName="MDXCreateElement"},64694:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>k,contentTitle:()=>f,default:()=>O,frontMatter:()=>b,metadata:()=>y,toc:()=>h});var a=r(3905),n=Object.defineProperty,o=Object.defineProperties,p=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,d=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&c(e,r,t[r]);if(i)for(var r of i(t))m.call(t,r)&&c(e,r,t[r]);return e},u=(e,t)=>o(e,p(t)),s=(e,t)=>{var r={};for(var a in e)l.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&i)for(var a of i(e))t.indexOf(a)<0&&m.call(e,a)&&(r[a]=e[a]);return r};const b={title:"@rimbu/sorted/map",slug:"/rimbu/sorted/map"},f="package @rimbu/sorted/map",y={unversionedId:"rimbu_sorted/map/index",id:"rimbu_sorted/map/index",title:"@rimbu/sorted/map",description:"The @rimbu/sorted/map package provides SortedMap implementations.",source:"@site/api/rimbu_sorted/map/index.mdx",sourceDirName:"rimbu_sorted/map",slug:"/rimbu/sorted/map",permalink:"/api/rimbu/sorted/map",draft:!1,tags:[],version:"current",frontMatter:{title:"@rimbu/sorted/map",slug:"/rimbu/sorted/map"},sidebar:"defaultSidebar",previous:{title:"SortedSet<T>",permalink:"/api/rimbu/sorted/SortedSet/interface"},next:{title:"SortedMap (namespace)",permalink:"/api/rimbu/sorted/map/SortedMap/namespace"}},k={},h=[{value:"Interfaces",id:"interfaces",level:2},{value:"Namespaces",id:"namespaces",level:2}],g={toc:h},v="wrapper";function O(e){var t=e,{components:r}=t,n=s(t,["components"]);return(0,a.kt)(v,u(d(d({},g),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",d({},{id:"package-rimbusortedmap"}),(0,a.kt)("inlineCode",{parentName:"h1"},"package @rimbu/sorted/map")),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"@rimbu/sorted/map")," package provides ",(0,a.kt)("inlineCode",{parentName:"p"},"SortedMap")," implementations."),(0,a.kt)("p",null," See the ",(0,a.kt)("a",d({parentName:"p"},{href:"/docs/collections/map"}),"Rimbu docs Map page")," for more information."),(0,a.kt)("h2",d({},{id:"interfaces"}),"Interfaces"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",d({parentName:"tr"},{align:null}),(0,a.kt)("a",d({parentName:"td"},{href:"/api/rimbu/sorted/map/SortedMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"SortedMap<K,V>"))),(0,a.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable Map of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,a.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/sorted/map/SortedMap/interface"}),"SortedMap API documentation"))))),(0,a.kt)("h2",d({},{id:"namespaces"}),"Namespaces"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",d({parentName:"tr"},{align:null}),(0,a.kt)("a",d({parentName:"td"},{href:"/api/rimbu/sorted/map/SortedMap/namespace"}),(0,a.kt)("inlineCode",{parentName:"a"},"SortedMap"))),(0,a.kt)("td",d({parentName:"tr"},{align:null}),"A type-invariant immutable Map of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,a.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/sorted/map/SortedMap/interface"}),"SortedMap API documentation"))))))}O.isMDXComponent=!0}}]);