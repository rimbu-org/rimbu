"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[20399],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>c});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=a.createContext({}),u=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=u(e.components);return a.createElement(o.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,o=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),s=u(n),c=i,k=s["".concat(o,".").concat(c)]||s[c]||d[c]||r;return n?a.createElement(k,l(l({ref:t},m),{},{components:n})):a.createElement(k,l({ref:t},m))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=s;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p.mdxType="string"==typeof e?e:i,l[1]=p;for(var u=2;u<r;u++)l[u]=n[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}s.displayName="MDXCreateElement"},51824:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>y,contentTitle:()=>c,default:()=>h,frontMatter:()=>s,metadata:()=>k,toc:()=>f});var a=n(3905),i=Object.defineProperty,r=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,d=(e,t)=>{for(var n in t||(t={}))o.call(t,n)&&m(e,n,t[n]);if(p)for(var n of p(t))u.call(t,n)&&m(e,n,t[n]);return e};const s={title:"VariantMultiMapBase.Types",slug:"/rimbu/multimap/custom/VariantMultiMapBase/Types/interface"},c="interface VariantMultiMapBase.Types",k={unversionedId:"rimbu_multimap/custom/VariantMultiMapBase/Types.interface",id:"rimbu_multimap/custom/VariantMultiMapBase/Types.interface",title:"VariantMultiMapBase.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_multimap/custom/VariantMultiMapBase/Types.interface.mdx",sourceDirName:"rimbu_multimap/custom/VariantMultiMapBase",slug:"/rimbu/multimap/custom/VariantMultiMapBase/Types/interface",permalink:"/api/rimbu/multimap/custom/VariantMultiMapBase/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"VariantMultiMapBase.Types",slug:"/rimbu/multimap/custom/VariantMultiMapBase/Types/interface"},sidebar:"defaultSidebar",previous:{title:"VariantMultiMapBase.NonEmpty<K,V,Tp>",permalink:"/api/rimbu/multimap/custom/VariantMultiMapBase/NonEmpty/interface"},next:{title:"VariantMultiMapBase<K,V,Tp>",permalink:"/api/rimbu/multimap/custom/VariantMultiMapBase/interface"}},y={},f=[{value:"Properties",id:"properties",level:2},{value:"<code>_K</code>",id:"_k",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>_V</code>",id:"_v",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>keyMap</code>",id:"keymap",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>keyMapNonEmpty</code>",id:"keymapnonempty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>keyMapValues</code>",id:"keymapvalues",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>keyMapValuesNonEmpty</code>",id:"keymapvaluesnonempty",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-7",level:4}],v={toc:f};function h(e){var t,n=e,{components:i}=n,m=((e,t)=>{var n={};for(var a in e)o.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&p)for(var a of p(e))t.indexOf(a)<0&&u.call(e,a)&&(n[a]=e[a]);return n})(n,["components"]);return(0,a.kt)("wrapper",(t=d(d({},v),m),r(t,l({components:i,mdxType:"MDXLayout"}))),(0,a.kt)("h1",d({},{id:"interface-variantmultimapbasetypes"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface VariantMultiMapBase.Types")),(0,a.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"KeyValue<K,V>"))),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/VariantMultiMap/Types/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiMap.Types")),", ",(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Types/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"MultiMapBase.Types"))),(0,a.kt)("h2",d({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"_k"}),(0,a.kt)("inlineCode",{parentName:"h3"},"_K")),(0,a.kt)("p",null,"The key type.")),(0,a.kt)("h4",d({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly _K: K;"))),(0,a.kt)("h4",d({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface#_K"}),"KeyValue._K"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"_v"}),(0,a.kt)("inlineCode",{parentName:"h3"},"_V")),(0,a.kt)("p",null,"The value type.")),(0,a.kt)("h4",d({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly _V: V;"))),(0,a.kt)("h4",d({},{id:"overrides-1"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/KeyValue/interface#_V"}),"KeyValue._V"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"keymap"}),(0,a.kt)("inlineCode",{parentName:"h3"},"keyMap")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",d({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly keyMap: "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map/VariantMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMap")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_K'], "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/set/VariantSet/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantSet.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_V']>>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"keymapnonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"keyMapNonEmpty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",d({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly keyMapNonEmpty: "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map/VariantMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMap.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_K'], "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/set/VariantSet/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantSet.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_V']>>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"keymapvalues"}),(0,a.kt)("inlineCode",{parentName:"h3"},"keyMapValues")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",d({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly keyMapValues: "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/set/VariantSet/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantSet")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_V']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"keymapvaluesnonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"keyMapValuesNonEmpty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",d({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly keyMapValuesNonEmpty: "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/set/VariantSet/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantSet.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_V']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"nonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",d({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/VariantMultiMapBase/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiMapBase.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",d({},{id:"normal"}),(0,a.kt)("inlineCode",{parentName:"h3"},"normal")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",d({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,a.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/VariantMultiMapBase/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiMapBase")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}h.isMDXComponent=!0}}]);