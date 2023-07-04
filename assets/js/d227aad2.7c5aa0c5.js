"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[69381],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>d});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),c=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(p.Provider,{value:t},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),m=c(r),f=a,d=m["".concat(p,".").concat(f)]||m[f]||s[f]||i;return r?n.createElement(d,l(l({ref:t},u),{},{components:r})):n.createElement(d,l({ref:t},u))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=f;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var c=2;c<i;c++)l[c]=r[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},22169:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>O,contentTitle:()=>b,default:()=>h,frontMatter:()=>d,metadata:()=>y,toc:()=>v});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&u(e,r,t[r]);if(o)for(var r of o(t))c.call(t,r)&&u(e,r,t[r]);return e},s=(e,t)=>i(e,l(t)),f=(e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const d={title:"RMap.Builder<K,V>",slug:"/rimbu/collection-types/RMap/Builder/interface"},b="interface RMap.Builder<K,V>",y={unversionedId:"rimbu_collection-types/RMap/Builder.interface",id:"rimbu_collection-types/RMap/Builder.interface",title:"RMap.Builder<K,V>",description:"A mutable RMap builder used to efficiently create new immutable instances. See the Map documentation and the RMap.Builder API documentation",source:"@site/api/rimbu_collection-types/RMap/Builder.interface.mdx",sourceDirName:"rimbu_collection-types/RMap",slug:"/rimbu/collection-types/RMap/Builder/interface",permalink:"/api/rimbu/collection-types/RMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"RMap.Builder<K,V>",slug:"/rimbu/collection-types/RMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"RMap (namespace)",permalink:"/api/rimbu/collection-types/RMap/namespace"},next:{title:"RMap.Context<UK>",permalink:"/api/rimbu/collection-types/RMap/Context/interface"}},O={},v=[{value:"Type parameters",id:"type-parameters",level:2}],g={toc:v},k="wrapper";function h(e){var t=e,{components:r}=t,a=f(t,["components"]);return(0,n.kt)(k,s(m(m({},g),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"interface-rmapbuilderkv"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface RMap.Builder<K,V>")),(0,n.kt)("p",null,"A mutable ",(0,n.kt)("inlineCode",{parentName:"p"},"RMap")," builder used to efficiently create new immutable instances. See the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/collection-types/map/RMap/Builder/interface"}),"RMap.Builder API documentation")),(0,n.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"the key type")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))))}h.isMDXComponent=!0}}]);