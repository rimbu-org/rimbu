"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[88044],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>f});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=i.createContext({}),c=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=c(e.components);return i.createElement(l.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},s=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),m=c(n),s=r,f=m["".concat(l,".").concat(s)]||m[s]||d[s]||a;return n?i.createElement(f,o(o({ref:t},u),{},{components:n})):i.createElement(f,o({ref:t},u))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=s;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[m]="string"==typeof e?e:r,o[1]=p;for(var c=2;c<a;c++)o[c]=n[c];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}s.displayName="MDXCreateElement"},21337:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>y,default:()=>M,frontMatter:()=>f,metadata:()=>k,toc:()=>h});var i=n(3905),r=Object.defineProperty,a=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,n)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))l.call(t,n)&&u(e,n,t[n]);if(p)for(var n of p(t))c.call(t,n)&&u(e,n,t[n]);return e},d=(e,t)=>a(e,o(t)),s=(e,t)=>{var n={};for(var i in e)l.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&p)for(var i of p(e))t.indexOf(i)<0&&c.call(e,i)&&(n[i]=e[i]);return n};const f={title:"RMap.Types",slug:"/rimbu/collection-types/map/RMap/Types/interface"},y="interface RMap.Types",k={unversionedId:"rimbu_collection-types/map/RMap/Types.interface",id:"rimbu_collection-types/map/RMap/Types.interface",title:"RMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_collection-types/map/RMap/Types.interface.mdx",sourceDirName:"rimbu_collection-types/map/RMap",slug:"/rimbu/collection-types/map/RMap/Types/interface",permalink:"/api/rimbu/collection-types/map/RMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"RMap.Types",slug:"/rimbu/collection-types/map/RMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"RMap.NonEmpty<K,V>",permalink:"/api/rimbu/collection-types/map/RMap/NonEmpty/interface"},next:{title:"RMap<K,V>",permalink:"/api/rimbu/collection-types/map/RMap/interface"}},b={},h=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4}],v={toc:h},O="wrapper";function M(e){var t=e,{components:n}=t,r=s(t,["components"]);return(0,i.kt)(O,d(m(m({},v),r),{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",m({},{id:"interface-rmaptypes"}),(0,i.kt)("inlineCode",{parentName:"h1"},"interface RMap.Types")),(0,i.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/HashMap/Types/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"HashMap.Types")),", ",(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/proximity/ProximityMap/Types/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"ProximityMap.Types"))),(0,i.kt)("h2",m({},{id:"properties"}),"Properties"),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"builder"}),(0,i.kt)("inlineCode",{parentName:"h3"},"builder")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Builder/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMap.Builder")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"context"}),(0,i.kt)("inlineCode",{parentName:"h3"},"context")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"nonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMap.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"normal"}),(0,i.kt)("inlineCode",{parentName:"h3"},"normal")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMap")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}M.isMDXComponent=!0}}]);