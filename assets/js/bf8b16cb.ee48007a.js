"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[10580],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>m});var n=t(67294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function p(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function a(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?p(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},p=Object.keys(e);for(n=0;n<p.length;n++)t=p[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(n=0;n<p.length;n++)t=p[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var c=n.createContext({}),l=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):a(a({},r),e)),t},u=function(e){var r=l(e.components);return n.createElement(c.Provider,{value:r},e.children)},s="mdxType",b={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,p=e.originalType,c=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),s=l(t),f=o,m=s["".concat(c,".").concat(f)]||s[f]||b[f]||p;return t?n.createElement(m,a(a({ref:r},u),{},{components:t})):n.createElement(m,a({ref:r},u))}));function m(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var p=t.length,a=new Array(p);a[0]=f;var i={};for(var c in r)hasOwnProperty.call(r,c)&&(i[c]=r[c]);i.originalType=e,i[s]="string"==typeof e?e:o,a[1]=i;for(var l=2;l<p;l++)a[l]=t[l];return n.createElement.apply(null,a)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},37002:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>O,contentTitle:()=>y,default:()=>P,frontMatter:()=>m,metadata:()=>d,toc:()=>j});var n=t(3905),o=Object.defineProperty,p=Object.defineProperties,a=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?o(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,s=(e,r)=>{for(var t in r||(r={}))c.call(r,t)&&u(e,t,r[t]);if(i)for(var t of i(r))l.call(r,t)&&u(e,t,r[t]);return e},b=(e,r)=>p(e,a(r)),f=(e,r)=>{var t={};for(var n in e)c.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&i)for(var n of i(e))r.indexOf(n)<0&&l.call(e,n)&&(t[n]=e[n]);return t};const m={title:"ObjProps",slug:"/rimbu/deep/Deep/Match/ObjProps/type"},y="type ObjProps<T,C,R>",d={unversionedId:"rimbu_deep/Deep/Match/ObjProps.type",id:"rimbu_deep/Deep/Match/ObjProps.type",title:"ObjProps",description:"The type to determine allowed matchers for object properties.",source:"@site/api/rimbu_deep/Deep/Match/ObjProps.type.mdx",sourceDirName:"rimbu_deep/Deep/Match",slug:"/rimbu/deep/Deep/Match/ObjProps/type",permalink:"/api/rimbu/deep/Deep/Match/ObjProps/type",draft:!1,tags:[],version:"current",frontMatter:{title:"ObjProps",slug:"/rimbu/deep/Deep/Match/ObjProps/type"},sidebar:"defaultSidebar",previous:{title:"Obj",permalink:"/api/rimbu/deep/Deep/Match/Obj/type"},next:{title:"TraversalForArr",permalink:"/api/rimbu/deep/Deep/Match/TraversalForArr/type"}},O={},j=[{value:"Definition",id:"definition",level:2}],v={toc:j},h="wrapper";function P(e){var r=e,{components:t}=r,o=f(r,["components"]);return(0,n.kt)(h,b(s(s({},v),o),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-objpropstcr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type ObjProps<T,C,R>")),(0,n.kt)("p",null,"The type to determine allowed matchers for object properties."),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type ObjProps<T, C, R> = {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"[K in keyof C]?: K extends keyof T ? "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/deep/Match/Entry/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Entry")),(0,n.kt)("inlineCode",{parentName:"p"},"<T[K], C[K], T, R> : never;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"};")))}P.isMDXComponent=!0}}]);