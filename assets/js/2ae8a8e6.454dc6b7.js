"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[88493],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>k});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?d(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},d=Object.keys(e);for(a=0;a<d.length;a++)r=d[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(e);for(a=0;a<d.length;a++)r=d[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var p=a.createContext({}),l=function(e){var t=a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},m=function(e){var t=l(e.components);return a.createElement(p.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,d=e.originalType,p=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),c=l(r),s=n,k=c["".concat(p,".").concat(s)]||c[s]||u[s]||d;return r?a.createElement(k,o(o({ref:t},m),{},{components:r})):a.createElement(k,o({ref:t},m))}));function k(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var d=r.length,o=new Array(d);o[0]=s;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[c]="string"==typeof e?e:n,o[1]=i;for(var l=2;l<d;l++)o[l]=r[l];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}s.displayName="MDXCreateElement"},50624:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>h,contentTitle:()=>f,default:()=>g,frontMatter:()=>k,metadata:()=>b,toc:()=>y});var a=r(3905),n=Object.defineProperty,d=Object.defineProperties,o=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&m(e,r,t[r]);if(i)for(var r of i(t))l.call(t,r)&&m(e,r,t[r]);return e},u=(e,t)=>d(e,o(t)),s=(e,t)=>{var r={};for(var a in e)p.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&i)for(var a of i(e))t.indexOf(a)<0&&l.call(e,a)&&(r[a]=e[a]);return r};const k={title:"OrderedSortedMap (namespace)",slug:"/rimbu/ordered/map/OrderedSortedMap/namespace"},f="namespace OrderedSortedMap",b={unversionedId:"rimbu_ordered/map/OrderedSortedMap/index",id:"rimbu_ordered/map/OrderedSortedMap/index",title:"OrderedSortedMap (namespace)",description:"A type-invariant immutable Ordered SortedMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the Map documentation and the OrderedSortedMap API documentation",source:"@site/api/rimbu_ordered/map/OrderedSortedMap/index.mdx",sourceDirName:"rimbu_ordered/map/OrderedSortedMap",slug:"/rimbu/ordered/map/OrderedSortedMap/namespace",permalink:"/api/rimbu/ordered/map/OrderedSortedMap/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSortedMap (namespace)",slug:"/rimbu/ordered/map/OrderedSortedMap/namespace"},sidebar:"defaultSidebar",previous:{title:"OrderedMap<K,V>",permalink:"/api/rimbu/ordered/map/OrderedMap/interface"},next:{title:"OrderedSortedMap.Builder<K,V>",permalink:"/api/rimbu/ordered/map/OrderedSortedMap/Builder/interface"}},h={},y=[{value:"Interfaces",id:"interfaces",level:2},{value:"Static Methods",id:"static-methods",level:2},{value:"<code>createContext</code>",id:"createcontext",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>defaultContext</code>",id:"defaultcontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Type parameters",id:"type-parameters-1",level:4}],N={toc:y},O="wrapper";function g(e){var t=e,{components:r}=t,n=s(t,["components"]);return(0,a.kt)(O,u(c(c({},N),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"namespace-orderedsortedmap"}),(0,a.kt)("inlineCode",{parentName:"h1"},"namespace OrderedSortedMap")),(0,a.kt)("p",null,"A type-invariant immutable Ordered SortedMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/interface"}),"OrderedSortedMap API documentation"),"  "),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,a.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedSortedMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedMap<K,V>"))),(0,a.kt)("h2",c({},{id:"interfaces"}),"Interfaces"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),(0,a.kt)("a",c({parentName:"td"},{href:"/api/rimbu/ordered/map/OrderedSortedMap/Builder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedMap.Builder<K,V>"))),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"A mutable ",(0,a.kt)("inlineCode",{parentName:"td"},"OrderedSortedMap")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/Builder/interface"}),"OrderedSortedMap.Builder API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),(0,a.kt)("a",c({parentName:"td"},{href:"/api/rimbu/ordered/map/OrderedSortedMap/Context/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedMap.Context<UK>"))),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"A context instance for an ",(0,a.kt)("inlineCode",{parentName:"td"},"OrderedSortedMap")," that acts as a factory for every instance of this type of collection.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),(0,a.kt)("a",c({parentName:"td"},{href:"/api/rimbu/ordered/map/OrderedSortedMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedMap.NonEmpty<K,V>"))),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable Ordered SortedMap of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,a.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",c({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/interface"}),"OrderedSortedMap API documentation"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),(0,a.kt)("a",c({parentName:"td"},{href:"/api/rimbu/ordered/map/OrderedSortedMap/Types/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"OrderedSortedMap.Types"))),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))),(0,a.kt)("h2",c({},{id:"static-methods"}),"Static Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",c({},{id:"createcontext"}),(0,a.kt)("inlineCode",{parentName:"h3"},"createContext")),(0,a.kt)("p",null,"Returns a new OrderedSortedMap context instance based on the given ",(0,a.kt)("inlineCode",{parentName:"p"},"options"),".")),(0,a.kt)("h4",c({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"createContext<UK>(options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"listContext?: List.Context;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"mapContext?: SortedMap.Context<UK>;"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): OrderedSortedMap.Context<UK>;"))),(0,a.kt)("h4",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"UK"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the upper key type for which the context can create instances")))),(0,a.kt)("h4",c({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",c({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"listContext?: List.Context;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"mapContext?: SortedMap.Context<UK>;"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"(optional) an object containing the following properties:",(0,a.kt)("br",null)," - listContext - (optional) the list context to use for key ordering",(0,a.kt)("br",null)," - mapContext - (optional) the map context to use for key value mapping"))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",c({},{id:"defaultcontext"}),(0,a.kt)("inlineCode",{parentName:"h3"},"defaultContext")),(0,a.kt)("p",null,"Returns the default context for OrderedSortedMaps.")),(0,a.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"defaultContext<UK>(): OrderedSortedMap.Context<UK>;"))),(0,a.kt)("h4",c({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"UK"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the upper key type for which the context can create instances"))))))}g.isMDXComponent=!0}}]);