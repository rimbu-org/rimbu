"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[93982],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>s});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),c=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},u=function(e){var r=c(e.components);return n.createElement(l.Provider,{value:r},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),d=c(t),f=a,s=d["".concat(l,".").concat(f)]||d[f]||m[f]||o;return t?n.createElement(s,i(i({ref:r},u),{},{components:t})):n.createElement(s,i({ref:r},u))}));function s(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=f;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p[d]="string"==typeof e?e:a,i[1]=p;for(var c=2;c<o;c++)i[c]=t[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},75088:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>y,contentTitle:()=>b,default:()=>v,frontMatter:()=>s,metadata:()=>h,toc:()=>w});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,d=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&u(e,t,r[t]);if(p)for(var t of p(r))c.call(r,t)&&u(e,t,r[t]);return e},m=(e,r)=>o(e,i(r)),f=(e,r)=>{var t={};for(var n in e)l.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&c.call(e,n)&&(t[n]=e[n]);return t};const s={title:"ArrowGraphSorted.Builder<N>",slug:"/rimbu/core/ArrowGraphSorted/Builder/interface"},b="interface ArrowGraphSorted.Builder<N>",h={unversionedId:"rimbu_core/ArrowGraphSorted/Builder.interface",id:"rimbu_core/ArrowGraphSorted/Builder.interface",title:"ArrowGraphSorted.Builder<N>",description:"A mutable ArrowGraphSorted builder used to efficiently create new immutable instances. See the Graph documentation and the ArrowGraphSorted.Builder API documentation",source:"@site/api/rimbu_core/ArrowGraphSorted/Builder.interface.mdx",sourceDirName:"rimbu_core/ArrowGraphSorted",slug:"/rimbu/core/ArrowGraphSorted/Builder/interface",permalink:"/api/rimbu/core/ArrowGraphSorted/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ArrowGraphSorted.Builder<N>",slug:"/rimbu/core/ArrowGraphSorted/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"ArrowGraphSorted (namespace)",permalink:"/api/rimbu/core/ArrowGraphSorted/namespace"},next:{title:"ArrowGraphSorted.Context<UN>",permalink:"/api/rimbu/core/ArrowGraphSorted/Context/interface"}},y={},w=[{value:"Type parameters",id:"type-parameters",level:2}],O={toc:w},g="wrapper";function v(e){var r=e,{components:t}=r,a=f(r,["components"]);return(0,n.kt)(g,m(d(d({},O),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",d({},{id:"interface-arrowgraphsortedbuildern"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface ArrowGraphSorted.Builder<N>")),(0,n.kt)("p",null,"A mutable ",(0,n.kt)("inlineCode",{parentName:"p"},"ArrowGraphSorted")," builder used to efficiently create new immutable instances. See the ",(0,n.kt)("a",d({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,n.kt)("a",d({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/Builder/interface"}),"ArrowGraphSorted.Builder API documentation")),(0,n.kt)("h2",d({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"N"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"the node type")))))}v.isMDXComponent=!0}}]);