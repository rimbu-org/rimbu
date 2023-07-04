"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[76586],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),l=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=l(e.components);return n.createElement(p.Provider,{value:t},e.children)},s="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,c=d(e,["components","mdxType","originalType","parentName"]),s=l(r),m=a,f=s["".concat(p,".").concat(m)]||s[m]||u[m]||o;return r?n.createElement(f,i(i({ref:t},c),{},{components:r})):n.createElement(f,i({ref:t},c))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=m;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[s]="string"==typeof e?e:a,i[1]=d;for(var l=2;l<o;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},91637:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>y,contentTitle:()=>O,default:()=>k,frontMatter:()=>f,metadata:()=>b,toc:()=>h});var n=r(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,d=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&c(e,r,t[r]);if(d)for(var r of d(t))l.call(t,r)&&c(e,r,t[r]);return e},u=(e,t)=>o(e,i(t)),m=(e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&d)for(var n of d(e))t.indexOf(n)<0&&l.call(e,n)&&(r[n]=e[n]);return r};const f={title:"OrderedSet<T>",slug:"/rimbu/ordered/set/OrderedSet/interface"},O="interface OrderedSet<T>",b={unversionedId:"rimbu_ordered/set/OrderedSet.interface",id:"rimbu_ordered/set/OrderedSet.interface",title:"OrderedSet<T>",description:"A type-invariant immutable Ordered Set of value type T. In the Set, there are no duplicate values. See the Set documentation and the OrderedSet API documentation",source:"@site/api/rimbu_ordered/set/OrderedSet.interface.mdx",sourceDirName:"rimbu_ordered/set",slug:"/rimbu/ordered/set/OrderedSet/interface",permalink:"/api/rimbu/ordered/set/OrderedSet/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSet<T>",slug:"/rimbu/ordered/set/OrderedSet/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSet.Types",permalink:"/api/rimbu/ordered/set/OrderedSet/Types/interface"},next:{title:"OrderedSortedSet (namespace)",permalink:"/api/rimbu/ordered/set/OrderedSortedSet/namespace"}},y={},h=[{value:"Type parameters",id:"type-parameters",level:2}],S={toc:h},v="wrapper";function k(e){var t=e,{components:r}=t,a=m(t,["components"]);return(0,n.kt)(v,u(s(s({},S),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"interface-orderedsett"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface OrderedSet<T>")),(0,n.kt)("p",null,"A type-invariant immutable Ordered Set of value type T. In the Set, there are no duplicate values. See the ",(0,n.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSet/interface"}),"OrderedSet API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSet/namespace"}),"OrderedSet")),(0,n.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the value type")))),(0,n.kt)("admonition",s({},{title:"note",type:"note"}),(0,n.kt)("ul",{parentName:"admonition"},(0,n.kt)("li",{parentName:"ul"},"The OrderedSet keeps the insertion order of values, thus iterators and stream will also reflect this order. - The OrderedSet wraps around an RSet instance, thus has the same time complexity as the source set. - The OrderedSet keeps the key insertion order in a List, thus its space complexity is higher than the source set."))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"const s1 = OrderedSortedSet.empty<string>()\nconst s2 = OrderedSortedSet.of('a', 'b', 'c')\n"))))}k.isMDXComponent=!0}}]);