"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[12683],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=p(n),d=a,f=m["".concat(s,".").concat(d)]||m[d]||u[d]||i;return n?r.createElement(f,o(o({ref:t},c),{},{components:n})):r.createElement(f,o({ref:t},c))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[m]="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},96620:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>y,default:()=>h,frontMatter:()=>f,metadata:()=>k,toc:()=>N});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))s.call(t,n)&&c(e,n,t[n]);if(l)for(var n of l(t))p.call(t,n)&&c(e,n,t[n]);return e},u=(e,t)=>i(e,o(t)),d=(e,t)=>{var n={};for(var r in e)s.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n};const f={title:"AsyncTransformer (namespace)",slug:"/rimbu/stream/async/AsyncTransformer/namespace"},y="namespace AsyncTransformer",k={unversionedId:"rimbu_stream/async/AsyncTransformer/index",id:"rimbu_stream/async/AsyncTransformer/index",title:"AsyncTransformer (namespace)",description:"An AsyncReducer that produces instances of AsyncStreamSource.",source:"@site/api/rimbu_stream/async/AsyncTransformer/index.mdx",sourceDirName:"rimbu_stream/async/AsyncTransformer",slug:"/rimbu/stream/async/AsyncTransformer/namespace",permalink:"/api/rimbu/stream/async/AsyncTransformer/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"AsyncTransformer (namespace)",slug:"/rimbu/stream/async/AsyncTransformer/namespace"},sidebar:"defaultSidebar",previous:{title:"AsyncStreamable<T>",permalink:"/api/rimbu/stream/async/AsyncStreamable/interface"},next:{title:"NonEmpty",permalink:"/api/rimbu/stream/async/AsyncTransformer/NonEmpty/type"}},b={},N=[{value:"Functions",id:"functions",level:2},{value:"<code>distinctPrevious</code>",id:"distinctprevious",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:5},{value:"Parameters",id:"parameters",level:4},{value:"Constants",id:"constants",level:2}],v={toc:N},g="wrapper";function h(e){var t=e,{components:n}=t,a=d(t,["components"]);return(0,r.kt)(g,u(m(m({},v),a),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",m({},{id:"namespace-asynctransformer"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace AsyncTransformer")),(0,r.kt)("p",null,"An AsyncReducer that produces instances of ",(0,r.kt)("inlineCode",{parentName:"p"},"AsyncStreamSource"),"."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion type:")," ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncTransformer/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncTransformer<T,R>"))),(0,r.kt)("h2",m({},{id:"functions"}),"Functions"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"distinctprevious"}),(0,r.kt)("inlineCode",{parentName:"h3"},"distinctPrevious")),(0,r.kt)("p",null,"Returns an async transformer that returns only those elements from the input that are different to previous element according to the optionally given ",(0,r.kt)("inlineCode",{parentName:"p"},"eq")," function.")),(0,r.kt)("h4",m({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"function distinctPrevious<T>(options?: {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"eq?: Eq<T>;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"negate?: boolean;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"}): "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/AsyncTransformer/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncTransformer")),(0,r.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,r.kt)("h5",m({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,r.kt)("td",m({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"options")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"{"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"eq?: Eq<T>;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"negate?: boolean;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"}")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"(optional) object specifying the following properties",(0,r.kt)("br",null)," - eq: (default: ",(0,r.kt)("inlineCode",{parentName:"td"},"Eq.objectIs"),") the ",(0,r.kt)("inlineCode",{parentName:"td"},"Eq")," instance to use to test equality of elements",(0,r.kt)("br",null)," - negate: (default: false) when true will negate the given predicate")))),(0,r.kt)("admonition",m({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"await AsyncStream.of(1, 1, 2, 3, 2, 2)\n.transform(AsyncTransformer.distinctPrevious())\n.toArray()\n// => [1, 2, 3, 2]\n")))),(0,r.kt)("h2",m({},{id:"constants"}),"Constants"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"window"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"Returns an async transformer that produces windows/collections of ",(0,r.kt)("inlineCode",{parentName:"td"},"windowSize")," size, each window starting ",(0,r.kt)("inlineCode",{parentName:"td"},"skipAmount")," of elements after the previous, and optionally collected by a custom reducer.")))))}h.isMDXComponent=!0}}]);