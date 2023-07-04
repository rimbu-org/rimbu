"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[30935],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>f});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=p(n),s=i,f=c["".concat(d,".").concat(s)]||c[s]||m[s]||a;return n?r.createElement(f,o(o({ref:t},u),{},{components:n})):r.createElement(f,o({ref:t},u))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=s;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[c]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},92332:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>h,contentTitle:()=>k,default:()=>N,frontMatter:()=>f,metadata:()=>y,toc:()=>b});var r=n(3905),i=Object.defineProperty,a=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,u=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,c=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&u(e,n,t[n]);if(l)for(var n of l(t))p.call(t,n)&&u(e,n,t[n]);return e},m=(e,t)=>a(e,o(t)),s=(e,t)=>{var n={};for(var r in e)d.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n};const f={title:"OrderedMap.Types",slug:"/rimbu/ordered/OrderedMap/Types/interface"},k="interface OrderedMap.Types",y={unversionedId:"rimbu_ordered/OrderedMap/Types.interface",id:"rimbu_ordered/OrderedMap/Types.interface",title:"OrderedMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_ordered/OrderedMap/Types.interface.mdx",sourceDirName:"rimbu_ordered/OrderedMap",slug:"/rimbu/ordered/OrderedMap/Types/interface",permalink:"/api/rimbu/ordered/OrderedMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedMap.Types",slug:"/rimbu/ordered/OrderedMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedMap.NonEmpty<K,V>",permalink:"/api/rimbu/ordered/OrderedMap/NonEmpty/interface"},next:{title:"OrderedMap<K,V>",permalink:"/api/rimbu/ordered/OrderedMap/interface"}},h={},b=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>sourceContext</code>",id:"sourcecontext",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>sourceMap</code>",id:"sourcemap",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>sourceMapNonEmpty</code>",id:"sourcemapnonempty",level:3},{value:"Definition",id:"definition-6",level:4}],v={toc:b},O="wrapper";function N(e){var t=e,{components:n}=t,i=s(t,["components"]);return(0,r.kt)(O,m(c(c({},v),i),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",c({},{id:"interface-orderedmaptypes"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface OrderedMap.Types")),(0,r.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,r.kt)("h2",c({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"builder"}),(0,r.kt)("inlineCode",{parentName:"h3"},"builder")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedMap.Builder")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"context"}),(0,r.kt)("inlineCode",{parentName:"h3"},"context")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedMap.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"nonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedMap.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"normal"}),(0,r.kt)("inlineCode",{parentName:"h3"},"normal")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedMap")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"sourcecontext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceContext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceContext: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"sourcemap"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceMap")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceMap: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RMap")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"sourcemapnonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceMapNonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-6"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceMapNonEmpty: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RMap.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}N.isMDXComponent=!0}}]);