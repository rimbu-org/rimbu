"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[91841],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>c});var a=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,l=function(e,t){if(null==e)return{};var n,a,l={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var m=a.createContext({}),d=function(e){var t=a.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},o=function(e){var t=d(e.components);return a.createElement(m.Provider,{value:t},e.children)},u="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var n=e.components,l=e.mdxType,r=e.originalType,m=e.parentName,o=p(e,["components","mdxType","originalType","parentName"]),u=d(n),s=l,c=u["".concat(m,".").concat(s)]||u[s]||k[s]||r;return n?a.createElement(c,i(i({ref:t},o),{},{components:n})):a.createElement(c,i({ref:t},o))}));function c(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var r=n.length,i=new Array(r);i[0]=s;var p={};for(var m in t)hasOwnProperty.call(t,m)&&(p[m]=t[m]);p.originalType=e,p[u]="string"==typeof e?e:l,i[1]=p;for(var d=2;d<r;d++)i[d]=n[d];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}s.displayName="MDXCreateElement"},12133:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>h,contentTitle:()=>N,default:()=>g,frontMatter:()=>c,metadata:()=>y,toc:()=>v});var a=n(3905),l=Object.defineProperty,r=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,m=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,o=(e,t,n)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))m.call(t,n)&&o(e,n,t[n]);if(p)for(var n of p(t))d.call(t,n)&&o(e,n,t[n]);return e},k=(e,t)=>r(e,i(t)),s=(e,t)=>{var n={};for(var a in e)m.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&p)for(var a of p(e))t.indexOf(a)<0&&d.call(e,a)&&(n[a]=e[a]);return n};const c={title:"MultiSetContext<UT,N,Tp>",slug:"/rimbu/multiset/custom/MultiSetContext/class"},N="class MultiSetContext<UT,N,Tp>",y={unversionedId:"rimbu_multiset/custom/MultiSetContext.class",id:"rimbu_multiset/custom/MultiSetContext.class",title:"MultiSetContext<UT,N,Tp>",description:"undocumented",source:"@site/api/rimbu_multiset/custom/MultiSetContext.class.mdx",sourceDirName:"rimbu_multiset/custom",slug:"/rimbu/multiset/custom/MultiSetContext/class",permalink:"/api/rimbu/multiset/custom/MultiSetContext/class",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiSetContext<UT,N,Tp>",slug:"/rimbu/multiset/custom/MultiSetContext/class"},sidebar:"defaultSidebar",previous:{title:"MultiSetBuilder<T,Tp,TpG>",permalink:"/api/rimbu/multiset/custom/MultiSetBuilder/class"},next:{title:"MultiSetCreators",permalink:"/api/rimbu/multiset/custom/MultiSetCreators/interface"}},h={},v=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>_empty</code>",id:"_empty",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>_types</code>",id:"_types",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>countMapContext</code>",id:"countmapcontext",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>empty</code>",id:"empty",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>from</code>",id:"from",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>of</code>",id:"of",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>reducer</code>",id:"reducer",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>typeTag</code>",id:"typetag",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>builder</code>",id:"builder-1",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>createBuilder</code>",id:"createbuilder",level:3},{value:"Definition",id:"definition-10",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>createNonEmpty</code>",id:"createnonempty",level:3},{value:"Definition",id:"definition-11",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"<code>empty</code>",id:"empty-1",level:3},{value:"Definition",id:"definition-12",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>from</code>",id:"from-1",level:3},{value:"Definitions",id:"definitions",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"<code>isNonEmptyInstance</code>",id:"isnonemptyinstance",level:3},{value:"Definition",id:"definition-13",level:4},{value:"Type parameters",id:"type-parameters-6",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"<code>isValidElem</code>",id:"isvalidelem",level:3},{value:"Definition",id:"definition-14",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"<code>of</code>",id:"of-1",level:3},{value:"Definition",id:"definition-15",level:4},{value:"Type parameters",id:"type-parameters-7",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"<code>reducer</code>",id:"reducer-1",level:3},{value:"Definition",id:"definition-16",level:4},{value:"Type parameters",id:"type-parameters-8",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"Overrides",id:"overrides-8",level:4}],f={toc:v},b="wrapper";function g(e){var t=e,{components:n}=t,l=s(t,["components"]);return(0,a.kt)(b,k(u(u({},f),l),{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",u({},{id:"class-multisetcontextutntp"}),(0,a.kt)("inlineCode",{parentName:"h1"},"class MultiSetContext<UT,N,Tp>")),(0,a.kt)("p",null,"undocumented"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implements:")," ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Context/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"MultiSetBase.Context<UT,Tp>"))),(0,a.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"UT"),(0,a.kt)("td",u({parentName:"tr"},{align:null})),(0,a.kt)("td",u({parentName:"tr"},{align:null})),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"N"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"string")),(0,a.kt)("td",u({parentName:"tr"},{align:null})),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"Tp"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/ContextImplTypes/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ContextImplTypes"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/ContextImplTypes/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"ContextImplTypes"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")))),(0,a.kt)("h2",u({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"_empty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"_empty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly _empty: WithElem<Tp, UT>['normal'];")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"_types"}),(0,a.kt)("inlineCode",{parentName:"h3"},"_types")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get _types(): Tp;"))),(0,a.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Context/interface#_types"}),"Context._types"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"builder"}),(0,a.kt)("inlineCode",{parentName:"h3"},"builder")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},'readonly builder: <T extends UT>() => WithElem<Tp, T>["builder"];')))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"countmapcontext"}),(0,a.kt)("inlineCode",{parentName:"h3"},"countMapContext")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly countMapContext: (Tp & Elem<UT>)['countMapContext'];"))),(0,a.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Context/interface#countMapContext"}),"Context.countMapContext"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"empty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"empty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},'readonly empty: <T extends UT>() => WithElem<Tp, T>["normal"];')))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"from"}),(0,a.kt)("inlineCode",{parentName:"h3"},"from")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly from: any;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"of"}),(0,a.kt)("inlineCode",{parentName:"h3"},"of")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},'readonly of: <T>(values_0: T, ...values_1: T[]) => T extends UT ? WithElem<Tp, T>["nonEmpty"] : never;')))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"reducer"}),(0,a.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},'readonly reducer: <T extends UT>(source?: StreamSource<T>) => Reducer<T, WithElem<Tp, T>["normal"]>;')))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"typetag"}),(0,a.kt)("inlineCode",{parentName:"h3"},"typeTag")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-8"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly typeTag: N;"))),(0,a.kt)("h4",u({},{id:"overrides-2"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Context/interface#typeTag"}),"Context.typeTag"))),(0,a.kt)("h2",u({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"builder-1"}),(0,a.kt)("inlineCode",{parentName:"h3"},"builder")),(0,a.kt)("p",null,"Returns an empty builder instance for this type of collection and context.")),(0,a.kt)("h4",u({},{id:"definition-9"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"builder<T extends UT>(): WithElem<Tp, T>['builder'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"UT")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.builder<number>()    // => HashMultiSet.Builder<number>\n"))),(0,a.kt)("h4",u({},{id:"overrides-3"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#builder"}),"Factory.builder"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"createbuilder"}),(0,a.kt)("inlineCode",{parentName:"h3"},"createBuilder")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-10"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"createBuilder<T extends UT>(source?: WithElem<Tp, T>['nonEmpty']): WithElem<Tp, T>['builder'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-2"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"UT")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"source")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"WithElem<Tp, T>['nonEmpty']")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"createnonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"createNonEmpty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-11"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"createNonEmpty<T extends UT>(countMap: WithElem<Tp, T>['countMapNonEmpty'], size: number): WithElem<Tp, T>['nonEmpty'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-3"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"UT")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-1"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"countMap")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"WithElem<Tp, T>['countMapNonEmpty']")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"size")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"empty-1"}),(0,a.kt)("inlineCode",{parentName:"h3"},"empty")),(0,a.kt)("p",null,"Returns the (singleton) empty instance of this type and context with given key and value types.")),(0,a.kt)("h4",u({},{id:"definition-12"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"empty<T extends UT>(): WithElem<Tp, T>['normal'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-4"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"UT")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.empty<number>()    // => HashMultiSet<number>\nHashMultiSet.empty<string>()    // => HashMultiSet<string>\n"))),(0,a.kt)("h4",u({},{id:"overrides-4"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#empty"}),"Factory.empty"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"from-1"}),(0,a.kt)("inlineCode",{parentName:"h3"},"from")),(0,a.kt)("p",null,"Returns an immutable multimap of this type and context, containing the values in the given ",(0,a.kt)("inlineCode",{parentName:"p"},"sources")," ",(0,a.kt)("inlineCode",{parentName:"p"},"StreamSource"),".")),(0,a.kt)("h4",u({},{id:"definitions"}),"Definitions"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"from<T extends UT>(...sources: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<StreamSource.NonEmpty<T>>): WithElem<Tp, T>['nonEmpty'];"))),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"from<T extends UT>(...sources: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<StreamSource<T>>): WithElem<Tp, T>['normal'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-5"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"UT")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-2"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"sources")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,a.kt)("inlineCode",{parentName:"td"},"<StreamSource.NonEmpty<T>>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"a non-empty array of ",(0,a.kt)("inlineCode",{parentName:"td"},"StreamSource")," instances containing values to add")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.from([1, 2], [2, 3, 4]).toArray()    // => [1, 2, 2, 3, 4]\n"))),(0,a.kt)("h4",u({},{id:"overrides-5"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#from"}),"Factory.from"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"isnonemptyinstance"}),(0,a.kt)("inlineCode",{parentName:"h3"},"isNonEmptyInstance")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-13"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"isNonEmptyInstance<T>(source: any): source is WithElem<Tp, T>['nonEmpty'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-6"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-3"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"source")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"any")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"isvalidelem"}),(0,a.kt)("inlineCode",{parentName:"h3"},"isValidElem")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-14"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"isValidElem(elem: any): elem is UT;"))),(0,a.kt)("h4",u({},{id:"parameters-4"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"elem")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"any")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides-6"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Context/interface#isValidElem"}),"Context.isValidElem"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"of-1"}),(0,a.kt)("inlineCode",{parentName:"h3"},"of")),(0,a.kt)("p",null,"Returns an immutable multimap of this collection type and context, containing the given ",(0,a.kt)("inlineCode",{parentName:"p"},"values"),".")),(0,a.kt)("h4",u({},{id:"definition-15"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"of<T extends UT>(...values: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>): WithElem<Tp, T>['nonEmpty'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-7"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"UT")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-5"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"values")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,a.kt)("inlineCode",{parentName:"td"},"<T>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"a non-empty array of vslues")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2)    // => HashMultiSet.NonEmpty<number>\n"))),(0,a.kt)("h4",u({},{id:"overrides-7"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#of"}),"Factory.of"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"reducer-1"}),(0,a.kt)("inlineCode",{parentName:"h3"},"reducer")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"Reducer")," that appends received items to a MultiSet and returns the MultiSet as a result. When a ",(0,a.kt)("inlineCode",{parentName:"p"},"source")," is given, the reducer will first create a MultiSet from the source, and then add elements to it.")),(0,a.kt)("h4",u({},{id:"definition-16"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"reducer<T extends UT>(source?: StreamSource<T>): Reducer<T, WithElem<Tp, T>['normal']>;"))),(0,a.kt)("h4",u({},{id:"type-parameters-8"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"UT")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-6"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"source")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"StreamSource<T>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"(optional) an initial source of elements to add to")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const someList = [1, 2, 3];\nconst result = Stream.range({ start: 20, amount: 5 }).reduce(SortedMultiSet.reducer(someList))\nresult.toArray()   // => [1, 2, 3, 20, 21, 22, 23, 24]\n"))),(0,a.kt)("admonition",u({},{title:"note",type:"note"}),(0,a.kt)("p",{parentName:"admonition"},"uses a MultiSet builder under the hood. If the given ",(0,a.kt)("inlineCode",{parentName:"p"},"source")," is a MultiSet in the same context, it will directly call ",(0,a.kt)("inlineCode",{parentName:"p"},".toBuilder()"),".")),(0,a.kt)("h4",u({},{id:"overrides-8"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Factory/interface#reducer"}),"Factory.reducer"))))}g.isMDXComponent=!0}}]);