"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[25332],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),u=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(d.Provider,{value:t},e.children)},p="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,d=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),p=u(n),m=a,k=p["".concat(d,".").concat(m)]||p[m]||s[m]||l;return n?r.createElement(k,i(i({ref:t},c),{},{components:n})):r.createElement(k,i({ref:t},c))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,i=new Array(l);i[0]=m;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[p]="string"==typeof e?e:a,i[1]=o;for(var u=2;u<l;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},56432:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>N,frontMatter:()=>k,metadata:()=>y,toc:()=>v});var r=n(3905),a=Object.defineProperty,l=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,p=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&c(e,n,t[n]);if(o)for(var n of o(t))u.call(t,n)&&c(e,n,t[n]);return e},s=(e,t)=>l(e,i(t)),m=(e,t)=>{var n={};for(var r in e)d.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&o)for(var r of o(e))t.indexOf(r)<0&&u.call(e,r)&&(n[r]=e[r]);return n};const k={title:"InstanceImpl<I,O,S>",slug:"/rimbu/stream/async/AsyncReducer/InstanceImpl/class"},f="class InstanceImpl<I,O,S>",y={unversionedId:"rimbu_stream/async/AsyncReducer/InstanceImpl.class",id:"rimbu_stream/async/AsyncReducer/InstanceImpl.class",title:"InstanceImpl<I,O,S>",description:"undocumented",source:"@site/api/rimbu_stream/async/AsyncReducer/InstanceImpl.class.mdx",sourceDirName:"rimbu_stream/async/AsyncReducer",slug:"/rimbu/stream/async/AsyncReducer/InstanceImpl/class",permalink:"/api/rimbu/stream/async/AsyncReducer/InstanceImpl/class",draft:!1,tags:[],version:"current",frontMatter:{title:"InstanceImpl<I,O,S>",slug:"/rimbu/stream/async/AsyncReducer/InstanceImpl/class"},sidebar:"defaultSidebar",previous:{title:"AsyncReducer.Instance<I,O>",permalink:"/api/rimbu/stream/async/AsyncReducer/Instance/interface"},next:{title:"InvalidCombineShapeError",permalink:"/api/rimbu/stream/async/AsyncReducer/InvalidCombineShapeError/class"}},b={},v=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>halted</code>",id:"halted",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>index</code>",id:"index",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>getOutput</code>",id:"getoutput",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>onClose</code>",id:"onclose",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Parameters",id:"parameters",level:4}],h={toc:v},O="wrapper";function N(e){var t=e,{components:n}=t,a=m(t,["components"]);return(0,r.kt)(O,s(p(p({},h),a),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",p({},{id:"class-instanceimplios"}),(0,r.kt)("inlineCode",{parentName:"h1"},"class InstanceImpl<I,O,S>")),(0,r.kt)("p",null,"undocumented"),(0,r.kt)("h2",p({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),"I"),(0,r.kt)("td",p({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),"O"),(0,r.kt)("td",p({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),"S"),(0,r.kt)("td",p({parentName:"tr"},{align:null}),"undocumented")))),(0,r.kt)("h2",p({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"halted"}),(0,r.kt)("inlineCode",{parentName:"h3"},"halted")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"get halted(): boolean;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"index"}),(0,r.kt)("inlineCode",{parentName:"h3"},"index")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"get index(): number;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"next"}),(0,r.kt)("inlineCode",{parentName:"h3"},"next")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"next: (value: I) => Promise<void>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"reducer"}),(0,r.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly reducer: "),(0,r.kt)("a",p({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Impl/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Impl")),(0,r.kt)("inlineCode",{parentName:"p"},"<I, O, S>;")))),(0,r.kt)("h2",p({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"getoutput"}),(0,r.kt)("inlineCode",{parentName:"h3"},"getOutput")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"getOutput(): Promise<O>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",p({},{id:"onclose"}),(0,r.kt)("inlineCode",{parentName:"h3"},"onClose")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",p({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"onClose(err?: unknown): Promise<void>;"))),(0,r.kt)("h4",p({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",p({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"err")),(0,r.kt)("td",p({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"unknown")),(0,r.kt)("td",p({parentName:"tr"},{align:null})))))))}N.isMDXComponent=!0}}]);