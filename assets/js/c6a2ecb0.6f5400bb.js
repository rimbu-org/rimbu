"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[22908],{3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>k});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var m=n.createContext({}),o=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},u=function(e){var t=o(e.components);return n.createElement(m.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,m=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),s=o(a),k=r,c=s["".concat(m,".").concat(k)]||s[k]||d[k]||i;return a?n.createElement(c,l(l({ref:t},u),{},{components:a})):n.createElement(c,l({ref:t},u))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=s;var p={};for(var m in t)hasOwnProperty.call(t,m)&&(p[m]=t[m]);p.originalType=e,p.mdxType="string"==typeof e?e:r,l[1]=p;for(var o=2;o<i;o++)l[o]=a[o];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}s.displayName="MDXCreateElement"},50448:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>N,contentTitle:()=>k,default:()=>f,frontMatter:()=>s,metadata:()=>c,toc:()=>y});var n=a(3905),r=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,m=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,u=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,d=(e,t)=>{for(var a in t||(t={}))m.call(t,a)&&u(e,a,t[a]);if(p)for(var a of p(t))o.call(t,a)&&u(e,a,t[a]);return e};const s={title:"MultiSetBase.Context<UT,Tp>",slug:"/rimbu/multiset/custom/MultiSetBase/Context/interface"},k="interface MultiSetBase.Context<UT,Tp>",c={unversionedId:"rimbu_multiset/custom/MultiSetBase/Context.interface",id:"rimbu_multiset/custom/MultiSetBase/Context.interface",title:"MultiSetBase.Context<UT,Tp>",description:"undocumented",source:"@site/api/rimbu_multiset/custom/MultiSetBase/Context.interface.mdx",sourceDirName:"rimbu_multiset/custom/MultiSetBase",slug:"/rimbu/multiset/custom/MultiSetBase/Context/interface",permalink:"/api/rimbu/multiset/custom/MultiSetBase/Context/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiSetBase.Context<UT,Tp>",slug:"/rimbu/multiset/custom/MultiSetBase/Context/interface"},sidebar:"defaultSidebar",previous:{title:"MultiSetBase.Builder<T,Tp>",permalink:"/api/rimbu/multiset/custom/MultiSetBase/Builder/interface"},next:{title:"MultiSetBase.Factory<Tp,UT>",permalink:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface"}},N={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>_types</code>",id:"_types",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>countMapContext</code>",id:"countmapcontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>typeTag</code>",id:"typetag",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>empty</code>",id:"empty",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>from</code>",id:"from",level:3},{value:"Definitions",id:"definitions",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>isValidElem</code>",id:"isvalidelem",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"<code>of</code>",id:"of",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Overrides",id:"overrides-4",level:4}],h={toc:y};function f(e){var t,a=e,{components:r}=a,u=((e,t)=>{var a={};for(var n in e)m.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&o.call(e,n)&&(a[n]=e[n]);return a})(a,["components"]);return(0,n.kt)("wrapper",(t=d(d({},h),u),i(t,l({components:r,mdxType:"MDXLayout"}))),(0,n.kt)("h1",d({},{id:"interface-multisetbasecontextuttp"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface MultiSetBase.Context<UT,Tp>")),(0,n.kt)("p",null,"undocumented"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetBase.Factory<Tp,UT>"))),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/SortedMultiSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"SortedMultiSet.Context<UT>")),", ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/MultiSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSet.Context<UT>")),", ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetContext/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetContext<UT,N,Tp>")),", ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/HashMultiSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashMultiSet.Context<UT>"))),(0,n.kt)("h2",d({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"UT"),(0,n.kt)("td",d({parentName:"tr"},{align:null})),(0,n.kt)("td",d({parentName:"tr"},{align:null})),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"Tp"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetBase.Types")),(0,n.kt)("inlineCode",{parentName:"td"}," ")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetBase.Types"))),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"undocumented")))),(0,n.kt)("h2",d({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"_types"}),(0,n.kt)("inlineCode",{parentName:"h3"},"_types")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",d({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly _types: Tp;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"countmapcontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"countMapContext")),(0,n.kt)("p",null,"The context used for the internal countMap instances.")),(0,n.kt)("h4",d({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly countMapContext: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, UT>['countMapContext'];")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"typetag"}),(0,n.kt)("inlineCode",{parentName:"h3"},"typeTag")),(0,n.kt)("p",null,"A string tag defining the specific collection type")),(0,n.kt)("h4",d({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly typeTag: string;"))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.defaultContext().typeTag   // => 'HashMultiSet'\n")))),(0,n.kt)("h2",d({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"Returns an empty builder instance for this type of collection and context.")),(0,n.kt)("h4",d({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"builder<T extends UT>(): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['builder'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UT")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.builder<number>()    // => HashMultiSet.Builder<number>\n"))),(0,n.kt)("h4",d({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#builder"}),"Factory.builder"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"empty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"empty")),(0,n.kt)("p",null,"Returns the (singleton) empty instance of this type and context with given key and value types.")),(0,n.kt)("h4",d({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"empty<T extends UT>(): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-2"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UT")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.empty<number>()    // => HashMultiSet<number>\nHashMultiSet.empty<string>()    // => HashMultiSet<string>\n"))),(0,n.kt)("h4",d({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#empty"}),"Factory.empty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"from"}),(0,n.kt)("inlineCode",{parentName:"h3"},"from")),(0,n.kt)("p",null,"Returns an immutable multimap of this type and context, containing the values in the given ",(0,n.kt)("inlineCode",{parentName:"p"},"sources")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource"),".")),(0,n.kt)("h4",d({},{id:"definitions"}),"Definitions"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"from<T extends UT>(...sources: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['nonEmpty'];"))),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"from<T extends UT>(...sources: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<"),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-3"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UT")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",d({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"sources")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<"),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<T>>")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"a non-empty array of ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," instances containing values to add")))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.from([1, 2], [2, 3, 4]).toArray()    // => [1, 2, 2, 3, 4]\n"))),(0,n.kt)("h4",d({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#from"}),"Factory.from"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"isvalidelem"}),(0,n.kt)("inlineCode",{parentName:"h3"},"isValidElem")),(0,n.kt)("p",null,"Returns true if given ",(0,n.kt)("inlineCode",{parentName:"p"},"obj")," could be a valid key in this Context.")),(0,n.kt)("h4",d({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"isValidElem(key: any): key is UT;"))),(0,n.kt)("h4",d({},{id:"parameters-1"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"key")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"any")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.defaultContext().isValidKey(1)   // => true\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"of"}),(0,n.kt)("inlineCode",{parentName:"h3"},"of")),(0,n.kt)("p",null,"Returns an immutable multimap of this collection type and context, containing the given ",(0,n.kt)("inlineCode",{parentName:"p"},"values"),".")),(0,n.kt)("h4",d({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"of<T extends UT>(...values: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['nonEmpty'];"))),(0,n.kt)("h4",d({},{id:"type-parameters-4"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UT")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",d({},{id:"parameters-2"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"values")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"td"},"<T>")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"a non-empty array of vslues")))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2)    // => HashMultiSet.NonEmpty<number>\n"))),(0,n.kt)("h4",d({},{id:"overrides-3"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#of"}),"Factory.of"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"reducer"}),(0,n.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,n.kt)("p",null,"Returns a ",(0,n.kt)("inlineCode",{parentName:"p"},"Reducer")," that appends received items to a MultiSet and returns the MultiSet as a result. When a ",(0,n.kt)("inlineCode",{parentName:"p"},"source")," is given, the reducer will first create a MultiSet from the source, and then add elements to it.")),(0,n.kt)("h4",d({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"reducer<T extends UT>(source?: "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/common/Reducer/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Reducer")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal']>;"))),(0,n.kt)("h4",d({},{id:"type-parameters-5"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"UT")),(0,n.kt)("td",d({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",d({},{id:"parameters-3"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"source")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),(0,n.kt)("a",d({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<T>")),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"(optional) an initial source of elements to add to")))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"const someList = [1, 2, 3];\nconst result = Stream.range({ start: 20, amount: 5 }).reduce(SortedMultiSet.reducer(someList))\nresult.toArray()   // => [1, 2, 3, 20, 21, 22, 23, 24]\n"))),(0,n.kt)("admonition",d({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"uses a MultiSet builder under the hood. If the given ",(0,n.kt)("inlineCode",{parentName:"p"},"source")," is a MultiSet in the same context, it will directly call ",(0,n.kt)("inlineCode",{parentName:"p"},".toBuilder()"),".")),(0,n.kt)("h4",d({},{id:"overrides-4"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#reducer"}),"Factory.reducer"))))}f.isMDXComponent=!0}}]);