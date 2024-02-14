"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[17451],{3905:(e,r,n)=>{n.d(r,{Zo:()=>u,kt:()=>f});var t=n(67294);function o(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function a(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function i(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?a(Object(n),!0).forEach((function(r){o(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,t,o=function(e,r){if(null==e)return{};var n,t,o={},a=Object.keys(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||(o[n]=e[n]);return o}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=t.createContext({}),m=function(e){var r=t.useContext(p),n=r;return e&&(n="function"==typeof e?e(r):i(i({},r),e)),n},u=function(e){var r=m(e.components);return t.createElement(p.Provider,{value:r},e.children)},s="mdxType",c={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},d=t.forwardRef((function(e,r){var n=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),s=m(n),d=o,f=s["".concat(p,".").concat(d)]||s[d]||c[d]||a;return n?t.createElement(f,i(i({ref:r},u),{},{components:n})):t.createElement(f,i({ref:r},u))}));function f(e,r){var n=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=d;var l={};for(var p in r)hasOwnProperty.call(r,p)&&(l[p]=r[p]);l.originalType=e,l[s]="string"==typeof e?e:o,i[1]=l;for(var m=2;m<a;m++)i[m]=n[m];return t.createElement.apply(null,i)}return t.createElement.apply(null,n)}d.displayName="MDXCreateElement"},97716:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>y,contentTitle:()=>b,default:()=>T,frontMatter:()=>f,metadata:()=>w,toc:()=>k});var t=n(3905),o=Object.defineProperty,a=Object.defineProperties,i=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,u=(e,r,n)=>r in e?o(e,r,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[r]=n,s=(e,r)=>{for(var n in r||(r={}))p.call(r,n)&&u(e,n,r[n]);if(l)for(var n of l(r))m.call(r,n)&&u(e,n,r[n]);return e},c=(e,r)=>a(e,i(r)),d=(e,r)=>{var n={};for(var t in e)p.call(e,t)&&r.indexOf(t)<0&&(n[t]=e[t]);if(null!=e&&l)for(var t of l(e))r.indexOf(t)<0&&m.call(e,t)&&(n[t]=e[t]);return n};const f={title:"window",slug:"/rimbu/stream/Transformer/window/var"},b="type window",w={unversionedId:"rimbu_stream/Transformer/window.var",id:"rimbu_stream/Transformer/window.var",title:"window",description:"Returns a transformer that produces windows/collections of windowSize size, each window starting skipAmount of elements after the previous, and optionally collected by a custom reducer.",source:"@site/api/rimbu_stream/Transformer/window.var.mdx",sourceDirName:"rimbu_stream/Transformer",slug:"/rimbu/stream/Transformer/window/var",permalink:"/api/rimbu/stream/Transformer/window/var",draft:!1,tags:[],version:"current",frontMatter:{title:"window",slug:"/rimbu/stream/Transformer/window/var"},sidebar:"defaultSidebar",previous:{title:"filter",permalink:"/api/rimbu/stream/Transformer/filter/var"},next:{title:"Transformer",permalink:"/api/rimbu/stream/Transformer/type"}},y={},k=[{value:"Definition",id:"definition",level:2}],v={toc:k},O="wrapper";function T(e){var r=e,{components:n}=r,o=d(r,["components"]);return(0,t.kt)(O,c(s(s({},v),o),{components:n,mdxType:"MDXLayout"}),(0,t.kt)("h1",s({},{id:"type-window"}),(0,t.kt)("inlineCode",{parentName:"h1"},"type window")),(0,t.kt)("p",null,"Returns a transformer that produces windows/collections of ",(0,t.kt)("inlineCode",{parentName:"p"},"windowSize")," size, each window starting ",(0,t.kt)("inlineCode",{parentName:"p"},"skipAmount")," of elements after the previous, and optionally collected by a custom reducer."),(0,t.kt)("admonition",s({},{title:"example",type:"note"}),(0,t.kt)("pre",{parentName:"admonition"},(0,t.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"Stream.of(1, 2, 3, 4, 5, 6)\n.transform(Transformer.window(3))\n.toArray()\n// => [[1, 2, 3], [4, 5, 6]]\n"))),(0,t.kt)("h2",s({},{id:"definition"}),"Definition"),(0,t.kt)("p",null,(0,t.kt)("inlineCode",{parentName:"p"},"window: {"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"<T, R>(windowSize: number, options: {"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"skipAmount?: number "),(0,t.kt)("code",null,"|"),(0,t.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"collector: Reducer<T, R>;"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"}): "),(0,t.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/Transformer/type"}),(0,t.kt)("inlineCode",{parentName:"a"},"Transformer")),(0,t.kt)("inlineCode",{parentName:"p"},"<T, R>;"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"<T>(windowSize: number, options?: {"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"skipAmount?: number "),(0,t.kt)("code",null,"|"),(0,t.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"collector?: undefined;"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"}): "),(0,t.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/Transformer/type"}),(0,t.kt)("inlineCode",{parentName:"a"},"Transformer")),(0,t.kt)("inlineCode",{parentName:"p"},"<T, T[]>;"),(0,t.kt)("br",null),"\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"}")))}T.isMDXComponent=!0}}]);