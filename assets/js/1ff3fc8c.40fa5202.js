"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[60799],{3905:(e,r,t)=>{t.d(r,{Zo:()=>l,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var u=n.createContext({}),c=function(e){var r=n.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},l=function(e){var r=c(e.components);return n.createElement(u.Provider,{value:r},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},s=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,u=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),d=c(t),s=a,f=d["".concat(u,".").concat(s)]||d[s]||m[s]||i;return t?n.createElement(f,o(o({ref:r},l),{},{components:t})):n.createElement(f,o({ref:r},l))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=s;var p={};for(var u in r)hasOwnProperty.call(r,u)&&(p[u]=r[u]);p.originalType=e,p[d]="string"==typeof e?e:a,o[1]=p;for(var c=2;c<i;c++)o[c]=t[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}s.displayName="MDXCreateElement"},33266:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>v,contentTitle:()=>b,default:()=>N,frontMatter:()=>f,metadata:()=>y,toc:()=>h});var n=t(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,l=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,d=(e,r)=>{for(var t in r||(r={}))u.call(r,t)&&l(e,t,r[t]);if(p)for(var t of p(r))c.call(r,t)&&l(e,t,r[t]);return e},m=(e,r)=>i(e,o(r)),s=(e,r)=>{var t={};for(var n in e)u.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&c.call(e,n)&&(t[n]=e[n]);return t};const f={title:"race",slug:"/rimbu/stream/Reducer/race/var"},b="type race",y={unversionedId:"rimbu_stream/Reducer/race.var",id:"rimbu_stream/Reducer/race.var",title:"race",description:"Returns a Reducer that feeds incoming values to all reducers in the provided reducers source, and halts when the first reducer in the array is halted and returns the output of that reducer. Returns the otherwise value if no reducer is yet halted.",source:"@site/api/rimbu_stream/Reducer/race.var.mdx",sourceDirName:"rimbu_stream/Reducer",slug:"/rimbu/stream/Reducer/race/var",permalink:"/api/rimbu/stream/Reducer/race/var",draft:!1,tags:[],version:"current",frontMatter:{title:"race",slug:"/rimbu/stream/Reducer/race/var"},sidebar:"defaultSidebar",previous:{title:"product",permalink:"/api/rimbu/stream/Reducer/product/var"},next:{title:"single",permalink:"/api/rimbu/stream/Reducer/single/var"}},v={},h=[{value:"Definition",id:"definition",level:2}],k={toc:h},O="wrapper";function N(e){var r=e,{components:t}=r,a=s(r,["components"]);return(0,n.kt)(O,m(d(d({},k),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",d({},{id:"type-race"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type race")),(0,n.kt)("p",null,"Returns a ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that feeds incoming values to all reducers in the provided ",(0,n.kt)("inlineCode",{parentName:"p"},"reducers")," source, and halts when the first reducer in the array is halted and returns the output of that reducer. Returns the ",(0,n.kt)("inlineCode",{parentName:"p"},"otherwise")," value if no reducer is yet halted."),(0,n.kt)("h2",d({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"race: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, R, O>(reducers: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, R>>, otherwise: OptLazy<O>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, R "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," O>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"<T, R>(reducers: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, R>>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, R "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," undefined>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}")))}N.isMDXComponent=!0}}]);