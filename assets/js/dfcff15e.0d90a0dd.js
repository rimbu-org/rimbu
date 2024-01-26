"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[96584],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>c});var a=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,l=function(e,t){if(null==e)return{};var n,a,l={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var m=a.createContext({}),p=function(e){var t=a.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},d=function(e){var t=p(e.components);return a.createElement(m.Provider,{value:t},e.children)},u="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,l=e.mdxType,i=e.originalType,m=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=p(n),k=l,c=u["".concat(m,".").concat(k)]||u[k]||s[k]||i;return n?a.createElement(c,r(r({ref:t},d),{},{components:n})):a.createElement(c,r({ref:t},d))}));function c(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var i=n.length,r=new Array(i);r[0]=k;var o={};for(var m in t)hasOwnProperty.call(t,m)&&(o[m]=t[m]);o.originalType=e,o[u]="string"==typeof e?e:l,r[1]=o;for(var p=2;p<i;p++)r[p]=n[p];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},76973:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>f,contentTitle:()=>N,default:()=>g,frontMatter:()=>c,metadata:()=>h,toc:()=>y});var a=n(3905),l=Object.defineProperty,i=Object.defineProperties,r=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,m=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,d=(e,t,n)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))m.call(t,n)&&d(e,n,t[n]);if(o)for(var n of o(t))p.call(t,n)&&d(e,n,t[n]);return e},s=(e,t)=>i(e,r(t)),k=(e,t)=>{var n={};for(var a in e)m.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&o)for(var a of o(e))t.indexOf(a)<0&&p.call(e,a)&&(n[a]=e[a]);return n};const c={title:"VariantMultiSetBase<T,Tp>",slug:"/rimbu/multiset/custom/VariantMultiSetBase/interface"},N="interface VariantMultiSetBase<T,Tp>",h={unversionedId:"rimbu_multiset/custom/VariantMultiSetBase.interface",id:"rimbu_multiset/custom/VariantMultiSetBase.interface",title:"VariantMultiSetBase<T,Tp>",description:"undocumented",source:"@site/api/rimbu_multiset/custom/VariantMultiSetBase.interface.mdx",sourceDirName:"rimbu_multiset/custom",slug:"/rimbu/multiset/custom/VariantMultiSetBase/interface",permalink:"/api/rimbu/multiset/custom/VariantMultiSetBase/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"VariantMultiSetBase<T,Tp>",slug:"/rimbu/multiset/custom/VariantMultiSetBase/interface"},sidebar:"defaultSidebar",previous:{title:"VariantMultiSetBase.Types",permalink:"/api/rimbu/multiset/custom/VariantMultiSetBase/Types/interface"},next:{title:"@rimbu/ordered",permalink:"/api/rimbu/ordered"}},f={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>countMap</code>",id:"countmap",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>isEmpty</code>",id:"isempty",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>size</code>",id:"size",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>sizeDistinct</code>",id:"sizedistinct",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>[Symbol.iterator]</code>",id:"symboliterator",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>assumeNonEmpty</code>",id:"assumenonempty",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>count</code>",id:"count",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>filterEntries</code>",id:"filterentries",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"<code>forEach</code>",id:"foreach",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"<code>has</code>",id:"has",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-10",level:4},{value:"<code>remove</code>",id:"remove",level:3},{value:"Definition",id:"definition-11",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"<code>removeAllEvery</code>",id:"removeallevery",level:3},{value:"Definition",id:"definition-12",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"<code>removeAllSingle</code>",id:"removeallsingle",level:3},{value:"Definition",id:"definition-13",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition-14",level:4},{value:"<code>streamDistinct</code>",id:"streamdistinct",level:3},{value:"Definition",id:"definition-15",level:4},{value:"<code>toArray</code>",id:"toarray",level:3},{value:"Definition",id:"definition-16",level:4},{value:"<code>toJSON</code>",id:"tojson",level:3},{value:"Definition",id:"definition-17",level:4},{value:"<code>toString</code>",id:"tostring",level:3},{value:"Definition",id:"definition-18",level:4}],v={toc:y},b="wrapper";function g(e){var t=e,{components:n}=t,l=k(t,["components"]);return(0,a.kt)(b,s(u(u({},v),l),{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",u({},{id:"interface-variantmultisetbasettp"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface VariantMultiSetBase<T,Tp>")),(0,a.kt)("p",null,"undocumented"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/namespace"}),"VariantMultiSetBase")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/FastIterable/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"FastIterable<T>"))),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBase/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"MultiSetBase<T,Tp>")),", ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/VariantMultiSet/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiSet<T>")),", ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiSetBase.NonEmpty<T,Tp>")),", ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/core/VariantMultiSet/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiSet<T>"))),(0,a.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null})),(0,a.kt)("td",u({parentName:"tr"},{align:null})),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"Tp"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/Types/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiSetBase.Types"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/VariantMultiSetBase/Types/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"VariantMultiSetBase.Types"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")))),(0,a.kt)("h2",u({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"countmap"}),(0,a.kt)("inlineCode",{parentName:"h3"},"countMap")),(0,a.kt)("p",null,"Returns the Map representation of this collection.")),(0,a.kt)("h4",u({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly countMap: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,a.kt)("inlineCode",{parentName:"p"},"<Tp, T>['countMap'];"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nconst map: HashMap.NonEmpty<number, number> = m.countMap\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"isempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"isEmpty")),(0,a.kt)("p",null,"Returns true if the collection is empty.")),(0,a.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly isEmpty: boolean;"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.empty<number>().isEmpty     // => true\nHashMultiSet.of(1, 2, 2).isEmpty         // => false\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"size"}),(0,a.kt)("inlineCode",{parentName:"h3"},"size")),(0,a.kt)("p",null,"Returns the number of values in the collection.")),(0,a.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly size: number;"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2).size         // => 2\nHashMultiSet.of(1, 2, 2).size      // => 3\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"sizedistinct"}),(0,a.kt)("inlineCode",{parentName:"h3"},"sizeDistinct")),(0,a.kt)("p",null,"Returns the number of distinct values in the collection.")),(0,a.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly sizeDistinct: number;"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2).sizeDistinct       // => 2\nHashMultiSet.of(1, 2, 2).sizeDistinct    // => 2\n")))),(0,a.kt)("h2",u({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"symboliterator"}),(0,a.kt)("inlineCode",{parentName:"h3"},"[Symbol.iterator]")),(0,a.kt)("p",null,"Returns a ",(0,a.kt)("inlineCode",{parentName:"p"},"FastIterator")," instance used to iterate over the values of this ",(0,a.kt)("inlineCode",{parentName:"p"},"Iterable"),".")),(0,a.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"[Symbol.iterator](): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,a.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/FastIterable/interface#%5BSymbol.iterator%5D"}),"FastIterable.[Symbol.iterator]"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"assumenonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"assumeNonEmpty")),(0,a.kt)("p",null,"Returns the collection as a .NonEmpty type")),(0,a.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"assumeNonEmpty(): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,a.kt)("inlineCode",{parentName:"p"},"<Tp, T>['nonEmpty'];"))),(0,a.kt)("admonition",u({},{title:"throws",type:"note"}),(0,a.kt)("p",{parentName:"admonition"},"RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty")),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.empty<number>().assumeNonEmpty()   // => throws\nconst m: HashMultiSet<number> = HashMultiSet.of(1, 2)\nconst m2: HashMultiSet.NonEmpty<number> = m     // => compiler error\nconst m3: HashMultiSet.NonEmpty<number> = m.assumeNonEmpty()\n"))),(0,a.kt)("admonition",u({},{title:"note",type:"note"}),(0,a.kt)("p",{parentName:"admonition"},"returns reference to this collection"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"count"}),(0,a.kt)("inlineCode",{parentName:"h3"},"count")),(0,a.kt)("p",null,"Returns the amount of occurrances of the given ",(0,a.kt)("inlineCode",{parentName:"p"},"value")," in the collection.")),(0,a.kt)("h4",u({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"count<U = T>(value: RelatedTo<T, U>): number;"))),(0,a.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"the value to look for")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.count(5)   // => 0\nm.count(2)   // => 2\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"filterentries"}),(0,a.kt)("inlineCode",{parentName:"h3"},"filterEntries")),(0,a.kt)("p",null,"Returns the collection containing only those values for which the given ",(0,a.kt)("inlineCode",{parentName:"p"},"pred")," function returns true.")),(0,a.kt)("h4",u({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"filterEntries(pred: (entry: readonly [T, number], index: number) => boolean, options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"negate?: boolean;"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,a.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,a.kt)("h4",u({},{id:"parameters-1"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"pred")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"(entry: readonly [T, number], index: number) => boolean")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"a predicate function receiving:",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"entry"),": the next entry consisting of the value and its count",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"index"),": the entry index",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, when called, ensures no next entries are passed")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"negate?: boolean;"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"(optional) an object containing the following properties:",(0,a.kt)("br",null)," - negate: (default: false) when true will negate the predicate")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2, 3)\n.filterEntries(entry => entry[1] > 1)\n.toArray()\n// => [[2, 2]]\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"foreach"}),(0,a.kt)("inlineCode",{parentName:"h3"},"forEach")),(0,a.kt)("p",null,"Performs given function ",(0,a.kt)("inlineCode",{parentName:"p"},"f")," for each value of the collection, using given ",(0,a.kt)("inlineCode",{parentName:"p"},"state")," as initial traversal state.")),(0,a.kt)("h4",u({},{id:"definition-8"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"forEach(f: (value: T, index: number, halt: () => void) => void, options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"state?: TraverseState;"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): void;"))),(0,a.kt)("h4",u({},{id:"parameters-2"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"f")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"(value: T, index: number, halt: () => void) => void")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"the function to perform for each value, receiving:",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"value"),": the next value",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"index"),": the index of the value",(0,a.kt)("br",null)," - ",(0,a.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, if called, ensures that no new values are passed")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"state?: TraverseState;"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"(optional) an object containing the following properties:",(0,a.kt)("br",null)," - state: (optional) the traversal state")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2, 3).forEach((entry, i, halt) => {\nconsole.log(entry)\nif (i >= 1) halt()\n})\n// => logs [1, 1]  [2, 2]\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"has"}),(0,a.kt)("inlineCode",{parentName:"h3"},"has")),(0,a.kt)("p",null,"Returns true if the given ",(0,a.kt)("inlineCode",{parentName:"p"},"value")," exists in the collection.")),(0,a.kt)("h4",u({},{id:"definition-9"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"has<U = T>(value: RelatedTo<T, U>): boolean;"))),(0,a.kt)("h4",u({},{id:"type-parameters-2"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-3"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"the value to look for")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.has(5)   // => false\nm.has(2)   // => true\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"nonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,a.kt)("p",null,"Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection as a .NonEmpty type.")),(0,a.kt)("h4",u({},{id:"definition-10"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"nonEmpty(): this is "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,a.kt)("inlineCode",{parentName:"p"},"<Tp, T>['nonEmpty'];"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m: HashMultiSet<number> = HashMultiSet.of(1, 2, 2)\nm.stream().first(0)     // compiler allows fallback value since the Stream may be empty\nif (m.nonEmpty()) {\nm.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty\n}\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"remove"}),(0,a.kt)("inlineCode",{parentName:"h3"},"remove")),(0,a.kt)("p",null,"Returns the collection where the given ",(0,a.kt)("inlineCode",{parentName:"p"},"amount")," (default: 'ALL') of the given ",(0,a.kt)("inlineCode",{parentName:"p"},"value")," are removed.")),(0,a.kt)("h4",u({},{id:"definition-11"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"remove<U = T>(value: RelatedTo<T, U>, options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"amount?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," 'ALL';"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,a.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-3"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-4"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"the value to remove")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"amount?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," 'ALL';"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"(optional) an object containing the following properties:",(0,a.kt)("br",null)," - amount: (default: 'ALL') the amount of values to remove, or 'ALL' to remove all values.")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.remove(5).toArray()     // => [1, 2, 2]\nm.remove(2).toArray()     // => [1]\nm.remove(2, 1).toArray()  // => [1, 2]\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"removeallevery"}),(0,a.kt)("inlineCode",{parentName:"h3"},"removeAllEvery")),(0,a.kt)("p",null,"Returns the collection where for every value from given ",(0,a.kt)("inlineCode",{parentName:"p"},"values")," ",(0,a.kt)("inlineCode",{parentName:"p"},"StreamSource"),", all values in the collection are removed.")),(0,a.kt)("h4",u({},{id:"definition-12"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"removeAllEvery<U = T>(values: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,a.kt)("inlineCode",{parentName:"p"},"<RelatedTo<T, U>>): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,a.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-4"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-5"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"values")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,a.kt)("inlineCode",{parentName:"td"},"<RelatedTo<T, U>>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"a ",(0,a.kt)("inlineCode",{parentName:"td"},"StreamSource")," containing values to remove.")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.removeAllEvery([5, 6]).toArray()    // => [1, 2, 2]\nm.removeAllEvery([2, 3]).toArray()    // => [1]\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"removeallsingle"}),(0,a.kt)("inlineCode",{parentName:"h3"},"removeAllSingle")),(0,a.kt)("p",null,"Returns the collection where every single value from given ",(0,a.kt)("inlineCode",{parentName:"p"},"values")," ",(0,a.kt)("inlineCode",{parentName:"p"},"StreamSource")," is removed.")),(0,a.kt)("h4",u({},{id:"definition-13"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"removeAllSingle<U = T>(values: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,a.kt)("inlineCode",{parentName:"p"},"<RelatedTo<T, U>>): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,a.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,a.kt)("h4",u({},{id:"type-parameters-5"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-6"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"values")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,a.kt)("inlineCode",{parentName:"td"},"<RelatedTo<T, U>>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"a ",(0,a.kt)("inlineCode",{parentName:"td"},"StreamSource")," containing values to remove.")))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const m = HashMultiSet.of(1, 2, 2)\nm.removeAllSingle([5, 6]).toArray()    // => [1, 2, 2]\nm.removeAllSingle([2, 3]).toArray()    // => [1, 2]\nm.removeAllSingle([2, 3, 2]).toArray() // => [1]\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"stream"}),(0,a.kt)("inlineCode",{parentName:"h3"},"stream")),(0,a.kt)("p",null,"Returns a Stream containing all values of this collection.")),(0,a.kt)("h4",u({},{id:"definition-14"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"stream(): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/Stream/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"Stream")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2, 2]\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"streamdistinct"}),(0,a.kt)("inlineCode",{parentName:"h3"},"streamDistinct")),(0,a.kt)("p",null,"Returns a Stream containing all distinct values of this collection.")),(0,a.kt)("h4",u({},{id:"definition-15"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"streamDistinct(): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/Stream/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"Stream")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2]\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"toarray"}),(0,a.kt)("inlineCode",{parentName:"h3"},"toArray")),(0,a.kt)("p",null,"Returns an array containing all values in this collection.")),(0,a.kt)("h4",u({},{id:"definition-16"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"toArray(): T[];"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toArray()  // => [1, 2, 2]\n"))),(0,a.kt)("admonition",u({},{title:"note",type:"note"}),(0,a.kt)("p",{parentName:"admonition"},"O(log(N))  @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"tojson"}),(0,a.kt)("inlineCode",{parentName:"h3"},"toJSON")),(0,a.kt)("p",null,"Returns a JSON representation of this collection.")),(0,a.kt)("h4",u({},{id:"definition-17"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"toJSON(): ToJSON<(readonly [T, number])[]>;"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toJSON()   // => { dataType: 'HashMultiSet', value: [[1, 1], [2, 2]] }\n")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"tostring"}),(0,a.kt)("inlineCode",{parentName:"h3"},"toString")),(0,a.kt)("p",null,"Returns a string representation of this collection.")),(0,a.kt)("h4",u({},{id:"definition-18"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"toString(): string;"))),(0,a.kt)("admonition",u({},{title:"example",type:"note"}),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toString()  // => HashMultiSet(1, 2, 2)\n")))))}g.isMDXComponent=!0}}]);