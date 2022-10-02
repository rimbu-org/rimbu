"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[4779],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>N});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function p(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var m=n.createContext({}),o=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):p(p({},t),e)),a},d=function(e){var t=o(e.components);return n.createElement(m.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,m=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),k=o(a),N=r,s=k["".concat(m,".").concat(N)]||k[N]||u[N]||i;return a?n.createElement(s,p(p({ref:t},d),{},{components:a})):n.createElement(s,p({ref:t},d))}));function N(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,p=new Array(i);p[0]=k;var l={};for(var m in t)hasOwnProperty.call(t,m)&&(l[m]=t[m]);l.originalType=e,l.mdxType="string"==typeof e?e:r,p[1]=l;for(var o=2;o<i;o++)p[o]=a[o];return n.createElement.apply(null,p)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},88229:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>N,default:()=>h,frontMatter:()=>k,metadata:()=>s,toc:()=>b});var n=a(3905),r=Object.defineProperty,i=Object.defineProperties,p=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,m=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,d=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))m.call(t,a)&&d(e,a,t[a]);if(l)for(var a of l(t))o.call(t,a)&&d(e,a,t[a]);return e};const k={title:"BiMap (namespace)",slug:"/rimbu/bimap/BiMap/namespace"},N="namespace BiMap",s={unversionedId:"rimbu_bimap/BiMap/index",id:"rimbu_bimap/BiMap/index",title:"BiMap (namespace)",description:"A type-invariant immutable bi-directional Map where keys and values have a one-to-one mapping. See the BiMap documentation and the BiMap API documentation",source:"@site/api/rimbu_bimap/BiMap/index.mdx",sourceDirName:"rimbu_bimap/BiMap",slug:"/rimbu/bimap/BiMap/namespace",permalink:"/api/rimbu/bimap/BiMap/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"BiMap (namespace)",slug:"/rimbu/bimap/BiMap/namespace"},sidebar:"defaultSidebar",previous:{title:"@rimbu/bimap",permalink:"/api/rimbu/bimap"},next:{title:"BiMap.Builder<K,V>",permalink:"/api/rimbu/bimap/BiMap/Builder/interface"}},c={},b=[{value:"Interfaces",id:"interfaces",level:2},{value:"Static Methods",id:"static-methods",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>createContext</code>",id:"createcontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>defaultContext</code>",id:"defaultcontext",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"<code>empty</code>",id:"empty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>from</code>",id:"from",level:3},{value:"Definitions",id:"definitions",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>of</code>",id:"of",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Type parameters",id:"type-parameters-6",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Overrides",id:"overrides-4",level:4}],y={toc:b};function h(e){var t,a=e,{components:r}=a,d=((e,t)=>{var a={};for(var n in e)m.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&l)for(var n of l(e))t.indexOf(n)<0&&o.call(e,n)&&(a[n]=e[n]);return a})(a,["components"]);return(0,n.kt)("wrapper",(t=u(u({},y),d),i(t,p({components:r,mdxType:"MDXLayout"}))),(0,n.kt)("h1",u({},{id:"namespace-bimap"}),(0,n.kt)("inlineCode",{parentName:"h1"},"namespace BiMap")),(0,n.kt)("p",null,"A type-invariant immutable bi-directional Map where keys and values have a one-to-one mapping. See the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/docs/collections/bimap"}),"BiMap documentation")," and the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/api/rimbu/bimap/BiMap/interface"}),"BiMap API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap<K,V>"))),(0,n.kt)("h2",u({},{id:"interfaces"}),"Interfaces"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/bimap/BiMap/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.Builder<K,V>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"A mutable ",(0,n.kt)("inlineCode",{parentName:"td"},"BiMap")," builder used to efficiently create new immutable instances. See the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/bimap"}),"BiMap documentation")," and the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/bimap/BiMap/Builder/interface"}),"BiMap.Builder API documentation"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/bimap/BiMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.Context<UK,UV,Tp>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"The BiMap's Context instance that serves as a factory for all related immutable instances and builders.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/bimap/BiMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.NonEmpty<K,V>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable bi-directional Map where keys and values have a one-to-one mapping. See the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/bimap"}),"BiMap documentation")," and the ",(0,n.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/bimap/BiMap/interface"}),"BiMap API documentation")," *")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/bimap/BiMap/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.Types"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))),(0,n.kt)("h2",u({},{id:"static-methods"}),"Static Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"Returns an empty ",(0,n.kt)("inlineCode",{parentName:"p"},"BiMap")," builder instance.")),(0,n.kt)("h4",u({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"builder<K extends UK, V extends UV>(): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<K, V>;"))),(0,n.kt)("h4",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"BiMap.builder<number, string>()    // => BiMap.Builder<number, string>\n"))),(0,n.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/custom/BiMapFactory/interface#builder"}),"BiMapFactory.builder"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"createcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"createContext")),(0,n.kt)("p",null,"Returns a new BiMap context instance based on the given ",(0,n.kt)("inlineCode",{parentName:"p"},"options"),".")),(0,n.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"createContext<UK, UV>(options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"keyValueContext?: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<UK>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"valueKeyContext?: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<UV>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<UK, UV>;"))),(0,n.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"UK"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the upper key type for which the context can create instances")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"UV"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the upper value type for which the context can create instances")))),(0,n.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"options")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"{"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"keyValueContext?: "),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,n.kt)("inlineCode",{parentName:"td"},"<UK>;"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"valueKeyContext?: "),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,n.kt)("inlineCode",{parentName:"td"},"<UV>;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"}")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"(optiona) an object containing the following properties:",(0,n.kt)("br",null)," - keyValueContext - (optional) the map context to use for key value mappings",(0,n.kt)("br",null)," - valueKeyContext - (optional) the map context to use for value key mappings"))))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"defaultcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"defaultContext")),(0,n.kt)("p",null,"Returns the default context for BiMaps.")),(0,n.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"defaultContext<UK, UV>(): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<UK, UV>;"))),(0,n.kt)("h4",u({},{id:"type-parameters-2"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"UK"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the upper key type for which the context can create instances")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"UV"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the upper value type for which the context can create instances"))))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"empty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"empty")),(0,n.kt)("p",null,"Returns the (singleton) empty instance of this type and context with given key and value types.")),(0,n.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"empty<K extends UK, V extends UV>(): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<K, V>;"))),(0,n.kt)("h4",u({},{id:"type-parameters-3"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"BiMap.empty<number, string>()    // => BiMap<number, string>\nBiMap.empty<string, boolean>()   // => BiMap<string, boolean>\n"))),(0,n.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/custom/BiMapFactory/interface#empty"}),"BiMapFactory.empty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"from"}),(0,n.kt)("inlineCode",{parentName:"h3"},"from")),(0,n.kt)("p",null,"Returns an immutable BiMap, containing the entries in the given ",(0,n.kt)("inlineCode",{parentName:"p"},"sources")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource")," instances.")),(0,n.kt)("h4",u({},{id:"definitions"}),"Definitions"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"from<K extends UK, V extends UV>(...sources: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>>): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<K, V>;"))),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"from<K extends UK, V extends UV>(...sources: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>>): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<K, V>;"))),(0,n.kt)("h4",u({},{id:"type-parameters-4"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-1"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"sources")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<"),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<readonly [K, V]>>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"an array of ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," instances contaning key-value entries")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"BiMap.from([[1, 'a'], [2, 'b']])    // => BiMap.NonEmpty<number, string>\n"))),(0,n.kt)("h4",u({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/custom/BiMapFactory/interface#from"}),"BiMapFactory.from"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"of"}),(0,n.kt)("inlineCode",{parentName:"h3"},"of")),(0,n.kt)("p",null,"Returns an immutable ",(0,n.kt)("inlineCode",{parentName:"p"},"BiMap"),", containing the given ",(0,n.kt)("inlineCode",{parentName:"p"},"entries"),".")),(0,n.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"of<K extends UK, V extends UV>(...entries: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<K, V>;"))),(0,n.kt)("h4",u({},{id:"type-parameters-5"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-2"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"entries")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<readonly [K, V]>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"a non-empty array of key-value entries")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"BiMap.of([1, 'a'], [2, 'b'])    // => BiMap.NonEmpty<number, string>\n"))),(0,n.kt)("h4",u({},{id:"overrides-3"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/custom/BiMapFactory/interface#of"}),"BiMapFactory.of"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"reducer"}),(0,n.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,n.kt)("p",null,"Returns a ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that adds received tuples to a BiMap and returns the BiMap as a result. When a ",(0,n.kt)("inlineCode",{parentName:"p"},"source")," is given, the reducer will first create a BiMap from the source, and then add tuples to it.")),(0,n.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"reducer<K extends UK, V extends UV>(source?: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V], "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/BiMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"BiMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<K, V>>;"))),(0,n.kt)("h4",u({},{id:"type-parameters-6"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-3"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"source")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<readonly [K, V]>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"(optional) an initial source of tuples to add to")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const someSource = BiMap.of([1, 'a'], [2, 'b']);\nconst result = Stream.of([1, 'c'], [3, 'a']).reduce(BiMap.reducer(someSource))\nresult.toArray()   // => [[1, 'c'], [2, 'b'], [3, 'a']]\n"))),(0,n.kt)("admonition",u({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"uses a builder under the hood. If the given ",(0,n.kt)("inlineCode",{parentName:"p"},"source")," is a BiMap in the same context, it will directly call ",(0,n.kt)("inlineCode",{parentName:"p"},".toBuilder()"),".")),(0,n.kt)("h4",u({},{id:"overrides-4"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/bimap/custom/BiMapFactory/interface#reducer"}),"BiMapFactory.reducer"))))}h.isMDXComponent=!0}}]);