"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[65532],{3905:function(e,t,a){a.d(t,{Zo:function(){return d},kt:function(){return c}});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),u=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=u(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),s=u(a),c=r,k=s["".concat(p,".").concat(c)]||s[c]||m[c]||i;return a?n.createElement(k,l(l({ref:t},d),{},{components:a})):n.createElement(k,l({ref:t},d))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=s;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var u=2;u<i;u++)l[u]=a[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}s.displayName="MDXCreateElement"},93010:function(e,t,a){a.r(t),a.d(t,{assets:function(){return f},contentTitle:function(){return c},default:function(){return b},frontMatter:function(){return s},metadata:function(){return k},toc:function(){return v}});var n=a(3905),r=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,d=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,m=(e,t)=>{for(var a in t||(t={}))p.call(t,a)&&d(e,a,t[a]);if(o)for(var a of o(t))u.call(t,a)&&d(e,a,t[a]);return e};const s={title:"FlatMapIterator<T,T2>",slug:"/rimbu/stream/custom/FlatMapIterator/class"},c="class FlatMapIterator<T,T2>",k={unversionedId:"rimbu_stream/custom/FlatMapIterator.class",id:"rimbu_stream/custom/FlatMapIterator.class",title:"FlatMapIterator<T,T2>",description:"undocumented",source:"@site/api/rimbu_stream/custom/FlatMapIterator.class.mdx",sourceDirName:"rimbu_stream/custom",slug:"/rimbu/stream/custom/FlatMapIterator/class",permalink:"/api/rimbu/stream/custom/FlatMapIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"FlatMapIterator<T,T2>",slug:"/rimbu/stream/custom/FlatMapIterator/class"},sidebar:"defaultSidebar",previous:{title:"FilterPureIterator<T,A>",permalink:"/api/rimbu/stream/custom/FilterPureIterator/class"},next:{title:"FromIterable<T>",permalink:"/api/rimbu/stream/custom/FromIterable/class"}},f={},v=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>currentIterator</code>",id:"currentiterator",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>done</code>",id:"done",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>flatMapFun</code>",id:"flatmapfun",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>iterator</code>",id:"iterator",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>source</code>",id:"source",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>state</code>",id:"state",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Overrides",id:"overrides-1",level:4}],N={toc:v};function b(e){var t,a=e,{components:r}=a,d=((e,t)=>{var a={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&u.call(e,n)&&(a[n]=e[n]);return a})(a,["components"]);return(0,n.kt)("wrapper",(t=m(m({},N),d),i(t,l({components:r,mdxType:"MDXLayout"}))),(0,n.kt)("h1",m({},{id:"class-flatmapiteratortt2"}),(0,n.kt)("inlineCode",{parentName:"h1"},"class FlatMapIterator<T,T2>")),(0,n.kt)("p",null,"undocumented"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"FastIteratorBase<T>"))),(0,n.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"T2"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")))),(0,n.kt)("h2",m({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"currentiterator"}),(0,n.kt)("inlineCode",{parentName:"h3"},"currentIterator")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"currentIterator: null "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,n.kt)("inlineCode",{parentName:"p"},"<T2>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"done"}),(0,n.kt)("inlineCode",{parentName:"h3"},"done")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"done: boolean;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"flatmapfun"}),(0,n.kt)("inlineCode",{parentName:"h3"},"flatMapFun")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly flatMapFun: (value: T, index: number, halt: () => void) => "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<T2>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"iterator"}),(0,n.kt)("inlineCode",{parentName:"h3"},"iterator")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"iterator: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"source"}),(0,n.kt)("inlineCode",{parentName:"h3"},"source")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly source: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/Stream/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"Stream")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"state"}),(0,n.kt)("inlineCode",{parentName:"h3"},"state")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly state: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/TraverseState/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"TraverseState")),(0,n.kt)("inlineCode",{parentName:"p"},";")))),(0,n.kt)("h2",m({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"fastnext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,n.kt)("inlineCode",{parentName:"p"},"<O>): T2 "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O;"))),(0,n.kt)("h4",m({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"O"),(0,n.kt)("td",m({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("a",m({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,n.kt)("inlineCode",{parentName:"td"},"<O>")),(0,n.kt)("td",m({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",m({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#fastNext"}),"FastIteratorBase.fastNext"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"next"}),(0,n.kt)("inlineCode",{parentName:"h3"},"next")),(0,n.kt)("p",null,"Returns the next ",(0,n.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,n.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"next(): IteratorResult<T>;"))),(0,n.kt)("h4",m({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface#next"}),"FastIterator.next"),", ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#next"}),"FastIteratorBase.next"))))}b.isMDXComponent=!0}}]);