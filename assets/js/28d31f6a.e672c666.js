"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[69021],{3905:(e,t,i)=>{i.d(t,{Zo:()=>d,kt:()=>s});var n=i(67294);function l(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function a(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function p(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?a(Object(i),!0).forEach((function(t){l(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function r(e,t){if(null==e)return{};var i,n,l=function(e,t){if(null==e)return{};var i,n,l={},a=Object.keys(e);for(n=0;n<a.length;n++)i=a[n],t.indexOf(i)>=0||(l[i]=e[i]);return l}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)i=a[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(l[i]=e[i])}return l}var u=n.createContext({}),o=function(e){var t=n.useContext(u),i=t;return e&&(i="function"==typeof e?e(t):p(p({},t),e)),i},d=function(e){var t=o(e.components);return n.createElement(u.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var i=e.components,l=e.mdxType,a=e.originalType,u=e.parentName,d=r(e,["components","mdxType","originalType","parentName"]),m=o(i),c=l,s=m["".concat(u,".").concat(c)]||m[c]||k[c]||a;return i?n.createElement(s,p(p({ref:t},d),{},{components:i})):n.createElement(s,p({ref:t},d))}));function s(e,t){var i=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var a=i.length,p=new Array(a);p[0]=c;var r={};for(var u in t)hasOwnProperty.call(t,u)&&(r[u]=t[u]);r.originalType=e,r[m]="string"==typeof e?e:l,p[1]=r;for(var o=2;o<a;o++)p[o]=i[o];return n.createElement.apply(null,p)}return n.createElement.apply(null,i)}c.displayName="MDXCreateElement"},36047:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>h,contentTitle:()=>y,default:()=>N,frontMatter:()=>s,metadata:()=>f,toc:()=>v});var n=i(3905),l=Object.defineProperty,a=Object.defineProperties,p=Object.getOwnPropertyDescriptors,r=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,d=(e,t,i)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,m=(e,t)=>{for(var i in t||(t={}))u.call(t,i)&&d(e,i,t[i]);if(r)for(var i of r(t))o.call(t,i)&&d(e,i,t[i]);return e},k=(e,t)=>a(e,p(t)),c=(e,t)=>{var i={};for(var n in e)u.call(e,n)&&t.indexOf(n)<0&&(i[n]=e[n]);if(null!=e&&r)for(var n of r(e))t.indexOf(n)<0&&o.call(e,n)&&(i[n]=e[n]);return i};const s={title:"BiMultiMapBase.Types",slug:"/rimbu/bimultimap/custom/BiMultiMapBase/Types/interface"},y="interface BiMultiMapBase.Types",f={unversionedId:"rimbu_bimultimap/custom/BiMultiMapBase/Types.interface",id:"rimbu_bimultimap/custom/BiMultiMapBase/Types.interface",title:"BiMultiMapBase.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_bimultimap/custom/BiMultiMapBase/Types.interface.mdx",sourceDirName:"rimbu_bimultimap/custom/BiMultiMapBase",slug:"/rimbu/bimultimap/custom/BiMultiMapBase/Types/interface",permalink:"/api/rimbu/bimultimap/custom/BiMultiMapBase/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"BiMultiMapBase.Types",slug:"/rimbu/bimultimap/custom/BiMultiMapBase/Types/interface"},sidebar:"defaultSidebar",previous:{title:"BiMultiMapBase.NonEmpty<K,V,Tp>",permalink:"/api/rimbu/bimultimap/custom/BiMultiMapBase/NonEmpty/interface"},next:{title:"BiMultiMapBase<K,V,Tp>",permalink:"/api/rimbu/bimultimap/custom/BiMultiMapBase/interface"}},h={},v=[{value:"Properties",id:"properties",level:2},{value:"<code>_K</code>",id:"_k",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>_V</code>",id:"_v",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>keyMultiMapValues</code>",id:"keymultimapvalues",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>keyValueMultiMap</code>",id:"keyvaluemultimap",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>keyValueMultiMapContext</code>",id:"keyvaluemultimapcontext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>keyValueMultiMapNonEmpty</code>",id:"keyvaluemultimapnonempty",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-8",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-9",level:4},{value:"<code>valueKeyMultiMap</code>",id:"valuekeymultimap",level:3},{value:"Definition",id:"definition-10",level:4},{value:"<code>valueKeyMultiMapContext</code>",id:"valuekeymultimapcontext",level:3},{value:"Definition",id:"definition-11",level:4},{value:"<code>valueKeyMultiMapNonEmpty</code>",id:"valuekeymultimapnonempty",level:3},{value:"Definition",id:"definition-12",level:4},{value:"<code>valueMultiMapValues</code>",id:"valuemultimapvalues",level:3},{value:"Definition",id:"definition-13",level:4}],M={toc:v},b="wrapper";function N(e){var t=e,{components:i}=t,l=c(t,["components"]);return(0,n.kt)(b,k(m(m({},M),l),{components:i,mdxType:"MDXLayout"}),(0,n.kt)("h1",m({},{id:"interface-bimultimapbasetypes"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface BiMultiMapBase.Types")),(0,n.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"KeyValue<K,V>"))),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/SortedBiMultiMap/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"SortedBiMultiMap.Types")),", ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/BiMultiMap/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMap.Types")),", ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/custom/ContextTypesImpl/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ContextTypesImpl")),", ",(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/core/HashBiMultiMap/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashBiMultiMap.Types"))),(0,n.kt)("h2",m({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"_k"}),(0,n.kt)("inlineCode",{parentName:"h3"},"_K")),(0,n.kt)("p",null,"The key type.")),(0,n.kt)("h4",m({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly _K: K;"))),(0,n.kt)("h4",m({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface#_K"}),"KeyValue._K"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"_v"}),(0,n.kt)("inlineCode",{parentName:"h3"},"_V")),(0,n.kt)("p",null,"The value type.")),(0,n.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly _V: V;"))),(0,n.kt)("h4",m({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface#_V"}),"KeyValue._V"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"The 'builder' collection type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/custom/BiMultiMapBase/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMapBase.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"context"}),(0,n.kt)("inlineCode",{parentName:"h3"},"context")),(0,n.kt)("p",null,"The collection context type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/custom/BiMultiMapBase/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMapBase.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"keymultimapvalues"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyMultiMapValues")),(0,n.kt)("p",null,"The value set collection type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyMultiMapValues: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/RSet/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RSet")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"keyvaluemultimap"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyValueMultiMap")),(0,n.kt)("p",null,"The key to value multimap type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyValueMultiMap: MultiMap<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"keyvaluemultimapcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyValueMultiMapContext")),(0,n.kt)("p",null,"The key to value multimap context type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyValueMultiMapContext: MultiMap.Context<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"keyvaluemultimapnonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyValueMultiMapNonEmpty")),(0,n.kt)("p",null,"The non-empty key to value multimap type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyValueMultiMapNonEmpty: MultiMap.NonEmpty<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"The 'non-empty' collection type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-8"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/custom/BiMultiMapBase/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMapBase.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"normal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"normal")),(0,n.kt)("p",null,"The 'normal' collection type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-9"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/bimultimap/custom/BiMultiMapBase/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMultiMapBase")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"valuekeymultimap"}),(0,n.kt)("inlineCode",{parentName:"h3"},"valueKeyMultiMap")),(0,n.kt)("p",null,"The value to key multimap type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-10"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly valueKeyMultiMap: MultiMap<this['_V'], this['_K']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"valuekeymultimapcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"valueKeyMultiMapContext")),(0,n.kt)("p",null,"The value to key multimap context type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-11"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly valueKeyMultiMapContext: MultiMap.Context<this['_V'], this['_K']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"valuekeymultimapnonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"valueKeyMultiMapNonEmpty")),(0,n.kt)("p",null,"The non-empty value to key multimap type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-12"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly valueKeyMultiMapNonEmpty: MultiMap.NonEmpty<this['_V'], this['_K']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"valuemultimapvalues"}),(0,n.kt)("inlineCode",{parentName:"h3"},"valueMultiMapValues")),(0,n.kt)("p",null,"The key set collection type (higher-kinded type).")),(0,n.kt)("h4",m({},{id:"definition-13"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly valueMultiMapValues: "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/RSet/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RSet")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K']>;")))))}N.isMDXComponent=!0}}]);