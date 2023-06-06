"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[46242],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>c});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=a.createContext({}),m=function(e){var t=a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=m(e.components);return a.createElement(u.Provider,{value:t},e.children)},o="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,u=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),o=m(n),s=r,c=o["".concat(u,".").concat(s)]||o[s]||k[s]||l;return n?a.createElement(c,i(i({ref:t},d),{},{components:n})):a.createElement(c,i({ref:t},d))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,i=new Array(l);i[0]=s;var p={};for(var u in t)hasOwnProperty.call(t,u)&&(p[u]=t[u]);p.originalType=e,p[o]="string"==typeof e?e:r,i[1]=p;for(var m=2;m<l;m++)i[m]=n[m];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}s.displayName="MDXCreateElement"},78215:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>N,default:()=>y,frontMatter:()=>c,metadata:()=>h,toc:()=>g});var a=n(3905),r=Object.defineProperty,l=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,d=(e,t,n)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,o=(e,t)=>{for(var n in t||(t={}))u.call(t,n)&&d(e,n,t[n]);if(p)for(var n of p(t))m.call(t,n)&&d(e,n,t[n]);return e},k=(e,t)=>l(e,i(t)),s=(e,t)=>{var n={};for(var a in e)u.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&p)for(var a of p(e))t.indexOf(a)<0&&m.call(e,a)&&(n[a]=e[a]);return n};const c={title:"Reducer.Impl<I,O,S>",slug:"/rimbu/common/Reducer/Impl/interface"},N="interface Reducer.Impl<I,O,S>",h={unversionedId:"rimbu_common/Reducer/Impl.interface",id:"rimbu_common/Reducer/Impl.interface",title:"Reducer.Impl<I,O,S>",description:"The Implementation interface for a Reducer, which also exposes the internal state type.",source:"@site/api/rimbu_common/Reducer/Impl.interface.mdx",sourceDirName:"rimbu_common/Reducer",slug:"/rimbu/common/Reducer/Impl/interface",permalink:"/api/rimbu/common/Reducer/Impl/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"Reducer.Impl<I,O,S>",slug:"/rimbu/common/Reducer/Impl/interface"},sidebar:"defaultSidebar",previous:{title:"Base<I,O,S>",permalink:"/api/rimbu/common/Reducer/Base/class"},next:{title:"and",permalink:"/api/rimbu/common/Reducer/and/var"}},b={},g=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>init</code>",id:"init",level:3},{value:"Definition",id:"definition",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>collectInput</code>",id:"collectinput",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>dropInput</code>",id:"dropinput",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"<code>filterInput</code>",id:"filterinput",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"<code>mapInput</code>",id:"mapinput",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"<code>mapOutput</code>",id:"mapoutput",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"<code>sliceInput</code>",id:"sliceinput",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"<code>stateToResult</code>",id:"statetoresult",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Parameters",id:"parameters-7",level:4},{value:"<code>takeInput</code>",id:"takeinput",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Parameters",id:"parameters-8",level:4}],v={toc:g},f="wrapper";function y(e){var t=e,{components:n}=t,r=s(t,["components"]);return(0,a.kt)(f,k(o(o({},v),r),{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",o({},{id:"interface-reducerimplios"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface Reducer.Impl<I,O,S>")),(0,a.kt)("p",null,"The Implementation interface for a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer"),", which also exposes the internal state type."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/Base/class"}),(0,a.kt)("inlineCode",{parentName:"a"},"Base<I,O,S>"))),(0,a.kt)("h2",o({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),"I"),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the input value type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),"O"),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the output value type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),"S"),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the internal state type")))),(0,a.kt)("h2",o({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"init"}),(0,a.kt)("inlineCode",{parentName:"h3"},"init")),(0,a.kt)("p",null,"The initial state value for the reducer algorithm.")),(0,a.kt)("h4",o({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly init: "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"p"},"<S>;")))),(0,a.kt)("h2",o({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"collectinput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"collectInput")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," instance that converts or filters its input values using given ",(0,a.kt)("inlineCode",{parentName:"p"},"collectFun")," before passing them to the reducer.")),(0,a.kt)("h4",o({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"collectInput<I2>(collectFun: CollectFun<I2, I>): "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,a.kt)("inlineCode",{parentName:"p"},"<I2, O>;"))),(0,a.kt)("h4",o({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),"I2"),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the resulting reducer input type")))),(0,a.kt)("h4",o({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"collectFun")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"CollectFun<I2, I>")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"a function receiving",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"value"),": the next value",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"index"),": the value index",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"skip"),": a token that, when returned, will not add a value to the resulting collection",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, when called, ensures no next elements are passed")))),(0,a.kt)("admonition",o({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",o({parentName:"pre"},{className:"language-ts"}),"Reducer.sum.collectInput((v, _, skip) => v <= 10 ? skip : v * 2)\n// this reducer will double all input values larger thant 10 before summing them,\n// and will skip all values smaller than 10\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"dropinput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"dropInput")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," instance that skips the first given ",(0,a.kt)("inlineCode",{parentName:"p"},"amount")," of input elements, and will process subsequent elements.")),(0,a.kt)("h4",o({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"dropInput(amount: number): "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,a.kt)("inlineCode",{parentName:"p"},"<I, O>;"))),(0,a.kt)("h4",o({},{id:"parameters-1"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"amount")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the amount of elements to skip")))),(0,a.kt)("admonition",o({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",o({parentName:"pre"},{className:"language-ts"}),"Stream.range({ end: 10 }).reduce(Reducer.sum.dropInput(9))\n// => 19\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"filterinput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"filterInput")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," instance that only passes values to the reducer that satisy the given ",(0,a.kt)("inlineCode",{parentName:"p"},"pred")," predicate.")),(0,a.kt)("h4",o({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"filterInput(pred: (value: I, index: number, halt: () => void) => boolean): "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,a.kt)("inlineCode",{parentName:"p"},"<I, O>;"))),(0,a.kt)("h4",o({},{id:"parameters-2"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"pred")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"(value: I, index: number, halt: () => void) => boolean")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"a function that returns true if the value should be passed to the reducer based on the following inputs:",(0,a.kt)("br",null)," - value: the current input value",(0,a.kt)("br",null)," - index: the current input index",(0,a.kt)("br",null)," - halt: function that, when called, ensures no more new values are passed to the reducer")))),(0,a.kt)("admonition",o({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",o({parentName:"pre"},{className:"language-ts"}),"Reducer.sum.filterInput(v => v > 10)\n// this reducer will only sum values larger than 10\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"mapinput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"mapInput")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," instance that converts its input values using given ",(0,a.kt)("inlineCode",{parentName:"p"},"mapFun")," before passing them to the reducer.")),(0,a.kt)("h4",o({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"mapInput<I2>(mapFun: (value: I2, index: number) => I): "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,a.kt)("inlineCode",{parentName:"p"},"<I2, O>;"))),(0,a.kt)("h4",o({},{id:"type-parameters-2"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),"I2"),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the resulting reducer input type")))),(0,a.kt)("h4",o({},{id:"parameters-3"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"mapFun")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"(value: I2, index: number) => I")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"a function that returns a new value to pass to the reducer based on the following inputs:",(0,a.kt)("br",null)," - value: the current input value",(0,a.kt)("br",null)," - index: the current input index")))),(0,a.kt)("admonition",o({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",o({parentName:"pre"},{className:"language-ts"}),"Reducer.sum.mapInput(v => v * 2)\n// this reducer will double all input values before summing them\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"mapoutput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"mapOutput")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," instance that converts its output values using given ",(0,a.kt)("inlineCode",{parentName:"p"},"mapFun"),".")),(0,a.kt)("h4",o({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"mapOutput<O2>(mapFun: (value: O) => O2): "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,a.kt)("inlineCode",{parentName:"p"},"<I, O2>;"))),(0,a.kt)("h4",o({},{id:"type-parameters-3"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),"O2"),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the resulting reducer output type")))),(0,a.kt)("h4",o({},{id:"parameters-4"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"mapFun")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"(value: O) => O2")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"a function that takes the current output value and converts it to a new output value")))),(0,a.kt)("admonition",o({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",o({parentName:"pre"},{className:"language-ts"}),"Reducer.sum.mapOutput(String)\n// this reducer will convert all its results to string before returning them\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"next"}),(0,a.kt)("inlineCode",{parentName:"h3"},"next")),(0,a.kt)("p",null,"Returns the next state based on the given input values")),(0,a.kt)("h4",o({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"next(state: S, elem: I, index: number, halt: () => void): S;"))),(0,a.kt)("h4",o({},{id:"parameters-5"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"state")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"S")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the current state")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"elem")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"I")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the current input value")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the current input index")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"halt")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"() => void")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"a function that, when called, ensures no more values are passed to the reducer"))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"sliceinput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"sliceInput")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," instance that takes given ",(0,a.kt)("inlineCode",{parentName:"p"},"amount")," of elements starting at given ",(0,a.kt)("inlineCode",{parentName:"p"},"from")," index, and ignores other elements.")),(0,a.kt)("h4",o({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"sliceInput(from?: number, amount?: number): "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,a.kt)("inlineCode",{parentName:"p"},"<I, O>;"))),(0,a.kt)("h4",o({},{id:"parameters-6"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"from")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"(default: 0) the index at which to start processing elements")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"amount")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"(optional) the amount of elements to process, if not given, processes all elements from the ",(0,a.kt)("inlineCode",{parentName:"td"},"from")," index")))),(0,a.kt)("admonition",o({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",o({parentName:"pre"},{className:"language-ts"}),"Stream.range({ end: 10 }).reduce(Reducer.sum.sliceInput(1, 2))\n// => 3\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"statetoresult"}),(0,a.kt)("inlineCode",{parentName:"h3"},"stateToResult")),(0,a.kt)("p",null,"Returns the output value based on the given ",(0,a.kt)("inlineCode",{parentName:"p"},"state"))),(0,a.kt)("h4",o({},{id:"definition-8"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"stateToResult(state: S): O;"))),(0,a.kt)("h4",o({},{id:"parameters-7"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"state")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"S")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the current state"))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",o({},{id:"takeinput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"takeInput")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," instance that takes at most the given ",(0,a.kt)("inlineCode",{parentName:"p"},"amount")," of input elements, and will ignore subsequent elements.")),(0,a.kt)("h4",o({},{id:"definition-9"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"takeInput(amount: number): "),(0,a.kt)("a",o({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,a.kt)("inlineCode",{parentName:"p"},"<I, O>;"))),(0,a.kt)("h4",o({},{id:"parameters-8"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",o({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"amount")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",o({parentName:"tr"},{align:null}),"the amount of elements to accept")))),(0,a.kt)("admonition",o({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",o({parentName:"pre"},{className:"language-ts"}),"Stream.range({ end: 10 }).reduce(Reducer.sum.takeInput(2))\n// => 1\n")))))}y.isMDXComponent=!0}}]);