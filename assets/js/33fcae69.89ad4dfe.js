"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[33354],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>d});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},m="mdxType",y={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),m=l(r),f=a,d=m["".concat(c,".").concat(f)]||m[f]||y[f]||i;return r?n.createElement(d,p(p({ref:t},u),{},{components:r})):n.createElement(d,p({ref:t},u))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,p=new Array(i);p[0]=f;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o[m]="string"==typeof e?e:a,p[1]=o;for(var l=2;l<i;l++)p[l]=r[l];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},89142:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>h,contentTitle:()=>s,default:()=>v,frontMatter:()=>d,metadata:()=>b,toc:()=>k});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))c.call(t,r)&&u(e,r,t[r]);if(o)for(var r of o(t))l.call(t,r)&&u(e,r,t[r]);return e},y=(e,t)=>i(e,p(t)),f=(e,t)=>{var r={};for(var n in e)c.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&l.call(e,n)&&(r[n]=e[n]);return r};const d={title:"Entry",slug:"/rimbu/core/Deep/Match/Entry/type"},s="type Entry<T,C,P,R>",b={unversionedId:"rimbu_core/Deep/Match/Entry.type",id:"rimbu_core/Deep/Match/Entry.type",title:"Entry",description:"Determines the various allowed match types for given type T.",source:"@site/api/rimbu_core/Deep/Match/Entry.type.mdx",sourceDirName:"rimbu_core/Deep/Match",slug:"/rimbu/core/Deep/Match/Entry/type",permalink:"/api/rimbu/core/Deep/Match/Entry/type",draft:!1,tags:[],version:"current",frontMatter:{title:"Entry",slug:"/rimbu/core/Deep/Match/Entry/type"},sidebar:"defaultSidebar",previous:{title:"CompoundType",permalink:"/api/rimbu/core/Deep/Match/CompoundType/type"},next:{title:"FailureLog",permalink:"/api/rimbu/core/Deep/Match/FailureLog/type"}},h={},k=[{value:"Definition",id:"definition",level:2}],C={toc:k},O="wrapper";function v(e){var t=e,{components:r}=t,a=f(t,["components"]);return(0,n.kt)(O,y(m(m({},C),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"type-entrytcpr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type Entry<T,C,P,R>")),(0,n.kt)("p",null,"Determines the various allowed match types for given type ",(0,n.kt)("inlineCode",{parentName:"p"},"T"),"."),(0,n.kt)("h2",m({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type Entry<T, C, P, R> = IsAnyFunc<T> extends true ? T : IsPlainObj<T> extends true ? "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/WithResult/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.WithResult")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, P, R, "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/Obj/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Obj")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, C, P, R>> : IsArray<T> extends true ? "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/Arr/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Arr")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, C, P, R> "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/Entry/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Entry")),(0,n.kt)("inlineCode",{parentName:"p"},"<T[number & keyof T], C[number & keyof C], P, R>[] "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/Func/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Func")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, P, R, "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/Arr/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Arr")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, C, P, R> "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/Entry/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Entry")),(0,n.kt)("inlineCode",{parentName:"p"},"<T[number & keyof T], C[number & keyof C], P, R>[]> : "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/Deep/Match/WithResult/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.WithResult")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, P, R, {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"[K in keyof C]: C[K & keyof T];"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}>;")))}v.isMDXComponent=!0}}]);