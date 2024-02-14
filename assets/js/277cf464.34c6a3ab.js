"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[91074],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},u=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},l="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},y=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),l=s(r),y=a,f=l["".concat(p,".").concat(y)]||l[y]||m[y]||i;return r?n.createElement(f,o(o({ref:t},u),{},{components:r})):n.createElement(f,o({ref:t},u))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=y;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[l]="string"==typeof e?e:a,o[1]=c;for(var s=2;s<i;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}y.displayName="MDXCreateElement"},35313:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>v,contentTitle:()=>d,default:()=>k,frontMatter:()=>f,metadata:()=>b,toc:()=>O});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,l=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&u(e,r,t[r]);if(c)for(var r of c(t))s.call(t,r)&&u(e,r,t[r]);return e},m=(e,t)=>i(e,o(t)),y=(e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&c)for(var n of c(e))t.indexOf(n)<0&&s.call(e,n)&&(r[n]=e[n]);return r};const f={title:"isEmpty",slug:"/rimbu/stream/AsyncReducer/isEmpty/var"},d="type isEmpty",b={unversionedId:"rimbu_stream/async/AsyncReducer/isEmpty.var",id:"rimbu_stream/async/AsyncReducer/isEmpty.var",title:"isEmpty",description:"An AsyncReducer that outputs true if no input values are received, false otherwise.",source:"@site/api/rimbu_stream/async/AsyncReducer/isEmpty.var.mdx",sourceDirName:"rimbu_stream/async/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/isEmpty/var",permalink:"/api/rimbu/stream/AsyncReducer/isEmpty/var",draft:!1,tags:[],version:"current",frontMatter:{title:"isEmpty",slug:"/rimbu/stream/AsyncReducer/isEmpty/var"},sidebar:"defaultSidebar",previous:{title:"groupBy",permalink:"/api/rimbu/stream/AsyncReducer/groupBy/var"},next:{title:"last",permalink:"/api/rimbu/stream/AsyncReducer/last/var"}},v={},O=[{value:"Definition",id:"definition",level:2}],g={toc:O},E="wrapper";function k(e){var t=e,{components:r}=t,a=y(t,["components"]);return(0,n.kt)(E,m(l(l({},g),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",l({},{id:"type-isempty"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type isEmpty")),(0,n.kt)("p",null,"An ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncReducer")," that outputs true if no input values are received, false otherwise."),(0,n.kt)("admonition",l({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",l({parentName:"pre"},{className:"language-ts"}),"await AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty))\n// => false\n"))),(0,n.kt)("h2",l({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"isEmpty: "),(0,n.kt)("a",l({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<any, boolean>")))}k.isMDXComponent=!0}}]);