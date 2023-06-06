"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[46784],{3905:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>f});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),u=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},s=function(e){var t=u(e.components);return n.createElement(p.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),c=u(a),d=r,f=c["".concat(p,".").concat(d)]||c[d]||m[d]||i;return a?n.createElement(f,l(l({ref:t},s),{},{components:a})):n.createElement(f,l({ref:t},s))}));function f(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=d;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[c]="string"==typeof e?e:r,l[1]=o;for(var u=2;u<i;u++)l[u]=a[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},11591:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>k,contentTitle:()=>h,default:()=>H,frontMatter:()=>f,metadata:()=>y,toc:()=>b});var n=a(3905),r=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,s=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,c=(e,t)=>{for(var a in t||(t={}))p.call(t,a)&&s(e,a,t[a]);if(o)for(var a of o(t))u.call(t,a)&&s(e,a,t[a]);return e},m=(e,t)=>i(e,l(t)),d=(e,t)=>{var a={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&u.call(e,n)&&(a[n]=e[n]);return a};const f={title:"HashMultiMapHashValue.Context<UK,UV>",slug:"/rimbu/multimap/HashMultiMapHashValue/Context/interface"},h="interface HashMultiMapHashValue.Context<UK,UV>",y={unversionedId:"rimbu_multimap/HashMultiMapHashValue/Context.interface",id:"rimbu_multimap/HashMultiMapHashValue/Context.interface",title:"HashMultiMapHashValue.Context<UK,UV>",description:"A context instance for an HashMultiMapHashValue that acts as a factory for every instance of this type of collection.",source:"@site/api/rimbu_multimap/HashMultiMapHashValue/Context.interface.mdx",sourceDirName:"rimbu_multimap/HashMultiMapHashValue",slug:"/rimbu/multimap/HashMultiMapHashValue/Context/interface",permalink:"/api/rimbu/multimap/HashMultiMapHashValue/Context/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashMultiMapHashValue.Context<UK,UV>",slug:"/rimbu/multimap/HashMultiMapHashValue/Context/interface"},sidebar:"defaultSidebar",previous:{title:"HashMultiMapHashValue.Builder<K,V>",permalink:"/api/rimbu/multimap/HashMultiMapHashValue/Builder/interface"},next:{title:"HashMultiMapHashValue.NonEmpty<K,V>",permalink:"/api/rimbu/multimap/HashMultiMapHashValue/NonEmpty/interface"}},k={},b=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>keyMapContext</code>",id:"keymapcontext",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>keyMapValuesContext</code>",id:"keymapvaluescontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>typeTag</code>",id:"typetag",level:3},{value:"Definition",id:"definition-2",level:4}],v={toc:b},M="wrapper";function H(e){var t=e,{components:a}=t,r=d(t,["components"]);return(0,n.kt)(M,m(c(c({},v),r),{components:a,mdxType:"MDXLayout"}),(0,n.kt)("h1",c({},{id:"interface-hashmultimaphashvaluecontextukuv"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface HashMultiMapHashValue.Context<UK,UV>")),(0,n.kt)("p",null,"A context instance for an ",(0,n.kt)("inlineCode",{parentName:"p"},"HashMultiMapHashValue")," that acts as a factory for every instance of this type of collection."),(0,n.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"UK"),(0,n.kt)("td",c({parentName:"tr"},{align:null}),"the upper key type bound for which the context can be used")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",c({parentName:"tr"},{align:null}),"UV"),(0,n.kt)("td",c({parentName:"tr"},{align:null}),"the upper value type bound for which the context can be used")))),(0,n.kt)("h2",c({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"keymapcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyMapContext")),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"HashMap")," context used to create HashMaps to the key to value maps.")),(0,n.kt)("h4",c({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyMapContext: HashMap.Context<UK>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"keymapvaluescontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyMapValuesContext")),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"HashSet")," context used to create HashSets for the value sets.")),(0,n.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyMapValuesContext: HashSet.Context<UV>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"typetag"}),(0,n.kt)("inlineCode",{parentName:"h3"},"typeTag")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly typeTag: 'HashMultiMapHashValue';")))))}H.isMDXComponent=!0}}]);