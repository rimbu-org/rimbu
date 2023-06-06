"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[35909],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>s});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=i.createContext({}),u=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=u(e.components);return i.createElement(p.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},f=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),c=u(n),f=r,s=c["".concat(p,".").concat(f)]||c[f]||d[f]||a;return n?i.createElement(s,l(l({ref:t},m),{},{components:n})):i.createElement(s,l({ref:t},m))}));function s(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=f;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[c]="string"==typeof e?e:r,l[1]=o;for(var u=2;u<a;u++)l[u]=n[u];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}f.displayName="MDXCreateElement"},63143:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>y,default:()=>O,frontMatter:()=>s,metadata:()=>k,toc:()=>M});var i=n(3905),r=Object.defineProperty,a=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,n)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,c=(e,t)=>{for(var n in t||(t={}))p.call(t,n)&&m(e,n,t[n]);if(o)for(var n of o(t))u.call(t,n)&&m(e,n,t[n]);return e},d=(e,t)=>a(e,l(t)),f=(e,t)=>{var n={};for(var i in e)p.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&o)for(var i of o(e))t.indexOf(i)<0&&u.call(e,i)&&(n[i]=e[i]);return n};const s={title:"MultiMap.Types",slug:"/rimbu/multimap/MultiMap/Types/interface"},y="interface MultiMap.Types",k={unversionedId:"rimbu_multimap/MultiMap/Types.interface",id:"rimbu_multimap/MultiMap/Types.interface",title:"MultiMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_multimap/MultiMap/Types.interface.mdx",sourceDirName:"rimbu_multimap/MultiMap",slug:"/rimbu/multimap/MultiMap/Types/interface",permalink:"/api/rimbu/multimap/MultiMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiMap.Types",slug:"/rimbu/multimap/MultiMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"MultiMap.NonEmpty<K,V>",permalink:"/api/rimbu/multimap/MultiMap/NonEmpty/interface"},next:{title:"MultiMap<K,V>",permalink:"/api/rimbu/multimap/MultiMap/interface"}},b={},M=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4}],v={toc:M},h="wrapper";function O(e){var t=e,{components:n}=t,r=f(t,["components"]);return(0,i.kt)(h,d(c(c({},v),r),{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",c({},{id:"interface-multimaptypes"}),(0,i.kt)("inlineCode",{parentName:"h1"},"interface MultiMap.Types")),(0,i.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,i.kt)("h2",c({},{id:"properties"}),"Properties"),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",c({},{id:"builder"}),(0,i.kt)("inlineCode",{parentName:"h3"},"builder")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",c({},{id:"definition"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,i.kt)("a",c({parentName:"p"},{href:"/api/rimbu/multimap/MultiMap/Builder/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"MultiMap.Builder")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",c({},{id:"context"}),(0,i.kt)("inlineCode",{parentName:"h3"},"context")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,i.kt)("a",c({parentName:"p"},{href:"/api/rimbu/multimap/MultiMap/Context/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"MultiMap.Context")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",c({},{id:"nonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,i.kt)("a",c({parentName:"p"},{href:"/api/rimbu/multimap/MultiMap/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"MultiMap.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",c({},{id:"normal"}),(0,i.kt)("inlineCode",{parentName:"h3"},"normal")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,i.kt)("a",c({parentName:"p"},{href:"/api/rimbu/multimap/MultiMap/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"MultiMap")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}O.isMDXComponent=!0}}]);