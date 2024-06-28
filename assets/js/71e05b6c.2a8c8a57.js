"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[89871],{3905:(e,r,t)=>{t.d(r,{Zo:()=>m,kt:()=>y});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function p(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function c(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?p(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},p=Object.keys(e);for(n=0;n<p.length;n++)t=p[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(n=0;n<p.length;n++)t=p[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var u=n.createContext({}),o=function(e){var r=n.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):c(c({},r),e)),t},m=function(e){var r=o(e.components);return n.createElement(u.Provider,{value:r},e.children)},d="mdxType",s={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},l=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,p=e.originalType,u=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),d=o(t),l=a,y=d["".concat(u,".").concat(l)]||d[l]||s[l]||p;return t?n.createElement(y,c(c({ref:r},m),{},{components:t})):n.createElement(y,c({ref:r},m))}));function y(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var p=t.length,c=new Array(p);c[0]=l;var i={};for(var u in r)hasOwnProperty.call(r,u)&&(i[u]=r[u]);i.originalType=e,i[d]="string"==typeof e?e:a,c[1]=i;for(var o=2;o<p;o++)c[o]=t[o];return n.createElement.apply(null,c)}return n.createElement.apply(null,t)}l.displayName="MDXCreateElement"},47092:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>O,contentTitle:()=>f,default:()=>R,frontMatter:()=>y,metadata:()=>k,toc:()=>A});var n=t(3905),a=Object.defineProperty,p=Object.defineProperties,c=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,m=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,d=(e,r)=>{for(var t in r||(r={}))u.call(r,t)&&m(e,t,r[t]);if(i)for(var t of i(r))o.call(r,t)&&m(e,t,r[t]);return e},s=(e,r)=>p(e,c(r)),l=(e,r)=>{var t={};for(var n in e)u.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&i)for(var n of i(e))r.indexOf(n)<0&&o.call(e,n)&&(t[n]=e[n]);return t};const y={title:"pipe",slug:"/rimbu/stream/AsyncReducer/pipe/var"},f="type pipe",k={unversionedId:"rimbu_stream/async/AsyncReducer/pipe.var",id:"rimbu_stream/async/AsyncReducer/pipe.var",title:"pipe",description:"Returns an AsyncReducer instance that first applies this reducer, and then applies the given next reducer to each output produced by the previous reducer.",source:"@site/api/rimbu_stream/async/AsyncReducer/pipe.var.mdx",sourceDirName:"rimbu_stream/async/AsyncReducer",slug:"/rimbu/stream/AsyncReducer/pipe/var",permalink:"/api/rimbu/stream/AsyncReducer/pipe/var",draft:!1,tags:[],version:"current",frontMatter:{title:"pipe",slug:"/rimbu/stream/AsyncReducer/pipe/var"},sidebar:"defaultSidebar",previous:{title:"partition",permalink:"/api/rimbu/stream/AsyncReducer/partition/var"},next:{title:"race",permalink:"/api/rimbu/stream/AsyncReducer/race/var"}},O={},A=[{value:"Definition",id:"definition",level:2}],b={toc:A},N="wrapper";function R(e){var r=e,{components:t}=r,a=l(r,["components"]);return(0,n.kt)(N,s(d(d({},b),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",d({},{id:"type-pipe"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type pipe")),(0,n.kt)("p",null,"Returns an ",(0,n.kt)("inlineCode",{parentName:"p"},"AsyncReducer")," instance that first applies this reducer, and then applies the given ",(0,n.kt)("inlineCode",{parentName:"p"},"next")," reducer to each output produced by the previous reducer."),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"AsyncStream\n.from(Stream.of(1, 2, 3))\n.reduce(\nAsyncReducer.pipe(Reducer.product, Reducer.sum)\n)\n// => 9\n"))),(0,n.kt)("h2",d({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"pipe: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1, O2>(reducer1: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1>, reducer2: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O1, O2>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O2>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1, O2, O3>(reducer1: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1>, reducer2: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O1, O2>, reducer3: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O2, O3>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O3>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1, O2, O3, O4>(reducer1: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1>, reducer2: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O1, O2>, reducer3: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O2, O3>, reducer4: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O2, O4>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O4>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1, O2, O3, O4, O5>(reducer1: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O1>, reducer2: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O1, O2>, reducer3: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O2, O3>, reducer4: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O2, O4>, reducer5: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/Accept/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer.Accept")),(0,n.kt)("inlineCode",{parentName:"p"},"<O2, O5>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/AsyncReducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"AsyncReducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<I, O5>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}R.isMDXComponent=!0}}]);