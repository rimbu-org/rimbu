"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[17588],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>b});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=c(r),m=a,b=s["".concat(l,".").concat(m)]||s[m]||f[m]||o;return r?n.createElement(b,i(i({ref:t},u),{},{components:r})):n.createElement(b,i({ref:t},u))}));function b(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[s]="string"==typeof e?e:a,i[1]=p;for(var c=2;c<o;c++)i[c]=r[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},47363:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>y,contentTitle:()=>d,default:()=>x,frontMatter:()=>b,metadata:()=>h,toc:()=>g});var n=r(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,u=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,s=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&u(e,r,t[r]);if(p)for(var r of p(t))c.call(t,r)&&u(e,r,t[r]);return e},f=(e,t)=>o(e,i(t)),m=(e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r};const b={title:"Graph.Context<UN>",slug:"/rimbu/graph/Graph/Context/interface"},d="interface Graph.Context<UN>",h={unversionedId:"rimbu_graph/Graph/Context.interface",id:"rimbu_graph/Graph/Context.interface",title:"Graph.Context<UN>",description:"The EdgeValuedGraGraphphSorted's Context instance that serves as a factory for all related immutable instances and builders.",source:"@site/api/rimbu_graph/Graph/Context.interface.mdx",sourceDirName:"rimbu_graph/Graph",slug:"/rimbu/graph/Graph/Context/interface",permalink:"/api/rimbu/graph/Graph/Context/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"Graph.Context<UN>",slug:"/rimbu/graph/Graph/Context/interface"},sidebar:"defaultSidebar",previous:{title:"Graph.Builder<N>",permalink:"/api/rimbu/graph/Graph/Builder/interface"},next:{title:"Graph.NonEmpty<N>",permalink:"/api/rimbu/graph/Graph/NonEmpty/interface"}},y={},g=[{value:"Type parameters",id:"type-parameters",level:2}],O={toc:g},v="wrapper";function x(e){var t=e,{components:r}=t,a=m(t,["components"]);return(0,n.kt)(v,f(s(s({},O),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"interface-graphcontextun"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface Graph.Context<UN>")),(0,n.kt)("p",null,"The EdgeValuedGraGraphphSorted's Context instance that serves as a factory for all related immutable instances and builders."),(0,n.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"UN"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the upper type limit for node types for which this context can create instances")))))}x.isMDXComponent=!0}}]);