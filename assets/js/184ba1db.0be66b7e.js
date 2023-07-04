"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[90871],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>s});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function p(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var d=a.createContext({}),l=function(e){var r=a.useContext(d),t=r;return e&&(t="function"==typeof e?e(r):p(p({},r),e)),t},u=function(e){var r=l(e.components);return a.createElement(d.Provider,{value:r},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},f=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,i=e.originalType,d=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=l(t),f=n,s=c["".concat(d,".").concat(f)]||c[f]||m[f]||i;return t?a.createElement(s,p(p({ref:r},u),{},{components:t})):a.createElement(s,p({ref:r},u))}));function s(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=t.length,p=new Array(i);p[0]=f;var o={};for(var d in r)hasOwnProperty.call(r,d)&&(o[d]=r[d]);o.originalType=e,o[c]="string"==typeof e?e:n,p[1]=o;for(var l=2;l<i;l++)p[l]=t[l];return a.createElement.apply(null,p)}return a.createElement.apply(null,t)}f.displayName="MDXCreateElement"},38197:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>b,default:()=>h,frontMatter:()=>s,metadata:()=>O,toc:()=>v});var a=t(3905),n=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,c=(e,r)=>{for(var t in r||(r={}))d.call(r,t)&&u(e,t,r[t]);if(o)for(var t of o(r))l.call(r,t)&&u(e,t,r[t]);return e},m=(e,r)=>i(e,p(r)),f=(e,r)=>{var t={};for(var a in e)d.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&o)for(var a of o(e))r.indexOf(a)<0&&l.call(e,a)&&(t[a]=e[a]);return t};const s={title:"OrderedMap.Builder<K,V>",slug:"/rimbu/ordered/map/OrderedMap/Builder/interface"},b="interface OrderedMap.Builder<K,V>",O={unversionedId:"rimbu_ordered/map/OrderedMap/Builder.interface",id:"rimbu_ordered/map/OrderedMap/Builder.interface",title:"OrderedMap.Builder<K,V>",description:"A mutable OrderedMap builder used to efficiently create new immutable instances. See the Map documentation and the OrderedMap.Builder API documentation",source:"@site/api/rimbu_ordered/map/OrderedMap/Builder.interface.mdx",sourceDirName:"rimbu_ordered/map/OrderedMap",slug:"/rimbu/ordered/map/OrderedMap/Builder/interface",permalink:"/api/rimbu/ordered/map/OrderedMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedMap.Builder<K,V>",slug:"/rimbu/ordered/map/OrderedMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedMap (namespace)",permalink:"/api/rimbu/ordered/map/OrderedMap/namespace"},next:{title:"OrderedMap.Context<UK>",permalink:"/api/rimbu/ordered/map/OrderedMap/Context/interface"}},y={},v=[{value:"Type parameters",id:"type-parameters",level:2}],g={toc:v},k="wrapper";function h(e){var r=e,{components:t}=r,n=f(r,["components"]);return(0,a.kt)(k,m(c(c({},g),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"interface-orderedmapbuilderkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface OrderedMap.Builder<K,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"OrderedMap")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedMap/Builder/interface"}),"OrderedMap.Builder API documentation")),(0,a.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}h.isMDXComponent=!0}}]);