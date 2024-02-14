"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[22480],{3905:(e,r,t)=>{t.d(r,{Zo:()=>m,kt:()=>d});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function l(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=n.createContext({}),s=function(e){var r=n.useContext(p),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},m=function(e){var r=s(e.components);return n.createElement(p.Provider,{value:r},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),c=s(t),f=a,d=c["".concat(p,".").concat(f)]||c[f]||u[f]||i;return t?n.createElement(d,o(o({ref:r},m),{},{components:t})):n.createElement(d,o({ref:r},m))}));function d(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=f;var l={};for(var p in r)hasOwnProperty.call(r,p)&&(l[p]=r[p]);l.originalType=e,l[c]="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=t[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},53346:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>k,contentTitle:()=>y,default:()=>h,frontMatter:()=>d,metadata:()=>b,toc:()=>v});var n=t(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,m=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,c=(e,r)=>{for(var t in r||(r={}))p.call(r,t)&&m(e,t,r[t]);if(l)for(var t of l(r))s.call(r,t)&&m(e,t,r[t]);return e},u=(e,r)=>i(e,o(r)),f=(e,r)=>{var t={};for(var n in e)p.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&l)for(var n of l(e))r.indexOf(n)<0&&s.call(e,n)&&(t[n]=e[n]);return t};const d={title:"filter",slug:"/rimbu/stream/AsyncTransformer/filter/var"},y="type filter",b={unversionedId:"rimbu_stream/AsyncTransformer/filter.var",id:"rimbu_stream/AsyncTransformer/filter.var",title:"filter",description:"Returns an async transformer that filters elements from the input stream based on the provided predicate function.",source:"@site/api/rimbu_stream/AsyncTransformer/filter.var.mdx",sourceDirName:"rimbu_stream/AsyncTransformer",slug:"/rimbu/stream/AsyncTransformer/filter/var",permalink:"/api/rimbu/stream/AsyncTransformer/filter/var",draft:!1,tags:[],version:"current",frontMatter:{title:"filter",slug:"/rimbu/stream/AsyncTransformer/filter/var"},sidebar:"defaultSidebar",previous:{title:"NonEmpty",permalink:"/api/rimbu/stream/AsyncTransformer/NonEmpty/type"},next:{title:"window",permalink:"/api/rimbu/stream/AsyncTransformer/window/var"}},k={},v=[{value:"Definition",id:"definition",level:2}],T={toc:v},O="wrapper";function h(e){var r=e,{components:t}=r,a=f(r,["components"]);return(0,n.kt)(O,u(c(c({},T),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",c({},{id:"type-filter"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type filter")),(0,n.kt)("p",null,"Returns an async transformer that filters elements from the input stream based on the provided predicate function."),(0,n.kt)("admonition",c({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"if the predicate is a type guard, the return type is automatically inferred")),(0,n.kt)("h2",c({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"filter: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, TF extends T>(pred: (value: T, index: number, halt: () => void) => value is TF, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"negate?: false "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncTransformer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncTransformer")),(0,n.kt)("inlineCode",{parentName:"p"},"<TF>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, TF extends T>(pred: (value: T, index: number, halt: () => void) => value is TF, options: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"negate: true;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncTransformer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncTransformer")),(0,n.kt)("inlineCode",{parentName:"p"},"<Exclude<T, TF>>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T>(pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"negate?: boolean "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncTransformer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncTransformer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}h.isMDXComponent=!0}}]);