"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[25332],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var l=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);t&&(l=l.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,l)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,l,i=function(e,t){if(null==e)return{};var n,l,i={},r=Object.keys(e);for(l=0;l<r.length;l++)n=r[l],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(l=0;l<r.length;l++)n=r[l],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=l.createContext({}),u=function(e){var t=l.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=u(e.components);return l.createElement(d.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return l.createElement(l.Fragment,{},t)}},s=l.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),c=u(n),s=i,k=c["".concat(d,".").concat(s)]||c[s]||m[s]||r;return n?l.createElement(k,a(a({ref:t},p),{},{components:n})):l.createElement(k,a({ref:t},p))}));function k(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,a=new Array(r);a[0]=s;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[c]="string"==typeof e?e:i,a[1]=o;for(var u=2;u<r;u++)a[u]=n[u];return l.createElement.apply(null,a)}return l.createElement.apply(null,n)}s.displayName="MDXCreateElement"},56432:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>v,contentTitle:()=>f,default:()=>O,frontMatter:()=>k,metadata:()=>y,toc:()=>h});var l=n(3905),i=Object.defineProperty,r=Object.defineProperties,a=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,c=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&p(e,n,t[n]);if(o)for(var n of o(t))u.call(t,n)&&p(e,n,t[n]);return e},m=(e,t)=>r(e,a(t)),s=(e,t)=>{var n={};for(var l in e)d.call(e,l)&&t.indexOf(l)<0&&(n[l]=e[l]);if(null!=e&&o)for(var l of o(e))t.indexOf(l)<0&&u.call(e,l)&&(n[l]=e[l]);return n};const k={title:"InstanceImpl<I,O,S>",slug:"/rimbu/stream/async/AsyncReducer/InstanceImpl/class"},f="class InstanceImpl<I,O,S>",y={unversionedId:"rimbu_stream/async/AsyncReducer/InstanceImpl.class",id:"rimbu_stream/async/AsyncReducer/InstanceImpl.class",title:"InstanceImpl<I,O,S>",description:"The default AsyncReducer.Impl implementation.",source:"@site/api/rimbu_stream/async/AsyncReducer/InstanceImpl.class.mdx",sourceDirName:"rimbu_stream/async/AsyncReducer",slug:"/rimbu/stream/async/AsyncReducer/InstanceImpl/class",permalink:"/api/rimbu/stream/async/AsyncReducer/InstanceImpl/class",draft:!1,tags:[],version:"current",frontMatter:{title:"InstanceImpl<I,O,S>",slug:"/rimbu/stream/async/AsyncReducer/InstanceImpl/class"},sidebar:"defaultSidebar",previous:{title:"AsyncReducer.Instance<I,O>",permalink:"/api/rimbu/stream/async/AsyncReducer/Instance/interface"},next:{title:"InvalidCombineShapeError",permalink:"/api/rimbu/stream/async/AsyncReducer/InvalidCombineShapeError/class"}},v={},h=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>halt</code>",id:"halt",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>halted</code>",id:"halted",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>index</code>",id:"index",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>getOutput</code>",id:"getoutput",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>initialize</code>",id:"initialize",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>onClose</code>",id:"onclose",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Parameters",id:"parameters",level:4}],b={toc:h},N="wrapper";function O(e){var t=e,{components:n}=t,i=s(t,["components"]);return(0,l.kt)(N,m(c(c({},b),i),{components:n,mdxType:"MDXLayout"}),(0,l.kt)("h1",c({},{id:"class-instanceimplios"}),(0,l.kt)("inlineCode",{parentName:"h1"},"class InstanceImpl<I,O,S>")),(0,l.kt)("p",null,"The default ",(0,l.kt)("inlineCode",{parentName:"p"},"AsyncReducer.Impl")," implementation."),(0,l.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,l.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",c({parentName:"tr"},{align:null}),"I"),(0,l.kt)("td",c({parentName:"tr"},{align:null}),"the input element type")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",c({parentName:"tr"},{align:null}),"O"),(0,l.kt)("td",c({parentName:"tr"},{align:null}),"the output element type")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",c({parentName:"tr"},{align:null}),"S"),(0,l.kt)("td",c({parentName:"tr"},{align:null}),"the reducer state type")))),(0,l.kt)("h2",c({},{id:"properties"}),"Properties"),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"halt"}),(0,l.kt)("inlineCode",{parentName:"h3"},"halt")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"halt: () => void;")))),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"halted"}),(0,l.kt)("inlineCode",{parentName:"h3"},"halted")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"get halted(): boolean;")))),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"index"}),(0,l.kt)("inlineCode",{parentName:"h3"},"index")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"get index(): number;")))),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"next"}),(0,l.kt)("inlineCode",{parentName:"h3"},"next")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"next: (value: I) => Promise<void>;")))),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"reducer"}),(0,l.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition-4"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"readonly reducer: "),(0,l.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Impl/interface"}),(0,l.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Impl")),(0,l.kt)("inlineCode",{parentName:"p"},"<I, O, S>;")))),(0,l.kt)("h2",c({},{id:"methods"}),"Methods"),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"getoutput"}),(0,l.kt)("inlineCode",{parentName:"h3"},"getOutput")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition-5"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"getOutput(): Promise<O>;")))),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"initialize"}),(0,l.kt)("inlineCode",{parentName:"h3"},"initialize")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition-6"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"initialize(): Promise<void>;")))),(0,l.kt)("details",null,(0,l.kt)("summary",null,(0,l.kt)("h3",c({},{id:"onclose"}),(0,l.kt)("inlineCode",{parentName:"h3"},"onClose")),(0,l.kt)("p",null,"undocumented")),(0,l.kt)("h4",c({},{id:"definition-7"}),"Definition"),(0,l.kt)("code",null,(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"onClose(err?: unknown): Promise<void>;"))),(0,l.kt)("h4",c({},{id:"parameters"}),"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,l.kt)("th",c({parentName:"tr"},{align:null}),"Type"),(0,l.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",c({parentName:"tr"},{align:null}),(0,l.kt)("inlineCode",{parentName:"td"},"err")),(0,l.kt)("td",c({parentName:"tr"},{align:null}),(0,l.kt)("inlineCode",{parentName:"td"},"unknown")),(0,l.kt)("td",c({parentName:"tr"},{align:null})))))))}O.isMDXComponent=!0}}]);