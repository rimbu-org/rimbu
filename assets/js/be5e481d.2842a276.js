"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[8094],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>k});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):d(d({},t),e)),r},m=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),u=p(r),s=a,k=u["".concat(l,".").concat(s)]||u[s]||c[s]||i;return r?n.createElement(k,d(d({ref:t},m),{},{components:r})):n.createElement(k,d({ref:t},m))}));function k(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,d=new Array(i);d[0]=s;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[u]="string"==typeof e?e:a,d[1]=o;for(var p=2;p<i;p++)d[p]=r[p];return n.createElement.apply(null,d)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},48341:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>h,contentTitle:()=>f,default:()=>S,frontMatter:()=>k,metadata:()=>b,toc:()=>N});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,d=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&m(e,r,t[r]);if(o)for(var r of o(t))p.call(t,r)&&m(e,r,t[r]);return e},c=(e,t)=>i(e,d(t)),s=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&p.call(e,n)&&(r[n]=e[n]);return r};const k={title:"OrderedSet (namespace)",slug:"/rimbu/ordered/OrderedSet/namespace"},f="namespace OrderedSet",b={unversionedId:"rimbu_ordered/OrderedSet/index",id:"rimbu_ordered/OrderedSet/index",title:"OrderedSet (namespace)",description:"A type-invariant immutable Ordered Set of value type T. In the Set, there are no duplicate values. See the Set documentation and the OrderedSet API documentation",source:"@site/api/rimbu_ordered/OrderedSet/index.mdx",sourceDirName:"rimbu_ordered/OrderedSet",slug:"/rimbu/ordered/OrderedSet/namespace",permalink:"/api/rimbu/ordered/OrderedSet/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSet (namespace)",slug:"/rimbu/ordered/OrderedSet/namespace"},sidebar:"defaultSidebar",previous:{title:"OrderedMap<K,V>",permalink:"/api/rimbu/ordered/OrderedMap/interface"},next:{title:"OrderedSet.Builder<T>",permalink:"/api/rimbu/ordered/OrderedSet/Builder/interface"}},h={},N=[{value:"Interfaces",id:"interfaces",level:2},{value:"Static Methods",id:"static-methods",level:2},{value:"<code>createContext</code>",id:"createcontext",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4}],O={toc:N},y="wrapper";function S(e){var t=e,{components:r}=t,a=s(t,["components"]);return(0,n.kt)(y,c(u(u({},O),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",u({},{id:"namespace-orderedset"}),(0,n.kt)("inlineCode",{parentName:"h1"},"namespace OrderedSet")),(0,n.kt)("p",null,"A type-invariant immutable Ordered Set of value type T. In the Set, there are no duplicate values. See the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSet/interface"}),"OrderedSet API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/OrderedSet/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSet<T>"))),(0,n.kt)("h2",u({},{id:"interfaces"}),"Interfaces"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/OrderedSet/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSet.Builder<T>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"A mutable ",(0,n.kt)("inlineCode",{parentName:"td"},"OrderedSet")," builder used to efficiently create new immutable instances. See the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSet/Builder/interface"}),"OrderedSet.Builder API documentation"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/OrderedSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSet.Context<UT>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/OrderedSet/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSet.NonEmpty<T>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable Ordered SortedSet of value type T. In the Set, there are no duplicate values. See the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSet/interface"}),"OrderedSet API documentation"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/ordered/OrderedSet/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSet.Types"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))),(0,n.kt)("h2",u({},{id:"static-methods"}),"Static Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"createcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"createContext")),(0,n.kt)("p",null,"Returns a new OrderedSet context instance based on the given ",(0,n.kt)("inlineCode",{parentName:"p"},"options"),".")),(0,n.kt)("h4",u({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"createContext<UT>(options: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"listContext?: List.Context;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"setContext: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/RSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RSet.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<UT>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): OrderedSet.Context<UT>;"))),(0,n.kt)("h4",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"UT"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the upper element type for which the context can create instances")))),(0,n.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"options")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"{"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"listContext?: List.Context;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"setContext: "),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/collection-types/RSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RSet.Context")),(0,n.kt)("inlineCode",{parentName:"td"},"<UT>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"}")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"an object containing the following properties:",(0,n.kt)("br",null)," - listContext - the list context to use for element ordering",(0,n.kt)("br",null)," - setContext - the set context to use for element sets"))))))}S.isMDXComponent=!0}}]);