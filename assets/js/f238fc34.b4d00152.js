"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[80597],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>d});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},y=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),y=c(r),d=a,f=y["".concat(l,".").concat(d)]||y[d]||m[d]||i;return r?n.createElement(f,p(p({ref:t},u),{},{components:r})):n.createElement(f,p({ref:t},u))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,p=new Array(i);p[0]=y;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o.mdxType="string"==typeof e?e:a,p[1]=o;for(var c=2;c<i;c++)p[c]=r[c];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}y.displayName="MDXCreateElement"},99793:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>d,default:()=>k,frontMatter:()=>y,metadata:()=>f,toc:()=>b});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&u(e,r,t[r]);if(o)for(var r of o(t))c.call(t,r)&&u(e,r,t[r]);return e};const y={title:"Entry",slug:"/rimbu/deep/Match/Entry/type"},d="type Entry<T,C,P,R>",f={unversionedId:"rimbu_deep/Match/Entry.type",id:"rimbu_deep/Match/Entry.type",title:"Entry",description:"Determines the various allowed match types for given type T.",source:"@site/api/rimbu_deep/Match/Entry.type.mdx",sourceDirName:"rimbu_deep/Match",slug:"/rimbu/deep/Match/Entry/type",permalink:"/api/rimbu/deep/Match/Entry/type",draft:!1,tags:[],version:"current",frontMatter:{title:"Entry",slug:"/rimbu/deep/Match/Entry/type"},sidebar:"defaultSidebar",previous:{title:"CompoundType",permalink:"/api/rimbu/deep/Match/CompoundType/type"},next:{title:"FailureLog",permalink:"/api/rimbu/deep/Match/FailureLog/type"}},s={},b=[{value:"Definition",id:"definition",level:2}],h={toc:b};function k(e){var t,r=e,{components:a}=r,u=((e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=m(m({},h),u),i(t,p({components:a,mdxType:"MDXLayout"}))),(0,n.kt)("h1",m({},{id:"type-entrytcpr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type Entry<T,C,P,R>")),(0,n.kt)("p",null,"Determines the various allowed match types for given type ",(0,n.kt)("inlineCode",{parentName:"p"},"T"),"."),(0,n.kt)("h2",m({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"type Entry<T, C, P, R> = IsAnyFunc<T> extends true ? T : IsPlainObj<T> extends true ? "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/WithResult/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.WithResult")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, P, R, "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/Obj/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Obj")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, C, P, R>> : IsArray<T> extends true ? "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/Arr/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Arr")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, C, P, R> "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/Entry/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Entry")),(0,n.kt)("inlineCode",{parentName:"p"},"<T[number & keyof T], C[number & keyof C], P, R>[] "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/Func/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Func")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, P, R, "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/Arr/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Arr")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, C, P, R> "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/Entry/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.Entry")),(0,n.kt)("inlineCode",{parentName:"p"},"<T[number & keyof T], C[number & keyof C], P, R>[]> : "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/deep/Match/WithResult/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Match.WithResult")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, P, R, {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"[K in keyof C]: C[K & keyof T];"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}>;")))}k.isMDXComponent=!0}}]);