"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[77255],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>y});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=c(n),m=i,y=s["".concat(l,".").concat(m)]||s[m]||f[m]||a;return n?r.createElement(y,o(o({ref:t},u),{},{components:n})):r.createElement(y,o({ref:t},u))}));function y(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[s]="string"==typeof e?e:i,o[1]=p;for(var c=2;c<a;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},78049:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>v,contentTitle:()=>d,default:()=>g,frontMatter:()=>y,metadata:()=>b,toc:()=>k});var r=n(3905),i=Object.defineProperty,a=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,s=(e,t)=>{for(var n in t||(t={}))l.call(t,n)&&u(e,n,t[n]);if(p)for(var n of p(t))c.call(t,n)&&u(e,n,t[n]);return e},f=(e,t)=>a(e,o(t)),m=(e,t)=>{var n={};for(var r in e)l.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&p)for(var r of p(e))t.indexOf(r)<0&&c.call(e,r)&&(n[r]=e[r]);return n};const y={title:"VariantMap.Types",slug:"/rimbu/collection-types/VariantMap/Types/interface"},d="interface VariantMap.Types",b={unversionedId:"rimbu_collection-types/VariantMap/Types.interface",id:"rimbu_collection-types/VariantMap/Types.interface",title:"VariantMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_collection-types/VariantMap/Types.interface.mdx",sourceDirName:"rimbu_collection-types/VariantMap",slug:"/rimbu/collection-types/VariantMap/Types/interface",permalink:"/api/rimbu/collection-types/VariantMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"VariantMap.Types",slug:"/rimbu/collection-types/VariantMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"VariantMap.NonEmpty<K,V>",permalink:"/api/rimbu/collection-types/VariantMap/NonEmpty/interface"},next:{title:"VariantMap<K,V>",permalink:"/api/rimbu/collection-types/VariantMap/interface"}},v={},k=[{value:"Properties",id:"properties",level:2},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-1",level:4}],O={toc:k},h="wrapper";function g(e){var t=e,{components:n}=t,i=m(t,["components"]);return(0,r.kt)(h,f(s(s({},O),i),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",s({},{id:"interface-variantmaptypes"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface VariantMap.Types")),(0,r.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,r.kt)("h2",s({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"nonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",s({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,r.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/VariantMap/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"VariantMap.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",s({},{id:"normal"}),(0,r.kt)("inlineCode",{parentName:"h3"},"normal")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",s({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,r.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/VariantMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"VariantMap")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}g.isMDXComponent=!0}}]);