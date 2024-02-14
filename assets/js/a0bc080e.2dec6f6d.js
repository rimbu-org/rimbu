"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[88339],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>k});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),p=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},u=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=p(r),d=a,k=c["".concat(s,".").concat(d)]||c[d]||m[d]||i;return r?n.createElement(k,l(l({ref:t},u),{},{components:r})):n.createElement(k,l({ref:t},u))}));function k(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=d;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[c]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<i;p++)l[p]=r[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},57916:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>v,contentTitle:()=>y,default:()=>O,frontMatter:()=>k,metadata:()=>f,toc:()=>b});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))s.call(t,r)&&u(e,r,t[r]);if(o)for(var r of o(t))p.call(t,r)&&u(e,r,t[r]);return e},m=(e,t)=>i(e,l(t)),d=(e,t)=>{var r={};for(var n in e)s.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&p.call(e,n)&&(r[n]=e[n]);return r};const k={title:"AsyncDropIterator<T>",slug:"/rimbu/stream/async-custom/AsyncDropIterator/class"},y="class AsyncDropIterator<T>",f={unversionedId:"rimbu_stream/async-custom/AsyncDropIterator.class",id:"rimbu_stream/async-custom/AsyncDropIterator.class",title:"AsyncDropIterator<T>",description:"undocumented",source:"@site/api/rimbu_stream/async-custom/AsyncDropIterator.class.mdx",sourceDirName:"rimbu_stream/async-custom",slug:"/rimbu/stream/async-custom/AsyncDropIterator/class",permalink:"/api/rimbu/stream/async-custom/AsyncDropIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"AsyncDropIterator<T>",slug:"/rimbu/stream/async-custom/AsyncDropIterator/class"},sidebar:"defaultSidebar",previous:{title:"AsyncConcatIterator<T>",permalink:"/api/rimbu/stream/async-custom/AsyncConcatIterator/class"},next:{title:"AsyncDropWhileIterator<T>",permalink:"/api/rimbu/stream/async-custom/AsyncDropWhileIterator/class"}},v={},b=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>amount</code>",id:"amount",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>remain</code>",id:"remain",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>return</code>",id:"return",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>source</code>",id:"source",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-2",level:4}],h={toc:b},N="wrapper";function O(e){var t=e,{components:r}=t,a=d(t,["components"]);return(0,n.kt)(N,m(c(c({},h),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",c({},{id:"class-asyncdropiteratort"}),(0,n.kt)("inlineCode",{parentName:"h1"},"class AsyncDropIterator<T>")),(0,n.kt)("p",null,"undocumented"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncFastIteratorBase<T>"))),(0,n.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",c({parentName:"tr"},{align:null}),"undocumented")))),(0,n.kt)("h2",c({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"amount"}),(0,n.kt)("inlineCode",{parentName:"h3"},"amount")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly amount: number;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"remain"}),(0,n.kt)("inlineCode",{parentName:"h3"},"remain")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"remain: number;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"return"}),(0,n.kt)("inlineCode",{parentName:"h3"},"return")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"return?: () => Promise<any>;"))),(0,n.kt)("h4",c({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#return"}),"AsyncFastIteratorBase.return"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"source"}),(0,n.kt)("inlineCode",{parentName:"h3"},"source")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly source: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncFastIterator/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncFastIterator")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;")))),(0,n.kt)("h2",c({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"fastnext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O>;"))),(0,n.kt)("h4",c({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"O"),(0,n.kt)("td",c({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",c({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,n.kt)("td",c({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"AsyncOptLazy<O>")),(0,n.kt)("td",c({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",c({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#fastNext"}),"AsyncFastIteratorBase.fastNext"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"next"}),(0,n.kt)("inlineCode",{parentName:"h3"},"next")),(0,n.kt)("p",null,"Returns a promise resolving to the next ",(0,n.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,n.kt)("h4",c({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"next(): Promise<IteratorResult<T>>;"))),(0,n.kt)("h4",c({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncFastIterator/interface#next"}),"AsyncFastIterator.next"),", ",(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#next"}),"AsyncFastIteratorBase.next"))))}O.isMDXComponent=!0}}]);