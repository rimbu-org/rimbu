"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[5318],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>b});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),c=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},u=function(e){var r=c(e.components);return n.createElement(l.Provider,{value:r},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},m=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=c(t),m=a,b=s["".concat(l,".").concat(m)]||s[m]||f[m]||o;return t?n.createElement(b,i(i({ref:r},u),{},{components:t})):n.createElement(b,i({ref:r},u))}));function b(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=m;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p[s]="string"==typeof e?e:a,i[1]=p;for(var c=2;c<o;c++)i[c]=t[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}m.displayName="MDXCreateElement"},15213:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>d,contentTitle:()=>h,default:()=>v,frontMatter:()=>b,metadata:()=>y,toc:()=>g});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,s=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&u(e,t,r[t]);if(p)for(var t of p(r))c.call(r,t)&&u(e,t,r[t]);return e},f=(e,r)=>o(e,i(r)),m=(e,r)=>{var t={};for(var n in e)l.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&c.call(e,n)&&(t[n]=e[n]);return t};const b={title:"ArrowGraph.Context<UN>",slug:"/rimbu/graph/ArrowGraph/Context/interface"},h="interface ArrowGraph.Context<UN>",y={unversionedId:"rimbu_graph/ArrowGraph/Context.interface",id:"rimbu_graph/ArrowGraph/Context.interface",title:"ArrowGraph.Context<UN>",description:"The ArrowGraph's Context instance that serves as a factory for all related immutable instances and builders.",source:"@site/api/rimbu_graph/ArrowGraph/Context.interface.mdx",sourceDirName:"rimbu_graph/ArrowGraph",slug:"/rimbu/graph/ArrowGraph/Context/interface",permalink:"/api/rimbu/graph/ArrowGraph/Context/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ArrowGraph.Context<UN>",slug:"/rimbu/graph/ArrowGraph/Context/interface"},sidebar:"defaultSidebar",previous:{title:"ArrowGraph.Builder<N>",permalink:"/api/rimbu/graph/ArrowGraph/Builder/interface"},next:{title:"ArrowGraph.NonEmpty<N>",permalink:"/api/rimbu/graph/ArrowGraph/NonEmpty/interface"}},d={},g=[{value:"Type parameters",id:"type-parameters",level:2}],w={toc:g},O="wrapper";function v(e){var r=e,{components:t}=r,a=m(r,["components"]);return(0,n.kt)(O,f(s(s({},w),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"interface-arrowgraphcontextun"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface ArrowGraph.Context<UN>")),(0,n.kt)("p",null,"The ArrowGraph's Context instance that serves as a factory for all related immutable instances and builders."),(0,n.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"UN"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the upper type limit for node types for which this context can create instances")))))}v.isMDXComponent=!0}}]);