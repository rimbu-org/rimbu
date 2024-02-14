"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[83272],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>f});var n=r(67294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var i=n.createContext({}),m=function(e){var t=n.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},s=function(e){var t=m(e.components);return n.createElement(i.Provider,{value:t},e.children)},y="mdxType",l={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),y=m(r),u=o,f=y["".concat(i,".").concat(u)]||y[u]||l[u]||a;return r?n.createElement(f,p(p({ref:t},s),{},{components:r})):n.createElement(f,p({ref:t},s))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,p=new Array(a);p[0]=u;var c={};for(var i in t)hasOwnProperty.call(t,i)&&(c[i]=t[i]);c.originalType=e,c[y]="string"==typeof e?e:o,p[1]=c;for(var m=2;m<a;m++)p[m]=r[m];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},7341:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>b,default:()=>A,frontMatter:()=>f,metadata:()=>d,toc:()=>v});var n=r(3905),o=Object.defineProperty,a=Object.defineProperties,p=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?o(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,y=(e,t)=>{for(var r in t||(t={}))i.call(t,r)&&s(e,r,t[r]);if(c)for(var r of c(t))m.call(t,r)&&s(e,r,t[r]);return e},l=(e,t)=>a(e,p(t)),u=(e,t)=>{var r={};for(var n in e)i.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&c)for(var n of c(e))t.indexOf(n)<0&&m.call(e,n)&&(r[n]=e[n]);return r};const f={title:"AcceptNonEmpty",slug:"/rimbu/stream/AsyncTransformer/AcceptNonEmpty/type"},b="type AcceptNonEmpty<T,R>",d={unversionedId:"rimbu_stream/AsyncTransformer/AcceptNonEmpty.type",id:"rimbu_stream/AsyncTransformer/AcceptNonEmpty.type",title:"AcceptNonEmpty",description:"Convenience type to allow non-empty synchronous transformers to be supplied to functions that accept non-empty async transformers.",source:"@site/api/rimbu_stream/AsyncTransformer/AcceptNonEmpty.type.mdx",sourceDirName:"rimbu_stream/AsyncTransformer",slug:"/rimbu/stream/AsyncTransformer/AcceptNonEmpty/type",permalink:"/api/rimbu/stream/AsyncTransformer/AcceptNonEmpty/type",draft:!1,tags:[],version:"current",frontMatter:{title:"AcceptNonEmpty",slug:"/rimbu/stream/AsyncTransformer/AcceptNonEmpty/type"},sidebar:"defaultSidebar",previous:{title:"Accept",permalink:"/api/rimbu/stream/AsyncTransformer/Accept/type"},next:{title:"NonEmpty",permalink:"/api/rimbu/stream/AsyncTransformer/NonEmpty/type"}},O={},v=[{value:"Definition",id:"definition",level:2}],N={toc:v},E="wrapper";function A(e){var t=e,{components:r}=t,o=u(t,["components"]);return(0,n.kt)(E,l(y(y({},N),o),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",y({},{id:"type-acceptnonemptytr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type AcceptNonEmpty<T,R>")),(0,n.kt)("p",null,"Convenience type to allow non-empty synchronous transformers to be supplied to functions that accept non-empty async transformers."),(0,n.kt)("h2",y({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type AcceptNonEmpty<T, R> = "),(0,n.kt)("a",y({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncTransformer/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncTransformer.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, R> "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",y({parentName:"p"},{href:"/api/rimbu/stream/Transformer/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Transformer.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, R>;")))}A.isMDXComponent=!0}}]);