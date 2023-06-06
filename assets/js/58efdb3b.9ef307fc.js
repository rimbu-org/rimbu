"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[20831],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>h});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var d=a.createContext({}),l=function(e){var t=a.useContext(d),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},s=function(e){var t=l(e.components);return a.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,d=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),m=l(r),u=n,h=m["".concat(d,".").concat(u)]||m[u]||c[u]||o;return r?a.createElement(h,p(p({ref:t},s),{},{components:r})):a.createElement(h,p({ref:t},s))}));function h(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,p=new Array(o);p[0]=u;var i={};for(var d in t)hasOwnProperty.call(t,d)&&(i[d]=t[d]);i.originalType=e,i[m]="string"==typeof e?e:n,p[1]=i;for(var l=2;l<o;l++)p[l]=r[l];return a.createElement.apply(null,p)}return a.createElement.apply(null,r)}u.displayName="MDXCreateElement"},617:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>y,default:()=>M,frontMatter:()=>h,metadata:()=>f,toc:()=>b});var a=r(3905),n=Object.defineProperty,o=Object.defineProperties,p=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))d.call(t,r)&&s(e,r,t[r]);if(i)for(var r of i(t))l.call(t,r)&&s(e,r,t[r]);return e},c=(e,t)=>o(e,p(t)),u=(e,t)=>{var r={};for(var a in e)d.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&i)for(var a of i(e))t.indexOf(a)<0&&l.call(e,a)&&(r[a]=e[a]);return r};const h={title:"OrderedHashMap.NonEmpty<K,V>",slug:"/rimbu/ordered/OrderedHashMap/NonEmpty/interface"},y="interface OrderedHashMap.NonEmpty<K,V>",f={unversionedId:"rimbu_ordered/OrderedHashMap/NonEmpty.interface",id:"rimbu_ordered/OrderedHashMap/NonEmpty.interface",title:"OrderedHashMap.NonEmpty<K,V>",description:"A non-empty type-invariant immutable Ordered HashMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the Map documentation and the OrderedHashMap API documentation",source:"@site/api/rimbu_ordered/OrderedHashMap/NonEmpty.interface.mdx",sourceDirName:"rimbu_ordered/OrderedHashMap",slug:"/rimbu/ordered/OrderedHashMap/NonEmpty/interface",permalink:"/api/rimbu/ordered/OrderedHashMap/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedHashMap.NonEmpty<K,V>",slug:"/rimbu/ordered/OrderedHashMap/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedHashMap.Context<UK>",permalink:"/api/rimbu/ordered/OrderedHashMap/Context/interface"},next:{title:"OrderedHashMap.Types",permalink:"/api/rimbu/ordered/OrderedHashMap/Types/interface"}},O={},b=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition",level:4}],k={toc:b},v="wrapper";function M(e){var t=e,{components:r}=t,n=u(t,["components"]);return(0,a.kt)(v,c(m(m({},k),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",m({},{id:"interface-orderedhashmapnonemptykv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface OrderedHashMap.NonEmpty<K,V>")),(0,a.kt)("p",null,"A non-empty type-invariant immutable Ordered HashMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedHashMap/interface"}),"OrderedHashMap API documentation"),"  "),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/ordered/OrderedHashMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedHashMap<K,V>"))),(0,a.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",m({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))),(0,a.kt)("admonition",m({},{title:"note",type:"note"}),(0,a.kt)("ul",{parentName:"admonition"},(0,a.kt)("li",{parentName:"ul"},"The OrderedHashMap keeps maintains the insertion order of elements, thus iterators and streams will also reflect this order. - The OrderedHashMap wraps around a HashMap instance, thus has mostly the same time complexity as the HashMap. - The OrderedHashMap keeps the key insertion order in a List, thus its space complexity is higher than a regular HashMap."))),(0,a.kt)("admonition",m({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"const m1 = OrderedHashMap.empty<number, string>()\nconst m2 = OrderedHashMap.of([1, 'a'], [2, 'b'])\n"))),(0,a.kt)("h2",m({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"stream"}),(0,a.kt)("inlineCode",{parentName:"h3"},"stream")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"stream(): Stream.NonEmpty<readonly [K, V]>;")))))}M.isMDXComponent=!0}}]);