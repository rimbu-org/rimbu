"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[5624],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>s});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var u=a.createContext({}),p=function(e){var t=a.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},d=function(e){var t=p(e.components);return a.createElement(u.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,u=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),c=p(r),f=n,s=c["".concat(u,".").concat(f)]||c[f]||m[f]||i;return r?a.createElement(s,l(l({ref:t},d),{},{components:r})):a.createElement(s,l({ref:t},d))}));function s(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,l=new Array(i);l[0]=f;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o[c]="string"==typeof e?e:n,l[1]=o;for(var p=2;p<i;p++)l[p]=r[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},48808:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>M,contentTitle:()=>b,default:()=>g,frontMatter:()=>s,metadata:()=>y,toc:()=>S});var a=r(3905),n=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,d=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))u.call(t,r)&&d(e,r,t[r]);if(o)for(var r of o(t))p.call(t,r)&&d(e,r,t[r]);return e},m=(e,t)=>i(e,l(t)),f=(e,t)=>{var r={};for(var a in e)u.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&o)for(var a of o(e))t.indexOf(a)<0&&p.call(e,a)&&(r[a]=e[a]);return r};const s={title:"SortedMultiMapSortedValue.Builder<K,V>",slug:"/rimbu/multimap/SortedMultiMapSortedValue/Builder/interface"},b="interface SortedMultiMapSortedValue.Builder<K,V>",y={unversionedId:"rimbu_multimap/SortedMultiMapSortedValue/Builder.interface",id:"rimbu_multimap/SortedMultiMapSortedValue/Builder.interface",title:"SortedMultiMapSortedValue.Builder<K,V>",description:"A mutable SortedMultiMapSortedValue builder used to efficiently create new immutable instances. See the MultiMap documentation and the SortedMultiMapSortedValue.Builder API documentation",source:"@site/api/rimbu_multimap/SortedMultiMapSortedValue/Builder.interface.mdx",sourceDirName:"rimbu_multimap/SortedMultiMapSortedValue",slug:"/rimbu/multimap/SortedMultiMapSortedValue/Builder/interface",permalink:"/api/rimbu/multimap/SortedMultiMapSortedValue/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedMultiMapSortedValue.Builder<K,V>",slug:"/rimbu/multimap/SortedMultiMapSortedValue/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"SortedMultiMapSortedValue (namespace)",permalink:"/api/rimbu/multimap/SortedMultiMapSortedValue/namespace"},next:{title:"SortedMultiMapSortedValue.Context<UK,UV>",permalink:"/api/rimbu/multimap/SortedMultiMapSortedValue/Context/interface"}},M={},S=[{value:"Type parameters",id:"type-parameters",level:2}],O={toc:S},v="wrapper";function g(e){var t=e,{components:r}=t,n=f(t,["components"]);return(0,a.kt)(v,m(c(c({},O),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"interface-sortedmultimapsortedvaluebuilderkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface SortedMultiMapSortedValue.Builder<K,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"SortedMultiMapSortedValue")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/multimap"}),"MultiMap documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/multimap/SortedMultiMapSortedValue/Builder/interface"}),"SortedMultiMapSortedValue.Builder API documentation")),(0,a.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}g.isMDXComponent=!0}}]);