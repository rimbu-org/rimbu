"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[63037],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>s});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),u=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},d=function(e){var t=u(e.components);return n.createElement(p.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),c=u(r),f=a,s=c["".concat(p,".").concat(f)]||c[f]||m[f]||i;return r?n.createElement(s,l(l({ref:t},d),{},{components:r})):n.createElement(s,l({ref:t},d))}));function s(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=f;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[c]="string"==typeof e?e:a,l[1]=o;for(var u=2;u<i;u++)l[u]=r[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},52447:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>k,contentTitle:()=>h,default:()=>O,frontMatter:()=>s,metadata:()=>y,toc:()=>b});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,d=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&d(e,r,t[r]);if(o)for(var r of o(t))u.call(t,r)&&d(e,r,t[r]);return e},m=(e,t)=>i(e,l(t)),f=(e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r};const s={title:"ValuedGraph.Types",slug:"/rimbu/graph/ValuedGraph/Types/interface"},h="interface ValuedGraph.Types",y={unversionedId:"rimbu_graph/ValuedGraph/Types.interface",id:"rimbu_graph/ValuedGraph/Types.interface",title:"ValuedGraph.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_graph/ValuedGraph/Types.interface.mdx",sourceDirName:"rimbu_graph/ValuedGraph",slug:"/rimbu/graph/ValuedGraph/Types/interface",permalink:"/api/rimbu/graph/ValuedGraph/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ValuedGraph.Types",slug:"/rimbu/graph/ValuedGraph/Types/interface"},sidebar:"defaultSidebar",previous:{title:"ValuedGraph.NonEmpty<N,V>",permalink:"/api/rimbu/graph/ValuedGraph/NonEmpty/interface"},next:{title:"ValuedGraph<N,V>",permalink:"/api/rimbu/graph/ValuedGraph/interface"}},k={},b=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4}],v={toc:b},g="wrapper";function O(e){var t=e,{components:r}=t,a=f(t,["components"]);return(0,n.kt)(g,m(c(c({},v),a),{components:r,mdxType:"MDXLayout"}),(0,n.kt)("h1",c({},{id:"interface-valuedgraphtypes"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface ValuedGraph.Types")),(0,n.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,n.kt)("h2",c({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/graph/ValuedGraph/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ValuedGraph.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_N'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"context"}),(0,n.kt)("inlineCode",{parentName:"h3"},"context")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/graph/ValuedGraph/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ValuedGraph.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_N']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/graph/ValuedGraph/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ValuedGraph.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_N'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"normal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"normal")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/graph/ValuedGraph/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ValuedGraph")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_N'], this['_V']>;")))))}O.isMDXComponent=!0}}]);