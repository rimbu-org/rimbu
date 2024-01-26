"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[2528],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>d});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),c=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},u=function(e){var r=c(e.components);return n.createElement(l.Provider,{value:r},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=c(t),f=a,d=s["".concat(l,".").concat(f)]||s[f]||m[f]||i;return t?n.createElement(d,o(o({ref:r},u),{},{components:t})):n.createElement(d,o({ref:r},u))}));function d(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=f;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p[s]="string"==typeof e?e:a,o[1]=p;for(var c=2;c<i;c++)o[c]=t[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},31450:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>v,contentTitle:()=>y,default:()=>g,frontMatter:()=>d,metadata:()=>b,toc:()=>k});var n=t(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,s=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&u(e,t,r[t]);if(p)for(var t of p(r))c.call(r,t)&&u(e,t,r[t]);return e},m=(e,r)=>i(e,o(r)),f=(e,r)=>{var t={};for(var n in e)l.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&c.call(e,n)&&(t[n]=e[n]);return t};const d={title:"firstWhere",slug:"/rimbu/stream/AsyncReducer/firstWhere/var"},y="type firstWhere",b={unversionedId:"rimbu_stream/AsyncReducer/firstWhere.var",id:"rimbu_stream/AsyncReducer/firstWhere.var",title:"firstWhere",description:"Returns an AsyncReducer that remembers the first input value for which the given pred function returns true.",source:"@site/api/rimbu_stream/AsyncReducer/firstWhere.var.mdx",sourceDirName:"rimbu_stream/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/firstWhere/var",permalink:"/api/rimbu/stream/AsyncReducer/firstWhere/var",draft:!1,tags:[],version:"current",frontMatter:{title:"firstWhere",slug:"/rimbu/stream/AsyncReducer/firstWhere/var"},sidebar:"defaultSidebar",previous:{title:"first",permalink:"/api/rimbu/stream/AsyncReducer/first/var"},next:{title:"isEmpty",permalink:"/api/rimbu/stream/AsyncReducer/isEmpty/var"}},v={},k=[{value:"Definition",id:"definition",level:2}],h={toc:k},O="wrapper";function g(e){var r=e,{components:t}=r,a=f(r,["components"]);return(0,n.kt)(O,m(s(s({},h),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-firstwhere"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type firstWhere")),(0,n.kt)("p",null,"Returns an ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncReducer")," that remembers the first input value for which the given ",(0,n.kt)("inlineCode",{parentName:"p"},"pred")," function returns true."),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"await AsyncStream.from(Stream.range({ amount: 10 })).reduce(AsyncReducer.firstWhere(async v => v > 5)))\n// => 6\n"))),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"firstWhere: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T>(pred: (value: T, index: number) => MaybePromise<boolean>, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"negate?: boolean;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, O>(pred: (value: T, index: number) => MaybePromise<boolean>, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"negate?: boolean;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"otherwise: AsyncOptLazy<O>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}g.isMDXComponent=!0}}]);