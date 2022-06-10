"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[51192],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),c=u(n),m=a,k=c["".concat(s,".").concat(m)]||c[m]||d[m]||i;return n?r.createElement(k,l(l({ref:t},p),{},{components:n})):r.createElement(k,l({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=c;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:a,l[1]=o;for(var u=2;u<i;u++)l[u]=n[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},607:function(e,t,n){n.r(t),n.d(t,{assets:function(){return y},contentTitle:function(){return m},default:function(){return b},frontMatter:function(){return c},metadata:function(){return k},toc:function(){return f}});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,d=(e,t)=>{for(var n in t||(t={}))s.call(t,n)&&p(e,n,t[n]);if(o)for(var n of o(t))u.call(t,n)&&p(e,n,t[n]);return e};const c={title:"AsyncRepeatIterator<T>",slug:"/rimbu/stream/async-custom/AsyncRepeatIterator/class"},m="class AsyncRepeatIterator<T>",k={unversionedId:"rimbu_stream/async-custom/AsyncRepeatIterator.class",id:"rimbu_stream/async-custom/AsyncRepeatIterator.class",title:"AsyncRepeatIterator<T>",description:"undocumented",source:"@site/api/rimbu_stream/async-custom/AsyncRepeatIterator.class.mdx",sourceDirName:"rimbu_stream/async-custom",slug:"/rimbu/stream/async-custom/AsyncRepeatIterator/class",permalink:"/api/rimbu/stream/async-custom/AsyncRepeatIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"AsyncRepeatIterator<T>",slug:"/rimbu/stream/async-custom/AsyncRepeatIterator/class"},sidebar:"defaultSidebar",previous:{title:"AsyncReduceIterator<I,R>",permalink:"/api/rimbu/stream/async-custom/AsyncReduceIterator/class"},next:{title:"AsyncSplitOnIterator<T>",permalink:"/api/rimbu/stream/async-custom/AsyncSplitOnIterator/class"}},y={},f=[{value:"Type parameters",id:"type-parameters",level:3},{value:"Properties",id:"properties",level:2},{value:"<code>amount</code>",id:"amount",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>isEmpty</code>",id:"isempty",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>iterator</code>",id:"iterator",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>remain</code>",id:"remain",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>return</code>",id:"return",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>source</code>",id:"source",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-1",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Overrides",id:"overrides-2",level:4}],v={toc:f};function b(e){var t,n=e,{components:a}=n,p=((e,t)=>{var n={};for(var r in e)s.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&o)for(var r of o(e))t.indexOf(r)<0&&u.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=d(d({},v),p),i(t,l({components:a,mdxType:"MDXLayout"}))),(0,r.kt)("h1",d({},{id:"class-asyncrepeatiteratort"}),(0,r.kt)("inlineCode",{parentName:"h1"},"class AsyncRepeatIterator<T>")),(0,r.kt)("p",null,"undocumented"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Extends:")," ",(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncFastIteratorBase<T>"))),(0,r.kt)("h3",d({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),"T"),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")))),(0,r.kt)("h2",d({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"amount"}),(0,r.kt)("inlineCode",{parentName:"h3"},"amount")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly amount?: number "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," undefined;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"isempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"isEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"isEmpty: boolean;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"iterator"}),(0,r.kt)("inlineCode",{parentName:"h3"},"iterator")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"iterator: "),(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncFastIterator/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncFastIterator")),(0,r.kt)("inlineCode",{parentName:"p"},"<T>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"remain"}),(0,r.kt)("inlineCode",{parentName:"h3"},"remain")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"remain?: number;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"return"}),(0,r.kt)("inlineCode",{parentName:"h3"},"return")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"return?: () => Promise<any>;"))),(0,r.kt)("h4",d({},{id:"overrides"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#return"}),"AsyncFastIteratorBase.return"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"source"}),(0,r.kt)("inlineCode",{parentName:"h3"},"source")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly source: "),(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncStream/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncStream")),(0,r.kt)("inlineCode",{parentName:"p"},"<T>;")))),(0,r.kt)("h2",d({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"fastnext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition-6"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: "),(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): Promise<T "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O>;"))),(0,r.kt)("h3",d({},{id:"type-parameters-1"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),"O"),(0,r.kt)("td",d({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",d({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,r.kt)("inlineCode",{parentName:"td"},"<O>")),(0,r.kt)("td",d({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",d({},{id:"overrides-1"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#fastNext"}),"AsyncFastIteratorBase.fastNext"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",d({},{id:"next"}),(0,r.kt)("inlineCode",{parentName:"h3"},"next")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",d({},{id:"definition-7"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"next(): Promise<IteratorResult<T>>;"))),(0,r.kt)("h4",d({},{id:"overrides-2"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncFastIterator/interface#next"}),"AsyncFastIterator.next"),", ",(0,r.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#next"}),"AsyncFastIteratorBase.next"))))}b.isMDXComponent=!0}}]);