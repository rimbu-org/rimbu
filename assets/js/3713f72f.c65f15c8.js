"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[21135],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>y});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},b="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),b=c(r),s=a,y=b["".concat(l,".").concat(s)]||b[s]||f[s]||o;return r?n.createElement(y,i(i({ref:t},u),{},{components:r})):n.createElement(y,i({ref:t},u))}));function y(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=s;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[b]="string"==typeof e?e:a,i[1]=p;for(var c=2;c<o;c++)i[c]=r[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},43808:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>m,default:()=>P,frontMatter:()=>y,metadata:()=>O,toc:()=>j});var n=r(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,b=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&u(e,r,t[r]);if(p)for(var r of p(t))c.call(t,r)&&u(e,r,t[r]);return e},f=(e,t)=>o(e,i(t)),s=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const y={title:"Obj",slug:"/rimbu/core/Deep/Path/Internal/Obj/type"},m="type Obj<T,Write,Maybe>",O={unversionedId:"rimbu_core/Deep/Path/Internal/Obj.type",id:"rimbu_core/Deep/Path/Internal/Obj.type",title:"Obj",description:"Determines the allowed paths for an object.",source:"@site/api/rimbu_core/Deep/Path/Internal/Obj.type.mdx",sourceDirName:"rimbu_core/Deep/Path/Internal",slug:"/rimbu/core/Deep/Path/Internal/Obj/type",permalink:"/api/rimbu/core/Deep/Path/Internal/Obj/type",draft:!1,tags:[],version:"current",frontMatter:{title:"Obj",slug:"/rimbu/core/Deep/Path/Internal/Obj/type"},sidebar:"defaultSidebar",previous:{title:"NonOptional",permalink:"/api/rimbu/core/Deep/Path/Internal/NonOptional/type"},next:{title:"Separator",permalink:"/api/rimbu/core/Deep/Path/Internal/Separator/type"}},d={},j=[{value:"Definition",id:"definition",level:2}],h={toc:j},v="wrapper";function P(e){var t=e,{components:r}=t,a=s(t,["components"]);return(0,n.kt)(v,f(b(b({},h),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",b({},{id:"type-objtwritemaybe"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type Obj<T,Write,Maybe>")),(0,n.kt)("p",null,"Determines the allowed paths for an object."),(0,n.kt)("h2",b({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type Obj<T, Write extends boolean, Maybe extends boolean> = ```{"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"[K in keyof T]: "),"${K & string}${",(0,n.kt)("inlineCode",{parentName:"p"},"[`Path.Internal.Generic`](/api/rimbu/core/Deep/Path/Internal/Generic/type)`<T[K], Write, Write extends true ? false : `[`Path.Internal.IsOptional`](/api/rimbu/core/Deep/Path/Internal/IsOptional/type)"),"<T","[K]",", true, Maybe>>}",(0,n.kt)("inlineCode",{parentName:"p"},";"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}[keyof T]```;")))}P.isMDXComponent=!0}}]);