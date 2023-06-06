"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[63401],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>f});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var a=n.createContext({}),c=function(e){var t=n.useContext(a),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(a.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},y=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,a=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=c(r),y=i,f=s["".concat(a,".").concat(y)]||s[y]||m[y]||o;return r?n.createElement(f,l(l({ref:t},u),{},{components:r})):n.createElement(f,l({ref:t},u))}));function f(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,l=new Array(o);l[0]=y;var p={};for(var a in t)hasOwnProperty.call(t,a)&&(p[a]=t[a]);p.originalType=e,p[s]="string"==typeof e?e:i,l[1]=p;for(var c=2;c<o;c++)l[c]=r[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}y.displayName="MDXCreateElement"},53319:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>b,default:()=>E,frontMatter:()=>f,metadata:()=>d,toc:()=>h});var n=r(3905),i=Object.defineProperty,o=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,a=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))a.call(t,r)&&u(e,r,t[r]);if(p)for(var r of p(t))c.call(t,r)&&u(e,r,t[r]);return e},m=(e,t)=>o(e,l(t)),y=(e,t)=>{var r={};for(var n in e)a.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const f={title:"WithElem",slug:"/rimbu/collection-types/set-custom/WithElem/type"},b="type WithElem<Tp,T>",d={unversionedId:"rimbu_collection-types/set-custom/WithElem.type",id:"rimbu_collection-types/set-custom/WithElem.type",title:"WithElem",description:"A utility type to set the element type to given type T.",source:"@site/api/rimbu_collection-types/set-custom/WithElem.type.mdx",sourceDirName:"rimbu_collection-types/set-custom",slug:"/rimbu/collection-types/set-custom/WithElem/type",permalink:"/api/rimbu/collection-types/set-custom/WithElem/type",draft:!1,tags:[],version:"current",frontMatter:{title:"WithElem",slug:"/rimbu/collection-types/set-custom/WithElem/type"},sidebar:"defaultSidebar",previous:{title:"VariantSetBase<T,Tp>",permalink:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface"},next:{title:"WithKeyValue",permalink:"/api/rimbu/collection-types/set-custom/WithKeyValue/type"}},O={},h=[{value:"Definition",id:"definition",level:2}],v={toc:h},g="wrapper";function E(e){var t=e,{components:r}=t,i=y(t,["components"]);return(0,n.kt)(g,m(s(s({},v),i),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-withelemtpt"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type WithElem<Tp,T>")),(0,n.kt)("p",null,"A utility type to set the element type to given type T."),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"export type WithElem<Tp, T> = "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/Elem/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"Elem")),(0,n.kt)("inlineCode",{parentName:"p"},"<T> & Tp;")))}E.isMDXComponent=!0}}]);