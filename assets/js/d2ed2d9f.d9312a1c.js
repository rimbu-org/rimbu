"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[37165],{3905:(e,r,t)=>{t.d(r,{Zo:()=>s,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function c(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var u=n.createContext({}),l=function(e){var r=n.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},s=function(e){var r=l(e.components);return n.createElement(u.Provider,{value:r},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},m=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,u=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),p=l(t),m=a,f=p["".concat(u,".").concat(m)]||p[m]||d[m]||o;return t?n.createElement(f,i(i({ref:r},s),{},{components:t})):n.createElement(f,i({ref:r},s))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=m;var c={};for(var u in r)hasOwnProperty.call(r,u)&&(c[u]=r[u]);c.originalType=e,c[p]="string"==typeof e?e:a,i[1]=c;for(var l=2;l<o;l++)i[l]=t[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}m.displayName="MDXCreateElement"},656:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>v,contentTitle:()=>y,default:()=>w,frontMatter:()=>f,metadata:()=>b,toc:()=>O});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,s=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,p=(e,r)=>{for(var t in r||(r={}))u.call(r,t)&&s(e,t,r[t]);if(c)for(var t of c(r))l.call(r,t)&&s(e,t,r[t]);return e},d=(e,r)=>o(e,i(r)),m=(e,r)=>{var t={};for(var n in e)u.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&c)for(var n of c(e))r.indexOf(n)<0&&l.call(e,n)&&(t[n]=e[n]);return t};const f={title:"and",slug:"/rimbu/stream/AsyncReducer/and/var"},y="type and",b={unversionedId:"rimbu_stream/AsyncReducer/and.var",id:"rimbu_stream/AsyncReducer/and.var",title:"and",description:"Returns an AsyncReducer that takes boolean values and outputs true if all input values are true, and false otherwise.",source:"@site/api/rimbu_stream/AsyncReducer/and.var.mdx",sourceDirName:"rimbu_stream/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/and/var",permalink:"/api/rimbu/stream/AsyncReducer/and/var",draft:!1,tags:[],version:"current",frontMatter:{title:"and",slug:"/rimbu/stream/AsyncReducer/and/var"},sidebar:"defaultSidebar",previous:{title:"ReducerHaltedError",permalink:"/api/rimbu/stream/AsyncReducer/ReducerHaltedError/class"},next:{title:"average",permalink:"/api/rimbu/stream/AsyncReducer/average/var"}},v={},O=[{value:"Definition",id:"definition",level:2}],g={toc:O},k="wrapper";function w(e){var r=e,{components:t}=r,a=m(r,["components"]);return(0,n.kt)(k,d(p(p({},g),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",p({},{id:"type-and"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type and")),(0,n.kt)("p",null,"Returns an ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncReducer")," that takes boolean values and outputs true if all input values are true, and false otherwise."),(0,n.kt)("admonition",p({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",p({parentName:"pre"},{className:"language-ts"}),"await AsyncStream.of(true, false, true)).reduce(AsyncReducer.and))\n// => false\n"))),(0,n.kt)("h2",p({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"and: "),(0,n.kt)("a",p({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<boolean, boolean>")))}w.isMDXComponent=!0}}]);