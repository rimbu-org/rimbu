"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[23479],{3905:(e,r,t)=>{t.d(r,{Zo:()=>l,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function c(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var u=n.createContext({}),p=function(e){var r=n.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},l=function(e){var r=p(e.components);return n.createElement(u.Provider,{value:r},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},s=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,u=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),m=p(t),s=a,f=m["".concat(u,".").concat(s)]||m[s]||d[s]||o;return t?n.createElement(f,i(i({ref:r},l),{},{components:t})):n.createElement(f,i({ref:r},l))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=s;var c={};for(var u in r)hasOwnProperty.call(r,u)&&(c[u]=r[u]);c.originalType=e,c[m]="string"==typeof e?e:a,i[1]=c;for(var p=2;p<o;p++)i[p]=t[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}s.displayName="MDXCreateElement"},85850:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>v,contentTitle:()=>b,default:()=>h,frontMatter:()=>f,metadata:()=>y,toc:()=>O});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,l=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))u.call(r,t)&&l(e,t,r[t]);if(c)for(var t of c(r))p.call(r,t)&&l(e,t,r[t]);return e},d=(e,r)=>o(e,i(r)),s=(e,r)=>{var t={};for(var n in e)u.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&c)for(var n of c(e))r.indexOf(n)<0&&p.call(e,n)&&(t[n]=e[n]);return t};const f={title:"product",slug:"/rimbu/stream/Reducer/product/var"},b="type product",y={unversionedId:"rimbu_stream/Reducer/product.var",id:"rimbu_stream/Reducer/product.var",title:"product",description:"A Reducer that calculates the product of all given numeric input values.",source:"@site/api/rimbu_stream/Reducer/product.var.mdx",sourceDirName:"rimbu_stream/Reducer",slug:"/rimbu/stream/Reducer/product/var",permalink:"/api/rimbu/stream/Reducer/product/var",draft:!1,tags:[],version:"current",frontMatter:{title:"product",slug:"/rimbu/stream/Reducer/product/var"},sidebar:"defaultSidebar",previous:{title:"or",permalink:"/api/rimbu/stream/Reducer/or/var"},next:{title:"sum",permalink:"/api/rimbu/stream/Reducer/sum/var"}},v={},O=[{value:"Definition",id:"definition",level:2}],g={toc:O},k="wrapper";function h(e){var r=e,{components:t}=r,a=s(r,["components"]);return(0,n.kt)(k,d(m(m({},g),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"type-product"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type product")),(0,n.kt)("p",null,"A ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that calculates the product of all given numeric input values."),(0,n.kt)("admonition",m({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"console.log(Stream.range({ start: 1, amount: 5 }).reduce(product))\n// => 120\n"))),(0,n.kt)("h2",m({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"product: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<number, number>")))}h.isMDXComponent=!0}}]);