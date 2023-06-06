"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[71417],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>y});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),u=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=u(e.components);return n.createElement(l.Provider,{value:t},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),s=u(r),d=a,y=s["".concat(l,".").concat(d)]||s[d]||f[d]||i;return r?n.createElement(y,o(o({ref:t},c),{},{components:r})):n.createElement(y,o({ref:t},c))}));function y(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=d;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[s]="string"==typeof e?e:a,o[1]=p;for(var u=2;u<i;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},90564:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>m,default:()=>P,frontMatter:()=>y,metadata:()=>b,toc:()=>h});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&c(e,r,t[r]);if(p)for(var r of p(t))u.call(t,r)&&c(e,r,t[r]);return e},f=(e,t)=>i(e,o(t)),d=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const y={title:"IsOptional",slug:"/rimbu/deep/Deep/Path/Internal/IsOptional/type"},m="type IsOptional<T,True,False>",b={unversionedId:"rimbu_deep/Deep/Path/Internal/IsOptional.type",id:"rimbu_deep/Deep/Path/Internal/IsOptional.type",title:"IsOptional",description:"Determines whether the given type T is optional, that is, whether it can be null or undefined.",source:"@site/api/rimbu_deep/Deep/Path/Internal/IsOptional.type.mdx",sourceDirName:"rimbu_deep/Deep/Path/Internal",slug:"/rimbu/deep/Deep/Path/Internal/IsOptional/type",permalink:"/api/rimbu/deep/Deep/Path/Internal/IsOptional/type",draft:!1,tags:[],version:"current",frontMatter:{title:"IsOptional",slug:"/rimbu/deep/Deep/Path/Internal/IsOptional/type"},sidebar:"defaultSidebar",previous:{title:"Generic",permalink:"/api/rimbu/deep/Deep/Path/Internal/Generic/type"},next:{title:"MaybeValue",permalink:"/api/rimbu/deep/Deep/Path/Internal/MaybeValue/type"}},O={},h=[{value:"Definition",id:"definition",level:2}],v={toc:h},g="wrapper";function P(e){var t=e,{components:r}=t,a=d(t,["components"]);return(0,n.kt)(g,f(s(s({},v),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-isoptionalttruefalse"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type IsOptional<T,True,False>")),(0,n.kt)("p",null,"Determines whether the given type ",(0,n.kt)("inlineCode",{parentName:"p"},"T")," is optional, that is, whether it can be null or undefined."),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type IsOptional<T, True = true, False = false> = undefined extends T ? True : null extends T ? True : False;")))}P.isMDXComponent=!0}}]);