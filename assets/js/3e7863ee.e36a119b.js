"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[55443],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>h});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var o=r.createContext({}),m=function(e){var t=r.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=m(e.components);return r.createElement(o.Provider,{value:t},e.children)},u="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),u=m(a),s=n,h=u["".concat(o,".").concat(s)]||u[s]||k[s]||i;return a?r.createElement(h,l(l({ref:t},d),{},{components:a})):r.createElement(h,l({ref:t},d))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,l=new Array(i);l[0]=s;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p[u]="string"==typeof e?e:n,l[1]=p;for(var m=2;m<i;m++)l[m]=a[m];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}s.displayName="MDXCreateElement"},98786:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>y,contentTitle:()=>N,default:()=>v,frontMatter:()=>h,metadata:()=>c,toc:()=>f});var r=a(3905),n=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,d=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))o.call(t,a)&&d(e,a,t[a]);if(p)for(var a of p(t))m.call(t,a)&&d(e,a,t[a]);return e},k=(e,t)=>i(e,l(t)),s=(e,t)=>{var a={};for(var r in e)o.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&p)for(var r of p(e))t.indexOf(r)<0&&m.call(e,r)&&(a[r]=e[r]);return a};const h={title:"ArrowGraphSorted (namespace)",slug:"/rimbu/graph/ArrowGraphSorted/namespace"},N="namespace ArrowGraphSorted",c={unversionedId:"rimbu_graph/ArrowGraphSorted/index",id:"rimbu_graph/ArrowGraphSorted/index",title:"ArrowGraphSorted (namespace)",description:"An type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the Graph documentation and the ArrowGraphSorted API documentation",source:"@site/api/rimbu_graph/ArrowGraphSorted/index.mdx",sourceDirName:"rimbu_graph/ArrowGraphSorted",slug:"/rimbu/graph/ArrowGraphSorted/namespace",permalink:"/api/rimbu/graph/ArrowGraphSorted/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"ArrowGraphSorted (namespace)",slug:"/rimbu/graph/ArrowGraphSorted/namespace"},sidebar:"defaultSidebar",previous:{title:"ArrowGraphHashed<N>",permalink:"/api/rimbu/graph/ArrowGraphHashed/interface"},next:{title:"ArrowGraphSorted.Builder<N>",permalink:"/api/rimbu/graph/ArrowGraphSorted/Builder/interface"}},y={},f=[{value:"Interfaces",id:"interfaces",level:2},{value:"Static Methods",id:"static-methods",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>createContext</code>",id:"createcontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>defaultContext</code>",id:"defaultcontext",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"<code>empty</code>",id:"empty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>from</code>",id:"from",level:3},{value:"Definitions",id:"definitions",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>of</code>",id:"of",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Type parameters",id:"type-parameters-6",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Overrides",id:"overrides-4",level:4}],b={toc:f},g="wrapper";function v(e){var t=e,{components:a}=t,n=s(t,["components"]);return(0,r.kt)(g,k(u(u({},b),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",u({},{id:"namespace-arrowgraphsorted"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace ArrowGraphSorted")),(0,r.kt)("p",null,"An type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the ",(0,r.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,r.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/interface"}),"ArrowGraphSorted API documentation")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion interface:")," ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/ArrowGraphSorted/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted<N>"))),(0,r.kt)("h2",u({},{id:"interfaces"}),"Interfaces"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/ArrowGraphSorted/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.Builder<N>"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"A mutable ",(0,r.kt)("inlineCode",{parentName:"td"},"ArrowGraphSorted")," builder used to efficiently create new immutable instances. See the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/Builder/interface"}),"ArrowGraphSorted.Builder API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/ArrowGraphSorted/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.Context<UN>"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"The ArrowGraphSorted's Context instance that serves as a factory for all related immutable instances and builders.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/ArrowGraphSorted/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.NonEmpty<N>"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"A non-empty type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,r.kt)("a",u({parentName:"td"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/interface"}),"ArrowGraphSorted API documentation"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/ArrowGraphSorted/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted.Types"))),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"Utility interface that provides higher-kinded types for this collection.")))),(0,r.kt)("h2",u({},{id:"static-methods"}),"Static Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"builder"}),(0,r.kt)("inlineCode",{parentName:"h3"},"builder")),(0,r.kt)("p",null,"Returns an empty builder instance.")),(0,r.kt)("h4",u({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"builder<N extends UN>(): "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/WithGraphValues/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"WithGraphValues")),(0,r.kt)("inlineCode",{parentName:"p"},"<Tp, N, unknown>['builder'];"))),(0,r.kt)("h4",u({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"N"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"UN")),(0,r.kt)("td",u({parentName:"tr"},{align:null}))))),(0,r.kt)("admonition",u({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"ArrowValuedGraphHashed.builder<number, string>()    // => ArrowValuedGraphHashed.Builder<number, string>\n"))),(0,r.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/GraphBase/Factory/interface#builder"}),"Factory.builder"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"createcontext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"createContext")),(0,r.kt)("p",null,"Returns a new ArrowValuedGraphSorted context instance based on the given ",(0,r.kt)("inlineCode",{parentName:"p"},"options"),".")),(0,r.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"createContext<UN>(options?: {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"linkMapContext?: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/sorted/map/SortedMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<UN>;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"linkConnectionsContext?: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/sorted/SortedSet/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedSet.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<UN>;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"}): ArrowGraphSorted.Context<UN>;"))),(0,r.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"UN"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"the upper node type for which the context can create instances")))),(0,r.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"options")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"{"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"linkMapContext?: "),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/sorted/map/SortedMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.Context")),(0,r.kt)("inlineCode",{parentName:"td"},"<UN>;"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"linkConnectionsContext?: "),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/sorted/SortedSet/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedSet.Context")),(0,r.kt)("inlineCode",{parentName:"td"},"<UN>;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"}")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"(optional) an object containing the following properties:",(0,r.kt)("br",null)," - linkMapContext - (optional) the map context to use to maintain link maps",(0,r.kt)("br",null)," - linkConnectionsContext - (optional) the set context to use to maintain link connections"))))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"defaultcontext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"defaultContext")),(0,r.kt)("p",null,"Returns the default context for this type of graph.")),(0,r.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"defaultContext<UN>(): ArrowGraphSorted.Context<UN>;"))),(0,r.kt)("h4",u({},{id:"type-parameters-2"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"UN"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"the upper node type that the context should accept"))))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"empty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"empty")),(0,r.kt)("p",null,"Returns the (singleton) empty instance of this type and context with given key and value types.")),(0,r.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"empty<N extends UN>(): "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/WithGraphValues/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"WithGraphValues")),(0,r.kt)("inlineCode",{parentName:"p"},"<Tp, N, unknown>['normal'];"))),(0,r.kt)("h4",u({},{id:"type-parameters-3"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"N"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"UN")),(0,r.kt)("td",u({parentName:"tr"},{align:null}))))),(0,r.kt)("admonition",u({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"ArrowGraphHashed.empty<number>()    // => ArrowGraphHashed<number>\nArrowGraphHashed.empty<string>()    // => ArrowGraphHashed<string>\n"))),(0,r.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/GraphBase/Factory/interface#empty"}),"Factory.empty"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"from"}),(0,r.kt)("inlineCode",{parentName:"h3"},"from")),(0,r.kt)("p",null,"Returns an immutable valued Graph, containing the graph elements from each of the given ",(0,r.kt)("inlineCode",{parentName:"p"},"sources"),".")),(0,r.kt)("h4",u({},{id:"definitions"}),"Definitions"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"from<N extends UN>(...sources: ArrayNonEmpty<"),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<GraphElement<N>>>): "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/WithGraphValues/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"WithGraphValues")),(0,r.kt)("inlineCode",{parentName:"p"},"<Tp, N, unknown>['nonEmpty'];"))),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"from<N extends UN>(...sources: ArrayNonEmpty<"),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,r.kt)("inlineCode",{parentName:"p"},"<GraphElement<N>>>): "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/WithGraphValues/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"WithGraphValues")),(0,r.kt)("inlineCode",{parentName:"p"},"<Tp, N, unknown>['normal'];"))),(0,r.kt)("h4",u({},{id:"type-parameters-4"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"N"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"UN")),(0,r.kt)("td",u({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",u({},{id:"parameters-1"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"sources")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"ArrayNonEmpty<"),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"td"},"<GraphElement<N>>>")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"an array of ",(0,r.kt)("inlineCode",{parentName:"td"},"StreamSource")," instances containing graph elements to add")))),(0,r.kt)("admonition",u({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"ArrowGraphHashed.from([[1], [2]], [[3, 4]])  // => ArrowGraphHashed.NonEmpty<number>\n"))),(0,r.kt)("h4",u({},{id:"overrides-2"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/GraphBase/Factory/interface#from"}),"Factory.from"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"of"}),(0,r.kt)("inlineCode",{parentName:"h3"},"of")),(0,r.kt)("p",null,"Returns an immutable valued Graph instance containing the graph elements from the given ",(0,r.kt)("inlineCode",{parentName:"p"},"graphElements"),".")),(0,r.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"of<N extends UN>(...graphElements: ArrayNonEmpty<GraphElement<N>>): "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/WithGraphValues/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"WithGraphValues")),(0,r.kt)("inlineCode",{parentName:"p"},"<Tp, N, unknown>['nonEmpty'];"))),(0,r.kt)("h4",u({},{id:"type-parameters-5"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"N"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"UN")),(0,r.kt)("td",u({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",u({},{id:"parameters-2"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"graphElements")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"ArrayNonEmpty<GraphElement<N>>")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"a non-empty array of graph elements that are either a single tuple containing a node, or a triplet containing two connection nodes and the connection value.")))),(0,r.kt)("admonition",u({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"ArrowGraphHashed.of([1], [2], [3, 4]) // => ArrowGraphHashed.NonEmpty<number>\n"))),(0,r.kt)("h4",u({},{id:"overrides-3"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/GraphBase/Factory/interface#of"}),"Factory.of"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"reducer"}),(0,r.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,r.kt)("p",null,"Returns a ",(0,r.kt)("inlineCode",{parentName:"p"},"Reducer")," that adds received graph elements to a Graph and returns the Graph as a result. When a ",(0,r.kt)("inlineCode",{parentName:"p"},"source")," is given, the reducer will first create a graph from the source, and then add graph elements to it.")),(0,r.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"reducer<N extends UN>(source?: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<GraphElement<N>>): Reducer<GraphElement<N>, "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/WithGraphValues/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"WithGraphValues")),(0,r.kt)("inlineCode",{parentName:"p"},"<Tp, N, unknown>['normal']>;"))),(0,r.kt)("h4",u({},{id:"type-parameters-6"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"N"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"UN")),(0,r.kt)("td",u({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",u({},{id:"parameters-3"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"source")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/NonEmpty/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"StreamSource.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"td"},"<GraphElement<N>>")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"(optional) an initial source of graph elements to add to")))),(0,r.kt)("admonition",u({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const someSource: GraphElement<number>[] = [[1, 2], [3], [5]];\nconst result = Stream.of([1, 3], [4, 3]).reduce(ArrowGraphSorted.reducer(someSource))\nresult.toArray()   // => [[1, 2], [1, 3], [4, 3], [5]]\n"))),(0,r.kt)("admonition",u({},{title:"note",type:"note"}),(0,r.kt)("p",{parentName:"admonition"},"uses a builder under the hood. If the given ",(0,r.kt)("inlineCode",{parentName:"p"},"source")," is a Graph in the same context, it will directly call ",(0,r.kt)("inlineCode",{parentName:"p"},".toBuilder()"),".")),(0,r.kt)("h4",u({},{id:"overrides-4"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/custom/GraphBase/Factory/interface#reducer"}),"Factory.reducer"))))}v.isMDXComponent=!0}}]);