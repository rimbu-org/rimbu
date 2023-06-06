"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[1070],{3905:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>h});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var p=r.createContext({}),c=function(e){var t=r.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},s=function(e){var t=c(e.components);return r.createElement(p.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=c(a),d=n,h=u["".concat(p,".").concat(d)]||u[d]||m[d]||i;return a?r.createElement(h,o(o({ref:t},s),{},{components:a})):r.createElement(h,o({ref:t},s))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,o=new Array(i);o[0]=d;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[u]="string"==typeof e?e:n,o[1]=l;for(var c=2;c<i;c++)o[c]=a[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},87713:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>y,contentTitle:()=>f,default:()=>g,frontMatter:()=>h,metadata:()=>b,toc:()=>S});var r=a(3905),n=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,s=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))p.call(t,a)&&s(e,a,t[a]);if(l)for(var a of l(t))c.call(t,a)&&s(e,a,t[a]);return e},m=(e,t)=>i(e,o(t)),d=(e,t)=>{var a={};for(var r in e)p.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&c.call(e,r)&&(a[r]=e[r]);return a};const h={title:"HashSet (namespace)",slug:"/rimbu/core/HashSet/namespace"},f="namespace HashSet",b={unversionedId:"rimbu_core/HashSet/index",id:"rimbu_core/HashSet/index",title:"HashSet (namespace)",description:"A type-invariant immutable Set of value type T. In the Set, there are no duplicate values. See the Set documentation and the HashSet API documentation",source:"@site/api/rimbu_core/HashSet/index.mdx",sourceDirName:"rimbu_core/HashSet",slug:"/rimbu/core/HashSet/namespace",permalink:"/api/rimbu/core/HashSet/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"HashSet (namespace)",slug:"/rimbu/core/HashSet/namespace"},sidebar:"defaultSidebar",previous:{title:"HashMultiSet",permalink:"/api/rimbu/core/HashMultiSet/var"},next:{title:"HashSet.Builder<T>",permalink:"/api/rimbu/core/HashSet/Builder/interface"}},y={},S=[{value:"Interfaces",id:"interfaces",level:2}],k={toc:S},v="wrapper";function g(e){var t=e,{components:a}=t,n=d(t,["components"]);return(0,r.kt)(v,m(u(u({},k),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",u({},{id:"namespace-hashset"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace HashSet")),(0,r.kt)("p",null,"A type-invariant immutable Set of value type T. In the Set, there are no duplicate values. See the ",(0,r.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,r.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/api/rimbu/hashed/HashSet/interface"}),"HashSet API documentation")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/core/HashSet/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashSet<T>"))),(0,r.kt)("h2",u({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/core/HashSet/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashSet.Builder<T>"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"A mutable ",(0,r.kt)("inlineCode",{parentName:"td"},"HashSet")," builder used to efficiently create new immutable instances. See the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/hashed/HashSet/Builder/interface"}),"HashSet.Builder API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/core/HashSet/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashSet.Context<UT>"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"A context instance for a ",(0,r.kt)("inlineCode",{parentName:"td"},"HashSet")," that acts as a factory for every instance of this type of collection.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/core/HashSet/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashSet.NonEmpty<T>"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable Set of value type T. In the Set, there are no duplicate values. See the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/hashed/HashSet/interface"}),"HashSet API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/core/HashSet/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"HashSet.Types"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))))}g.isMDXComponent=!0}}]);