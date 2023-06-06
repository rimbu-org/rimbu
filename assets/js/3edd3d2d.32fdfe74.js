"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[45194],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},s="mdxType",y={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=c(r),m=a,f=s["".concat(l,".").concat(m)]||s[m]||y[m]||i;return r?n.createElement(f,o(o({ref:t},u),{},{components:r})):n.createElement(f,o({ref:t},u))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[s]="string"==typeof e?e:a,o[1]=p;for(var c=2;c<i;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},53791:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>d,default:()=>P,frontMatter:()=>f,metadata:()=>b,toc:()=>v});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&u(e,r,t[r]);if(p)for(var r of p(t))c.call(t,r)&&u(e,r,t[r]);return e},y=(e,t)=>i(e,o(t)),m=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const f={title:"Generic",slug:"/rimbu/deep/Path/Internal/Generic/type"},d="type Generic<T,Write,Maybe,First>",b={unversionedId:"rimbu_deep/Path/Internal/Generic.type",id:"rimbu_deep/Path/Internal/Generic.type",title:"Generic",description:"Determines the allowed paths into a value of type T.",source:"@site/api/rimbu_deep/Path/Internal/Generic.type.mdx",sourceDirName:"rimbu_deep/Path/Internal",slug:"/rimbu/deep/Path/Internal/Generic/type",permalink:"/api/rimbu/deep/Path/Internal/Generic/type",draft:!1,tags:[],version:"current",frontMatter:{title:"Generic",slug:"/rimbu/deep/Path/Internal/Generic/type"},sidebar:"defaultSidebar",previous:{title:"Arr",permalink:"/api/rimbu/deep/Path/Internal/Arr/type"},next:{title:"IsOptional",permalink:"/api/rimbu/deep/Path/Internal/IsOptional/type"}},O={},v=[{value:"Definition",id:"definition",level:2}],h={toc:v},g="wrapper";function P(e){var t=e,{components:r}=t,a=m(t,["components"]);return(0,n.kt)(g,y(s(s({},h),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-generictwritemaybefirst"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type Generic<T,Write,Maybe,First>")),(0,n.kt)("p",null,"Determines the allowed paths into a value of type ",(0,n.kt)("inlineCode",{parentName:"p"},"T"),"."),(0,n.kt)("admonition",s({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"type is mapped as template literal to prevent non-string types to leak through")),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type Generic<T, Write extends boolean, Maybe extends boolean, First extends boolean = false> = ````${```IsAnyFunc<T> extends true ? '' : // empty string is always an option"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"'' "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/deep/Path/Internal/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Path.Internal.NonEmpty")),"`",(0,n.kt)("inlineCode",{parentName:"p"},"<T, Write, Maybe, First>}````;")))}P.isMDXComponent=!0}}]);