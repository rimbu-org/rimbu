"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[82503],{3905:(e,n,t)=>{t.d(n,{Zo:()=>l,kt:()=>d});var r=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function p(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var c=r.createContext({}),s=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},l=function(e){var n=s(e.components);return r.createElement(c.Provider,{value:n},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},y=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),u=s(t),y=a,d=u["".concat(c,".").concat(y)]||u[y]||m[y]||i;return t?r.createElement(d,o(o({ref:n},l),{},{components:t})):r.createElement(d,o({ref:n},l))}));function d(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=y;var p={};for(var c in n)hasOwnProperty.call(n,c)&&(p[c]=n[c]);p.originalType=e,p[u]="string"==typeof e?e:a,o[1]=p;for(var s=2;s<i;s++)o[s]=t[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}y.displayName="MDXCreateElement"},31790:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>C,contentTitle:()=>b,default:()=>v,frontMatter:()=>d,metadata:()=>f,toc:()=>k});var r=t(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,l=(e,n,t)=>n in e?a(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t,u=(e,n)=>{for(var t in n||(n={}))c.call(n,t)&&l(e,t,n[t]);if(p)for(var t of p(n))s.call(n,t)&&l(e,t,n[t]);return e},m=(e,n)=>i(e,o(n)),y=(e,n)=>{var t={};for(var r in e)c.call(e,r)&&n.indexOf(r)<0&&(t[r]=e[r]);if(null!=e&&p)for(var r of p(e))n.indexOf(r)<0&&s.call(e,r)&&(t[r]=e[r]);return t};const d={title:"CombineResult",slug:"/rimbu/stream/async/AsyncReducer/CombineResult/type"},b="type CombineResult<S>",f={unversionedId:"rimbu_stream/async/AsyncReducer/CombineResult.type",id:"rimbu_stream/async/AsyncReducer/CombineResult.type",title:"CombineResult",description:"Type defining the result type of an async reducer combination for a given shape.",source:"@site/api/rimbu_stream/async/AsyncReducer/CombineResult.type.mdx",sourceDirName:"rimbu_stream/async/AsyncReducer",slug:"/rimbu/stream/async/AsyncReducer/CombineResult/type",permalink:"/api/rimbu/stream/async/AsyncReducer/CombineResult/type",draft:!1,tags:[],version:"current",frontMatter:{title:"CombineResult",slug:"/rimbu/stream/async/AsyncReducer/CombineResult/type"},sidebar:"defaultSidebar",previous:{title:"Base<I,O,S>",permalink:"/api/rimbu/stream/async/AsyncReducer/Base/class"},next:{title:"CombineShape",permalink:"/api/rimbu/stream/async/AsyncReducer/CombineShape/type"}},C={},k=[{value:"Definition",id:"definition",level:2}],R={toc:k},h="wrapper";function v(e){var n=e,{components:t}=n,a=y(n,["components"]);return(0,r.kt)(h,m(u(u({},R),a),{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",u({},{id:"type-combineresults"}),(0,r.kt)("inlineCode",{parentName:"h1"},"type CombineResult<S>")),(0,r.kt)("p",null,"Type defining the result type of an async reducer combination for a given shape."),(0,r.kt)("h2",u({},{id:"definition"}),"Definition"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type CombineResult<S extends "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/CombineShape/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.CombineShape")),(0,r.kt)("inlineCode",{parentName:"p"},"<any>> = S extends readonly "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/CombineShape/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.CombineShape")),(0,r.kt)("inlineCode",{parentName:"p"},"[] ? 0 extends S['length'] ? never : {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"[K in keyof S]: S[K] extends "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/CombineShape/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.CombineShape")),(0,r.kt)("inlineCode",{parentName:"p"},"?"),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/CombineResult/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.CombineResult")),(0,r.kt)("inlineCode",{parentName:"p"},"<S[K]> : never;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"} : S extends {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"[key: string]: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/CombineShape/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.CombineShape")),(0,r.kt)("inlineCode",{parentName:"p"},";"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"} ? {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"[K in keyof S]: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/CombineResult/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.CombineResult")),(0,r.kt)("inlineCode",{parentName:"p"},"<S[K]>;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"} : S extends "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncReducer/Accept/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,r.kt)("inlineCode",{parentName:"p"},"<unknown, infer R> ? R : never;")))}v.isMDXComponent=!0}}]);