"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[61450],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=i.createContext({}),c=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=c(e.components);return i.createElement(p.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},m=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),u=c(n),m=r,f=u["".concat(p,".").concat(m)]||u[m]||d[m]||a;return n?i.createElement(f,l(l({ref:t},s),{},{components:n})):i.createElement(f,l({ref:t},s))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=m;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[u]="string"==typeof e?e:r,l[1]=o;for(var c=2;c<a;c++)l[c]=n[c];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}m.displayName="MDXCreateElement"},85988:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>v,contentTitle:()=>y,default:()=>N,frontMatter:()=>f,metadata:()=>k,toc:()=>b});var i=n(3905),r=Object.defineProperty,a=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,s=(e,t,n)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))p.call(t,n)&&s(e,n,t[n]);if(o)for(var n of o(t))c.call(t,n)&&s(e,n,t[n]);return e},d=(e,t)=>a(e,l(t)),m=(e,t)=>{var n={};for(var i in e)p.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&o)for(var i of o(e))t.indexOf(i)<0&&c.call(e,i)&&(n[i]=e[i]);return n};const f={title:"RMapBase.Types",slug:"/rimbu/collection-types/map-custom/RMapBase/Types/interface"},y="interface RMapBase.Types",k={unversionedId:"rimbu_collection-types/map-custom/RMapBase/Types.interface",id:"rimbu_collection-types/map-custom/RMapBase/Types.interface",title:"RMapBase.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_collection-types/map-custom/RMapBase/Types.interface.mdx",sourceDirName:"rimbu_collection-types/map-custom/RMapBase",slug:"/rimbu/collection-types/map-custom/RMapBase/Types/interface",permalink:"/api/rimbu/collection-types/map-custom/RMapBase/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"RMapBase.Types",slug:"/rimbu/collection-types/map-custom/RMapBase/Types/interface"},sidebar:"defaultSidebar",previous:{title:"RMapBase.NonEmpty<K,V,Tp>",permalink:"/api/rimbu/collection-types/map-custom/RMapBase/NonEmpty/interface"},next:{title:"Update",permalink:"/api/rimbu/collection-types/map-custom/RMapBase/Update/type"}},v={},b=[{value:"Properties",id:"properties",level:2},{value:"<code>_K</code>",id:"_k",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>_V</code>",id:"_v",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-3",level:4}],h={toc:b},O="wrapper";function N(e){var t=e,{components:n}=t,r=m(t,["components"]);return(0,i.kt)(O,d(u(u({},h),r),{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",u({},{id:"interface-rmapbasetypes"}),(0,i.kt)("inlineCode",{parentName:"h1"},"interface RMapBase.Types")),(0,i.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Extends:")," ",(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/VariantMapBase/Types/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"VariantMapBase.Types"))),(0,i.kt)("h2",u({},{id:"properties"}),"Properties"),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",u({},{id:"_k"}),(0,i.kt)("inlineCode",{parentName:"h3"},"_K")),(0,i.kt)("p",null,"The key type.")),(0,i.kt)("h4",u({},{id:"definition"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly _K: K;"))),(0,i.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface#_K"}),"KeyValue._K"))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",u({},{id:"_v"}),(0,i.kt)("inlineCode",{parentName:"h3"},"_V")),(0,i.kt)("p",null,"The value type.")),(0,i.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly _V: V;"))),(0,i.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface#_V"}),"KeyValue._V"))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",u({},{id:"builder"}),(0,i.kt)("inlineCode",{parentName:"h3"},"builder")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/RMapBase/Builder/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMapBase.Builder")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",u({},{id:"context"}),(0,i.kt)("inlineCode",{parentName:"h3"},"context")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/RMapBase/Context/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMapBase.Context")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",u({},{id:"nonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/RMapBase/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMapBase.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,i.kt)("h4",u({},{id:"overrides-2"}),"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/VariantMapBase/Types/interface#nonEmpty"}),"Types.nonEmpty"))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",u({},{id:"normal"}),(0,i.kt)("inlineCode",{parentName:"h3"},"normal")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/RMapBase/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"RMapBase")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,i.kt)("h4",u({},{id:"overrides-3"}),"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/VariantMapBase/Types/interface#normal"}),"Types.normal"))))}N.isMDXComponent=!0}}]);