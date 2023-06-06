"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[69868],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>f});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function d(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)t=o[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)t=o[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var i=a.createContext({}),l=function(e){var r=a.useContext(i),t=r;return e&&(t="function"==typeof e?e(r):d(d({},r),e)),t},c=function(e){var r=l(e.components);return a.createElement(i.Provider,{value:r},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},s=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),m=l(t),s=n,f=m["".concat(i,".").concat(s)]||m[s]||u[s]||o;return t?a.createElement(f,d(d({ref:r},c),{},{components:t})):a.createElement(f,d({ref:r},c))}));function f(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var o=t.length,d=new Array(o);d[0]=s;var p={};for(var i in r)hasOwnProperty.call(r,i)&&(p[i]=r[i]);p.originalType=e,p[m]="string"==typeof e?e:n,d[1]=p;for(var l=2;l<o;l++)d[l]=t[l];return a.createElement.apply(null,d)}return a.createElement.apply(null,t)}s.displayName="MDXCreateElement"},70585:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>O,contentTitle:()=>y,default:()=>v,frontMatter:()=>f,metadata:()=>b,toc:()=>h});var a=t(3905),n=Object.defineProperty,o=Object.defineProperties,d=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,c=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))i.call(r,t)&&c(e,t,r[t]);if(p)for(var t of p(r))l.call(r,t)&&c(e,t,r[t]);return e},u=(e,r)=>o(e,d(r)),s=(e,r)=>{var t={};for(var a in e)i.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&p)for(var a of p(e))r.indexOf(a)<0&&l.call(e,a)&&(t[a]=e[a]);return t};const f={title:"OrderedSortedMap<K,V>",slug:"/rimbu/ordered/OrderedSortedMap/interface"},y="interface OrderedSortedMap<K,V>",b={unversionedId:"rimbu_ordered/OrderedSortedMap.interface",id:"rimbu_ordered/OrderedSortedMap.interface",title:"OrderedSortedMap<K,V>",description:"A type-invariant immutable Ordered SortedMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the Map documentation and the OrderedSortedMap API documentation",source:"@site/api/rimbu_ordered/OrderedSortedMap.interface.mdx",sourceDirName:"rimbu_ordered",slug:"/rimbu/ordered/OrderedSortedMap/interface",permalink:"/api/rimbu/ordered/OrderedSortedMap/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSortedMap<K,V>",slug:"/rimbu/ordered/OrderedSortedMap/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSortedMap.Types",permalink:"/api/rimbu/ordered/OrderedSortedMap/Types/interface"},next:{title:"OrderedSortedSet (namespace)",permalink:"/api/rimbu/ordered/OrderedSortedSet/namespace"}},O={},h=[{value:"Type parameters",id:"type-parameters",level:2}],k={toc:h},S="wrapper";function v(e){var r=e,{components:t}=r,n=s(r,["components"]);return(0,a.kt)(S,u(m(m({},k),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",m({},{id:"interface-orderedsortedmapkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface OrderedSortedMap<K,V>")),(0,a.kt)("p",null,"A type-invariant immutable Ordered SortedMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/interface"}),"OrderedSortedMap API documentation"),"  "),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/ordered/OrderedSortedMap/namespace"}),"OrderedSortedMap")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/ordered/OrderedSortedMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedMap.NonEmpty<K,V>"))),(0,a.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))),(0,a.kt)("admonition",m({},{title:"note",type:"note"}),(0,a.kt)("ul",{parentName:"admonition"},(0,a.kt)("li",{parentName:"ul"},"The OrderedSortedMap keeps maintains the insertion order of elements, thus iterators and streams will also reflect this order. - The OrderedSortedMap wraps around a SortedMap instance, thus has mostly the same time complexity as the SortedMap. - The OrderedSortedMap keeps the key insertion order in a List, thus its space complexity is higher than a regular SortedMap."))),(0,a.kt)("admonition",m({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"const m1 = OrderedSortedMap.empty<number, string>()\nconst m2 = OrderedSortedMap.of([1, 'a'], [2, 'b'])\n"))))}v.isMDXComponent=!0}}]);