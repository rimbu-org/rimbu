"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[40043],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>c});var n=a(67294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var m=n.createContext({}),p=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=p(e.components);return n.createElement(m.Provider,{value:t},e.children)},u="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,r=e.originalType,m=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=p(a),k=i,c=u["".concat(m,".").concat(k)]||u[k]||s[k]||r;return a?n.createElement(c,l(l({ref:t},d),{},{components:a})):n.createElement(c,l({ref:t},d))}));function c(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=a.length,l=new Array(r);l[0]=k;var o={};for(var m in t)hasOwnProperty.call(t,m)&&(o[m]=t[m]);o.originalType=e,o[u]="string"==typeof e?e:i,l[1]=o;for(var p=2;p<r;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},95613:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>h,contentTitle:()=>N,default:()=>b,frontMatter:()=>c,metadata:()=>v,toc:()=>f});var n=a(3905),i=Object.defineProperty,r=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,m=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,d=(e,t,a)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))m.call(t,a)&&d(e,a,t[a]);if(o)for(var a of o(t))p.call(t,a)&&d(e,a,t[a]);return e},s=(e,t)=>r(e,l(t)),k=(e,t)=>{var a={};for(var n in e)m.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&p.call(e,n)&&(a[n]=e[n]);return a};const c={title:"VariantMultiSetBase.NonEmpty<T,Tp>",slug:"/rimbu/multiset/custom/VariantMultiSetBase/NonEmpty/interface"},N="interface VariantMultiSetBase.NonEmpty<T,Tp>",v={unversionedId:"rimbu_multiset/custom/VariantMultiSetBase/NonEmpty.interface",id:"rimbu_multiset/custom/VariantMultiSetBase/NonEmpty.interface",title:"VariantMultiSetBase.NonEmpty<T,Tp>",description:"undocumented",source:"@site/api/rimbu_multiset/custom/VariantMultiSetBase/NonEmpty.interface.mdx",sourceDirName:"rimbu_multiset/custom/VariantMultiSetBase",slug:"/rimbu/multiset/custom/VariantMultiSetBase/NonEmpty/interface",permalink:"/api/rimbu/multiset/custom/VariantMultiSetBase/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"VariantMultiSetBase.NonEmpty<T,Tp>",slug:"/rimbu/multiset/custom/VariantMultiSetBase/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"VariantMultiSetBase (namespace)",permalink:"/api/rimbu/multiset/custom/VariantMultiSetBase/namespace"},next:{title:"VariantMultiSetBase.Types",permalink:"/api/rimbu/multiset/custom/VariantMultiSetBase/Types/interface"}},h={},f=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>countMap</code>",id:"countmap",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>isEmpty</code>",id:"isempty",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>size</code>",id:"size",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>sizeDistinct</code>",id:"sizedistinct",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>asNormal</code>",id:"asnormal",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>assumeNonEmpty</code>",id:"assumenonempty",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>count</code>",id:"count",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"<code>filterEntries</code>",id:"filterentries",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"<code>forEach</code>",id:"foreach",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"<code>has</code>",id:"has",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Overrides",id:"overrides-8",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-10",level:4},{value:"Overrides",id:"overrides-9",level:4},{value:"<code>remove</code>",id:"remove",level:3},{value:"Definition",id:"definition-11",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Overrides",id:"overrides-10",level:4},{value:"<code>removeAllEvery</code>",id:"removeallevery",level:3},{value:"Definition",id:"definition-12",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Overrides",id:"overrides-11",level:4},{value:"<code>removeAllSingle</code>",id:"removeallsingle",level:3},{value:"Definition",id:"definition-13",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"Overrides",id:"overrides-12",level:4},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition-14",level:4},{value:"Overrides",id:"overrides-13",level:4},{value:"<code>streamDistinct</code>",id:"streamdistinct",level:3},{value:"Definition",id:"definition-15",level:4},{value:"Overrides",id:"overrides-14",level:4},{value:"<code>toArray</code>",id:"toarray",level:3},{value:"Definition",id:"definition-16",level:4},{value:"Overrides",id:"overrides-15",level:4},{value:"<code>toJSON</code>",id:"tojson",level:3},{value:"Definition",id:"definition-17",level:4},{value:"Overrides",id:"overrides-16",level:4},{value:"<code>toString</code>",id:"tostring",level:3},{value:"Definition",id:"definition-18",level:4},{value:"Overrides",id:"overrides-17",level:4}],y={toc:f},g="wrapper";function b(e){var t=e,{components:a}=t,i=k(t,["components"]);return(0,n.kt)(g,s(u(u({},y),i),{components:a,mdxType:"MDXLayout"}),(0,n.kt)("h1",u({},{id:"interface-variantmultisetbasenonemptyttp"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface VariantMultiSetBase.NonEmpty<T,Tp>")),(0,n.kt)("p",null,"undocumented"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantMultiSetBase<T,Tp>"))),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetBase.NonEmpty<T,Tp>"))),(0,n.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",u({parentName:"tr"},{align:null})),(0,n.kt)("td",u({parentName:"tr"},{align:null})),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"Tp"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantMultiSetBase.Types"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantMultiSetBase.Types"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")))),(0,n.kt)("h2",u({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"countmap"}),(0,n.kt)("inlineCode",{parentName:"h3"},"countMap")),(0,n.kt)("p",null,"Returns the Map representation of this collection.")),(0,n.kt)("h4",u({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly countMap: WithElem<Tp, T>['countMapNonEmpty'];"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiMapHashValue.of([1, 1], [2, 2])\nconst map: HashMap.NonEmpty<number, HashSet.NonEmpty<number>> = m.countMap\n"))),(0,n.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#countMap"}),"VariantMultiSetBase.countMap"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"isempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"isEmpty")),(0,n.kt)("p",null,"Returns false since this collection is known to be non-empty")),(0,n.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly isEmpty: false;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).isEmpty         // => false\n"))),(0,n.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#isEmpty"}),"VariantMultiSetBase.isEmpty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"size"}),(0,n.kt)("inlineCode",{parentName:"h3"},"size")),(0,n.kt)("p",null,"Returns the number of values in the collection.")),(0,n.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly size: number;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2).size         // => 2\nHashMultiSet.of(1, 2, 2).size      // => 3\n"))),(0,n.kt)("h4",u({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#size"}),"VariantMultiSetBase.size"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"sizedistinct"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sizeDistinct")),(0,n.kt)("p",null,"Returns the number of distinct values in the collection.")),(0,n.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sizeDistinct: number;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2).sizeDistinct       // => 2\nHashMultiSet.of(1, 2, 2).sizeDistinct    // => 2\n"))),(0,n.kt)("h4",u({},{id:"overrides-3"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#sizeDistinct"}),"VariantMultiSetBase.sizeDistinct"))),(0,n.kt)("h2",u({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"asnormal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"asNormal")),(0,n.kt)("p",null,"Returns this collection typed as a 'possibly empty' collection.")),(0,n.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"asNormal(): WithElem<Tp, T>['normal'];"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2).asNormal();  // type: HashMultiSet<number>\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"assumenonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"assumeNonEmpty")),(0,n.kt)("p",null,"Returns the collection as a .NonEmpty type")),(0,n.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"assumeNonEmpty(): WithElem<Tp, T>['nonEmpty'];"))),(0,n.kt)("admonition",u({},{title:"throws",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty")),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.empty<number>().assumeNonEmpty()   // => throws\nconst m: HashMultiSet<number> = HashMultiSet.of(1, 2)\nconst m2: HashMultiSet.NonEmpty<number> = m     // => compiler error\nconst m3: HashMultiSet.NonEmpty<number> = m.assumeNonEmpty()\n"))),(0,n.kt)("admonition",u({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"returns reference to this collection")),(0,n.kt)("h4",u({},{id:"overrides-4"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#assumeNonEmpty"}),"VariantMultiSetBase.assumeNonEmpty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"count"}),(0,n.kt)("inlineCode",{parentName:"h3"},"count")),(0,n.kt)("p",null,"Returns the amount of occurrances of the given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," in the collection.")),(0,n.kt)("h4",u({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"count<U = T>(value: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, U>): number;"))),(0,n.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"td"},"<T, U>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value to look for")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.count(5)   // => 0\nm.count(2)   // => 2\n"))),(0,n.kt)("h4",u({},{id:"overrides-5"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#count"}),"VariantMultiSetBase.count"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"filterentries"}),(0,n.kt)("inlineCode",{parentName:"h3"},"filterEntries")),(0,n.kt)("p",null,"Returns the collection containing only those values for which the given ",(0,n.kt)("inlineCode",{parentName:"p"},"pred")," function returns true.")),(0,n.kt)("h4",u({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"filterEntries(pred: (entry: readonly [T, number], index: number) => boolean): WithElem<Tp, T>['normal'];"))),(0,n.kt)("h4",u({},{id:"parameters-1"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"pred")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"(entry: readonly [T, number], index: number) => boolean")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"a predicate function receiving:",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"entry"),": the next entry consisting of the value and its count",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"index"),": the entry index",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, when called, ensures no next entries are passed")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2, 3)\n.filterEntries(entry => entry[1] > 1)\n.toArray()\n// => [[2, 2]]\n"))),(0,n.kt)("h4",u({},{id:"overrides-6"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#filterEntries"}),"VariantMultiSetBase.filterEntries"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"foreach"}),(0,n.kt)("inlineCode",{parentName:"h3"},"forEach")),(0,n.kt)("p",null,"Performs given function ",(0,n.kt)("inlineCode",{parentName:"p"},"f")," for each value of the collection, using given ",(0,n.kt)("inlineCode",{parentName:"p"},"state")," as initial traversal state.")),(0,n.kt)("h4",u({},{id:"definition-8"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"forEach(f: (value: T, index: number, halt: () => void) => void, state?: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/TraverseState/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"TraverseState")),(0,n.kt)("inlineCode",{parentName:"p"},"): void;"))),(0,n.kt)("h4",u({},{id:"parameters-2"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"f")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"(value: T, index: number, halt: () => void) => void")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the function to perform for each value, receiving:",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"value"),": the next value",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"index"),": the index of the value",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, if called, ensures that no new values are passed")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"state")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/TraverseState/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"TraverseState"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"param",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"state -")),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2, 3).forEach((entry, i, halt) => {\nconsole.log(entry)\nif (i >= 1) halt()\n})\n// => logs [1, 1]  [2, 2]\n"))),(0,n.kt)("h4",u({},{id:"overrides-7"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#forEach"}),"VariantMultiSetBase.forEach"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"has"}),(0,n.kt)("inlineCode",{parentName:"h3"},"has")),(0,n.kt)("p",null,"Returns true if the given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," exists in the collection.")),(0,n.kt)("h4",u({},{id:"definition-9"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"has<U = T>(value: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, U>): boolean;"))),(0,n.kt)("h4",u({},{id:"type-parameters-2"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-3"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"td"},"<T, U>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value to look for")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.has(5)   // => false\nm.has(2)   // => true\n"))),(0,n.kt)("h4",u({},{id:"overrides-8"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#has"}),"VariantMultiSetBase.has"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"Returns true since this collection is known to be non-empty")),(0,n.kt)("h4",u({},{id:"definition-10"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"nonEmpty(): true;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).nonEmpty()   // => true\n"))),(0,n.kt)("h4",u({},{id:"overrides-9"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#nonEmpty"}),"VariantMultiSetBase.nonEmpty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"remove"}),(0,n.kt)("inlineCode",{parentName:"h3"},"remove")),(0,n.kt)("p",null,"Returns the collection where the given ",(0,n.kt)("inlineCode",{parentName:"p"},"amount")," (default: 'ALL') of the given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," are removed.")),(0,n.kt)("h4",u({},{id:"definition-11"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"remove<U = T>(value: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, U>, amount?: number "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," 'ALL'): WithElem<Tp, T>['normal'];"))),(0,n.kt)("h4",u({},{id:"type-parameters-3"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-4"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"td"},"<T, U>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value to remove")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"amount")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"number "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"td"}," 'ALL'")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the amount of values to remove, or 'ALL' to remove all values.")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.remove(5).toArray()     // => [1, 2, 2]\nm.remove(2).toArray()     // => [1]\nm.remove(2, 1).toArray()  // => [1, 2]\n"))),(0,n.kt)("h4",u({},{id:"overrides-10"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#remove"}),"VariantMultiSetBase.remove"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"removeallevery"}),(0,n.kt)("inlineCode",{parentName:"h3"},"removeAllEvery")),(0,n.kt)("p",null,"Returns the collection where for every value from given ",(0,n.kt)("inlineCode",{parentName:"p"},"values")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource"),", all values in the collection are removed.")),(0,n.kt)("h4",u({},{id:"definition-12"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"removeAllEvery<U = T>(values: StreamSource<"),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, U>>): WithElem<Tp, T>['normal'];"))),(0,n.kt)("h4",u({},{id:"type-parameters-4"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-5"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"values")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource<"),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"td"},"<T, U>>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"a ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," containing values to remove.")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.removeAllEvery([5, 6]).toArray()    // => [1, 2, 2]\nm.removeAllEvery([2, 3]).toArray()    // => [1]\n"))),(0,n.kt)("h4",u({},{id:"overrides-11"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#removeAllEvery"}),"VariantMultiSetBase.removeAllEvery"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"removeallsingle"}),(0,n.kt)("inlineCode",{parentName:"h3"},"removeAllSingle")),(0,n.kt)("p",null,"Returns the collection where every single value from given ",(0,n.kt)("inlineCode",{parentName:"p"},"values")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource")," is removed.")),(0,n.kt)("h4",u({},{id:"definition-13"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"removeAllSingle<U = T>(values: StreamSource<"),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"p"},"<T, U>>): WithElem<Tp, T>['normal'];"))),(0,n.kt)("h4",u({},{id:"type-parameters-5"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-6"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"values")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource<"),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/RelatedTo/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"RelatedTo")),(0,n.kt)("inlineCode",{parentName:"td"},"<T, U>>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"a ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," containing values to remove.")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.removeAllSingle([5, 6]).toArray()    // => [1, 2, 2]\nm.removeAllSingle([2, 3]).toArray()    // => [1, 2]\nm.removeAllSingle([2, 3, 2]).toArray() // => [1]\n"))),(0,n.kt)("h4",u({},{id:"overrides-12"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#removeAllSingle"}),"VariantMultiSetBase.removeAllSingle"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"stream"}),(0,n.kt)("inlineCode",{parentName:"h3"},"stream")),(0,n.kt)("p",null,"Returns a non-empty Stream containing all values of this collection.")),(0,n.kt)("h4",u({},{id:"definition-14"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"stream(): Stream.NonEmpty<T>;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2, 2]\n"))),(0,n.kt)("h4",u({},{id:"overrides-13"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#stream"}),"VariantMultiSetBase.stream"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"streamdistinct"}),(0,n.kt)("inlineCode",{parentName:"h3"},"streamDistinct")),(0,n.kt)("p",null,"Returns a non-empty Stream containing all distinct values of this collection.")),(0,n.kt)("h4",u({},{id:"definition-15"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"streamDistinct(): Stream.NonEmpty<T>;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2]\n"))),(0,n.kt)("h4",u({},{id:"overrides-14"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#streamDistinct"}),"VariantMultiSetBase.streamDistinct"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"toarray"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toArray")),(0,n.kt)("p",null,"Returns a non-empty array containing all values in this collection.")),(0,n.kt)("h4",u({},{id:"definition-16"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"toArray(): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ArrayNonEmpty/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrayNonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toArray()  // => [1, 2, 2]\n"))),(0,n.kt)("admonition",u({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"O(log(N))  @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only")),(0,n.kt)("h4",u({},{id:"overrides-15"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#toArray"}),"VariantMultiSetBase.toArray"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"tojson"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toJSON")),(0,n.kt)("p",null,"Returns a JSON representation of this collection.")),(0,n.kt)("h4",u({},{id:"definition-17"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"toJSON(): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/ToJSON/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ToJSON")),(0,n.kt)("inlineCode",{parentName:"p"},"<(readonly [T, number])[]>;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toJSON()   // => { dataType: 'HashMultiSet', value: [[1, 1], [2, 2]] }\n"))),(0,n.kt)("h4",u({},{id:"overrides-16"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#toJSON"}),"VariantMultiSetBase.toJSON"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"tostring"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toString")),(0,n.kt)("p",null,"Returns a string representation of this collection.")),(0,n.kt)("h4",u({},{id:"definition-18"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"toString(): string;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toString()  // => HashMultiSet(1, 2, 2)\n"))),(0,n.kt)("h4",u({},{id:"overrides-17"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface#toString"}),"VariantMultiSetBase.toString"))))}b.isMDXComponent=!0}}]);