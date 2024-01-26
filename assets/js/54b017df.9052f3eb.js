"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[73621],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var u=r.createContext({}),d=function(e){var t=r.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=d(e.components);return r.createElement(u.Provider,{value:t},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,u=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),p=d(n),s=a,k=p["".concat(u,".").concat(s)]||p[s]||m[s]||l;return n?r.createElement(k,i(i({ref:t},c),{},{components:n})):r.createElement(k,i({ref:t},c))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,i=new Array(l);i[0]=s;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o[p]="string"==typeof e?e:a,i[1]=o;for(var d=2;d<l;d++)i[d]=n[d];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},32532:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>g,frontMatter:()=>k,metadata:()=>y,toc:()=>v});var r=n(3905),a=Object.defineProperty,l=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,p=(e,t)=>{for(var n in t||(t={}))u.call(t,n)&&c(e,n,t[n]);if(o)for(var n of o(t))d.call(t,n)&&c(e,n,t[n]);return e},m=(e,t)=>l(e,i(t)),s=(e,t)=>{var n={};for(var r in e)u.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&o)for(var r of o(e))t.indexOf(r)<0&&d.call(e,r)&&(n[r]=e[r]);return n};const k={title:"AsyncReducer.Instance<I,O>",slug:"/rimbu/stream/AsyncReducer/Instance/interface"},f="interface AsyncReducer.Instance<I,O>",y={unversionedId:"rimbu_stream/AsyncReducer/Instance.interface",id:"rimbu_stream/AsyncReducer/Instance.interface",title:"AsyncReducer.Instance<I,O>",description:"undocumented",source:"@site/api/rimbu_stream/AsyncReducer/Instance.interface.mdx",sourceDirName:"rimbu_stream/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/Instance/interface",permalink:"/api/rimbu/stream/AsyncReducer/Instance/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"AsyncReducer.Instance<I,O>",slug:"/rimbu/stream/AsyncReducer/Instance/interface"},sidebar:"defaultSidebar",previous:{title:"AsyncReducer.Impl<I,O,S>",permalink:"/api/rimbu/stream/AsyncReducer/Impl/interface"},next:{title:"InstanceImpl<I,O,S>",permalink:"/api/rimbu/stream/AsyncReducer/InstanceImpl/class"}},b={},v=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>halted</code>",id:"halted",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>index</code>",id:"index",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>getOutput</code>",id:"getoutput",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>onClose</code>",id:"onclose",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Parameters",id:"parameters-1",level:4}],h={toc:v},N="wrapper";function g(e){var t=e,{components:n}=t,a=s(t,["components"]);return(0,r.kt)(N,m(p(p({},h),a),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",p({},{id:"interface-asyncreducerinstanceio"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface AsyncReducer.Instance<I,O>")),(0,r.kt)("p",null,"undocumented"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,r.kt)("a",p({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/InstanceImpl/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"InstanceImpl<I,O,S>"))),(0,r.kt)("h2",p({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),"I"),(0,r.kt)("td",p({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),"O"),(0,r.kt)("td",p({parentName:"tr"},{align:null}),"undocumented")))),(0,r.kt)("h2",p({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"halted"}),(0,r.kt)("inlineCode",{parentName:"h3"},"halted")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"get halted(): boolean;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"index"}),(0,r.kt)("inlineCode",{parentName:"h3"},"index")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"get index(): number;")))),(0,r.kt)("h2",p({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"getoutput"}),(0,r.kt)("inlineCode",{parentName:"h3"},"getOutput")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"getOutput(): MaybePromise<O>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"next"}),(0,r.kt)("inlineCode",{parentName:"h3"},"next")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"next(value: I): MaybePromise<void>;"))),(0,r.kt)("h4",p({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"value")),(0,r.kt)("td",p({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"I")),(0,r.kt)("td",p({parentName:"tr"},{align:null})))))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"onclose"}),(0,r.kt)("inlineCode",{parentName:"h3"},"onClose")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"onClose(err?: unknown): Promise<void>;"))),(0,r.kt)("h4",p({},{id:"parameters-1"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"err")),(0,r.kt)("td",p({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"unknown")),(0,r.kt)("td",p({parentName:"tr"},{align:null})))))))}g.isMDXComponent=!0}}]);