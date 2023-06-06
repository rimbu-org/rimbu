"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[93721],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>y});var n=t(67294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function p(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?p(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function a(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},p=Object.keys(e);for(n=0;n<p.length;n++)t=p[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(n=0;n<p.length;n++)t=p[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var c=n.createContext({}),l=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},u=function(e){var r=l(e.components);return n.createElement(c.Provider,{value:r},e.children)},s="mdxType",b={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,p=e.originalType,c=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),s=l(t),f=o,y=s["".concat(c,".").concat(f)]||s[f]||b[f]||p;return t?n.createElement(y,i(i({ref:r},u),{},{components:t})):n.createElement(y,i({ref:r},u))}));function y(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var p=t.length,i=new Array(p);i[0]=f;var a={};for(var c in r)hasOwnProperty.call(r,c)&&(a[c]=r[c]);a.originalType=e,a[s]="string"==typeof e?e:o,i[1]=a;for(var l=2;l<p;l++)i[l]=t[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},13624:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>d,contentTitle:()=>m,default:()=>h,frontMatter:()=>y,metadata:()=>O,toc:()=>P});var n=t(3905),o=Object.defineProperty,p=Object.defineProperties,i=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?o(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,s=(e,r)=>{for(var t in r||(r={}))c.call(r,t)&&u(e,t,r[t]);if(a)for(var t of a(r))l.call(r,t)&&u(e,t,r[t]);return e},b=(e,r)=>p(e,i(r)),f=(e,r)=>{var t={};for(var n in e)c.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&a)for(var n of a(e))r.indexOf(n)<0&&l.call(e,n)&&(t[n]=e[n]);return t};const y={title:"ObjProps",slug:"/rimbu/core/Deep/Patch/ObjProps/type"},m="type ObjProps<T,C,R>",O={unversionedId:"rimbu_core/Deep/Patch/ObjProps.type",id:"rimbu_core/Deep/Patch/ObjProps.type",title:"ObjProps",description:"A type defining the allowed patch values for object properties.",source:"@site/api/rimbu_core/Deep/Patch/ObjProps.type.mdx",sourceDirName:"rimbu_core/Deep/Patch",slug:"/rimbu/core/Deep/Patch/ObjProps/type",permalink:"/api/rimbu/core/Deep/Patch/ObjProps/type",draft:!1,tags:[],version:"current",frontMatter:{title:"ObjProps",slug:"/rimbu/core/Deep/Patch/ObjProps/type"},sidebar:"defaultSidebar",previous:{title:"Obj",permalink:"/api/rimbu/core/Deep/Patch/Obj/type"},next:{title:"Tup",permalink:"/api/rimbu/core/Deep/Patch/Tup/type"}},d={},P=[{value:"Definition",id:"definition",level:2}],j={toc:P},v="wrapper";function h(e){var r=e,{components:t}=r,o=f(r,["components"]);return(0,n.kt)(v,b(s(s({},j),o),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-objpropstcr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type ObjProps<T,C,R>")),(0,n.kt)("p",null,"A type defining the allowed patch values for object properties."),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type ObjProps<T, C, R> = {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"[K in keyof C]?: K extends keyof T ? "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/core/Deep/Patch/Entry/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Patch.Entry")),(0,n.kt)("inlineCode",{parentName:"p"},"<T[K], C[K], T, R> : never;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"};")))}h.isMDXComponent=!0}}]);