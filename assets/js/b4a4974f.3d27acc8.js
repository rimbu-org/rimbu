"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[66157],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),u=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=u(e.components);return r.createElement(p.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),s=u(n),c=a,k=s["".concat(p,".").concat(c)]||s[c]||m[c]||i;return n?r.createElement(k,l(l({ref:t},d),{},{components:n})):r.createElement(k,l({ref:t},d))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=c;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[s]="string"==typeof e?e:a,l[1]=o;for(var u=2;u<i;u++)l[u]=n[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},78284:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>g,frontMatter:()=>k,metadata:()=>v,toc:()=>y});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,d=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,s=(e,t)=>{for(var n in t||(t={}))p.call(t,n)&&d(e,n,t[n]);if(o)for(var n of o(t))u.call(t,n)&&d(e,n,t[n]);return e},m=(e,t)=>i(e,l(t)),c=(e,t)=>{var n={};for(var r in e)p.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&o)for(var r of o(e))t.indexOf(r)<0&&u.call(e,r)&&(n[r]=e[r]);return n};const k={title:"RangeUpIterator",slug:"/rimbu/stream/custom/RangeUpIterator/class"},f="class RangeUpIterator",v={unversionedId:"rimbu_stream/custom/RangeUpIterator.class",id:"rimbu_stream/custom/RangeUpIterator.class",title:"RangeUpIterator",description:"undocumented",source:"@site/api/rimbu_stream/custom/RangeUpIterator.class.mdx",sourceDirName:"rimbu_stream/custom",slug:"/rimbu/stream/custom/RangeUpIterator/class",permalink:"/api/rimbu/stream/custom/RangeUpIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"RangeUpIterator",slug:"/rimbu/stream/custom/RangeUpIterator/class"},sidebar:"defaultSidebar",previous:{title:"RangeDownIterator",permalink:"/api/rimbu/stream/custom/RangeDownIterator/class"},next:{title:"ReducerFastIterator<T,R>",permalink:"/api/rimbu/stream/custom/ReducerFastIterator/class"}},b={},y=[{value:"Properties",id:"properties",level:2},{value:"<code>delta</code>",id:"delta",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>end</code>",id:"end",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>start</code>",id:"start",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>state</code>",id:"state",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-1",level:4}],h={toc:y},N="wrapper";function g(e){var t=e,{components:n}=t,a=c(t,["components"]);return(0,r.kt)(N,m(s(s({},h),a),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",s({},{id:"class-rangeupiterator"}),(0,r.kt)("inlineCode",{parentName:"h1"},"class RangeUpIterator")),(0,r.kt)("p",null,"undocumented"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Extends:")," ",(0,r.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"FastIteratorBase<T>"))),(0,r.kt)("h2",s({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"delta"}),(0,r.kt)("inlineCode",{parentName:"h3"},"delta")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",s({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly delta: number;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"end"}),(0,r.kt)("inlineCode",{parentName:"h3"},"end")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",s({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly end: number "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," undefined;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"start"}),(0,r.kt)("inlineCode",{parentName:"h3"},"start")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",s({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly start: number;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"state"}),(0,r.kt)("inlineCode",{parentName:"h3"},"state")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",s({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"state: number;")))),(0,r.kt)("h2",s({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"fastnext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",s({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: "),(0,r.kt)("a",s({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): number "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O;"))),(0,r.kt)("h4",s({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",s({parentName:"tr"},{align:null}),"O"),(0,r.kt)("td",s({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",s({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",s({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,r.kt)("td",s({parentName:"tr"},{align:null}),(0,r.kt)("a",s({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"td"},"<O>")),(0,r.kt)("td",s({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",s({},{id:"overrides"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#fastNext"}),"FastIteratorBase.fastNext"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"next"}),(0,r.kt)("inlineCode",{parentName:"h3"},"next")),(0,r.kt)("p",null,"Returns the next ",(0,r.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,r.kt)("h4",s({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"next(): IteratorResult<T>;"))),(0,r.kt)("h4",s({},{id:"overrides-1"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface#next"}),"FastIterator.next"),", ",(0,r.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#next"}),"FastIteratorBase.next"))))}g.isMDXComponent=!0}}]);