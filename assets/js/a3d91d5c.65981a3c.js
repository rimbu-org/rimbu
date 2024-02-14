"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[49538],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>y});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=c(r),d=a,y=u["".concat(l,".").concat(d)]||u[d]||m[d]||i;return r?n.createElement(y,o(o({ref:t},p),{},{components:r})):n.createElement(y,o({ref:t},p))}));function y(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:a,o[1]=s;for(var c=2;c<i;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},67209:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>k,contentTitle:()=>f,default:()=>N,frontMatter:()=>y,metadata:()=>b,toc:()=>h});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,s=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,p=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&p(e,r,t[r]);if(s)for(var r of s(t))c.call(t,r)&&p(e,r,t[r]);return e},m=(e,t)=>i(e,o(t)),d=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&s)for(var n of s(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const y={title:"AsyncFastIterator<T>",slug:"/rimbu/stream/async/AsyncFastIterator/interface"},f="interface AsyncFastIterator<T>",b={unversionedId:"rimbu_stream/async/AsyncFastIterator.interface",id:"rimbu_stream/async/AsyncFastIterator.interface",title:"AsyncFastIterator<T>",description:"An asynchronous iterator that extends the default AsyncIterator interface with methods for improved performance.",source:"@site/api/rimbu_stream/async/AsyncFastIterator.interface.mdx",sourceDirName:"rimbu_stream/async",slug:"/rimbu/stream/async/AsyncFastIterator/interface",permalink:"/api/rimbu/stream/async/AsyncFastIterator/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"AsyncFastIterator<T>",slug:"/rimbu/stream/async/AsyncFastIterator/interface"},sidebar:"defaultSidebar",previous:{title:"AsyncFastIterable<T>",permalink:"/api/rimbu/stream/async/AsyncFastIterable/interface"},next:{title:"AsyncReducer (namespace)",permalink:"/api/rimbu/stream/async/AsyncReducer/namespace"}},k={},h=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definitions",id:"definitions",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition",level:4}],v={toc:h},O="wrapper";function N(e){var t=e,{components:r}=t,a=d(t,["components"]);return(0,n.kt)(O,m(u(u({},v),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",u({},{id:"interface-asyncfastiteratort"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface AsyncFastIterator<T>")),(0,n.kt)("p",null,"An asynchronous iterator that extends the default ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncIterator")," interface with methods for improved performance."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncFastIteratorBase<T>")),", ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async-custom/FromAsyncIterator/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"FromAsyncIterator<T>"))),(0,n.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the element type")))),(0,n.kt)("h2",u({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"fastnext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,n.kt)("p",null,"Returns the next iterator value asynchronously, or the given ",(0,n.kt)("inlineCode",{parentName:"p"},"otherwise")," ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncOptLazy")," value instead.")),(0,n.kt)("h4",u({},{id:"definitions"}),"Definitions"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fastNext(): MaybePromise<T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined>;"))),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise: AsyncOptLazy<O>): MaybePromise<T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"next"}),(0,n.kt)("inlineCode",{parentName:"h3"},"next")),(0,n.kt)("p",null,"Returns a promise resolving to the next ",(0,n.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,n.kt)("h4",u({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"next(): Promise<IteratorResult<T>>;")))))}N.isMDXComponent=!0}}]);