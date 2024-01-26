"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[54808],{3905:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>u});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=n.createContext({}),m=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},s=function(e){var t=m(e.components);return n.createElement(l.Provider,{value:t},e.children)},y="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),y=m(a),d=r,u=y["".concat(l,".").concat(d)]||y[d]||c[d]||i;return a?n.createElement(u,o(o({ref:t},s),{},{components:a})):n.createElement(u,o({ref:t},s))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,o=new Array(i);o[0]=d;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[y]="string"==typeof e?e:r,o[1]=p;for(var m=2;m<i;m++)o[m]=a[m];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},45885:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>b,contentTitle:()=>k,default:()=>g,frontMatter:()=>u,metadata:()=>N,toc:()=>f});var n=a(3905),r=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,s=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,y=(e,t)=>{for(var a in t||(t={}))l.call(t,a)&&s(e,a,t[a]);if(p)for(var a of p(t))m.call(t,a)&&s(e,a,t[a]);return e},c=(e,t)=>i(e,o(t)),d=(e,t)=>{var a={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&m.call(e,n)&&(a[n]=e[n]);return a};const u={title:"AsyncOptLazy (namespace)",slug:"/rimbu/common/AsyncOptLazy/namespace"},k="namespace AsyncOptLazy",N={unversionedId:"rimbu_common/AsyncOptLazy/index",id:"rimbu_common/AsyncOptLazy/index",title:"AsyncOptLazy (namespace)",description:"A potentially lazy and/or asynchronous value of type T.",source:"@site/api/rimbu_common/AsyncOptLazy/index.mdx",sourceDirName:"rimbu_common/AsyncOptLazy",slug:"/rimbu/common/AsyncOptLazy/namespace",permalink:"/api/rimbu/common/AsyncOptLazy/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"AsyncOptLazy (namespace)",slug:"/rimbu/common/AsyncOptLazy/namespace"},sidebar:"defaultSidebar",previous:{title:"AsyncCollectFun",permalink:"/api/rimbu/common/AsyncCollectFun/type"},next:{title:"AsyncOptLazy",permalink:"/api/rimbu/common/AsyncOptLazy/type"}},b={},f=[{value:"Functions",id:"functions",level:2},{value:"<code>toMaybePromise</code>",id:"tomaybepromise",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:5},{value:"Parameters",id:"parameters",level:4},{value:"<code>toPromise</code>",id:"topromise",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Type parameters",id:"type-parameters-1",level:5},{value:"Parameters",id:"parameters-1",level:4}],O={toc:f},h="wrapper";function g(e){var t=e,{components:a}=t,r=d(t,["components"]);return(0,n.kt)(h,c(y(y({},O),r),{components:a,mdxType:"MDXLayout"}),(0,n.kt)("h1",y({},{id:"namespace-asyncoptlazy"}),(0,n.kt)("inlineCode",{parentName:"h1"},"namespace AsyncOptLazy")),(0,n.kt)("p",null,"A potentially lazy and/or asynchronous value of type T."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion type:")," ",(0,n.kt)("a",y({parentName:"p"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy<T,A>"))),(0,n.kt)("h2",y({},{id:"functions"}),"Functions"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",y({},{id:"tomaybepromise"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toMaybePromise")),(0,n.kt)("p",null,"Returns the value or promised value contained in an ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncOptLazy")," instance of type T.")),(0,n.kt)("h4",y({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"function toMaybePromise<T, A extends any[] = []>(optLazy: "),(0,n.kt)("a",y({parentName:"p"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, A>, ...args: A): "),(0,n.kt)("a",y({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,n.kt)("h5",y({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"the value type")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),"A"),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"(default: []) types of the argument array that can be passed in the lazy case")))),(0,n.kt)("h4",y({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"optLazy")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("a",y({parentName:"td"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,n.kt)("inlineCode",{parentName:"td"},"<T, A>")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"the ",(0,n.kt)("inlineCode",{parentName:"td"},"AsyncOptLazy")," value of type T")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"args")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"A")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"when needed, the extra arguments to pass to the lazy invocation")))),(0,n.kt)("admonition",y({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",y({parentName:"pre"},{className:"language-ts"}),"AsyncOptLazy.toMaybePromise(1)              // => 1\nAsyncOptLazy.toMaybePromise(() => 1)        // => 1\nAsyncOptLazy.toMaybePromise(() => () => 1)  // => () => 1\nAsyncOptLazy.toMaybePromise(async () => 1)  // => Promise(1)\nAsyncOptLazy.toMaybePromise(Promise.resolve(1))  // => Promise(1)\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",y({},{id:"topromise"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toPromise")),(0,n.kt)("p",null,"Returns the value contained in an ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncOptLazy")," instance of type T as a promise.")),(0,n.kt)("h4",y({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"function toPromise<T, A extends any[] = []>(optLazy: "),(0,n.kt)("a",y({parentName:"p"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, A>, ...args: A): Promise<T>;"))),(0,n.kt)("h5",y({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"the value type")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),"A"),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"(default: []) types of the argument array that can be passed in the lazy case")))),(0,n.kt)("h4",y({},{id:"parameters-1"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",y({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"optLazy")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("a",y({parentName:"td"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,n.kt)("inlineCode",{parentName:"td"},"<T, A>")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"the ",(0,n.kt)("inlineCode",{parentName:"td"},"AsyncOptLazy")," value of type T")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"args")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"A")),(0,n.kt)("td",y({parentName:"tr"},{align:null}),"when needed, the extra arguments to pass to the lazy invocation")))),(0,n.kt)("admonition",y({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",y({parentName:"pre"},{className:"language-ts"}),"AsyncOptLazy.toPromise(1)              // => Promise(1)\nAsyncOptLazy.toPromise(() => 1)        // => Promise(1)\nAsyncOptLazy.toPromise(() => () => 1)  // => Promise(() => 1)\nAsyncOptLazy.toPromise(async () => 1)  // => Promise(1)\nAsyncOptLazy.toPromise(Promise.resolve(1))  // => Promise(1)\n")))))}g.isMDXComponent=!0}}]);