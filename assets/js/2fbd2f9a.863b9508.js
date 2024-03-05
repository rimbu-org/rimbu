"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[29528],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>k});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},l=Object.keys(e);for(a=0;a<l.length;a++)r=l[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)r=l[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var p=a.createContext({}),u=function(e){var t=a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},d=function(e){var t=u(e.components);return a.createElement(p.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,l=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),s=u(r),c=n,k=s["".concat(p,".").concat(c)]||s[c]||m[c]||l;return r?a.createElement(k,i(i({ref:t},d),{},{components:r})):a.createElement(k,i({ref:t},d))}));function k(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=r.length,i=new Array(l);i[0]=c;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[s]="string"==typeof e?e:n,i[1]=o;for(var u=2;u<l;u++)i[u]=r[u];return a.createElement.apply(null,i)}return a.createElement.apply(null,r)}c.displayName="MDXCreateElement"},31052:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>g,frontMatter:()=>k,metadata:()=>v,toc:()=>y});var a=r(3905),n=Object.defineProperty,l=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,d=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&d(e,r,t[r]);if(o)for(var r of o(t))u.call(t,r)&&d(e,r,t[r]);return e},m=(e,t)=>l(e,i(t)),c=(e,t)=>{var r={};for(var a in e)p.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&o)for(var a of o(e))t.indexOf(a)<0&&u.call(e,a)&&(r[a]=e[a]);return r};const k={title:"FilterPureIterator<T,A>",slug:"/rimbu/stream/custom/FilterPureIterator/class"},f="class FilterPureIterator<T,A>",v={unversionedId:"rimbu_stream/custom/FilterPureIterator.class",id:"rimbu_stream/custom/FilterPureIterator.class",title:"FilterPureIterator<T,A>",description:"undocumented",source:"@site/api/rimbu_stream/custom/FilterPureIterator.class.mdx",sourceDirName:"rimbu_stream/custom",slug:"/rimbu/stream/custom/FilterPureIterator/class",permalink:"/api/rimbu/stream/custom/FilterPureIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"FilterPureIterator<T,A>",slug:"/rimbu/stream/custom/FilterPureIterator/class"},sidebar:"defaultSidebar",previous:{title:"FilterIterator<T>",permalink:"/api/rimbu/stream/custom/FilterIterator/class"},next:{title:"IndexedIterator<T>",permalink:"/api/rimbu/stream/custom/IndexedIterator/class"}},b={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>args</code>",id:"args",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>negate</code>",id:"negate",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>pred</code>",id:"pred",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>source</code>",id:"source",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-1",level:4}],N={toc:y},h="wrapper";function g(e){var t=e,{components:r}=t,n=c(t,["components"]);return(0,a.kt)(h,m(s(s({},N),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",s({},{id:"class-filterpureiteratorta"}),(0,a.kt)("inlineCode",{parentName:"h1"},"class FilterPureIterator<T,A>")),(0,a.kt)("p",null,"undocumented"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class"}),(0,a.kt)("inlineCode",{parentName:"a"},"FastIteratorBase<T>"))),(0,a.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",s({parentName:"tr"},{align:null})),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"undocumented")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"A"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"readonly unknown[]")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"undocumented")))),(0,a.kt)("h2",s({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"args"}),(0,a.kt)("inlineCode",{parentName:"h3"},"args")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly args: A;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"negate"}),(0,a.kt)("inlineCode",{parentName:"h3"},"negate")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly negate: boolean;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"pred"}),(0,a.kt)("inlineCode",{parentName:"h3"},"pred")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly pred: (value: T, ...args: A) => boolean;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"source"}),(0,a.kt)("inlineCode",{parentName:"h3"},"source")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly source: "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;")))),(0,a.kt)("h2",s({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"fastnext"}),(0,a.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",s({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"p"},"<O>): T "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," O;"))),(0,a.kt)("h4",s({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"O"),(0,a.kt)("td",s({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",s({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("a",s({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"td"},"<O>")),(0,a.kt)("td",s({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",s({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#fastNext"}),"FastIteratorBase.fastNext"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"next"}),(0,a.kt)("inlineCode",{parentName:"h3"},"next")),(0,a.kt)("p",null,"Returns the next ",(0,a.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,a.kt)("h4",s({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"next(): IteratorResult<T>;"))),(0,a.kt)("h4",s({},{id:"overrides-1"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface#next"}),"FastIterator.next"),", ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#next"}),"FastIteratorBase.next"))))}g.isMDXComponent=!0}}]);