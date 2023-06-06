"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[40614],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var o=n.createContext({}),u=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},m=function(e){var t=u(e.components);return n.createElement(o.Provider,{value:t},e.children)},c="mdxType",b={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},y=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),c=u(r),y=a,f=c["".concat(o,".").concat(y)]||c[y]||b[y]||i;return r?n.createElement(f,p(p({ref:t},m),{},{components:r})):n.createElement(f,p({ref:t},m))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,p=new Array(i);p[0]=y;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[c]="string"==typeof e?e:a,p[1]=l;for(var u=2;u<i;u++)p[u]=r[u];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}y.displayName="MDXCreateElement"},50136:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>M,contentTitle:()=>s,default:()=>k,frontMatter:()=>f,metadata:()=>d,toc:()=>v});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))o.call(t,r)&&m(e,r,t[r]);if(l)for(var r of l(t))u.call(t,r)&&m(e,r,t[r]);return e},b=(e,t)=>i(e,p(t)),y=(e,t)=>{var r={};for(var n in e)o.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&l)for(var n of l(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const f={title:"BiMultiMap.NonEmpty<K,V>",slug:"/rimbu/bimultimap/BiMultiMap/NonEmpty/interface"},s="interface BiMultiMap.NonEmpty<K,V>",d={unversionedId:"rimbu_bimultimap/BiMultiMap/NonEmpty.interface",id:"rimbu_bimultimap/BiMultiMap/NonEmpty.interface",title:"BiMultiMap.NonEmpty<K,V>",description:"A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. See the BiMultiMap documentation and the BiMultiMap API documentation",source:"@site/api/rimbu_bimultimap/BiMultiMap/NonEmpty.interface.mdx",sourceDirName:"rimbu_bimultimap/BiMultiMap",slug:"/rimbu/bimultimap/BiMultiMap/NonEmpty/interface",permalink:"/api/rimbu/bimultimap/BiMultiMap/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"BiMultiMap.NonEmpty<K,V>",slug:"/rimbu/bimultimap/BiMultiMap/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"BiMultiMap.Context<UK,UV>",permalink:"/api/rimbu/bimultimap/BiMultiMap/Context/interface"},next:{title:"BiMultiMap.Types",permalink:"/api/rimbu/bimultimap/BiMultiMap/Types/interface"}},M={},v=[{value:"Type parameters",id:"type-parameters",level:2}],O={toc:v},g="wrapper";function k(e){var t=e,{components:r}=t,a=y(t,["components"]);return(0,n.kt)(g,b(c(c({},O),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",c({},{id:"interface-bimultimapnonemptykv"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface BiMultiMap.NonEmpty<K,V>")),(0,n.kt)("p",null,"A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a many-to-many mapping. See the ",(0,n.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/bimultimap"}),"BiMultiMap documentation")," and the ",(0,n.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/interface"}),"BiMultiMap API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/bimultimap/BiMultiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMap<K,V>"))),(0,n.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",c({parentName:"tr"},{align:null}),"the key type")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))))}k.isMDXComponent=!0}}]);