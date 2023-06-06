"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[52423],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),u=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=u(n),c=a,k=m["".concat(d,".").concat(c)]||m[c]||s[c]||i;return n?r.createElement(k,l(l({ref:t},p),{},{components:n})):r.createElement(k,l({ref:t},p))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=c;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var u=2;u<i;u++)l[u]=n[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},59728:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>O,frontMatter:()=>k,metadata:()=>v,toc:()=>y});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&p(e,n,t[n]);if(o)for(var n of o(t))u.call(t,n)&&p(e,n,t[n]);return e},s=(e,t)=>i(e,l(t)),c=(e,t)=>{var n={};for(var r in e)d.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&o)for(var r of o(e))t.indexOf(r)<0&&u.call(e,r)&&(n[r]=e[r]);return n};const k={title:"WindowIterator<T,R>",slug:"/rimbu/stream/custom/WindowIterator/class"},f="class WindowIterator<T,R>",v={unversionedId:"rimbu_stream/custom/WindowIterator.class",id:"rimbu_stream/custom/WindowIterator.class",title:"WindowIterator<T,R>",description:"undocumented",source:"@site/api/rimbu_stream/custom/WindowIterator.class.mdx",sourceDirName:"rimbu_stream/custom",slug:"/rimbu/stream/custom/WindowIterator/class",permalink:"/api/rimbu/stream/custom/WindowIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"WindowIterator<T,R>",slug:"/rimbu/stream/custom/WindowIterator/class"},sidebar:"defaultSidebar",previous:{title:"UnfoldIterator<T>",permalink:"/api/rimbu/stream/custom/UnfoldIterator/class"},next:{title:"WindowStream<T,R>",permalink:"/api/rimbu/stream/custom/WindowStream/class"}},b={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>collector</code>",id:"collector",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>index</code>",id:"index",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>skipAmount</code>",id:"skipamount",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>source</code>",id:"source",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>state</code>",id:"state",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>windowSize</code>",id:"windowsize",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Overrides",id:"overrides-1",level:4}],N={toc:y},h="wrapper";function O(e){var t=e,{components:n}=t,a=c(t,["components"]);return(0,r.kt)(h,s(m(m({},N),a),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",m({},{id:"class-windowiteratortr"}),(0,r.kt)("inlineCode",{parentName:"h1"},"class WindowIterator<T,R>")),(0,r.kt)("p",null,"undocumented"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Extends:")," ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"FastIteratorBase<T>"))),(0,r.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"R"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")))),(0,r.kt)("h2",m({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"collector"}),(0,r.kt)("inlineCode",{parentName:"h3"},"collector")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly collector: Reducer<T, R>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"index"}),(0,r.kt)("inlineCode",{parentName:"h3"},"index")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"index: number;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"skipamount"}),(0,r.kt)("inlineCode",{parentName:"h3"},"skipAmount")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly skipAmount: number;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"source"}),(0,r.kt)("inlineCode",{parentName:"h3"},"source")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly source: FastIterator<T>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"state"}),(0,r.kt)("inlineCode",{parentName:"h3"},"state")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"state: Set<{"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"result: unknown;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"size: number;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"halted: boolean;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"halt: () => void;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"}>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"windowsize"}),(0,r.kt)("inlineCode",{parentName:"h3"},"windowSize")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly windowSize: number;")))),(0,r.kt)("h2",m({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"fastnext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): R "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O;"))),(0,r.kt)("h4",m({},{id:"type-parameters-1"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"O"),(0,r.kt)("td",m({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"td"},"<O>")),(0,r.kt)("td",m({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",m({},{id:"overrides"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#fastNext"}),"FastIteratorBase.fastNext"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"next"}),(0,r.kt)("inlineCode",{parentName:"h3"},"next")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"next(): IteratorResult<T>;"))),(0,r.kt)("h4",m({},{id:"overrides-1"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#next"}),"FastIteratorBase.next"))))}O.isMDXComponent=!0}}]);