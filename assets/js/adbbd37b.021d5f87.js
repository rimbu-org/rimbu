"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[94560],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>f});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function d(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var p=a.createContext({}),l=function(e){var r=a.useContext(p),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},u=function(e){var r=l(e.components);return a.createElement(p.Provider,{value:r},e.children)},c="mdxType",s={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},m=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,i=e.originalType,p=e.parentName,u=d(e,["components","mdxType","originalType","parentName"]),c=l(t),m=n,f=c["".concat(p,".").concat(m)]||c[m]||s[m]||i;return t?a.createElement(f,o(o({ref:r},u),{},{components:t})):a.createElement(f,o({ref:r},u))}));function f(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=t.length,o=new Array(i);o[0]=m;var d={};for(var p in r)hasOwnProperty.call(r,p)&&(d[p]=r[p]);d.originalType=e,d[c]="string"==typeof e?e:n,o[1]=d;for(var l=2;l<i;l++)o[l]=t[l];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},95299:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>b,default:()=>k,frontMatter:()=>f,metadata:()=>O,toc:()=>h});var a=t(3905),n=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,d=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,c=(e,r)=>{for(var t in r||(r={}))p.call(r,t)&&u(e,t,r[t]);if(d)for(var t of d(r))l.call(r,t)&&u(e,t,r[t]);return e},s=(e,r)=>i(e,o(r)),m=(e,r)=>{var t={};for(var a in e)p.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&d)for(var a of d(e))r.indexOf(a)<0&&l.call(e,a)&&(t[a]=e[a]);return t};const f={title:"OrderedHashMap.Builder<K,V>",slug:"/rimbu/ordered/OrderedHashMap/Builder/interface"},b="interface OrderedHashMap.Builder<K,V>",O={unversionedId:"rimbu_ordered/OrderedHashMap/Builder.interface",id:"rimbu_ordered/OrderedHashMap/Builder.interface",title:"OrderedHashMap.Builder<K,V>",description:"A mutable OrderedHashMap builder used to efficiently create new immutable instances. See the Map documentation and the OrderedHashMap.Builder API documentation",source:"@site/api/rimbu_ordered/OrderedHashMap/Builder.interface.mdx",sourceDirName:"rimbu_ordered/OrderedHashMap",slug:"/rimbu/ordered/OrderedHashMap/Builder/interface",permalink:"/api/rimbu/ordered/OrderedHashMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedHashMap.Builder<K,V>",slug:"/rimbu/ordered/OrderedHashMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedHashMap (namespace)",permalink:"/api/rimbu/ordered/OrderedHashMap/namespace"},next:{title:"OrderedHashMap.Context<UK>",permalink:"/api/rimbu/ordered/OrderedHashMap/Context/interface"}},y={},h=[{value:"Type parameters",id:"type-parameters",level:2}],v={toc:h},g="wrapper";function k(e){var r=e,{components:t}=r,n=m(r,["components"]);return(0,a.kt)(g,s(c(c({},v),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"interface-orderedhashmapbuilderkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface OrderedHashMap.Builder<K,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"OrderedHashMap")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedHashMap/Builder/interface"}),"OrderedHashMap.Builder API documentation")),(0,a.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}k.isMDXComponent=!0}}]);