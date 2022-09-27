"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[86567],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function d(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),u=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):d(d({},r),e)),t},c=function(e){var r=u(e.components);return n.createElement(l.Provider,{value:r},e.children)},p={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},m=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),m=u(t),f=a,s=m["".concat(l,".").concat(f)]||m[f]||p[f]||o;return t?n.createElement(s,d(d({ref:r},c),{},{components:t})):n.createElement(s,d({ref:r},c))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,d=new Array(o);d[0]=m;var i={};for(var l in r)hasOwnProperty.call(r,l)&&(i[l]=r[l]);i.originalType=e,i.mdxType="string"==typeof e?e:a,d[1]=i;for(var u=2;u<o;u++)d[u]=t[u];return n.createElement.apply(null,d)}return n.createElement.apply(null,t)}m.displayName="MDXCreateElement"},38100:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>b,contentTitle:()=>f,default:()=>y,frontMatter:()=>m,metadata:()=>s,toc:()=>O});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,d=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,p=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&c(e,t,r[t]);if(i)for(var t of i(r))u.call(r,t)&&c(e,t,r[t]);return e};const m={title:"OrderedSortedSet.Builder<T>",slug:"/rimbu/ordered/OrderedSortedSet/Builder/interface"},f="interface OrderedSortedSet.Builder<T>",s={unversionedId:"rimbu_ordered/OrderedSortedSet/Builder.interface",id:"rimbu_ordered/OrderedSortedSet/Builder.interface",title:"OrderedSortedSet.Builder<T>",description:"A mutable OrderedSortedSet builder used to efficiently create new immutable instances. See the Set documentation and the OrderedSortedSet.Builder API documentation",source:"@site/api/rimbu_ordered/OrderedSortedSet/Builder.interface.mdx",sourceDirName:"rimbu_ordered/OrderedSortedSet",slug:"/rimbu/ordered/OrderedSortedSet/Builder/interface",permalink:"/api/rimbu/ordered/OrderedSortedSet/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSortedSet.Builder<T>",slug:"/rimbu/ordered/OrderedSortedSet/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSortedSet (namespace)",permalink:"/api/rimbu/ordered/OrderedSortedSet/namespace"},next:{title:"OrderedSortedSet.Context<UT>",permalink:"/api/rimbu/ordered/OrderedSortedSet/Context/interface"}},b={},O=[{value:"Type parameters",id:"type-parameters",level:2}],S={toc:O};function y(e){var r,t=e,{components:a}=t,c=((e,r)=>{var t={};for(var n in e)l.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&i)for(var n of i(e))r.indexOf(n)<0&&u.call(e,n)&&(t[n]=e[n]);return t})(t,["components"]);return(0,n.kt)("wrapper",(r=p(p({},S),c),o(r,d({components:a,mdxType:"MDXLayout"}))),(0,n.kt)("h1",p({},{id:"interface-orderedsortedsetbuildert"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface OrderedSortedSet.Builder<T>")),(0,n.kt)("p",null,"A mutable ",(0,n.kt)("inlineCode",{parentName:"p"},"OrderedSortedSet")," builder used to efficiently create new immutable instances. See the ",(0,n.kt)("a",p({parentName:"p"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",p({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSortedSet/Builder/interface"}),"OrderedSortedSet.Builder API documentation")),(0,n.kt)("h2",p({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",p({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",p({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",p({parentName:"tr"},{align:null}),"the value type")))))}y.isMDXComponent=!0}}]);