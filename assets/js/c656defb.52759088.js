"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[62430],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>d});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var o=n.createContext({}),u=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},c=function(e){var t=u(e.components);return n.createElement(o.Provider,{value:t},e.children)},m="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,o=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),m=u(r),s=i,d=m["".concat(o,".").concat(s)]||m[s]||f[s]||a;return r?n.createElement(d,l(l({ref:t},c),{},{components:r})):n.createElement(d,l({ref:t},c))}));function d(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,l=new Array(a);l[0]=s;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p[m]="string"==typeof e?e:i,l[1]=p;for(var u=2;u<a;u++)l[u]=r[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},96947:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>M,contentTitle:()=>y,default:()=>h,frontMatter:()=>d,metadata:()=>b,toc:()=>v});var n=r(3905),i=Object.defineProperty,a=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))o.call(t,r)&&c(e,r,t[r]);if(p)for(var r of p(t))u.call(t,r)&&c(e,r,t[r]);return e},f=(e,t)=>a(e,l(t)),s=(e,t)=>{var r={};for(var n in e)o.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const d={title:"VariantMultiMap.Types",slug:"/rimbu/multimap/VariantMultiMap/Types/interface"},y="interface VariantMultiMap.Types",b={unversionedId:"rimbu_multimap/VariantMultiMap/Types.interface",id:"rimbu_multimap/VariantMultiMap/Types.interface",title:"VariantMultiMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_multimap/VariantMultiMap/Types.interface.mdx",sourceDirName:"rimbu_multimap/VariantMultiMap",slug:"/rimbu/multimap/VariantMultiMap/Types/interface",permalink:"/api/rimbu/multimap/VariantMultiMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"VariantMultiMap.Types",slug:"/rimbu/multimap/VariantMultiMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"VariantMultiMap.NonEmpty<K,V>",permalink:"/api/rimbu/multimap/VariantMultiMap/NonEmpty/interface"},next:{title:"VariantMultiMap<K,V>",permalink:"/api/rimbu/multimap/VariantMultiMap/interface"}},M={},v=[{value:"Properties",id:"properties",level:2},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-1",level:4}],k={toc:v},O="wrapper";function h(e){var t=e,{components:r}=t,i=s(t,["components"]);return(0,n.kt)(O,f(m(m({},k),i),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"interface-variantmultimaptypes"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface VariantMultiMap.Types")),(0,n.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,n.kt)("h2",m({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/multimap/VariantMultiMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantMultiMap.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"normal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"normal")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/multimap/VariantMultiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantMultiMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}h.isMDXComponent=!0}}]);