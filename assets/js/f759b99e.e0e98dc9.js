"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[88152],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>y});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},s="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=c(r),m=a,y=s["".concat(l,".").concat(m)]||s[m]||d[m]||i;return r?n.createElement(y,o(o({ref:t},u),{},{components:r})):n.createElement(y,o({ref:t},u))}));function y(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[s]="string"==typeof e?e:a,o[1]=p;for(var c=2;c<i;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},69146:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>k,contentTitle:()=>f,default:()=>h,frontMatter:()=>y,metadata:()=>b,toc:()=>v});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&u(e,r,t[r]);if(p)for(var r of p(t))c.call(t,r)&&u(e,r,t[r]);return e},d=(e,t)=>i(e,o(t)),m=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const y={title:"partition",slug:"/rimbu/stream/AsyncReducer/partition/var"},f="type partition",b={unversionedId:"rimbu_stream/async/AsyncReducer/partition.var",id:"rimbu_stream/async/AsyncReducer/partition.var",title:"partition",description:"Returns an AsyncReducer that splits the incoming values into two separate outputs based on the given pred predicate. Values for which the predicate is true are fed into the collectorTrue reducer, and other values are fed into the collectorFalse instance. If no collectors are provided the values are collected into arrays.",source:"@site/api/rimbu_stream/async/AsyncReducer/partition.var.mdx",sourceDirName:"rimbu_stream/async/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/partition/var",permalink:"/api/rimbu/stream/AsyncReducer/partition/var",draft:!1,tags:[],version:"current",frontMatter:{title:"partition",slug:"/rimbu/stream/AsyncReducer/partition/var"},sidebar:"defaultSidebar",previous:{title:"nonEmpty",permalink:"/api/rimbu/stream/AsyncReducer/nonEmpty/var"},next:{title:"race",permalink:"/api/rimbu/stream/AsyncReducer/race/var"}},k={},v=[{value:"Definition",id:"definition",level:2}],N={toc:v},T="wrapper";function h(e){var t=e,{components:r}=t,a=m(t,["components"]);return(0,n.kt)(T,d(s(s({},N),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-partition"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type partition")),(0,n.kt)("p",null,"Returns an ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncReducer")," that splits the incoming values into two separate outputs based on the given ",(0,n.kt)("inlineCode",{parentName:"p"},"pred")," predicate. Values for which the predicate is true are fed into the ",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue")," reducer, and other values are fed into the ",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse")," instance. If no collectors are provided the values are collected into arrays."),(0,n.kt)("admonition",s({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"if the predicate is a type guard, the return type is automatically inferred ```")),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"partition: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, T2 extends T, RT, RF = RT>(pred: (value: T, index: number) => value is T2, options: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<T2, RT>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<Exclude<T, T2>, RF>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: RT, false: RF]>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, T2 extends T>(pred: (value: T, index: number) => value is T2, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: T2[], false: Exclude<T, T2>[]]>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, RT, RF = RT>(pred: (value: T, index: number) => MaybePromise<boolean>, options: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, RT>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, RF>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: RT, false: RF]>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T>(pred: (value: T, index: number) => MaybePromise<boolean>, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: T[], false: T[]]>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}h.isMDXComponent=!0}}]);