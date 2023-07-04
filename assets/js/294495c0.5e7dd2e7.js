"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[17358],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>f});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function p(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?p(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):p(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},p=Object.keys(e);for(n=0;n<p.length;n++)a=p[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(n=0;n<p.length;n++)a=p[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var c=n.createContext({}),l=function(e){var t=n.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},m=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},u="mdxType",y={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,p=e.originalType,c=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),u=l(a),s=r,f=u["".concat(c,".").concat(s)]||u[s]||y[s]||p;return a?n.createElement(f,o(o({ref:t},m),{},{components:a})):n.createElement(f,o({ref:t},m))}));function f(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var p=a.length,o=new Array(p);o[0]=s;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i[u]="string"==typeof e?e:r,o[1]=i;for(var l=2;l<p;l++)o[l]=a[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}s.displayName="MDXCreateElement"},37510:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>h,contentTitle:()=>d,default:()=>g,frontMatter:()=>f,metadata:()=>b,toc:()=>v});var n=a(3905),r=Object.defineProperty,p=Object.defineProperties,o=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,m=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))c.call(t,a)&&m(e,a,t[a]);if(i)for(var a of i(t))l.call(t,a)&&m(e,a,t[a]);return e},y=(e,t)=>p(e,o(t)),s=(e,t)=>{var a={};for(var n in e)c.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&i)for(var n of i(e))t.indexOf(n)<0&&l.call(e,n)&&(a[n]=e[n]);return a};const f={title:"VariantMap.NonEmpty<K,V>",slug:"/rimbu/collection-types/map/VariantMap/NonEmpty/interface"},d="interface VariantMap.NonEmpty<K,V>",b={unversionedId:"rimbu_collection-types/map/VariantMap/NonEmpty.interface",id:"rimbu_collection-types/map/VariantMap/NonEmpty.interface",title:"VariantMap.NonEmpty<K,V>",description:"A non-empty type-variant Map of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the Map documentation and the VariantMap API documentation",source:"@site/api/rimbu_collection-types/map/VariantMap/NonEmpty.interface.mdx",sourceDirName:"rimbu_collection-types/map/VariantMap",slug:"/rimbu/collection-types/map/VariantMap/NonEmpty/interface",permalink:"/api/rimbu/collection-types/map/VariantMap/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"VariantMap.NonEmpty<K,V>",slug:"/rimbu/collection-types/map/VariantMap/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"VariantMap (namespace)",permalink:"/api/rimbu/collection-types/map/VariantMap/namespace"},next:{title:"VariantMap.Types",permalink:"/api/rimbu/collection-types/map/VariantMap/Types/interface"}},h={},v=[{value:"Type parameters",id:"type-parameters",level:2}],k={toc:v},O="wrapper";function g(e){var t=e,{components:a}=t,r=s(t,["components"]);return(0,n.kt)(O,y(u(u({},k),r),{components:a,mdxType:"MDXLayout"}),(0,n.kt)("h1",u({},{id:"interface-variantmapnonemptykv"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface VariantMap.NonEmpty<K,V>")),(0,n.kt)("p",null,"A non-empty type-variant Map of key type K, and value type V. In the Map, each key has exactly one value, and the Map cannot contain duplicate keys. See the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/api/rimbu/collection-types/map/VariantMap/interface"}),"VariantMap API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map/VariantMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantMap<K,V>"))),(0,n.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the key type")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value type")))),(0,n.kt)("admonition",u({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"Type-variance means that both the key and value types can be widened in a type-safe way without casting.  @note As a consequence of being variant, the type does not contain methods that (can) add new elements to the collection.")))}g.isMDXComponent=!0}}]);