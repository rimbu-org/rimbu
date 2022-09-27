"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[65190],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>y});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var l=n.createContext({}),u=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},c=function(e){var t=u(e.components);return n.createElement(l.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),s=u(r),y=i,m=s["".concat(l,".").concat(y)]||s[y]||f[y]||o;return r?n.createElement(m,p(p({ref:t},c),{},{components:r})):n.createElement(m,p({ref:t},c))}));function y(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,p=new Array(o);p[0]=s;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a.mdxType="string"==typeof e?e:i,p[1]=a;for(var u=2;u<o;u++)p[u]=r[u];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},2678:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>y,default:()=>v,frontMatter:()=>s,metadata:()=>m,toc:()=>b});var n=r(3905),i=Object.defineProperty,o=Object.defineProperties,p=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,f=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&c(e,r,t[r]);if(a)for(var r of a(t))u.call(t,r)&&c(e,r,t[r]);return e};const s={title:"KeysOf",slug:"/rimbu/deep/Tuple/KeysOf/type"},y="type KeysOf<T>",m={unversionedId:"rimbu_deep/Tuple/KeysOf.type",id:"rimbu_deep/Tuple/KeysOf.type",title:"KeysOf",description:"Returns the indices/keys that are in a tuple.",source:"@site/api/rimbu_deep/Tuple/KeysOf.type.mdx",sourceDirName:"rimbu_deep/Tuple",slug:"/rimbu/deep/Tuple/KeysOf/type",permalink:"/api/rimbu/deep/Tuple/KeysOf/type",draft:!1,tags:[],version:"current",frontMatter:{title:"KeysOf",slug:"/rimbu/deep/Tuple/KeysOf/type"},sidebar:"defaultSidebar",previous:{title:"IsTuple",permalink:"/api/rimbu/deep/Tuple/IsTuple/type"},next:{title:"NonEmptySource",permalink:"/api/rimbu/deep/Tuple/NonEmptySource/type"}},d={},b=[{value:"Definition",id:"definition",level:2}],O={toc:b};function v(e){var t,r=e,{components:i}=r,c=((e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&a)for(var n of a(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=f(f({},O),c),o(t,p({components:i,mdxType:"MDXLayout"}))),(0,n.kt)("h1",f({},{id:"type-keysoft"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type KeysOf<T>")),(0,n.kt)("p",null,"Returns the indices/keys that are in a tuple."),(0,n.kt)("h2",f({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type KeysOf<T> = {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"[K in keyof T]: K;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}[keyof T & number];")))}v.isMDXComponent=!0}}]);