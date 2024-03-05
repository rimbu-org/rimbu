"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[60134],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>k});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),u=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=u(r),c=a,k=m["".concat(s,".").concat(c)]||m[c]||d[c]||i;return r?n.createElement(k,l(l({ref:t},p),{},{components:r})):n.createElement(k,l({ref:t},p))}));function k(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=c;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var u=2;u<i;u++)l[u]=r[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},37783:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>v,contentTitle:()=>y,default:()=>O,frontMatter:()=>k,metadata:()=>f,toc:()=>N});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))s.call(t,r)&&p(e,r,t[r]);if(o)for(var r of o(t))u.call(t,r)&&p(e,r,t[r]);return e},d=(e,t)=>i(e,l(t)),c=(e,t)=>{var r={};for(var n in e)s.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const k={title:"FromResourceIterator<T,R>",slug:"/rimbu/stream/async-custom/FromResourceIterator/class"},y="class FromResourceIterator<T,R>",f={unversionedId:"rimbu_stream/async-custom/FromResourceIterator.class",id:"rimbu_stream/async-custom/FromResourceIterator.class",title:"FromResourceIterator<T,R>",description:"undocumented",source:"@site/api/rimbu_stream/async-custom/FromResourceIterator.class.mdx",sourceDirName:"rimbu_stream/async-custom",slug:"/rimbu/stream/async-custom/FromResourceIterator/class",permalink:"/api/rimbu/stream/async-custom/FromResourceIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"FromResourceIterator<T,R>",slug:"/rimbu/stream/async-custom/FromResourceIterator/class"},sidebar:"defaultSidebar",previous:{title:"FromResource<T,R>",permalink:"/api/rimbu/stream/async-custom/FromResource/class"},next:{title:"FromSource<T>",permalink:"/api/rimbu/stream/async-custom/FromSource/class"}},v={},N=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>asyncStreamSourceHelpers</code>",id:"asyncstreamsourcehelpers",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>close</code>",id:"close",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>createSource</code>",id:"createsource",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>iterator</code>",id:"iterator",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>open</code>",id:"open",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>resource</code>",id:"resource",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>return</code>",id:"return",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Overrides",id:"overrides-2",level:4}],b={toc:N},h="wrapper";function O(e){var t=e,{components:r}=t,a=c(t,["components"]);return(0,n.kt)(h,d(m(m({},b),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"class-fromresourceiteratortr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"class FromResourceIterator<T,R>")),(0,n.kt)("p",null,"undocumented"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncFastIteratorBase<T>"))),(0,n.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"R"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"undocumented")))),(0,n.kt)("h2",m({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"asyncstreamsourcehelpers"}),(0,n.kt)("inlineCode",{parentName:"h3"},"asyncStreamSourceHelpers")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly asyncStreamSourceHelpers: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncStreamSourceHelpers/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncStreamSourceHelpers")),(0,n.kt)("inlineCode",{parentName:"p"},";")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"close"}),(0,n.kt)("inlineCode",{parentName:"h3"},"close")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly close: ((resource: R) => "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,n.kt)("inlineCode",{parentName:"p"},"<void>) "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"createsource"}),(0,n.kt)("inlineCode",{parentName:"h3"},"createSource")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly createSource: (resource: R) => "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncStreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncStreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"iterator"}),(0,n.kt)("inlineCode",{parentName:"h3"},"iterator")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"iterator: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncFastIterator/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncFastIterator")),(0,n.kt)("inlineCode",{parentName:"p"},"<T> "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"open"}),(0,n.kt)("inlineCode",{parentName:"h3"},"open")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly open: () => "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,n.kt)("inlineCode",{parentName:"p"},"<R>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"resource"}),(0,n.kt)("inlineCode",{parentName:"h3"},"resource")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"resource: R "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"return"}),(0,n.kt)("inlineCode",{parentName:"h3"},"return")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"return?: () => Promise<any>;"))),(0,n.kt)("h4",m({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#return"}),"AsyncFastIteratorBase.return"))),(0,n.kt)("h2",m({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"fastnext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: AsyncOptLazy<O>): Promise<T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O>;"))),(0,n.kt)("h4",m({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"O"),(0,n.kt)("td",m({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"AsyncOptLazy<O>")),(0,n.kt)("td",m({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",m({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#fastNext"}),"AsyncFastIteratorBase.fastNext"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"next"}),(0,n.kt)("inlineCode",{parentName:"h3"},"next")),(0,n.kt)("p",null,"Returns a promise resolving to the next ",(0,n.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,n.kt)("h4",m({},{id:"definition-8"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"next(): Promise<IteratorResult<T>>;"))),(0,n.kt)("h4",m({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncFastIterator/interface#next"}),"AsyncFastIterator.next"),", ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async-custom/AsyncFastIteratorBase/class#next"}),"AsyncFastIteratorBase.next"))))}O.isMDXComponent=!0}}]);