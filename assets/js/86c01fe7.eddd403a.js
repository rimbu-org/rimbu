"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[24699],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>d});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var u=n.createContext({}),c=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(u.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,u=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),s=c(r),f=a,d=s["".concat(u,".").concat(f)]||s[f]||m[f]||i;return r?n.createElement(d,l(l({ref:t},p),{},{components:r})):n.createElement(d,l({ref:t},p))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=f;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o[s]="string"==typeof e?e:a,l[1]=o;for(var c=2;c<i;c++)l[c]=r[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},79752:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>y,contentTitle:()=>b,default:()=>S,frontMatter:()=>d,metadata:()=>h,toc:()=>O});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,p=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))u.call(t,r)&&p(e,r,t[r]);if(o)for(var r of o(t))c.call(t,r)&&p(e,r,t[r]);return e},m=(e,t)=>i(e,l(t)),f=(e,t)=>{var r={};for(var n in e)u.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const d={title:"HashMultiSet.Builder<T>",slug:"/rimbu/core/HashMultiSet/Builder/interface"},b="interface HashMultiSet.Builder<T>",h={unversionedId:"rimbu_core/HashMultiSet/Builder.interface",id:"rimbu_core/HashMultiSet/Builder.interface",title:"HashMultiSet.Builder<T>",description:"A mutable HashMultiSet builder used to efficiently create new immutable instances. See the MultiSet documentation and the HashMultiSet.Builder API documentation",source:"@site/api/rimbu_core/HashMultiSet/Builder.interface.mdx",sourceDirName:"rimbu_core/HashMultiSet",slug:"/rimbu/core/HashMultiSet/Builder/interface",permalink:"/api/rimbu/core/HashMultiSet/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashMultiSet.Builder<T>",slug:"/rimbu/core/HashMultiSet/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"HashMultiSet (namespace)",permalink:"/api/rimbu/core/HashMultiSet/namespace"},next:{title:"HashMultiSet.Context<UT>",permalink:"/api/rimbu/core/HashMultiSet/Context/interface"}},y={},O=[{value:"Type parameters",id:"type-parameters",level:2}],v={toc:O},g="wrapper";function S(e){var t=e,{components:r}=t,a=f(t,["components"]);return(0,n.kt)(g,m(s(s({},v),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"interface-hashmultisetbuildert"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface HashMultiSet.Builder<T>")),(0,n.kt)("p",null,"A mutable ",(0,n.kt)("inlineCode",{parentName:"p"},"HashMultiSet")," builder used to efficiently create new immutable instances. See the ",(0,n.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/docs/collections/multiset"}),"MultiSet documentation")," and the ",(0,n.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/api/rimbu/multiset/HashMultiSet/Builder/interface"}),"HashMultiSet.Builder API documentation")),(0,n.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the value type")))))}S.isMDXComponent=!0}}]);