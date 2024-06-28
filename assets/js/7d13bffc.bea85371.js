"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[19499],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=a.createContext({}),u=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return a.createElement(o.Provider,{value:t},e.children)},s="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),s=u(n),m=r,k=s["".concat(o,".").concat(m)]||s[m]||c[m]||i;return n?a.createElement(k,l(l({ref:t},p),{},{components:n})):a.createElement(k,l({ref:t},p))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=m;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[s]="string"==typeof e?e:r,l[1]=d;for(var u=2;u<i;u++)l[u]=n[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},43562:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>h,contentTitle:()=>v,default:()=>O,frontMatter:()=>k,metadata:()=>f,toc:()=>y});var a=n(3905),r=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,d=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,s=(e,t)=>{for(var n in t||(t={}))o.call(t,n)&&p(e,n,t[n]);if(d)for(var n of d(t))u.call(t,n)&&p(e,n,t[n]);return e},c=(e,t)=>i(e,l(t)),m=(e,t)=>{var n={};for(var a in e)o.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&d)for(var a of d(e))t.indexOf(a)<0&&u.call(e,a)&&(n[a]=e[a]);return n};const k={title:"InstanceImpl<I,O,S>",slug:"/rimbu/stream/AsyncReducer/InstanceImpl/class"},v="class InstanceImpl<I,O,S>",f={unversionedId:"rimbu_stream/AsyncReducer/InstanceImpl.class",id:"rimbu_stream/AsyncReducer/InstanceImpl.class",title:"InstanceImpl<I,O,S>",description:"The default AsyncReducer.Impl implementation.",source:"@site/api/rimbu_stream/AsyncReducer/InstanceImpl.class.mdx",sourceDirName:"rimbu_stream/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/InstanceImpl/class",permalink:"/api/rimbu/stream/AsyncReducer/InstanceImpl/class",draft:!1,tags:[],version:"current",frontMatter:{title:"InstanceImpl<I,O,S>",slug:"/rimbu/stream/AsyncReducer/InstanceImpl/class"},sidebar:"defaultSidebar",previous:{title:"AsyncReducer.Instance<I,O>",permalink:"/api/rimbu/stream/AsyncReducer/Instance/interface"},next:{title:"InvalidCombineShapeError",permalink:"/api/rimbu/stream/AsyncReducer/InvalidCombineShapeError/class"}},h={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>halt</code>",id:"halt",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>halted</code>",id:"halted",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>index</code>",id:"index",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>getOutput</code>",id:"getoutput",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>halt</code>",id:"halt-1",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>initialize</code>",id:"initialize",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>next</code>",id:"next-1",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>onClose</code>",id:"onclose",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-5",level:4}],b={toc:y},N="wrapper";function O(e){var t=e,{components:n}=t,r=m(t,["components"]);return(0,a.kt)(N,c(s(s({},b),r),{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",s({},{id:"class-instanceimplios"}),(0,a.kt)("inlineCode",{parentName:"h1"},"class InstanceImpl<I,O,S>")),(0,a.kt)("p",null,"The default ",(0,a.kt)("inlineCode",{parentName:"p"},"AsyncReducer.Impl")," implementation."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implements:")," ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Instance/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Instance<I,O>"))),(0,a.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"I"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the input element type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"O"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the output element type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"S"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the reducer state type")))),(0,a.kt)("h2",s({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"halt"}),(0,a.kt)("inlineCode",{parentName:"h3"},"halt")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"halt: () => void;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"halted"}),(0,a.kt)("inlineCode",{parentName:"h3"},"halted")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get halted(): boolean;"))),(0,a.kt)("h4",s({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Instance/interface#halted"}),"Instance.halted"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"index"}),(0,a.kt)("inlineCode",{parentName:"h3"},"index")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get index(): number;"))),(0,a.kt)("h4",s({},{id:"overrides-1"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Instance/interface#index"}),"Instance.index"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"next"}),(0,a.kt)("inlineCode",{parentName:"h3"},"next")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"next: (value: I) => Promise<void>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"reducer"}),(0,a.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly reducer: "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Impl/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Impl")),(0,a.kt)("inlineCode",{parentName:"p"},"<I, O, S>;")))),(0,a.kt)("h2",s({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"getoutput"}),(0,a.kt)("inlineCode",{parentName:"h3"},"getOutput")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"getOutput(): Promise<O>;"))),(0,a.kt)("h4",s({},{id:"overrides-2"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Instance/interface#getOutput"}),"Instance.getOutput"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"halt-1"}),(0,a.kt)("inlineCode",{parentName:"h3"},"halt")),(0,a.kt)("p",null,"Method that, when called, halts the reducer instance so that it will no longer receive values.")),(0,a.kt)("h4",s({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"halt(): void;"))),(0,a.kt)("h4",s({},{id:"overrides-3"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Instance/interface#halt"}),"Instance.halt"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"initialize"}),(0,a.kt)("inlineCode",{parentName:"h3"},"initialize")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"initialize(): Promise<void>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"next-1"}),(0,a.kt)("inlineCode",{parentName:"h3"},"next")),(0,a.kt)("p",null,"Sends a new value into the reducer instance.")),(0,a.kt)("h4",s({},{id:"definition-8"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"next(value: I): "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,a.kt)("inlineCode",{parentName:"p"},"<void>;"))),(0,a.kt)("h4",s({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"I")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the next input value")))),(0,a.kt)("h4",s({},{id:"overrides-4"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Instance/interface#next"}),"Instance.next"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"onclose"}),(0,a.kt)("inlineCode",{parentName:"h3"},"onClose")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-9"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"onClose(err?: unknown): Promise<void>;"))),(0,a.kt)("h4",s({},{id:"parameters-1"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"err")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"unknown")),(0,a.kt)("td",s({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",s({},{id:"overrides-5"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Instance/interface#onClose"}),"Instance.onClose"))))}O.isMDXComponent=!0}}]);