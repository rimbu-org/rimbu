"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[9410],{3905:function(e,r,t){t.d(r,{Zo:function(){return m},kt:function(){return l}});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var c=n.createContext({}),u=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},m=function(e){var r=u(e.components);return n.createElement(c.Provider,{value:r},e.children)},s={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),f=u(t),l=a,y=f["".concat(c,".").concat(l)]||f[l]||s[l]||o;return t?n.createElement(y,i(i({ref:r},m),{},{components:t})):n.createElement(y,i({ref:r},m))}));function l(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=f;var p={};for(var c in r)hasOwnProperty.call(r,c)&&(p[c]=r[c]);p.originalType=e,p.mdxType="string"==typeof e?e:a,i[1]=p;for(var u=2;u<o;u++)i[u]=t[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},88581:function(e,r,t){t.r(r),t.d(r,{assets:function(){return d},contentTitle:function(){return l},default:function(){return v},frontMatter:function(){return f},metadata:function(){return y},toc:function(){return b}});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,s=(e,r)=>{for(var t in r||(r={}))c.call(r,t)&&m(e,t,r[t]);if(p)for(var t of p(r))u.call(r,t)&&m(e,t,r[t]);return e};const f={title:"Transformer_2",slug:"/rimbu/stream/Transformer_2/type"},l="type Transformer_2<T,R>",y={unversionedId:"rimbu_stream/Transformer_2.type",id:"rimbu_stream/Transformer_2.type",title:"Transformer_2",description:"A Reducer that produces instances of StreamSource.",source:"@site/api/rimbu_stream/Transformer_2.type.mdx",sourceDirName:"rimbu_stream",slug:"/rimbu/stream/Transformer_2/type",permalink:"/api/rimbu/stream/Transformer_2/type",draft:!1,tags:[],version:"current",frontMatter:{title:"Transformer_2",slug:"/rimbu/stream/Transformer_2/type"},sidebar:"defaultSidebar",previous:{title:"window",permalink:"/api/rimbu/stream/Transformer_2/window/var"},next:{title:"@rimbu/stream/async",permalink:"/api/rimbu/stream/async"}},d={},b=[{value:"Definition",id:"definition",level:2}],O={toc:b};function v(e){var r,t=e,{components:a}=t,m=((e,r)=>{var t={};for(var n in e)c.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&u.call(e,n)&&(t[n]=e[n]);return t})(t,["components"]);return(0,n.kt)("wrapper",(r=s(s({},O),m),o(r,i({components:a,mdxType:"MDXLayout"}))),(0,n.kt)("h1",s({},{id:"type-transformer_2tr"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type Transformer_2<T,R>")),(0,n.kt)("p",null,"A Reducer that produces instances of ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource"),"."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/Transformer_2/namespace"}),"Transformer_2")),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"export declare type Transformer<T, R = T> = "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<R>>;")))}v.isMDXComponent=!0}}]);