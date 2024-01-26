"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[73602],{3905:(e,t,r)=>{r.d(t,{Zo:()=>l,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var u=n.createContext({}),p=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},l=function(e){var t=p(e.components);return n.createElement(u.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,u=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),s=p(r),d=a,f=s["".concat(u,".").concat(d)]||s[d]||m[d]||o;return r?n.createElement(f,i(i({ref:t},l),{},{components:r})):n.createElement(f,i({ref:t},l))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=d;var c={};for(var u in t)hasOwnProperty.call(t,u)&&(c[u]=t[u]);c.originalType=e,c[s]="string"==typeof e?e:a,i[1]=c;for(var p=2;p<o;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},85378:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>v,contentTitle:()=>y,default:()=>h,frontMatter:()=>f,metadata:()=>b,toc:()=>O});var n=r(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,l=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))u.call(t,r)&&l(e,r,t[r]);if(c)for(var r of c(t))p.call(t,r)&&l(e,r,t[r]);return e},m=(e,t)=>o(e,i(t)),d=(e,t)=>{var r={};for(var n in e)u.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&c)for(var n of c(e))t.indexOf(n)<0&&p.call(e,n)&&(r[n]=e[n]);return r};const f={title:"count",slug:"/rimbu/stream/AsyncReducer/count/var"},y="type count",b={unversionedId:"rimbu_stream/AsyncReducer/count.var",id:"rimbu_stream/AsyncReducer/count.var",title:"count",description:"Returns an AsyncReducer that remembers the amount of input items provided.",source:"@site/api/rimbu_stream/AsyncReducer/count.var.mdx",sourceDirName:"rimbu_stream/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/count/var",permalink:"/api/rimbu/stream/AsyncReducer/count/var",draft:!1,tags:[],version:"current",frontMatter:{title:"count",slug:"/rimbu/stream/AsyncReducer/count/var"},sidebar:"defaultSidebar",previous:{title:"average",permalink:"/api/rimbu/stream/AsyncReducer/average/var"},next:{title:"first",permalink:"/api/rimbu/stream/AsyncReducer/first/var"}},v={},O=[{value:"Definition",id:"definition",level:2}],k={toc:O},g="wrapper";function h(e){var t=e,{components:r}=t,a=d(t,["components"]);return(0,n.kt)(g,m(s(s({},k),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-count"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type count")),(0,n.kt)("p",null,"Returns an ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncReducer")," that remembers the amount of input items provided."),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"const stream = AsyncStream.from(Stream.range({ amount: 10 }))\nconsole.log(await stream.reduce(AsyncReducer.count()))\n// => 10\nconsole.log(await stream.reduce(AsyncReducer.count(async v => v < 5)))\n// => 5\n"))),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"count: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"(): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<never, number>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T>(pred: (value: T, index: number) => MaybePromise<boolean>, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"negate?: boolean;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, number>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}h.isMDXComponent=!0}}]);