"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[19718],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>m});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=l(r),d=i,m=s["".concat(c,".").concat(d)]||s[d]||f[d]||a;return r?n.createElement(m,o(o({ref:t},u),{},{components:r})):n.createElement(m,o({ref:t},u))}));function m(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=d;var p={};for(var c in t)hasOwnProperty.call(t,c)&&(p[c]=t[c]);p.originalType=e,p[s]="string"==typeof e?e:i,o[1]=p;for(var l=2;l<a;l++)o[l]=r[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},13156:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>y,default:()=>g,frontMatter:()=>m,metadata:()=>b,toc:()=>v});var n=r(3905),i=Object.defineProperty,a=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))c.call(t,r)&&u(e,r,t[r]);if(p)for(var r of p(t))l.call(t,r)&&u(e,r,t[r]);return e},f=(e,t)=>a(e,o(t)),d=(e,t)=>{var r={};for(var n in e)c.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&l.call(e,n)&&(r[n]=e[n]);return r};const m={title:"TupIndices",slug:"/rimbu/core/Deep/Match/TupIndices/type"},y="type TupIndices<T,C,R>",b={unversionedId:"rimbu_core/Deep/Match/TupIndices.type",id:"rimbu_core/Deep/Match/TupIndices.type",title:"TupIndices",description:"Type used to indicate an object containing matches for tuple indices.",source:"@site/api/rimbu_core/Deep/Match/TupIndices.type.mdx",sourceDirName:"rimbu_core/Deep/Match",slug:"/rimbu/core/Deep/Match/TupIndices/type",permalink:"/api/rimbu/core/Deep/Match/TupIndices/type",draft:!1,tags:[],version:"current",frontMatter:{title:"TupIndices",slug:"/rimbu/core/Deep/Match/TupIndices/type"},sidebar:"defaultSidebar",previous:{title:"TraversalForArr",permalink:"/api/rimbu/core/Deep/Match/TraversalForArr/type"},next:{title:"WithResult",permalink:"/api/rimbu/core/Deep/Match/WithResult/type"}},O={},v=[{value:"Definition",id:"definition",level:2}],h={toc:v},T="wrapper";function g(e){var t=e,{components:r}=t,i=d(t,["components"]);return(0,n.kt)(T,f(s(s({},h),i),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-tupindicestcr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type TupIndices<T,C,R>")),(0,n.kt)("p",null,"Type used to indicate an object containing matches for tuple indices."),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type TupIndices<T, C, R> = {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"[K in "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/core/Tuple/KeysOf/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Tuple.KeysOf")),(0,n.kt)("inlineCode",{parentName:"p"},"<C>]?: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/Entry/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Entry")),(0,n.kt)("inlineCode",{parentName:"p"},"<T[K & keyof T], C[K], T, R>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"} & NotIterable;")))}g.isMDXComponent=!0}}]);