"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[95206],{3905:(e,r,t)=>{t.d(r,{Zo:()=>l,kt:()=>f});var n=t(67294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function c(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function a(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?c(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):c(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},c=Object.keys(e);for(n=0;n<c.length;n++)t=c[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(n=0;n<c.length;n++)t=c[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var u=n.createContext({}),p=function(e){var r=n.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):a(a({},r),e)),t},l=function(e){var r=p(e.components);return n.createElement(u.Provider,{value:r},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},s=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,c=e.originalType,u=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),m=p(t),s=o,f=m["".concat(u,".").concat(s)]||m[s]||d[s]||c;return t?n.createElement(f,a(a({ref:r},l),{},{components:t})):n.createElement(f,a({ref:r},l))}));function f(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var c=t.length,a=new Array(c);a[0]=s;var i={};for(var u in r)hasOwnProperty.call(r,u)&&(i[u]=r[u]);i.originalType=e,i[m]="string"==typeof e?e:o,a[1]=i;for(var p=2;p<c;p++)a[p]=t[p];return n.createElement.apply(null,a)}return n.createElement.apply(null,t)}s.displayName="MDXCreateElement"},50696:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>v,contentTitle:()=>y,default:()=>h,frontMatter:()=>f,metadata:()=>b,toc:()=>O});var n=t(3905),o=Object.defineProperty,c=Object.defineProperties,a=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,l=(e,r,t)=>r in e?o(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))u.call(r,t)&&l(e,t,r[t]);if(i)for(var t of i(r))p.call(r,t)&&l(e,t,r[t]);return e},d=(e,r)=>c(e,a(r)),s=(e,r)=>{var t={};for(var n in e)u.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&i)for(var n of i(e))r.indexOf(n)<0&&p.call(e,n)&&(t[n]=e[n]);return t};const f={title:"product",slug:"/rimbu/common/AsyncReducer/product/var"},y="type product",b={unversionedId:"rimbu_common/AsyncReducer/product.var",id:"rimbu_common/AsyncReducer/product.var",title:"product",description:"A Reducer that calculates the product of all given numeric input values.",source:"@site/api/rimbu_common/AsyncReducer/product.var.mdx",sourceDirName:"rimbu_common/AsyncReducer",slug:"/rimbu/common/AsyncReducer/product/var",permalink:"/api/rimbu/common/AsyncReducer/product/var",draft:!1,tags:[],version:"current",frontMatter:{title:"product",slug:"/rimbu/common/AsyncReducer/product/var"},sidebar:"defaultSidebar",previous:{title:"or",permalink:"/api/rimbu/common/AsyncReducer/or/var"},next:{title:"sum",permalink:"/api/rimbu/common/AsyncReducer/sum/var"}},v={},O=[{value:"Definition",id:"definition",level:2}],g={toc:O},k="wrapper";function h(e){var r=e,{components:t}=r,o=s(r,["components"]);return(0,n.kt)(k,d(m(m({},g),o),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"type-product"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type product")),(0,n.kt)("p",null,"A ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that calculates the product of all given numeric input values."),(0,n.kt)("admonition",m({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"console.log(Stream.range({ start: 1, amount: 5 }).reduce(product))\n// => 120\n"))),(0,n.kt)("h2",m({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"product: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<number, number>")))}h.isMDXComponent=!0}}]);