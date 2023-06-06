"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[89580],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>m});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var u=n.createContext({}),c=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(u.Provider,{value:t},e.children)},s="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,u=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),s=c(r),f=i,m=s["".concat(u,".").concat(f)]||s[f]||d[f]||o;return r?n.createElement(m,a(a({ref:t},p),{},{components:r})):n.createElement(m,a({ref:t},p))}));function m(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,a=new Array(o);a[0]=f;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l[s]="string"==typeof e?e:i,a[1]=l;for(var c=2;c<o;c++)a[c]=r[c];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},48493:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>S,contentTitle:()=>y,default:()=>k,frontMatter:()=>m,metadata:()=>b,toc:()=>v});var n=r(3905),i=Object.defineProperty,o=Object.defineProperties,a=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,p=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))u.call(t,r)&&p(e,r,t[r]);if(l)for(var r of l(t))c.call(t,r)&&p(e,r,t[r]);return e},d=(e,t)=>o(e,a(t)),f=(e,t)=>{var r={};for(var n in e)u.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&l)for(var n of l(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const m={title:"SortedMultiSet.Context<UT>",slug:"/rimbu/multiset/SortedMultiSet/Context/interface"},y="interface SortedMultiSet.Context<UT>",b={unversionedId:"rimbu_multiset/SortedMultiSet/Context.interface",id:"rimbu_multiset/SortedMultiSet/Context.interface",title:"SortedMultiSet.Context<UT>",description:"A context instance for an SortedMultiSet that acts as a factory for every instance of this type of collection.",source:"@site/api/rimbu_multiset/SortedMultiSet/Context.interface.mdx",sourceDirName:"rimbu_multiset/SortedMultiSet",slug:"/rimbu/multiset/SortedMultiSet/Context/interface",permalink:"/api/rimbu/multiset/SortedMultiSet/Context/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedMultiSet.Context<UT>",slug:"/rimbu/multiset/SortedMultiSet/Context/interface"},sidebar:"defaultSidebar",previous:{title:"SortedMultiSet.Builder<T>",permalink:"/api/rimbu/multiset/SortedMultiSet/Builder/interface"},next:{title:"SortedMultiSet.NonEmpty<T>",permalink:"/api/rimbu/multiset/SortedMultiSet/NonEmpty/interface"}},S={},v=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>typeTag</code>",id:"typetag",level:3},{value:"Definition",id:"definition",level:4}],O={toc:v},g="wrapper";function k(e){var t=e,{components:r}=t,i=f(t,["components"]);return(0,n.kt)(g,d(s(s({},O),i),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"interface-sortedmultisetcontextut"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface SortedMultiSet.Context<UT>")),(0,n.kt)("p",null,"A context instance for an ",(0,n.kt)("inlineCode",{parentName:"p"},"SortedMultiSet")," that acts as a factory for every instance of this type of collection."),(0,n.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"UT"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the upper value type bound for which the context can be used")))),(0,n.kt)("h2",s({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"typetag"}),(0,n.kt)("inlineCode",{parentName:"h3"},"typeTag")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",s({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly typeTag: 'SortedMultiSet';")))))}k.isMDXComponent=!0}}]);