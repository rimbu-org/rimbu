"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[86187],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>d});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var o=n.createContext({}),c=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(o.Provider,{value:t},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,o=e.parentName,p=u(e,["components","mdxType","originalType","parentName"]),m=c(r),f=i,d=m["".concat(o,".").concat(f)]||m[f]||s[f]||a;return r?n.createElement(d,l(l({ref:t},p),{},{components:r})):n.createElement(d,l({ref:t},p))}));function d(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,l=new Array(a);l[0]=f;var u={};for(var o in t)hasOwnProperty.call(t,o)&&(u[o]=t[o]);u.originalType=e,u[m]="string"==typeof e?e:i,l[1]=u;for(var c=2;c<a;c++)l[c]=r[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},87391:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>b,default:()=>h,frontMatter:()=>d,metadata:()=>y,toc:()=>v});var n=r(3905),i=Object.defineProperty,a=Object.defineProperties,l=Object.getOwnPropertyDescriptors,u=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,p=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))o.call(t,r)&&p(e,r,t[r]);if(u)for(var r of u(t))c.call(t,r)&&p(e,r,t[r]);return e},s=(e,t)=>a(e,l(t)),f=(e,t)=>{var r={};for(var n in e)o.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&u)for(var n of u(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const d={title:"MultiSet.Builder<T>",slug:"/rimbu/multiset/MultiSet/Builder/interface"},b="interface MultiSet.Builder<T>",y={unversionedId:"rimbu_multiset/MultiSet/Builder.interface",id:"rimbu_multiset/MultiSet/Builder.interface",title:"MultiSet.Builder<T>",description:"A mutable MultiSet builder used to efficiently create new immutable instances. See the MultiSet documentation and the MultiSet.Builder API documentation",source:"@site/api/rimbu_multiset/MultiSet/Builder.interface.mdx",sourceDirName:"rimbu_multiset/MultiSet",slug:"/rimbu/multiset/MultiSet/Builder/interface",permalink:"/api/rimbu/multiset/MultiSet/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiSet.Builder<T>",slug:"/rimbu/multiset/MultiSet/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"MultiSet (namespace)",permalink:"/api/rimbu/multiset/MultiSet/namespace"},next:{title:"MultiSet.Context<UT>",permalink:"/api/rimbu/multiset/MultiSet/Context/interface"}},O={},v=[{value:"Type parameters",id:"type-parameters",level:2}],g={toc:v},S="wrapper";function h(e){var t=e,{components:r}=t,i=f(t,["components"]);return(0,n.kt)(S,s(m(m({},g),i),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"interface-multisetbuildert"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface MultiSet.Builder<T>")),(0,n.kt)("p",null,"A mutable ",(0,n.kt)("inlineCode",{parentName:"p"},"MultiSet")," builder used to efficiently create new immutable instances. See the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/multiset"}),"MultiSet documentation")," and the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/multiset/MultiSet/Builder/interface"}),"MultiSet.Builder API documentation")),(0,n.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))))}h.isMDXComponent=!0}}]);