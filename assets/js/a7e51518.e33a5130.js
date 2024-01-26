"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[38613],{3905:(e,r,t)=>{t.d(r,{Zo:()=>l,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function u(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var c=n.createContext({}),p=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},l=function(e){var r=p(e.components);return n.createElement(c.Provider,{value:r},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,l=u(e,["components","mdxType","originalType","parentName"]),m=p(t),d=a,f=m["".concat(c,".").concat(d)]||m[d]||s[d]||i;return t?n.createElement(f,o(o({ref:r},l),{},{components:t})):n.createElement(f,o({ref:r},l))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=d;var u={};for(var c in r)hasOwnProperty.call(r,c)&&(u[c]=r[c]);u.originalType=e,u[m]="string"==typeof e?e:a,o[1]=u;for(var p=2;p<i;p++)o[p]=t[p];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},47244:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>v,contentTitle:()=>b,default:()=>j,frontMatter:()=>f,metadata:()=>y,toc:()=>O});var n=t(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,u=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,l=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,m=(e,r)=>{for(var t in r||(r={}))c.call(r,t)&&l(e,t,r[t]);if(u)for(var t of u(r))p.call(r,t)&&l(e,t,r[t]);return e},s=(e,r)=>i(e,o(r)),d=(e,r)=>{var t={};for(var n in e)c.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&u)for(var n of u(e))r.indexOf(n)<0&&p.call(e,n)&&(t[n]=e[n]);return t};const f={title:"sum",slug:"/rimbu/stream/Reducer/sum/var"},b="type sum",y={unversionedId:"rimbu_stream/Reducer/sum.var",id:"rimbu_stream/Reducer/sum.var",title:"sum",description:"A Reducer that sums all given numeric input values.",source:"@site/api/rimbu_stream/Reducer/sum.var.mdx",sourceDirName:"rimbu_stream/Reducer",slug:"/rimbu/stream/Reducer/sum/var",permalink:"/api/rimbu/stream/Reducer/sum/var",draft:!1,tags:[],version:"current",frontMatter:{title:"sum",slug:"/rimbu/stream/Reducer/sum/var"},sidebar:"defaultSidebar",previous:{title:"product",permalink:"/api/rimbu/stream/Reducer/product/var"},next:{title:"Reducer",permalink:"/api/rimbu/stream/Reducer/type"}},v={},O=[{value:"Definition",id:"definition",level:2}],g={toc:O},k="wrapper";function j(e){var r=e,{components:t}=r,a=d(r,["components"]);return(0,n.kt)(k,s(m(m({},g),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"type-sum"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type sum")),(0,n.kt)("p",null,"A ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that sums all given numeric input values."),(0,n.kt)("admonition",m({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"console.log(Stream.range({ amount: 5 }).reduce(Reducer.sum))\n// => 10\n"))),(0,n.kt)("h2",m({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"sum: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<number, number>")))}j.isMDXComponent=!0}}]);