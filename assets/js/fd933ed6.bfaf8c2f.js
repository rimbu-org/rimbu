"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[58255],{3905:(e,r,t)=>{t.d(r,{Zo:()=>l,kt:()=>y});var n=t(67294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var c=n.createContext({}),m=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},l=function(e){var r=m(e.components);return n.createElement(c.Provider,{value:r},e.children)},u="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},s=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),u=m(t),s=o,y=u["".concat(c,".").concat(s)]||u[s]||f[s]||a;return t?n.createElement(y,i(i({ref:r},l),{},{components:t})):n.createElement(y,i({ref:r},l))}));function y(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var a=t.length,i=new Array(a);i[0]=s;var p={};for(var c in r)hasOwnProperty.call(r,c)&&(p[c]=r[c]);p.originalType=e,p[u]="string"==typeof e?e:o,i[1]=p;for(var m=2;m<a;m++)i[m]=t[m];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}s.displayName="MDXCreateElement"},72937:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>O,contentTitle:()=>b,default:()=>g,frontMatter:()=>y,metadata:()=>d,toc:()=>v});var n=t(3905),o=Object.defineProperty,a=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,l=(e,r,t)=>r in e?o(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,u=(e,r)=>{for(var t in r||(r={}))c.call(r,t)&&l(e,t,r[t]);if(p)for(var t of p(r))m.call(r,t)&&l(e,t,r[t]);return e},f=(e,r)=>a(e,i(r)),s=(e,r)=>{var t={};for(var n in e)c.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&m.call(e,n)&&(t[n]=e[n]);return t};const y={title:"NonEmpty",slug:"/rimbu/core/Transformer_2/NonEmpty/type"},b="type NonEmpty<T,R>",d={unversionedId:"rimbu_core/Transformer_2/NonEmpty.type",id:"rimbu_core/Transformer_2/NonEmpty.type",title:"NonEmpty",description:"A Reducer that produces instances of StreamSource.NonEmpty.",source:"@site/api/rimbu_core/Transformer_2/NonEmpty.type.mdx",sourceDirName:"rimbu_core/Transformer_2",slug:"/rimbu/core/Transformer_2/NonEmpty/type",permalink:"/api/rimbu/core/Transformer_2/NonEmpty/type",draft:!1,tags:[],version:"current",frontMatter:{title:"NonEmpty",slug:"/rimbu/core/Transformer_2/NonEmpty/type"},sidebar:"defaultSidebar",previous:{title:"Transformer_2 (namespace)",permalink:"/api/rimbu/core/Transformer_2/namespace"},next:{title:"window",permalink:"/api/rimbu/core/Transformer_2/window/var"}},O={},v=[{value:"Definition",id:"definition",level:2}],E={toc:v},N="wrapper";function g(e){var r=e,{components:t}=r,o=s(r,["components"]);return(0,n.kt)(N,f(u(u({},E),o),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",u({},{id:"type-nonemptytr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type NonEmpty<T,R>")),(0,n.kt)("p",null,"A Reducer that produces instances of ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource.NonEmpty"),"."),(0,n.kt)("h2",u({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type NonEmpty<T, R = T> = Reducer<T, "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/core/StreamSource/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<R>>;")))}g.isMDXComponent=!0}}]);