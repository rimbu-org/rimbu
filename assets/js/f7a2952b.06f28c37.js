"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[93299],{3905:(e,t,i)=>{i.d(t,{Zo:()=>m,kt:()=>s});var n=i(67294);function r(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function a(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function l(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?a(Object(i),!0).forEach((function(t){r(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function o(e,t){if(null==e)return{};var i,n,r=function(e,t){if(null==e)return{};var i,n,r={},a=Object.keys(e);for(n=0;n<a.length;n++)i=a[n],t.indexOf(i)>=0||(r[i]=e[i]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)i=a[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}var p=n.createContext({}),u=function(e){var t=n.useContext(p),i=t;return e&&(i="function"==typeof e?e(t):l(l({},t),e)),i},m=function(e){var t=u(e.components);return n.createElement(p.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var i=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),c=u(i),f=r,s=c["".concat(p,".").concat(f)]||c[f]||d[f]||a;return i?n.createElement(s,l(l({ref:t},m),{},{components:i})):n.createElement(s,l({ref:t},m))}));function s(e,t){var i=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=i.length,l=new Array(a);l[0]=f;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[c]="string"==typeof e?e:r,l[1]=o;for(var u=2;u<a;u++)l[u]=i[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,i)}f.displayName="MDXCreateElement"},70726:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>k,contentTitle:()=>y,default:()=>O,frontMatter:()=>s,metadata:()=>b,toc:()=>M});var n=i(3905),r=Object.defineProperty,a=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,i)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,c=(e,t)=>{for(var i in t||(t={}))p.call(t,i)&&m(e,i,t[i]);if(o)for(var i of o(t))u.call(t,i)&&m(e,i,t[i]);return e},d=(e,t)=>a(e,l(t)),f=(e,t)=>{var i={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(i[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&u.call(e,n)&&(i[n]=e[n]);return i};const s={title:"BiMultiMap.Types",slug:"/rimbu/bimultimap/BiMultiMap/Types/interface"},y="interface BiMultiMap.Types",b={unversionedId:"rimbu_bimultimap/BiMultiMap/Types.interface",id:"rimbu_bimultimap/BiMultiMap/Types.interface",title:"BiMultiMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_bimultimap/BiMultiMap/Types.interface.mdx",sourceDirName:"rimbu_bimultimap/BiMultiMap",slug:"/rimbu/bimultimap/BiMultiMap/Types/interface",permalink:"/api/rimbu/bimultimap/BiMultiMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"BiMultiMap.Types",slug:"/rimbu/bimultimap/BiMultiMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"BiMultiMap.NonEmpty<K,V>",permalink:"/api/rimbu/bimultimap/BiMultiMap/NonEmpty/interface"},next:{title:"BiMultiMap<K,V>",permalink:"/api/rimbu/bimultimap/BiMultiMap/interface"}},k={},M=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4}],v={toc:M},h="wrapper";function O(e){var t=e,{components:i}=t,r=f(t,["components"]);return(0,n.kt)(h,d(c(c({},v),r),{components:i,mdxType:"MDXLayout"}),(0,n.kt)("h1",c({},{id:"interface-bimultimaptypes"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface BiMultiMap.Types")),(0,n.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,n.kt)("h2",c({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/BiMultiMap/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMap.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"context"}),(0,n.kt)("inlineCode",{parentName:"h3"},"context")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/BiMultiMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/BiMultiMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMap.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"normal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"normal")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/BiMultiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}O.isMDXComponent=!0}}]);