"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[81146],{3905:function(e,r,n){n.d(r,{Zo:function(){return u},kt:function(){return d}});var t=n(67294);function a(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function i(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function o(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?i(Object(n),!0).forEach((function(r){a(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function c(e,r){if(null==e)return{};var n,t,a=function(e,r){if(null==e)return{};var n,t,a={},i=Object.keys(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||(a[n]=e[n]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)n=i[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=t.createContext({}),m=function(e){var r=t.useContext(p),n=r;return e&&(n="function"==typeof e?e(r):o(o({},r),e)),n},u=function(e){var r=m(e.components);return t.createElement(p.Provider,{value:r},e.children)},l={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},s=t.forwardRef((function(e,r){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),s=m(n),d=a,f=s["".concat(p,".").concat(d)]||s[d]||l[d]||i;return n?t.createElement(f,o(o({ref:r},u),{},{components:n})):t.createElement(f,o({ref:r},u))}));function d(e,r){var n=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=s;var c={};for(var p in r)hasOwnProperty.call(r,p)&&(c[p]=r[p]);c.originalType=e,c.mdxType="string"==typeof e?e:a,o[1]=c;for(var m=2;m<i;m++)o[m]=n[m];return t.createElement.apply(null,o)}return t.createElement.apply(null,n)}s.displayName="MDXCreateElement"},76783:function(e,r,n){n.r(r),n.d(r,{assets:function(){return y},contentTitle:function(){return d},default:function(){return h},frontMatter:function(){return s},metadata:function(){return f},toc:function(){return b}});var t=n(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,u=(e,r,n)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[r]=n,l=(e,r)=>{for(var n in r||(r={}))p.call(r,n)&&u(e,n,r[n]);if(c)for(var n of c(r))m.call(r,n)&&u(e,n,r[n]);return e};const s={title:"firstWhere",slug:"/rimbu/common/AsyncReducer/firstWhere/var"},d="type firstWhere",f={unversionedId:"rimbu_common/AsyncReducer/firstWhere.var",id:"rimbu_common/AsyncReducer/firstWhere.var",title:"firstWhere",description:"Returns an AsyncReducer that remembers the first input value for which the given pred function returns true.",source:"@site/api/rimbu_common/AsyncReducer/firstWhere.var.mdx",sourceDirName:"rimbu_common/AsyncReducer",slug:"/rimbu/common/AsyncReducer/firstWhere/var",permalink:"/api/rimbu/common/AsyncReducer/firstWhere/var",draft:!1,tags:[],version:"current",frontMatter:{title:"firstWhere",slug:"/rimbu/common/AsyncReducer/firstWhere/var"},sidebar:"defaultSidebar",previous:{title:"first",permalink:"/api/rimbu/common/AsyncReducer/first/var"},next:{title:"isEmpty",permalink:"/api/rimbu/common/AsyncReducer/isEmpty/var"}},y={},b=[{value:"Definition",id:"definition",level:2}],v={toc:b};function h(e){var r,n=e,{components:a}=n,u=((e,r)=>{var n={};for(var t in e)p.call(e,t)&&r.indexOf(t)<0&&(n[t]=e[t]);if(null!=e&&c)for(var t of c(e))r.indexOf(t)<0&&m.call(e,t)&&(n[t]=e[t]);return n})(n,["components"]);return(0,t.kt)("wrapper",(r=l(l({},v),u),i(r,o({components:a,mdxType:"MDXLayout"}))),(0,t.kt)("h1",l({},{id:"type-firstwhere"}),(0,t.kt)("inlineCode",{parentName:"h1"},"type firstWhere")),(0,t.kt)("p",null,"Returns an ",(0,t.kt)("inlineCode",{parentName:"p"},"AsyncReducer")," that remembers the first input value for which the given ",(0,t.kt)("inlineCode",{parentName:"p"},"pred")," function returns true."),(0,t.kt)("div",l({},{className:"admonition admonition-note alert alert--secondary"}),(0,t.kt)("div",l({parentName:"div"},{className:"admonition-heading"}),(0,t.kt)("h5",{parentName:"div"},(0,t.kt)("span",l({parentName:"h5"},{className:"admonition-icon"}),(0,t.kt)("svg",l({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),(0,t.kt)("path",l({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"example")),(0,t.kt)("div",l({parentName:"div"},{className:"admonition-content"}),(0,t.kt)("pre",{parentName:"div"},(0,t.kt)("code",l({parentName:"pre"},{className:"language-ts"}),"await AsyncStream.from(Stream.range({ amount: 10 })).reduce(AsyncReducer.firstWhere(async v => v > 5)))\n// => 6\n")))),(0,t.kt)("h2",l({},{id:"definition"}),"Definition"),(0,t.kt)("p",null,(0,t.kt)("inlineCode",{parentName:"p"},"firstWhere: {"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"<T>(pred: (value: T, index: number) => "),(0,t.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,t.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,t.kt)("inlineCode",{parentName:"p"},"<boolean>): "),(0,t.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/AsyncReducer/type"}),(0,t.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,t.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,t.kt)("code",null,"|"),(0,t.kt)("inlineCode",{parentName:"p"}," undefined>;"),(0,t.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"<T, O>(pred: (value: T, index: number) => "),(0,t.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,t.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,t.kt)("inlineCode",{parentName:"p"},"<boolean>, otherwise: "),(0,t.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,t.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,t.kt)("inlineCode",{parentName:"p"},"<O>): "),(0,t.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/AsyncReducer/type"}),(0,t.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,t.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,t.kt)("code",null,"|"),(0,t.kt)("inlineCode",{parentName:"p"}," O>;"),(0,t.kt)("br",null),"\xa0","\xa0",(0,t.kt)("inlineCode",{parentName:"p"},"}")))}h.isMDXComponent=!0}}]);