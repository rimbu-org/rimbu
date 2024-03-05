"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[26320],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>k});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=a.createContext({}),p=function(e){var t=a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},m=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),u=p(r),c=n,k=u["".concat(s,".").concat(c)]||u[c]||d[c]||i;return r?a.createElement(k,l(l({ref:t},m),{},{components:r})):a.createElement(k,l({ref:t},m))}));function k(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,l=new Array(i);l[0]=c;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[u]="string"==typeof e?e:n,l[1]=o;for(var p=2;p<i;p++)l[p]=r[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}c.displayName="MDXCreateElement"},33637:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>N,contentTitle:()=>f,default:()=>O,frontMatter:()=>k,metadata:()=>b,toc:()=>y});var a=r(3905),n=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))s.call(t,r)&&m(e,r,t[r]);if(o)for(var r of o(t))p.call(t,r)&&m(e,r,t[r]);return e},d=(e,t)=>i(e,l(t)),c=(e,t)=>{var r={};for(var a in e)s.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&o)for(var a of o(e))t.indexOf(a)<0&&p.call(e,a)&&(r[a]=e[a]);return r};const k={title:"TransformerFastIterator<T,R>",slug:"/rimbu/stream/custom/TransformerFastIterator/class"},f="class TransformerFastIterator<T,R>",b={unversionedId:"rimbu_stream/custom/TransformerFastIterator.class",id:"rimbu_stream/custom/TransformerFastIterator.class",title:"TransformerFastIterator<T,R>",description:"undocumented",source:"@site/api/rimbu_stream/custom/TransformerFastIterator.class.mdx",sourceDirName:"rimbu_stream/custom",slug:"/rimbu/stream/custom/TransformerFastIterator/class",permalink:"/api/rimbu/stream/custom/TransformerFastIterator/class",draft:!1,tags:[],version:"current",frontMatter:{title:"TransformerFastIterator<T,R>",slug:"/rimbu/stream/custom/TransformerFastIterator/class"},sidebar:"defaultSidebar",previous:{title:"TakeIterator<T>",permalink:"/api/rimbu/stream/custom/TakeIterator/class"},next:{title:"UnfoldIterator<T>",permalink:"/api/rimbu/stream/custom/UnfoldIterator/class"}},N={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>sourceIterator</code>",id:"sourceiterator",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>transformerInstance</code>",id:"transformerinstance",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides-1",level:4}],v={toc:y},h="wrapper";function O(e){var t=e,{components:r}=t,n=c(t,["components"]);return(0,a.kt)(h,d(u(u({},v),n),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",u({},{id:"class-transformerfastiteratortr"}),(0,a.kt)("inlineCode",{parentName:"h1"},"class TransformerFastIterator<T,R>")),(0,a.kt)("p",null,"undocumented"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class"}),(0,a.kt)("inlineCode",{parentName:"a"},"FastIteratorBase<T>"))),(0,a.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"R"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")))),(0,a.kt)("h2",u({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"sourceiterator"}),(0,a.kt)("inlineCode",{parentName:"h3"},"sourceIterator")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly sourceIterator: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"transformerinstance"}),(0,a.kt)("inlineCode",{parentName:"h3"},"transformerInstance")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly transformerInstance: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/Reducer/Instance/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"Reducer.Instance")),(0,a.kt)("inlineCode",{parentName:"p"},"<T, "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,a.kt)("inlineCode",{parentName:"p"},"<R>>;")))),(0,a.kt)("h2",u({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"fastnext"}),(0,a.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"fastNext<O>(otherwise?: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"p"},"<O>): R "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," O;"))),(0,a.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"O"),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"td"},"<O>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#fastNext"}),"FastIteratorBase.fastNext"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"next"}),(0,a.kt)("inlineCode",{parentName:"h3"},"next")),(0,a.kt)("p",null,"Returns the next ",(0,a.kt)("inlineCode",{parentName:"p"},"IteratorResult"),".")),(0,a.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"next(): IteratorResult<T>;"))),(0,a.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface#next"}),"FastIterator.next"),", ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/FastIteratorBase/class#next"}),"FastIteratorBase.next"))))}O.isMDXComponent=!0}}]);