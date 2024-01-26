"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[46949],{3905:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>k});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function m(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?m(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):m(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},m=Object.keys(e);for(r=0;r<m.length;r++)a=m[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var m=Object.getOwnPropertySymbols(e);for(r=0;r<m.length;r++)a=m[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var p=r.createContext({}),o=function(e){var t=r.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},s=function(e){var t=o(e.components);return r.createElement(p.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,m=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=o(a),u=n,k=d["".concat(p,".").concat(u)]||d[u]||c[u]||m;return a?r.createElement(k,i(i({ref:t},s),{},{components:a})):r.createElement(k,i({ref:t},s))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var m=a.length,i=new Array(m);i[0]=u;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[d]="string"==typeof e?e:n,i[1]=l;for(var o=2;o<m;o++)i[o]=a[o];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}u.displayName="MDXCreateElement"},36040:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>N,contentTitle:()=>b,default:()=>S,frontMatter:()=>k,metadata:()=>f,toc:()=>y});var r=a(3905),n=Object.defineProperty,m=Object.defineProperties,i=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,s=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,d=(e,t)=>{for(var a in t||(t={}))p.call(t,a)&&s(e,a,t[a]);if(l)for(var a of l(t))o.call(t,a)&&s(e,a,t[a]);return e},c=(e,t)=>m(e,i(t)),u=(e,t)=>{var a={};for(var r in e)p.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&o.call(e,r)&&(a[r]=e[r]);return a};const k={title:"@rimbu/stream",slug:"/rimbu/stream"},b="package @rimbu/stream",f={unversionedId:"rimbu_stream/index",id:"rimbu_stream/index",title:"@rimbu/stream",description:"The @rimbu/stream package provides the Stream and AsyncStream implementations and many related utilities.",source:"@site/api/rimbu_stream/index.mdx",sourceDirName:"rimbu_stream",slug:"/rimbu/stream",permalink:"/api/rimbu/stream",draft:!1,tags:[],version:"current",frontMatter:{title:"@rimbu/stream",slug:"/rimbu/stream"},sidebar:"defaultSidebar",previous:{title:"ObjStub",permalink:"/api/rimbu/spy/Spy/ObjStub/type"},next:{title:"AsyncFastIterable<T>",permalink:"/api/rimbu/stream/AsyncFastIterable/interface"}},N={},y=[{value:"Interfaces",id:"interfaces",level:2},{value:"Namespaces",id:"namespaces",level:2}],h={toc:y},g="wrapper";function S(e){var t=e,{components:a}=t,n=u(t,["components"]);return(0,r.kt)(g,c(d(d({},h),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",d({},{id:"package-rimbustream"}),(0,r.kt)("inlineCode",{parentName:"h1"},"package @rimbu/stream")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"@rimbu/stream")," package provides the ",(0,r.kt)("inlineCode",{parentName:"p"},"Stream")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"AsyncStream")," implementations and many related utilities."),(0,r.kt)("p",null," See the ",(0,r.kt)("a",d({parentName:"p"},{href:"/docs/collections/stream"}),"Rimbu docs Stream page")," for more information."),(0,r.kt)("p",null," This package also exports everything from the the following sub-packages:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",d({parentName:"li"},{href:"./stream/async"}),(0,r.kt)("inlineCode",{parentName:"a"},"@rimbu/stream/async")))),(0,r.kt)("h2",d({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncFastIterable/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncFastIterable<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncFastIterator/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncFastIterator<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncStream/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncStream<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A possibly infinite asynchronous sequence of elements of type T. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/stream"}),"Stream documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/stream/async/AsyncStream/interface"}),"AsyncStream API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncStreamable/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncStreamable<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/FastIterable/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"FastIterable<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"An interface that extends the standard ",(0,r.kt)("inlineCode",{parentName:"td"},"Iterable")," interface to return a ",(0,r.kt)("inlineCode",{parentName:"td"},"FastIterator")," instead of a normal ",(0,r.kt)("inlineCode",{parentName:"td"},"Iterator"),".")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"FastIterator<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"An iterator that extends the default ",(0,r.kt)("inlineCode",{parentName:"td"},"Iterator")," interface with methods that give more performance.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/Stream/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"Stream<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A possibly infinite sequence of elements of type T. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/stream"}),"Stream documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/stream/Stream/interface"}),"Stream API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/Streamable/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"Streamable<T>"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"An object that can create a Stream of elements of type ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),".")))),(0,r.kt)("h2",d({},{id:"namespaces"}),"Namespaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncReducer/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"An ",(0,r.kt)("inlineCode",{parentName:"td"},"AsyncReducer")," is a stand-alone asynchronous calculation that takes input values of type I, and, when requested, produces an output value of type O.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncStream/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncStream"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A possibly infinite asynchronous sequence of elements of type T. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/stream"}),"Stream documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/stream/async/AsyncStream/interface"}),"AsyncStream API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncStreamable/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncStreamable"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncStreamSource/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncStreamSource"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/AsyncTransformer/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncTransformer"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"An AsyncReducer that produces instances of ",(0,r.kt)("inlineCode",{parentName:"td"},"AsyncStreamSource"),".")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/Reducer/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"Reducer"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A ",(0,r.kt)("inlineCode",{parentName:"td"},"Reducer")," is a stand-alone calculation that takes input values of type I, and, when requested, produces an output value of type O.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/Stream/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"Stream"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A possibly infinite sequence of elements of type T. See the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/docs/collections/stream"}),"Stream documentation")," and the ",(0,r.kt)("a",d({parentName:"td"},{href:"https://rimbu.org/api/rimbu/stream/Stream/interface"}),"Stream API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/Streamable/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"Streamable"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"An object that can create a Stream of elements of type ",(0,r.kt)("inlineCode",{parentName:"td"},"T"),".")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"StreamSource"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"Any object that is Iterable, a Stream, or can produce a Stream.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",d({parentName:"tr"},{align:null}),(0,r.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/Transformer/namespace"}),(0,r.kt)("inlineCode",{parentName:"a"},"Transformer"))),(0,r.kt)("td",d({parentName:"tr"},{align:null}),"A Reducer that produces instances of ",(0,r.kt)("inlineCode",{parentName:"td"},"StreamSource"),".")))))}S.isMDXComponent=!0}}]);