"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[10452],{3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>s});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var o=n.createContext({}),m=function(e){var t=n.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},u=function(e){var t=m(e.components);return n.createElement(o.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),k=m(a),s=r,c=k["".concat(o,".").concat(s)]||k[s]||d[s]||i;return a?n.createElement(c,l(l({ref:t},u),{},{components:a})):n.createElement(c,l({ref:t},u))}));function s(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=k;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p.mdxType="string"==typeof e?e:r,l[1]=p;for(var m=2;m<i;m++)l[m]=a[m];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},22638:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>N,contentTitle:()=>s,default:()=>f,frontMatter:()=>k,metadata:()=>c,toc:()=>y});var n=a(3905),r=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,u=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,d=(e,t)=>{for(var a in t||(t={}))o.call(t,a)&&u(e,a,t[a]);if(p)for(var a of p(t))m.call(t,a)&&u(e,a,t[a]);return e};const k={title:"MultiMap.Context<UK,UV>",slug:"/rimbu/multimap/MultiMap/Context/interface"},s="interface MultiMap.Context<UK,UV>",c={unversionedId:"rimbu_multimap/MultiMap/Context.interface",id:"rimbu_multimap/MultiMap/Context.interface",title:"MultiMap.Context<UK,UV>",description:"A context instance for MultiMap implementations that acts as a factory for every instance of this type of collection.",source:"@site/api/rimbu_multimap/MultiMap/Context.interface.mdx",sourceDirName:"rimbu_multimap/MultiMap",slug:"/rimbu/multimap/MultiMap/Context/interface",permalink:"/api/rimbu/multimap/MultiMap/Context/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiMap.Context<UK,UV>",slug:"/rimbu/multimap/MultiMap/Context/interface"},sidebar:"defaultSidebar",previous:{title:"MultiMap.Builder<K,V>",permalink:"/api/rimbu/multimap/MultiMap/Builder/interface"},next:{title:"MultiMap.NonEmpty<K,V>",permalink:"/api/rimbu/multimap/MultiMap/NonEmpty/interface"}},N={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>keyMapContext</code>",id:"keymapcontext",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>keyMapValuesContext</code>",id:"keymapvaluescontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>typeTag</code>",id:"typetag",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>empty</code>",id:"empty",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>from</code>",id:"from",level:3},{value:"Definitions",id:"definitions",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"<code>of</code>",id:"of",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-7",level:4}],h={toc:y};function f(e){var t,a=e,{components:r}=a,u=((e,t)=>{var a={};for(var n in e)o.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&m.call(e,n)&&(a[n]=e[n]);return a})(a,["components"]);return(0,n.kt)("wrapper",(t=d(d({},h),u),i(t,l({components:r,mdxType:"MDXLayout"}))),(0,n.kt)("h1",d({},{id:"interface-multimapcontextukuv"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface MultiMap.Context<UK,UV>")),(0,n.kt)("p",null,"A context instance for ",(0,n.kt)("inlineCode",{parentName:"p"},"MultiMap")," implementations that acts as a factory for every instance of this type of collection."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiMapBase.Context<UK,UV,Tp>"))),(0,n.kt)("h2",d({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"UK"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"the upper key type bound for which the context can be used")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"UV"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"the upper value type bound for which th context can be used")))),(0,n.kt)("h2",d({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"keymapcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyMapContext")),(0,n.kt)("p",null,"The context used for the internal keymap instances.")),(0,n.kt)("h4",d({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyMapContext: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, UK, UV>['keyMapContext'];"))),(0,n.kt)("h4",d({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Context/interface#keyMapContext"}),"Context.keyMapContext"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"keymapvaluescontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"keyMapValuesContext")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",d({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly keyMapValuesContext: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, UK, UV>['keyMapValuesContext'];"))),(0,n.kt)("h4",d({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Context/interface#keyMapValuesContext"}),"Context.keyMapValuesContext"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"typetag"}),(0,n.kt)("inlineCode",{parentName:"h3"},"typeTag")),(0,n.kt)("p",null,"A string tag defining the specific collection type")),(0,n.kt)("h4",d({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly typeTag: string;"))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiMapHashValue.defaultContext().typeTag   // => 'HashMultiMapHashValue'\n"))),(0,n.kt)("h4",d({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Context/interface#typeTag"}),"Context.typeTag"))),(0,n.kt)("h2",d({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"Returns an empty builder instance for this type of collection and context.")),(0,n.kt)("h4",d({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"builder<K extends UK, V extends UV>(): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, K, V>['builder'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiMapHashValue.builder<number, string>()    // => HashMultiMapHashValue.Builder<number, string>\n"))),(0,n.kt)("h4",d({},{id:"overrides-3"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Factory/interface#builder"}),"Factory.builder"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"empty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"empty")),(0,n.kt)("p",null,"Returns the (singleton) empty instance of this type and context with given key and value types.")),(0,n.kt)("h4",d({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"empty<K extends UK, V extends UV>(): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, K, V>['normal'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-2"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiMapHashValue.empty<number, string>()    // => HashMultiMapHashValue<number, string>\nHashMultiMapHashValue.empty<string, boolean>()   // => HashMultiMapHashValue<string, boolean>\n"))),(0,n.kt)("h4",d({},{id:"overrides-4"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Factory/interface#empty"}),"Factory.empty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"from"}),(0,n.kt)("inlineCode",{parentName:"h3"},"from")),(0,n.kt)("p",null,"Returns an immutable multimap of this type and context, containing the entries in the given ",(0,n.kt)("inlineCode",{parentName:"p"},"source")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource"),".")),(0,n.kt)("h4",d({},{id:"definitions"}),"Definitions"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"from<K extends UK, V extends UV>(...sources: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, K, V>['nonEmpty'];"))),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"from<K extends UK, V extends UV>(...sources: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, K, V>['normal'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-3"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",d({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"sources")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<"),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<readonly [K, V]>>")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"an array of ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," instances containing key-value entries")))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiMapHashValue.from([[1, 'a'], [2, 'b']])    // => HashMultiMapHashValue.NonEmpty<number, string>\n"))),(0,n.kt)("h4",d({},{id:"overrides-5"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Factory/interface#from"}),"Factory.from"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"of"}),(0,n.kt)("inlineCode",{parentName:"h3"},"of")),(0,n.kt)("p",null,"Returns an immutable multimap of this collection type and context, containing the given ",(0,n.kt)("inlineCode",{parentName:"p"},"entries"),".")),(0,n.kt)("h4",d({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"of<K extends UK, V extends UV>(...entries: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, K, V>['nonEmpty'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-4"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",d({},{id:"parameters-1"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"entries")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<readonly [K, V]>")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"a non-empty array of key-value entries")))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])    // => HashMap.NonEmpty<number, string>\n"))),(0,n.kt)("h4",d({},{id:"overrides-6"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Factory/interface#of"}),"Factory.of"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"reducer"}),(0,n.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,n.kt)("p",null,"Returns a ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that adds received tuples to a MultiMap and returns the MultiMap as a result. When a ",(0,n.kt)("inlineCode",{parentName:"p"},"source")," is given, the reducer will first create a MultiMap from the source, and then add tuples to it.")),(0,n.kt)("h4",d({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"reducer<K extends UK, V extends UV>(source?: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [K, V]>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<[K, V], "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithKeyValue/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithKeyValue")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, K, V>['normal']>;"))),(0,n.kt)("h4",d({},{id:"type-parameters-5"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"K"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UK")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"V"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UV")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",d({},{id:"parameters-2"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"source")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<readonly [K, V]>")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"(optional) an initial source of tuples to add to")))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"const someSource: [number, string][] = [1, 'a'], [2, 'b'];\nconst result = Stream.of([1, 'c'], [3, 'a']).reduce(SortedMultiMap.reducer(someSource))\nresult.toArray()   // => [[1, 'a'], [1, 'c'], [2, 'b'], [3, 'a']]\n"))),(0,n.kt)("admonition",d({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"uses a builder under the hood. If the given ",(0,n.kt)("inlineCode",{parentName:"p"},"source")," is a BiMap in the same context, it will directly call ",(0,n.kt)("inlineCode",{parentName:"p"},".toBuilder()"),".")),(0,n.kt)("h4",d({},{id:"overrides-7"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multimap/custom/MultiMapBase/Factory/interface#reducer"}),"Factory.reducer"))))}f.isMDXComponent=!0}}]);