"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[892],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var i=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,l=function(e,t){if(null==e)return{};var n,i,l={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var u=i.createContext({}),d=function(e){var t=i.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=d(e.components);return i.createElement(u.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,l=e.mdxType,o=e.originalType,u=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),c=d(n),m=l,f=c["".concat(u,".").concat(m)]||c[m]||s[m]||o;return n?i.createElement(f,r(r({ref:t},p),{},{components:n})):i.createElement(f,r({ref:t},p))}));function m(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var o=n.length,r=new Array(o);r[0]=c;var a={};for(var u in t)hasOwnProperty.call(t,u)&&(a[u]=t[u]);a.originalType=e,a.mdxType="string"==typeof e?e:l,r[1]=a;for(var d=2;d<o;d++)r[d]=n[d];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},5013:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>k,contentTitle:()=>m,default:()=>h,frontMatter:()=>c,metadata:()=>f,toc:()=>y});var i=n(3905),l=Object.defineProperty,o=Object.defineProperties,r=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,s=(e,t)=>{for(var n in t||(t={}))u.call(t,n)&&p(e,n,t[n]);if(a)for(var n of a(t))d.call(t,n)&&p(e,n,t[n]);return e};const c={title:"EmptyBase",slug:"/rimbu/collection-types/set-custom/EmptyBase/class"},m="abstract class EmptyBase",f={unversionedId:"rimbu_collection-types/set-custom/EmptyBase.class",id:"rimbu_collection-types/set-custom/EmptyBase.class",title:"EmptyBase",description:"undocumented",source:"@site/api/rimbu_collection-types/set-custom/EmptyBase.class.mdx",sourceDirName:"rimbu_collection-types/set-custom",slug:"/rimbu/collection-types/set-custom/EmptyBase/class",permalink:"/api/rimbu/collection-types/set-custom/EmptyBase/class",draft:!1,tags:[],version:"current",frontMatter:{title:"EmptyBase",slug:"/rimbu/collection-types/set-custom/EmptyBase/class"},sidebar:"defaultSidebar",previous:{title:"Elem<T>",permalink:"/api/rimbu/collection-types/set-custom/Elem/interface"},next:{title:"KeyValue<K,V>",permalink:"/api/rimbu/collection-types/set-custom/KeyValue/interface"}},k={},y=[{value:"Properties",id:"properties",level:2},{value:"<code>isEmpty</code>",id:"isempty",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>length</code>",id:"length",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>size</code>",id:"size",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>[Symbol.iterator]</code>",id:"symboliterator",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>assumeNonEmpty</code>",id:"assumenonempty",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>filter</code>",id:"filter",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>forEach</code>",id:"foreach",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>remove</code>",id:"remove",level:3},{value:"Definition",id:"definition-8",level:4},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition-9",level:4},{value:"<code>toArray</code>",id:"toarray",level:3},{value:"Definition",id:"definition-10",level:4}],v={toc:y};function h(e){var t,n=e,{components:l}=n,p=((e,t)=>{var n={};for(var i in e)u.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&a)for(var i of a(e))t.indexOf(i)<0&&d.call(e,i)&&(n[i]=e[i]);return n})(n,["components"]);return(0,i.kt)("wrapper",(t=s(s({},v),p),o(t,r({components:l,mdxType:"MDXLayout"}))),(0,i.kt)("h1",s({},{id:"abstract-class-emptybase"}),(0,i.kt)("inlineCode",{parentName:"h1"},"abstract class EmptyBase")),(0,i.kt)("p",null,"undocumented"),(0,i.kt)("h2",s({},{id:"properties"}),"Properties"),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"isempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"isEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"get isEmpty(): true;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"length"}),(0,i.kt)("inlineCode",{parentName:"h3"},"length")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-1"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"get length(): 0;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"size"}),(0,i.kt)("inlineCode",{parentName:"h3"},"size")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-2"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"get size(): 0;")))),(0,i.kt)("h2",s({},{id:"methods"}),"Methods"),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"symboliterator"}),(0,i.kt)("inlineCode",{parentName:"h3"},"[Symbol.iterator]")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-3"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"[Symbol.iterator](): "),(0,i.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,i.kt)("inlineCode",{parentName:"p"},"<any>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"assumenonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"assumeNonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-4"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"assumeNonEmpty(): never;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"filter"}),(0,i.kt)("inlineCode",{parentName:"h3"},"filter")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-5"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"filter(): any;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"foreach"}),(0,i.kt)("inlineCode",{parentName:"h3"},"forEach")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-6"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"forEach(): void;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"nonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-7"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"nonEmpty(): false;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"remove"}),(0,i.kt)("inlineCode",{parentName:"h3"},"remove")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-8"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"remove(): any;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"stream"}),(0,i.kt)("inlineCode",{parentName:"h3"},"stream")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-9"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"stream(): "),(0,i.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/Stream/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"Stream")),(0,i.kt)("inlineCode",{parentName:"p"},"<any>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",s({},{id:"toarray"}),(0,i.kt)("inlineCode",{parentName:"h3"},"toArray")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",s({},{id:"definition-10"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"toArray(): [];")))))}h.isMDXComponent=!0}}]);