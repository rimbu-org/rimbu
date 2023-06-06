"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[32343],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>s});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function d(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)t=o[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)t=o[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var p=a.createContext({}),l=function(e){var r=a.useContext(p),t=r;return e&&(t="function"==typeof e?e(r):d(d({},r),e)),t},u=function(e){var r=l(e.components);return a.createElement(p.Provider,{value:r},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},f=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,o=e.originalType,p=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),c=l(t),f=n,s=c["".concat(p,".").concat(f)]||c[f]||m[f]||o;return t?a.createElement(s,d(d({ref:r},u),{},{components:t})):a.createElement(s,d({ref:r},u))}));function s(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var o=t.length,d=new Array(o);d[0]=f;var i={};for(var p in r)hasOwnProperty.call(r,p)&&(i[p]=r[p]);i.originalType=e,i[c]="string"==typeof e?e:n,d[1]=i;for(var l=2;l<o;l++)d[l]=t[l];return a.createElement.apply(null,d)}return a.createElement.apply(null,t)}f.displayName="MDXCreateElement"},53231:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>b,default:()=>h,frontMatter:()=>s,metadata:()=>O,toc:()=>v});var a=t(3905),n=Object.defineProperty,o=Object.defineProperties,d=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,c=(e,r)=>{for(var t in r||(r={}))p.call(r,t)&&u(e,t,r[t]);if(i)for(var t of i(r))l.call(r,t)&&u(e,t,r[t]);return e},m=(e,r)=>o(e,d(r)),f=(e,r)=>{var t={};for(var a in e)p.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&i)for(var a of i(e))r.indexOf(a)<0&&l.call(e,a)&&(t[a]=e[a]);return t};const s={title:"OrderedSortedMap.Builder<K,V>",slug:"/rimbu/ordered/map/OrderedSortedMap/Builder/interface"},b="interface OrderedSortedMap.Builder<K,V>",O={unversionedId:"rimbu_ordered/map/OrderedSortedMap/Builder.interface",id:"rimbu_ordered/map/OrderedSortedMap/Builder.interface",title:"OrderedSortedMap.Builder<K,V>",description:"A mutable OrderedSortedMap builder used to efficiently create new immutable instances. See the Map documentation and the OrderedSortedMap.Builder API documentation",source:"@site/api/rimbu_ordered/map/OrderedSortedMap/Builder.interface.mdx",sourceDirName:"rimbu_ordered/map/OrderedSortedMap",slug:"/rimbu/ordered/map/OrderedSortedMap/Builder/interface",permalink:"/api/rimbu/ordered/map/OrderedSortedMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSortedMap.Builder<K,V>",slug:"/rimbu/ordered/map/OrderedSortedMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSortedMap (namespace)",permalink:"/api/rimbu/ordered/map/OrderedSortedMap/namespace"},next:{title:"OrderedSortedMap.Context<UK>",permalink:"/api/rimbu/ordered/map/OrderedSortedMap/Context/interface"}},y={},v=[{value:"Type parameters",id:"type-parameters",level:2}],g={toc:v},k="wrapper";function h(e){var r=e,{components:t}=r,n=f(r,["components"]);return(0,a.kt)(k,m(c(c({},g),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"interface-orderedsortedmapbuilderkv"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface OrderedSortedMap.Builder<K,V>")),(0,a.kt)("p",null,"A mutable ",(0,a.kt)("inlineCode",{parentName:"p"},"OrderedSortedMap")," builder used to efficiently create new immutable instances. See the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,a.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/Builder/interface"}),"OrderedSortedMap.Builder API documentation")),(0,a.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,a.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}h.isMDXComponent=!0}}]);