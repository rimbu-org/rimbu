"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[70759],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},u="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=p(n),d=i,m=u["".concat(c,".").concat(d)]||u[d]||f[d]||o;return n?r.createElement(m,a(a({ref:t},s),{},{components:n})):r.createElement(m,a({ref:t},s))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[u]="string"==typeof e?e:i,a[1]=l;for(var p=2;p<o;p++)a[p]=n[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},90460:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>v,contentTitle:()=>y,default:()=>h,frontMatter:()=>m,metadata:()=>b,toc:()=>O});var r=n(3905),i=Object.defineProperty,o=Object.defineProperties,a=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,s=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))c.call(t,n)&&s(e,n,t[n]);if(l)for(var n of l(t))p.call(t,n)&&s(e,n,t[n]);return e},f=(e,t)=>o(e,a(t)),d=(e,t)=>{var n={};for(var r in e)c.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n};const m={title:"List.Context",slug:"/rimbu/list/List/Context/interface"},y="interface List.Context",b={unversionedId:"rimbu_list/List/Context.interface",id:"rimbu_list/List/Context.interface",title:"List.Context",description:"A context instance for List that acts as a factory for every instance of this type of collection.",source:"@site/api/rimbu_list/List/Context.interface.mdx",sourceDirName:"rimbu_list/List",slug:"/rimbu/list/List/Context/interface",permalink:"/api/rimbu/list/List/Context/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"List.Context",slug:"/rimbu/list/List/Context/interface"},sidebar:"defaultSidebar",previous:{title:"List.Builder<T>",permalink:"/api/rimbu/list/List/Builder/interface"},next:{title:"List.NonEmpty<T>",permalink:"/api/rimbu/list/List/NonEmpty/interface"}},v={},O=[{value:"Properties",id:"properties",level:2},{value:"<code>_types</code>",id:"_types",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>typeTag</code>",id:"typetag",level:3},{value:"Definition",id:"definition-1",level:4}],k={toc:O},g="wrapper";function h(e){var t=e,{components:n}=t,i=d(t,["components"]);return(0,r.kt)(g,f(u(u({},k),i),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",u({},{id:"interface-listcontext"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface List.Context")),(0,r.kt)("p",null,"A context instance for ",(0,r.kt)("inlineCode",{parentName:"p"},"List")," that acts as a factory for every instance of this type of collection."),(0,r.kt)("h2",u({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"_types"}),(0,r.kt)("inlineCode",{parentName:"h3"},"_types")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly _types: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/List/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"List.Types")),(0,r.kt)("inlineCode",{parentName:"p"},";")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"typetag"}),(0,r.kt)("inlineCode",{parentName:"h3"},"typeTag")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly typeTag: 'List';")))))}h.isMDXComponent=!0}}]);