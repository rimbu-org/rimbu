"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[79959],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>f});var n=r(67294);function c(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){c(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,c=function(e,t){if(null==e)return{};var r,n,c={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(c[r]=e[r]);return c}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(c[r]=e[r])}return c}var p=n.createContext({}),u=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},s=function(e){var t=u(e.components);return n.createElement(p.Provider,{value:t},e.children)},l="mdxType",y={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,c=e.mdxType,a=e.originalType,p=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),l=u(r),m=c,f=l["".concat(p,".").concat(m)]||l[m]||y[m]||a;return r?n.createElement(f,o(o({ref:t},s),{},{components:r})):n.createElement(f,o({ref:t},s))}));function f(e,t){var r=arguments,c=t&&t.mdxType;if("string"==typeof e||c){var a=r.length,o=new Array(a);o[0]=m;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[l]="string"==typeof e?e:c,o[1]=i;for(var u=2;u<a;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},61993:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>d,default:()=>h,frontMatter:()=>f,metadata:()=>b,toc:()=>v});var n=r(3905),c=Object.defineProperty,a=Object.defineProperties,o=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?c(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,l=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&s(e,r,t[r]);if(i)for(var r of i(t))u.call(t,r)&&s(e,r,t[r]);return e},y=(e,t)=>a(e,o(t)),m=(e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&i)for(var n of i(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const f={title:"Accept",slug:"/rimbu/stream/AsyncReducer/Accept/type"},d="type Accept<I,O>",b={unversionedId:"rimbu_stream/AsyncReducer/Accept.type",id:"rimbu_stream/AsyncReducer/Accept.type",title:"Accept",description:"Convenience type to allow synchronous reducers to be supplied to functions that accept async reducers.",source:"@site/api/rimbu_stream/AsyncReducer/Accept.type.mdx",sourceDirName:"rimbu_stream/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/Accept/type",permalink:"/api/rimbu/stream/AsyncReducer/Accept/type",draft:!1,tags:[],version:"current",frontMatter:{title:"Accept",slug:"/rimbu/stream/AsyncReducer/Accept/type"},sidebar:"defaultSidebar",previous:{title:"AsyncReducer (namespace)",permalink:"/api/rimbu/stream/AsyncReducer/namespace"},next:{title:"Base<I,O,S>",permalink:"/api/rimbu/stream/AsyncReducer/Base/class"}},O={},v=[{value:"Definition",id:"definition",level:2}],A={toc:v},g="wrapper";function h(e){var t=e,{components:r}=t,c=m(t,["components"]);return(0,n.kt)(g,y(l(l({},A),c),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",l({},{id:"type-acceptio"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type Accept<I,O>")),(0,n.kt)("p",null,"Convenience type to allow synchronous reducers to be supplied to functions that accept async reducers."),(0,n.kt)("h2",l({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type Accept<I, O> = "),(0,n.kt)("a",l({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O> "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," Reducer<I, O>;")))}h.isMDXComponent=!0}}]);