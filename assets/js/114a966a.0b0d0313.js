"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[67304],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return c}});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var u=r.createContext({}),d=function(e){var t=r.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(u.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,u=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),s=d(n),c=a,k=s["".concat(u,".").concat(c)]||s[c]||m[c]||i;return n?r.createElement(k,l(l({ref:t},p),{},{components:n})):r.createElement(k,l({ref:t},p))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=s;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o.mdxType="string"==typeof e?e:a,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},62651:function(e,t,n){n.r(t),n.d(t,{assets:function(){return f},contentTitle:function(){return c},default:function(){return N},frontMatter:function(){return s},metadata:function(){return k},toc:function(){return v}});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))u.call(t,n)&&p(e,n,t[n]);if(o)for(var n of o(t))d.call(t,n)&&p(e,n,t[n]);return e};const s={title:"ReduceIterator<I,R>",slug:"/rimbu/stream/custom/ReduceIterator/class"},c="class ReduceIterator<I,R>",k={unversionedId:"rimbu_stream/custom/ReduceIterator.class",id:"rimbu_stream/custom/ReduceIterator.class",title:"ReduceIterator<I,R>",description:"undocumented",source:"@site/api/rimbu_stream/custom/ReduceIterator.class.mdx",sourceDirName:"rimbu_stream/custom",slug:"/rimbu/stream/custom/ReduceIterator/class",permalink:"/api/rimbu/stream/custom/ReduceIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"ReduceIterator<I,R>",slug:"/rimbu/stream/custom/ReduceIterator/class"},sidebar:"defaultSidebar",previous:{title:"ReduceAllIterator<I,R>",permalink:"/api/rimbu/stream/custom/ReduceAllIterator/class"},next:{title:"RepeatIterator<T>",permalink:"/api/rimbu/stream/custom/RepeatIterator/class"}},f={},v=[{value:"Type parameters",id:"type-parameters",level:3},{value:"Properties",id:"properties",level:2},{value:"<code>halt</code>",id:"halt",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>halted</code>",id:"halted",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>index</code>",id:"index",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>source</code>",id:"source",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>state</code>",id:"state",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-1",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Overrides",id:"overrides-1",level:4}],h={toc:v};function N(e){var t,n=e,{components:a}=n,p=((e,t)=>{var n={};for(var r in e)u.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&o)for(var r of o(e))t.indexOf(r)<0&&d.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=m(m({},h),p),i(t,l({components:a,mdxType:"MDXLayout"}))),(0,r.kt)("h1",m({},{id:"class-reduceiteratorir"}),(0,r.kt)("inlineCode",{parentName:"h1"},"class ReduceIterator<I,R>")),(0,r.kt)("p",null,"undocumented"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Extends:")," ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"FastIteratorBase<T>"))),(0,r.kt)("h3",m({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"I"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"R"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")))),(0,r.kt)("h2",m({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"halt"}),(0,r.kt)("inlineCode",{parentName:"h3"},"halt")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"halt: () => void;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"halted"}),(0,r.kt)("inlineCode",{parentName:"h3"},"halted")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"halted: boolean;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"index"}),(0,r.kt)("inlineCode",{parentName:"h3"},"index")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"index: number;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"reducer"}),(0,r.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly reducer: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,r.kt)("inlineCode",{parentName:"p"},"<I, R>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"source"}),(0,r.kt)("inlineCode",{parentName:"h3"},"source")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly source: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,r.kt)("inlineCode",{parentName:"p"},"<I>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"state"}),(0,r.kt)("inlineCode",{parentName:"h3"},"state")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"state: unknown;")))),(0,r.kt)("h2",m({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"fastnext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): R "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O;"))),(0,r.kt)("h3",m({},{id:"type-parameters-1"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"O"),(0,r.kt)("td",m({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"td"},"<O>")),(0,r.kt)("td",m({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",m({},{id:"overrides"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#fastNext"}),"FastIteratorBase.fastNext"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"next"}),(0,r.kt)("inlineCode",{parentName:"h3"},"next")),(0,r.kt)("p",null,"Returns the next ",(0,r.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,r.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"next(): IteratorResult<T>;"))),(0,r.kt)("h4",m({},{id:"overrides-1"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface#next"}),"FastIterator.next"),", ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#next"}),"FastIteratorBase.next"))))}N.isMDXComponent=!0}}]);