"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[63496],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),u=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=u(e.components);return n.createElement(l.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=u(r),s=a,f=d["".concat(l,".").concat(s)]||d[s]||m[s]||i;return r?n.createElement(f,o(o({ref:t},c),{},{components:r})):n.createElement(f,o({ref:t},c))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=s;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[d]="string"==typeof e?e:a,o[1]=p;for(var u=2;u<i;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},56777:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>v,contentTitle:()=>b,default:()=>h,frontMatter:()=>f,metadata:()=>k,toc:()=>y});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,d=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&c(e,r,t[r]);if(p)for(var r of p(t))u.call(t,r)&&c(e,r,t[r]);return e},m=(e,t)=>i(e,o(t)),s=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const f={title:"partition",slug:"/rimbu/stream/Reducer/partition/var"},b="type partition",k={unversionedId:"rimbu_stream/Reducer/partition.var",id:"rimbu_stream/Reducer/partition.var",title:"partition",description:"Returns a Reducer that splits the incoming values into two separate outputs based on the given pred predicate. Values for which the predicate is true are fed into the collectorTrue reducer, and other values are fed into the collectorFalse instance. If no collectors are provided the values are collected into arrays.",source:"@site/api/rimbu_stream/Reducer/partition.var.mdx",sourceDirName:"rimbu_stream/Reducer",slug:"/rimbu/stream/Reducer/partition/var",permalink:"/api/rimbu/stream/Reducer/partition/var",draft:!1,tags:[],version:"current",frontMatter:{title:"partition",slug:"/rimbu/stream/Reducer/partition/var"},sidebar:"defaultSidebar",previous:{title:"or",permalink:"/api/rimbu/stream/Reducer/or/var"},next:{title:"pipe",permalink:"/api/rimbu/stream/Reducer/pipe/var"}},v={},y=[{value:"Definition",id:"definition",level:2}],N={toc:y},T="wrapper";function h(e){var t=e,{components:r}=t,a=s(t,["components"]);return(0,n.kt)(T,m(d(d({},N),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",d({},{id:"type-partition"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type partition")),(0,n.kt)("p",null,"Returns a ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that splits the incoming values into two separate outputs based on the given ",(0,n.kt)("inlineCode",{parentName:"p"},"pred")," predicate. Values for which the predicate is true are fed into the ",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue")," reducer, and other values are fed into the ",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse")," instance. If no collectors are provided the values are collected into arrays."),(0,n.kt)("admonition",d({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"if the predicate is a type guard, the return type is automatically inferred")),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"Stream.of(1, 2, 3).partition((v) => v % 2 === 0)\n// => [[2], [1, 3]]\nStream.of<number | string>(1, 'a', 'b', 2)\n.partition((v): v is string => typeof v === 'string')\n// => [['a', 'b'], [1, 2]]\n// return type is: [string[], number[]]\nStream.of(1, 2, 3, 4).partition(\n(v) => v % 2 === 0,\n{ collectorTrue: Reducer.toJSSet(), collectorFalse: Reducer.sum }\n)\n// => [Set(2, 4), 4]\n"))),(0,n.kt)("h2",d({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"partition: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, T2 extends T, RT, RF = RT>(pred: (value: T, index: number) => value is T2, options: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T2, RT>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<Exclude<T, T2>, RF>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: RT, false: RF]>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, T2 extends T>(pred: (value: T, index: number) => value is T2, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: T2[], false: Exclude<T, T2>[]]>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, RT, RF = RT>(pred: (value: T, index: number) => boolean, options: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, RT>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, RF>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: RT, false: RF]>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T>(pred: (value: T, index: number) => boolean, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorTrue?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"collectorFalse?: undefined;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, [true: T[], false: T[]]>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}h.isMDXComponent=!0}}]);