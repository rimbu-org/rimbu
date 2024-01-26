"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[62280],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>c});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),m=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=m(e.components);return n.createElement(p.Provider,{value:t},e.children)},s="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),s=m(a),k=r,c=s["".concat(p,".").concat(k)]||s[k]||u[k]||i;return a?n.createElement(c,l(l({ref:t},d),{},{components:a})):n.createElement(c,l({ref:t},d))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=k;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[s]="string"==typeof e?e:r,l[1]=o;for(var m=2;m<i;m++)l[m]=a[m];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},83130:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>v,contentTitle:()=>N,default:()=>g,frontMatter:()=>c,metadata:()=>h,toc:()=>f});var n=a(3905),r=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,d=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,s=(e,t)=>{for(var a in t||(t={}))p.call(t,a)&&d(e,a,t[a]);if(o)for(var a of o(t))m.call(t,a)&&d(e,a,t[a]);return e},u=(e,t)=>i(e,l(t)),k=(e,t)=>{var a={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&m.call(e,n)&&(a[n]=e[n]);return a};const c={title:"VariantSet<T>",slug:"/rimbu/collection-types/set/VariantSet/interface"},N="interface VariantSet<T>",h={unversionedId:"rimbu_collection-types/set/VariantSet.interface",id:"rimbu_collection-types/set/VariantSet.interface",title:"VariantSet<T>",description:"A type-variant immutable Set of value type T. In the Set, there are no duplicate values. See the Set documentation and the VariantSet API documentation",source:"@site/api/rimbu_collection-types/set/VariantSet.interface.mdx",sourceDirName:"rimbu_collection-types/set",slug:"/rimbu/collection-types/set/VariantSet/interface",permalink:"/api/rimbu/collection-types/set/VariantSet/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"VariantSet<T>",slug:"/rimbu/collection-types/set/VariantSet/interface"},sidebar:"defaultSidebar",previous:{title:"VariantSet.Types",permalink:"/api/rimbu/collection-types/set/VariantSet/Types/interface"},next:{title:"@rimbu/collection-types/set-custom",permalink:"/api/rimbu/collection-types/set-custom"}},v={},f=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>isEmpty</code>",id:"isempty",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>size</code>",id:"size",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>[Symbol.iterator]</code>",id:"symboliterator",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>assumeNonEmpty</code>",id:"assumenonempty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>difference</code>",id:"difference",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>filter</code>",id:"filter",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"<code>forEach</code>",id:"foreach",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"<code>has</code>",id:"has",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"<code>intersect</code>",id:"intersect",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"Overrides",id:"overrides-8",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Overrides",id:"overrides-9",level:4},{value:"<code>remove</code>",id:"remove",level:3},{value:"Definition",id:"definition-10",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Overrides",id:"overrides-10",level:4},{value:"<code>removeAll</code>",id:"removeall",level:3},{value:"Definition",id:"definition-11",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"Overrides",id:"overrides-11",level:4},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition-12",level:4},{value:"Overrides",id:"overrides-12",level:4},{value:"<code>toArray</code>",id:"toarray",level:3},{value:"Definition",id:"definition-13",level:4},{value:"Overrides",id:"overrides-13",level:4},{value:"<code>toJSON</code>",id:"tojson",level:3},{value:"Definition",id:"definition-14",level:4},{value:"Overrides",id:"overrides-14",level:4},{value:"<code>toString</code>",id:"tostring",level:3},{value:"Definition",id:"definition-15",level:4},{value:"Overrides",id:"overrides-15",level:4}],y={toc:f},b="wrapper";function g(e){var t=e,{components:a}=t,r=k(t,["components"]);return(0,n.kt)(b,u(s(s({},y),r),{components:a,mdxType:"MDXLayout"}),(0,n.kt)("h1",s({},{id:"interface-variantsett"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface VariantSet<T>")),(0,n.kt)("p",null,"A type-variant immutable Set of value type T. In the Set, there are no duplicate values. See the ",(0,n.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",s({parentName:"p"},{href:"https://rimbu.org/api/rimbu/collection-types/set/VariantSet/interface"}),"VariantSet API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set/VariantSet/namespace"}),"VariantSet")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantSetBase<T,Tp>"))),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set/VariantSet/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantSet.NonEmpty<T>"))),(0,n.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the value type")))),(0,n.kt)("admonition",s({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"Type-variance means that both the value type can be widened in a type-safe way without casting.  @note As a consequence of being variant, the type does not contain methods that (can) add new elements to the collection.")),(0,n.kt)("h2",s({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"isempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"isEmpty")),(0,n.kt)("p",null,"Returns true if the collection is empty.")),(0,n.kt)("h4",s({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly isEmpty: boolean;"))),(0,n.kt)("h4",s({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#isEmpty"}),"VariantSetBase.isEmpty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"size"}),(0,n.kt)("inlineCode",{parentName:"h3"},"size")),(0,n.kt)("p",null,"Returns the number of values in the collection.")),(0,n.kt)("h4",s({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly size: number;"))),(0,n.kt)("h4",s({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#size"}),"VariantSetBase.size"))),(0,n.kt)("h2",s({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"symboliterator"}),(0,n.kt)("inlineCode",{parentName:"h3"},"[Symbol.iterator]")),(0,n.kt)("p",null,"Returns a ",(0,n.kt)("inlineCode",{parentName:"p"},"FastIterator")," instance used to iterate over the values of this ",(0,n.kt)("inlineCode",{parentName:"p"},"Iterable"),".")),(0,n.kt)("h4",s({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"[Symbol.iterator](): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/FastIterator/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"FastIterator")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,n.kt)("h4",s({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/FastIterable/interface#%5BSymbol.iterator%5D"}),"FastIterable.[Symbol.iterator]"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"assumenonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"assumeNonEmpty")),(0,n.kt)("p",null,"Returns the same collection typed as non-empty.")),(0,n.kt)("h4",s({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"assumeNonEmpty(): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['nonEmpty'];"))),(0,n.kt)("admonition",s({},{title:"throws",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},(0,n.kt)("inlineCode",{parentName:"p"},"RimbuError.EmptyCollectionAssumedNonEmptyError")," if the collection is empty")),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.empty().assumeNonEmpty()          // => throws RimbuError.EmptyCollectionAssumedNonEmptyError\nHashSet.from([[0, 1]]).assumeNonEmpty()   // => List.NonEmpty(0, 1, 2)\n"))),(0,n.kt)("h4",s({},{id:"overrides-3"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#assumeNonEmpty"}),"VariantSetBase.assumeNonEmpty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"difference"}),(0,n.kt)("inlineCode",{parentName:"h3"},"difference")),(0,n.kt)("p",null,"Returns a collection where each value of given ",(0,n.kt)("inlineCode",{parentName:"p"},"other")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource")," is removed from this collection.")),(0,n.kt)("h4",s({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"difference<U = T>(other: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<RelatedTo<T, U>>): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("h4",s({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",s({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",s({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"other")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("a",s({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<RelatedTo<T, U>>")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"a ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," containing values")))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).difference(HashSet.of(1, 3)).toArray()  // => [2]\n"))),(0,n.kt)("h4",s({},{id:"overrides-4"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#difference"}),"VariantSetBase.difference"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"filter"}),(0,n.kt)("inlineCode",{parentName:"h3"},"filter")),(0,n.kt)("p",null,"Returns a collection containing only those entries that satisfy given ",(0,n.kt)("inlineCode",{parentName:"p"},"pred")," predicate.")),(0,n.kt)("h4",s({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"filter(pred: (value: T, index: number, halt: () => void) => boolean, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"negate?: boolean;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("h4",s({},{id:"parameters-1"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"pred")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"(value: T, index: number, halt: () => void) => boolean")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"a predicate function receiving:",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"value"),": the next value",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"index"),": the entry index",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, when called, ensures no next elements are passed")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"options")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"{"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"negate?: boolean;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"}")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"(optional) an object containing the following properties:",(0,n.kt)("br",null)," - negate: (default: false) when true will negate the predicate")))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).filter(value < 3).toArray()\n// => [1, 2]\n"))),(0,n.kt)("h4",s({},{id:"overrides-5"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#filter"}),"VariantSetBase.filter"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"foreach"}),(0,n.kt)("inlineCode",{parentName:"h3"},"forEach")),(0,n.kt)("p",null,"Performs given function ",(0,n.kt)("inlineCode",{parentName:"p"},"f")," for each value of the collection, using given ",(0,n.kt)("inlineCode",{parentName:"p"},"state")," as initial traversal state.")),(0,n.kt)("h4",s({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"forEach(f: (value: T, index: number, halt: () => void) => void, options?: {"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"state?: TraverseState;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"p"},"}): void;"))),(0,n.kt)("h4",s({},{id:"parameters-2"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"f")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"(value: T, index: number, halt: () => void) => void")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the function to perform for each element, receiving: - ",(0,n.kt)("inlineCode",{parentName:"td"},"value"),": the next element",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"index"),": the index of the element",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, if called, ensures that no new elements are passed")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"options")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"{"),(0,n.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"state?: TraverseState;"),(0,n.kt)("br",null),"\xa0","\xa0",(0,n.kt)("inlineCode",{parentName:"td"},"}")),(0,n.kt)("td",s({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).forEach((value, i, halt) => {\nconsole.log([value, i]);\nif (i >= 1) halt();\n})\n// => logs [1, 0]  [2, 1]\n"))),(0,n.kt)("admonition",s({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"O(N)")),(0,n.kt)("h4",s({},{id:"overrides-6"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#forEach"}),"VariantSetBase.forEach"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"has"}),(0,n.kt)("inlineCode",{parentName:"h3"},"has")),(0,n.kt)("p",null,"Returns true if given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," is in the collection.")),(0,n.kt)("h4",s({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"has<U = T>(value: RelatedTo<T, U>): boolean;"))),(0,n.kt)("h4",s({},{id:"type-parameters-2"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",s({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",s({},{id:"parameters-3"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the value to look for")))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).has(2)  // => true\nHashSet.of(1, 2, 3).has(10) // => false\n"))),(0,n.kt)("h4",s({},{id:"overrides-7"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#has"}),"VariantSetBase.has"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"intersect"}),(0,n.kt)("inlineCode",{parentName:"h3"},"intersect")),(0,n.kt)("p",null,"Returns a collection containing values that are both in this collection, and in the given ",(0,n.kt)("inlineCode",{parentName:"p"},"other")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource"),".")),(0,n.kt)("h4",s({},{id:"definition-8"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"intersect<U = T>(other: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<RelatedTo<T, U>>): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("h4",s({},{id:"type-parameters-3"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",s({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",s({},{id:"parameters-4"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"other")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("a",s({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<RelatedTo<T, U>>")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"a ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," containing values")))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).interface(HashSet.of(1, 3)).toArray()   // => [1, 3]\n"))),(0,n.kt)("h4",s({},{id:"overrides-8"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#intersect"}),"VariantSetBase.intersect"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection as a .NonEmpty type.")),(0,n.kt)("h4",s({},{id:"definition-9"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"nonEmpty(): this is "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['nonEmpty'];"))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"const m: HashSet<number> = HashSet.of(1, 2, 2)\nm.stream().first(0)     // compiler allows fallback value since the Stream may be empty\nif (m.nonEmpty()) {\nm.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty\n}\n"))),(0,n.kt)("h4",s({},{id:"overrides-9"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#nonEmpty"}),"VariantSetBase.nonEmpty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"remove"}),(0,n.kt)("inlineCode",{parentName:"h3"},"remove")),(0,n.kt)("p",null,"Returns the collection with given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," removed.")),(0,n.kt)("h4",s({},{id:"definition-10"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"remove<U = T>(value: RelatedTo<T, U>): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("h4",s({},{id:"type-parameters-4"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",s({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",s({},{id:"parameters-5"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"the value to remove")))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"const s = HashSet.of(1, 2, 3)\ns.remove(2).toArray()   // => [1, 3]\ns.remove(10).toArray()  // => [1, 2, 3]\n"))),(0,n.kt)("h4",s({},{id:"overrides-10"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#remove"}),"VariantSetBase.remove"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"removeall"}),(0,n.kt)("inlineCode",{parentName:"h3"},"removeAll")),(0,n.kt)("p",null,"Returns the collection with all values in the given ",(0,n.kt)("inlineCode",{parentName:"p"},"values")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource")," removed.")),(0,n.kt)("h4",s({},{id:"definition-11"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"removeAll<U = T>(values: "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<RelatedTo<T, U>>): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("h4",s({},{id:"type-parameters-5"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",s({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",s({},{id:"parameters-6"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"values")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),(0,n.kt)("a",s({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<RelatedTo<T, U>>")),(0,n.kt)("td",s({parentName:"tr"},{align:null}),"a ",(0,n.kt)("inlineCode",{parentName:"td"},"StreamSource")," containing values to remove")))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).removeAll([1, 3]).toArray()\n// => [2]\n"))),(0,n.kt)("h4",s({},{id:"overrides-11"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#removeAll"}),"VariantSetBase.removeAll"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"stream"}),(0,n.kt)("inlineCode",{parentName:"h3"},"stream")),(0,n.kt)("p",null,"Returns a Stream containing all elements of this collection.")),(0,n.kt)("h4",s({},{id:"definition-12"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"stream(): "),(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/Stream/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"Stream")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).stream().toArray()   // => [1, 2, 3]\n"))),(0,n.kt)("h4",s({},{id:"overrides-12"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#stream"}),"VariantSetBase.stream"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"toarray"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toArray")),(0,n.kt)("p",null,"Returns an array containing all values in this collection.")),(0,n.kt)("h4",s({},{id:"definition-13"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"toArray(): T[];"))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).toArray()   // => [1, 2, 3]\n"))),(0,n.kt)("admonition",s({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"O(log(N))  @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only")),(0,n.kt)("h4",s({},{id:"overrides-13"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#toArray"}),"VariantSetBase.toArray"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"tojson"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toJSON")),(0,n.kt)("p",null,"Returns a JSON representation of this collection.")),(0,n.kt)("h4",s({},{id:"definition-14"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"toJSON(): ToJSON<T[]>;"))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).toJSON()   // => { dataType: 'HashSet', value: [1, 2, 3] }\n"))),(0,n.kt)("h4",s({},{id:"overrides-14"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#toJSON"}),"VariantSetBase.toJSON"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",s({},{id:"tostring"}),(0,n.kt)("inlineCode",{parentName:"h3"},"toString")),(0,n.kt)("p",null,"Returns a string representation of this collection.")),(0,n.kt)("h4",s({},{id:"definition-15"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"toString(): string;"))),(0,n.kt)("admonition",s({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",s({parentName:"pre"},{className:"language-ts"}),"HashSet.of(1, 2, 3).toString()   // => HashSet(1, 2, 3)\n"))),(0,n.kt)("h4",s({},{id:"overrides-15"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",s({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/VariantSetBase/interface#toString"}),"VariantSetBase.toString"))))}g.isMDXComponent=!0}}]);