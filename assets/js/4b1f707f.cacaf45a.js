"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[73658],{3905:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>y});var r=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function m(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=r.createContext({}),c=function(e){var n=r.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},u=function(e){var n=c(e.components);return r.createElement(p.Provider,{value:n},e.children)},l={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},s=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,u=m(e,["components","mdxType","originalType","parentName"]),s=c(t),y=a,d=s["".concat(p,".").concat(y)]||s[y]||l[y]||o;return t?r.createElement(d,i(i({ref:n},u),{},{components:t})):r.createElement(d,i({ref:n},u))}));function y(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=s;var m={};for(var p in n)hasOwnProperty.call(n,p)&&(m[p]=n[p]);m.originalType=e,m.mdxType="string"==typeof e?e:a,i[1]=m;for(var c=2;c<o;c++)i[c]=t[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}s.displayName="MDXCreateElement"},60647:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>f,contentTitle:()=>y,default:()=>k,frontMatter:()=>s,metadata:()=>d,toc:()=>b});var r=t(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,m=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,n,t)=>n in e?a(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t,l=(e,n)=>{for(var t in n||(n={}))p.call(n,t)&&u(e,t,n[t]);if(m)for(var t of m(n))c.call(n,t)&&u(e,t,n[t]);return e};const s={title:"maxBy",slug:"/rimbu/common/AsyncReducer/maxBy/var"},y="type maxBy",d={unversionedId:"rimbu_common/AsyncReducer/maxBy.var",id:"rimbu_common/AsyncReducer/maxBy.var",title:"maxBy",description:"Returns a Reducer that remembers the maximum value of the inputs using the given compFun to compare input values",source:"@site/api/rimbu_common/AsyncReducer/maxBy.var.mdx",sourceDirName:"rimbu_common/AsyncReducer",slug:"/rimbu/common/AsyncReducer/maxBy/var",permalink:"/api/rimbu/common/AsyncReducer/maxBy/var",draft:!1,tags:[],version:"current",frontMatter:{title:"maxBy",slug:"/rimbu/common/AsyncReducer/maxBy/var"},sidebar:"defaultSidebar",previous:{title:"max",permalink:"/api/rimbu/common/AsyncReducer/max/var"},next:{title:"min",permalink:"/api/rimbu/common/AsyncReducer/min/var"}},f={},b=[{value:"Definition",id:"definition",level:2}],v={toc:b};function k(e){var n,t=e,{components:a}=t,u=((e,n)=>{var t={};for(var r in e)p.call(e,r)&&n.indexOf(r)<0&&(t[r]=e[r]);if(null!=e&&m)for(var r of m(e))n.indexOf(r)<0&&c.call(e,r)&&(t[r]=e[r]);return t})(t,["components"]);return(0,r.kt)("wrapper",(n=l(l({},v),u),o(n,i({components:a,mdxType:"MDXLayout"}))),(0,r.kt)("h1",l({},{id:"type-maxby"}),(0,r.kt)("inlineCode",{parentName:"h1"},"type maxBy")),(0,r.kt)("p",null,"Returns a ",(0,r.kt)("inlineCode",{parentName:"p"},"Reducer")," that remembers the maximum value of the inputs using the given ",(0,r.kt)("inlineCode",{parentName:"p"},"compFun")," to compare input values"),(0,r.kt)("admonition",l({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",l({parentName:"pre"},{className:"language-ts"}),"const stream = Stream.of('abc', 'a', 'abcde', 'ab')\nconsole.log(stream.maxBy((s1, s2) => s1.length - s2.length))\n// 'abcde'\n"))),(0,r.kt)("h2",l({},{id:"definition"}),"Definition"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"maxBy: {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"<T>(compFun: (v1: T, v2: T) => "),(0,r.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,r.kt)("inlineCode",{parentName:"p"},"<number>): "),(0,r.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/AsyncReducer/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,r.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," undefined>;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"<T, O>(compFun: (v1: T, v2: T) => "),(0,r.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/MaybePromise/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"MaybePromise")),(0,r.kt)("inlineCode",{parentName:"p"},"<number>, otherwise: "),(0,r.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/AsyncOptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncOptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): "),(0,r.kt)("a",l({parentName:"p"},{href:"/api/rimbu/common/AsyncReducer/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,r.kt)("inlineCode",{parentName:"p"},"<T, T "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O>;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"}")))}k.isMDXComponent=!0}}]);