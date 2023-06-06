"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[36385],{3905:(e,r,t)=>{t.d(r,{Zo:()=>l,kt:()=>d});var n=t(67294);function i(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach((function(r){i(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,i=function(e,r){if(null==e)return{};var t,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||(i[t]=e[t]);return i}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var c=n.createContext({}),u=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},l=function(e){var r=u(e.components);return n.createElement(c.Provider,{value:r},e.children)},m="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},s=n.forwardRef((function(e,r){var t=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),m=u(t),s=i,d=m["".concat(c,".").concat(s)]||m[s]||f[s]||a;return t?n.createElement(d,o(o({ref:r},l),{},{components:t})):n.createElement(d,o({ref:r},l))}));function d(e,r){var t=arguments,i=r&&r.mdxType;if("string"==typeof e||i){var a=t.length,o=new Array(a);o[0]=s;var p={};for(var c in r)hasOwnProperty.call(r,c)&&(p[c]=r[c]);p.originalType=e,p[m]="string"==typeof e?e:i,o[1]=p;for(var u=2;u<a;u++)o[u]=t[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}s.displayName="MDXCreateElement"},52391:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>v,contentTitle:()=>b,default:()=>g,frontMatter:()=>d,metadata:()=>y,toc:()=>h});var n=t(3905),i=Object.defineProperty,a=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,l=(e,r,t)=>r in e?i(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))c.call(r,t)&&l(e,t,r[t]);if(p)for(var t of p(r))u.call(r,t)&&l(e,t,r[t]);return e},f=(e,r)=>a(e,o(r)),s=(e,r)=>{var t={};for(var n in e)c.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&u.call(e,n)&&(t[n]=e[n]);return t};const d={title:"firstWhere",slug:"/rimbu/common/Reducer/firstWhere/var"},b="type firstWhere",y={unversionedId:"rimbu_common/Reducer/firstWhere.var",id:"rimbu_common/Reducer/firstWhere.var",title:"firstWhere",description:"Returns a Reducer that remembers the first input value for which the given pred function returns true.",source:"@site/api/rimbu_common/Reducer/firstWhere.var.mdx",sourceDirName:"rimbu_common/Reducer",slug:"/rimbu/common/Reducer/firstWhere/var",permalink:"/api/rimbu/common/Reducer/firstWhere/var",draft:!1,tags:[],version:"current",frontMatter:{title:"firstWhere",slug:"/rimbu/common/Reducer/firstWhere/var"},sidebar:"defaultSidebar",previous:{title:"first",permalink:"/api/rimbu/common/Reducer/first/var"},next:{title:"isEmpty",permalink:"/api/rimbu/common/Reducer/isEmpty/var"}},v={},h=[{value:"Definition",id:"definition",level:2}],O={toc:h},k="wrapper";function g(e){var r=e,{components:t}=r,i=s(r,["components"]);return(0,n.kt)(k,f(m(m({},O),i),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"type-firstwhere"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type firstWhere")),(0,n.kt)("p",null,"Returns a ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that remembers the first input value for which the given ",(0,n.kt)("inlineCode",{parentName:"p"},"pred")," function returns true."),(0,n.kt)("admonition",m({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"console.log(Stream.range({ amount: 10 }).reduce(Reducer.firstWhere(v => v > 5)))\n// => 6\n"))),(0,n.kt)("h2",m({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"firstWhere: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T>(pred: (value: T, index: number) => boolean): "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, O>(pred: (value: T, index: number) => boolean, otherwise: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,n.kt)("inlineCode",{parentName:"p"},"<O>): "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}g.isMDXComponent=!0}}]);