"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[6534],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>k});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),u=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},d=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),p=u(r),m=a,k=p["".concat(s,".").concat(m)]||p[m]||c[m]||l;return r?n.createElement(k,i(i({ref:t},d),{},{components:r})):n.createElement(k,i({ref:t},d))}));function k(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=r.length,i=new Array(l);i[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[p]="string"==typeof e?e:a,i[1]=o;for(var u=2;u<l;u++)i[u]=r[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},46837:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>v,contentTitle:()=>y,default:()=>g,frontMatter:()=>k,metadata:()=>f,toc:()=>b});var n=r(3905),a=Object.defineProperty,l=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,d=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,p=(e,t)=>{for(var r in t||(t={}))s.call(t,r)&&d(e,r,t[r]);if(o)for(var r of o(t))u.call(t,r)&&d(e,r,t[r]);return e},c=(e,t)=>l(e,i(t)),m=(e,t)=>{var r={};for(var n in e)s.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const k={title:"AsyncFilterPureIterator<T,A>",slug:"/rimbu/stream/async-custom/AsyncFilterPureIterator/class"},y="class AsyncFilterPureIterator<T,A>",f={unversionedId:"rimbu_stream/async-custom/AsyncFilterPureIterator.class",id:"rimbu_stream/async-custom/AsyncFilterPureIterator.class",title:"AsyncFilterPureIterator<T,A>",description:"undocumented",source:"@site/api/rimbu_stream/async-custom/AsyncFilterPureIterator.class.mdx",sourceDirName:"rimbu_stream/async-custom",slug:"/rimbu/stream/async-custom/AsyncFilterPureIterator/class",permalink:"/api/rimbu/stream/async-custom/AsyncFilterPureIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"AsyncFilterPureIterator<T,A>",slug:"/rimbu/stream/async-custom/AsyncFilterPureIterator/class"},sidebar:"defaultSidebar",previous:{title:"AsyncFilterIterator<T>",permalink:"/api/rimbu/stream/async-custom/AsyncFilterIterator/class"},next:{title:"AsyncFlatMapIterator<T,T2>",permalink:"/api/rimbu/stream/async-custom/AsyncFlatMapIterator/class"}},v={},b=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>args</code>",id:"args",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>invert</code>",id:"invert",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>pred</code>",id:"pred",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>return</code>",id:"return",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>source</code>",id:"source",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Overrides",id:"overrides-2",level:4}],N={toc:b},h="wrapper";function g(e){var t=e,{components:r}=t,a=m(t,["components"]);return(0,n.kt)(h,c(p(p({},N),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",p({},{id:"class-asyncfilterpureiteratorta"}),(0,n.kt)("inlineCode",{parentName:"h1"},"class AsyncFilterPureIterator<T,A>")),(0,n.kt)("p",null,"undocumented"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",p({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncFastIteratorBase<T>"))),(0,n.kt)("h2",p({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",p({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",p({parentName:"tr"},{align:null})),(0,n.kt)("td",p({parentName:"tr"},{align:null}),"undocumented")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",p({parentName:"tr"},{align:null}),"A"),(0,n.kt)("td",p({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"readonly unknown[]")),(0,n.kt)("td",p({parentName:"tr"},{align:null}),"undocumented")))),(0,n.kt)("h2",p({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",p({},{id:"args"}),(0,n.kt)("inlineCode",{parentName:"h3"},"args")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",p({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly args: A;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",p({},{id:"invert"}),(0,n.kt)("inlineCode",{parentName:"h3"},"invert")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",p({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly invert: boolean;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",p({},{id:"pred"}),(0,n.kt)("inlineCode",{parentName:"h3"},"pred")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",p({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly pred: (value: T, ...args: A) => "),(0,n.kt)("a",p({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,n.kt)("inlineCode",{parentName:"p"},"<boolean>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",p({},{id:"return"}),(0,n.kt)("inlineCode",{parentName:"h3"},"return")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",p({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"return?: undefined "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," (() => Promise<any>);"))),(0,n.kt)("h4",p({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",p({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#return"}),"AsyncFastIteratorBase.return"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",p({},{id:"source"}),(0,n.kt)("inlineCode",{parentName:"h3"},"source")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",p({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly source: AsyncFastIterator<T>;")))),(0,n.kt)("h2",p({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",p({},{id:"fastnext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",p({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O>;"))),(0,n.kt)("h4",p({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",p({parentName:"tr"},{align:null}),"O"),(0,n.kt)("td",p({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",p({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",p({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,n.kt)("td",p({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"AsyncOptLazy<O>")),(0,n.kt)("td",p({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",p({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",p({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#fastNext"}),"AsyncFastIteratorBase.fastNext"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",p({},{id:"next"}),(0,n.kt)("inlineCode",{parentName:"h3"},"next")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",p({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"next(): Promise<IteratorResult<T>>;"))),(0,n.kt)("h4",p({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",p({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#next"}),"AsyncFastIteratorBase.next"))))}g.isMDXComponent=!0}}]);