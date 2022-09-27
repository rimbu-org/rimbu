"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[69716],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>c});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?d(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},d=Object.keys(e);for(a=0;a<d.length;a++)r=d[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(e);for(a=0;a<d.length;a++)r=d[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var p=a.createContext({}),l=function(e){var t=a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},m=function(e){var t=l(e.components);return a.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,d=e.originalType,p=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),s=l(r),c=n,b=s["".concat(p,".").concat(c)]||s[c]||u[c]||d;return r?a.createElement(b,i(i({ref:t},m),{},{components:r})):a.createElement(b,i({ref:t},m))}));function c(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var d=r.length,i=new Array(d);i[0]=s;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:n,i[1]=o;for(var l=2;l<d;l++)i[l]=r[l];return a.createElement.apply(null,i)}return a.createElement.apply(null,r)}s.displayName="MDXCreateElement"},38528:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>f,contentTitle:()=>c,default:()=>O,frontMatter:()=>s,metadata:()=>b,toc:()=>h});var a=r(3905),n=Object.defineProperty,d=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&m(e,r,t[r]);if(o)for(var r of o(t))l.call(t,r)&&m(e,r,t[r]);return e};const s={title:"@rimbu/ordered/set",slug:"/rimbu/ordered/set"},c="package @rimbu/ordered/set",b={unversionedId:"rimbu_ordered/set/index",id:"rimbu_ordered/set/index",title:"@rimbu/ordered/set",description:"The @rimbu/ordered/set package provides various OrderedSet implementations.",source:"@site/api/rimbu_ordered/set/index.mdx",sourceDirName:"rimbu_ordered/set",slug:"/rimbu/ordered/set",permalink:"/api/rimbu/ordered/set",draft:!1,tags:[],version:"current",frontMatter:{title:"@rimbu/ordered/set",slug:"/rimbu/ordered/set"},sidebar:"defaultSidebar",previous:{title:"OrderedSortedMapCreators",permalink:"/api/rimbu/ordered/map-custom/OrderedSortedMapCreators/interface"},next:{title:"OrderedHashSet (namespace)",permalink:"/api/rimbu/ordered/set/OrderedHashSet/namespace"}},f={},h=[{value:"Interfaces",id:"interfaces",level:2},{value:"Namespaces",id:"namespaces",level:2}],k={toc:h};function O(e){var t,r=e,{components:n}=r,m=((e,t)=>{var r={};for(var a in e)p.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&o)for(var a of o(e))t.indexOf(a)<0&&l.call(e,a)&&(r[a]=e[a]);return r})(r,["components"]);return(0,a.kt)("wrapper",(t=u(u({},k),m),d(t,i({components:n,mdxType:"MDXLayout"}))),(0,a.kt)("h1",u({},{id:"package-rimbuorderedset"}),(0,a.kt)("inlineCode",{parentName:"h1"},"package @rimbu/ordered/set")),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"@rimbu/ordered/set")," package provides various ",(0,a.kt)("inlineCode",{parentName:"p"},"OrderedSet")," implementations."),(0,a.kt)("p",null," See the ",(0,a.kt)("a",u({parentName:"p"},{href:"/docs/collections/set"}),"Rimbu docs Set page")," for more information."),(0,a.kt)("h2",u({},{id:"interfaces"}),"Interfaces"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/set/OrderedHashSet/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedHashSet<T>"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"A type-invariant immutable Ordered HashSet of value type T. In the Set, there are no duplicate values. See the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedHashSet/interface"}),"OrderedHashSet API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/set/OrderedSet/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSet<T>"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"A type-invariant immutable Ordered Set of value type T. In the Set, there are no duplicate values. See the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSet/interface"}),"OrderedSet API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/set/OrderedSortedSet/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedSet<T>"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"A type-invariant immutable Ordered SortedSet of value type T. In the Set, there are no duplicate values. See the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSortedSet/interface"}),"OrderedSortedSet API documentation"))))),(0,a.kt)("h2",u({},{id:"namespaces"}),"Namespaces"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/set/OrderedHashSet/namespace"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedHashSet"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"A type-invariant immutable Ordered HashSet of value type T. In the Set, there are no duplicate values. See the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedHashSet/interface"}),"OrderedHashSet API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/set/OrderedSet/namespace"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSet"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"A type-invariant immutable Ordered Set of value type T. In the Set, there are no duplicate values. See the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSet/interface"}),"OrderedSet API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/set/OrderedSortedSet/namespace"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedSet"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"A type-invariant immutable Ordered SortedSet of value type T. In the Set, there are no duplicate values. See the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,a.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSortedSet/interface"}),"OrderedSortedSet API documentation"))))))}O.isMDXComponent=!0}}]);