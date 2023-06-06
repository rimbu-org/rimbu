"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[66904],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),u=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=u(e.components);return n.createElement(p.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),s=u(r),d=a,f=s["".concat(p,".").concat(d)]||s[d]||m[d]||i;return r?n.createElement(f,o(o({ref:t},c),{},{components:r})):n.createElement(f,o({ref:t},c))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=d;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[s]="string"==typeof e?e:a,o[1]=l;for(var u=2;u<i;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},20275:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>g,contentTitle:()=>b,default:()=>k,frontMatter:()=>f,metadata:()=>y,toc:()=>v});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&c(e,r,t[r]);if(l)for(var r of l(t))u.call(t,r)&&c(e,r,t[r]);return e},m=(e,t)=>i(e,o(t)),d=(e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&l)for(var n of l(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const f={title:"ValuedLink",slug:"/rimbu/graph/custom/ValuedLink/type"},b="type ValuedLink<N,V>",y={unversionedId:"rimbu_graph/custom/ValuedLink.type",id:"rimbu_graph/custom/ValuedLink.type",title:"ValuedLink",description:"A valued connection between two nodes, being a 3-valued tuple of which the first two elements are nodes and the last element a value",source:"@site/api/rimbu_graph/custom/ValuedLink.type.mdx",sourceDirName:"rimbu_graph/custom",slug:"/rimbu/graph/custom/ValuedLink/type",permalink:"/api/rimbu/graph/custom/ValuedLink/type",draft:!1,tags:[],version:"current",frontMatter:{title:"ValuedLink",slug:"/rimbu/graph/custom/ValuedLink/type"},sidebar:"defaultSidebar",previous:{title:"Target",permalink:"/api/rimbu/graph/custom/ValuedLink/Target/type"},next:{title:"VariantGraphBase (namespace)",permalink:"/api/rimbu/graph/custom/VariantGraphBase/namespace"}},g={},v=[{value:"Definition",id:"definition",level:2}],h={toc:v},O="wrapper";function k(e){var t=e,{components:r}=t,a=d(t,["components"]);return(0,n.kt)(O,m(s(s({},h),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"type-valuedlinknv"}),(0,n.kt)("inlineCode",{parentName:"h1"},"type ValuedLink<N,V>")),(0,n.kt)("p",null,"A valued connection between two nodes, being a 3-valued tuple of which the first two elements are nodes and the last element a value"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/graph/custom/ValuedLink/namespace"}),"ValuedLink")),(0,n.kt)("h2",s({},{id:"definition"}),"Definition"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"export type ValuedLink<N, V> = [N, N, V];")))}k.isMDXComponent=!0}}]);