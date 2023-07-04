"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[50682],{3905:(e,t,i)=>{i.d(t,{Zo:()=>d,kt:()=>f});var n=i(67294);function a(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function l(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function r(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?l(Object(i),!0).forEach((function(t){a(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):l(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function u(e,t){if(null==e)return{};var i,n,a=function(e,t){if(null==e)return{};var i,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)i=l[n],t.indexOf(i)>=0||(a[i]=e[i]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)i=l[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(a[i]=e[i])}return a}var p=n.createContext({}),o=function(e){var t=n.useContext(p),i=t;return e&&(i="function"==typeof e?e(t):r(r({},t),e)),i},d=function(e){var t=o(e.components);return n.createElement(p.Provider,{value:t},e.children)},m="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var i=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,d=u(e,["components","mdxType","originalType","parentName"]),m=o(i),c=a,f=m["".concat(p,".").concat(c)]||m[c]||s[c]||l;return i?n.createElement(f,r(r({ref:t},d),{},{components:i})):n.createElement(f,r({ref:t},d))}));function f(e,t){var i=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=i.length,r=new Array(l);r[0]=c;var u={};for(var p in t)hasOwnProperty.call(t,p)&&(u[p]=t[p]);u.originalType=e,u[m]="string"==typeof e?e:a,r[1]=u;for(var o=2;o<l;o++)r[o]=i[o];return n.createElement.apply(null,r)}return n.createElement.apply(null,i)}c.displayName="MDXCreateElement"},25924:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>y,contentTitle:()=>k,default:()=>N,frontMatter:()=>f,metadata:()=>h,toc:()=>v});var n=i(3905),a=Object.defineProperty,l=Object.defineProperties,r=Object.getOwnPropertyDescriptors,u=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,d=(e,t,i)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,m=(e,t)=>{for(var i in t||(t={}))p.call(t,i)&&d(e,i,t[i]);if(u)for(var i of u(t))o.call(t,i)&&d(e,i,t[i]);return e},s=(e,t)=>l(e,r(t)),c=(e,t)=>{var i={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(i[n]=e[n]);if(null!=e&&u)for(var n of u(e))t.indexOf(n)<0&&o.call(e,n)&&(i[n]=e[n]);return i};const f={title:"HashBiMultiMap.Types",slug:"/rimbu/bimultimap/HashBiMultiMap/Types/interface"},k="interface HashBiMultiMap.Types",h={unversionedId:"rimbu_bimultimap/HashBiMultiMap/Types.interface",id:"rimbu_bimultimap/HashBiMultiMap/Types.interface",title:"HashBiMultiMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_bimultimap/HashBiMultiMap/Types.interface.mdx",sourceDirName:"rimbu_bimultimap/HashBiMultiMap",slug:"/rimbu/bimultimap/HashBiMultiMap/Types/interface",permalink:"/api/rimbu/bimultimap/HashBiMultiMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashBiMultiMap.Types",slug:"/rimbu/bimultimap/HashBiMultiMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"HashBiMultiMap.NonEmpty<K,V>",permalink:"/api/rimbu/bimultimap/HashBiMultiMap/NonEmpty/interface"},next:{title:"HashBiMultiMap<K,V>",permalink:"/api/rimbu/bimultimap/HashBiMultiMap/interface"}},y={},v=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>keyMultiMapValues</code>",id:"keymultimapvalues",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>keyValueMultiMap</code>",id:"keyvaluemultimap",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>valueKeyMultiMap</code>",id:"valuekeymultimap",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>valueMultiMapValues</code>",id:"valuemultimapvalues",level:3},{value:"Definition",id:"definition-7",level:4}],M={toc:v},b="wrapper";function N(e){var t=e,{components:i}=t,a=c(t,["components"]);return(0,n.kt)(b,s(m(m({},M),a),{components:i,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"interface-hashbimultimaptypes"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface HashBiMultiMap.Types")),(0,n.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,n.kt)("h2",m({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/HashBiMultiMap/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"context"}),(0,n.kt)("inlineCode",{parentName:"h3"},"context")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/HashBiMultiMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"keymultimapvalues"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyMultiMapValues")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyMultiMapValues: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/set/HashSet/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashSet")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"keyvaluemultimap"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyValueMultiMap")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyValueMultiMap: HashMultiMapHashValue<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/HashBiMultiMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"normal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"normal")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/HashBiMultiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"valuekeymultimap"}),(0,n.kt)("inlineCode",{parentName:"h3"},"valueKeyMultiMap")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly valueKeyMultiMap: HashMultiMapHashValue<this['_V'], this['_K']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"valuemultimapvalues"}),(0,n.kt)("inlineCode",{parentName:"h3"},"valueMultiMapValues")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly valueMultiMapValues: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/set/HashSet/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashSet")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K']>;")))))}N.isMDXComponent=!0}}]);