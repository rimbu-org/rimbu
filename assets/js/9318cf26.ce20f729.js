"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[17967],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>y});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var i=n.createContext({}),l=function(e){var t=n.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):d(d({},t),e)),r},m=function(e){var t=l(e.components);return n.createElement(i.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,i=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),c=l(r),s=a,y=c["".concat(i,".").concat(s)]||c[s]||u[s]||o;return r?n.createElement(y,d(d({ref:t},m),{},{components:r})):n.createElement(y,d({ref:t},m))}));function y(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,d=new Array(o);d[0]=s;var p={};for(var i in t)hasOwnProperty.call(t,i)&&(p[i]=t[i]);p.originalType=e,p[c]="string"==typeof e?e:a,d[1]=p;for(var l=2;l<o;l++)d[l]=r[l];return n.createElement.apply(null,d)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},29763:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>M,frontMatter:()=>y,metadata:()=>O,toc:()=>h});var n=r(3905),a=Object.defineProperty,o=Object.defineProperties,d=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))i.call(t,r)&&m(e,r,t[r]);if(p)for(var r of p(t))l.call(t,r)&&m(e,r,t[r]);return e},u=(e,t)=>o(e,d(t)),s=(e,t)=>{var r={};for(var n in e)i.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&l.call(e,n)&&(r[n]=e[n]);return r};const y={title:"OrderedSortedMap.NonEmpty<K,V>",slug:"/rimbu/ordered/OrderedSortedMap/NonEmpty/interface"},f="interface OrderedSortedMap.NonEmpty<K,V>",O={unversionedId:"rimbu_ordered/OrderedSortedMap/NonEmpty.interface",id:"rimbu_ordered/OrderedSortedMap/NonEmpty.interface",title:"OrderedSortedMap.NonEmpty<K,V>",description:"A non-empty type-invariant immutable Ordered SortedMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the Map documentation and the OrderedSortedMap API documentation",source:"@site/api/rimbu_ordered/OrderedSortedMap/NonEmpty.interface.mdx",sourceDirName:"rimbu_ordered/OrderedSortedMap",slug:"/rimbu/ordered/OrderedSortedMap/NonEmpty/interface",permalink:"/api/rimbu/ordered/OrderedSortedMap/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSortedMap.NonEmpty<K,V>",slug:"/rimbu/ordered/OrderedSortedMap/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSortedMap.Context<UK>",permalink:"/api/rimbu/ordered/OrderedSortedMap/Context/interface"},next:{title:"OrderedSortedMap.Types",permalink:"/api/rimbu/ordered/OrderedSortedMap/Types/interface"}},b={},h=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition",level:4}],k={toc:h},v="wrapper";function M(e){var t=e,{components:r}=t,a=s(t,["components"]);return(0,n.kt)(v,u(c(c({},k),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",c({},{id:"interface-orderedsortedmapnonemptykv"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface OrderedSortedMap.NonEmpty<K,V>")),(0,n.kt)("p",null,"A non-empty type-invariant immutable Ordered SortedMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,n.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,n.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/interface"}),"OrderedSortedMap API documentation"),"  "),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/OrderedSortedMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSortedMap<K,V>"))),(0,n.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))),(0,n.kt)("admonition",c({},{title:"note",type:"note"}),(0,n.kt)("ul",{parentName:"admonition"},(0,n.kt)("li",{parentName:"ul"},"The OrderedSortedMap keeps maintains the insertion order of elements, thus iterators and streams will also reflect this order. - The OrderedSortedMap wraps around a SortedMap instance, thus has mostly the same time complexity as the SortedMap. - The OrderedSortedMap keeps the key insertion order in a List, thus its space complexity is higher than a regular SortedMap."))),(0,n.kt)("admonition",c({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",c({parentName:"pre"},{className:"language-ts"}),"const m1 = OrderedSortedMap.empty<number, string>()\nconst m2 = OrderedSortedMap.of([1, 'a'], [2, 'b'])\n"))),(0,n.kt)("h2",c({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"stream"}),(0,n.kt)("inlineCode",{parentName:"h3"},"stream")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"stream(): Stream.NonEmpty<readonly [K, V]>;")))))}M.isMDXComponent=!0}}]);