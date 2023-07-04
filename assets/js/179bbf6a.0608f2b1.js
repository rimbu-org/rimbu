"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[77119],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>N});var n=a(67294);function l(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){l(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,l=function(e,t){if(null==e)return{};var a,n,l={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(l[a]=e[a]);return l}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(l[a]=e[a])}return l}var m=n.createContext({}),d=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},p=function(e){var t=d(e.components);return n.createElement(m.Provider,{value:t},e.children)},u="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var a=e.components,l=e.mdxType,r=e.originalType,m=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),u=d(a),s=l,N=u["".concat(m,".").concat(s)]||u[s]||k[s]||r;return a?n.createElement(N,i(i({ref:t},p),{},{components:a})):n.createElement(N,i({ref:t},p))}));function N(e,t){var a=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var r=a.length,i=new Array(r);i[0]=s;var o={};for(var m in t)hasOwnProperty.call(t,m)&&(o[m]=t[m]);o.originalType=e,o[u]="string"==typeof e?e:l,i[1]=o;for(var d=2;d<r;d++)i[d]=a[d];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}s.displayName="MDXCreateElement"},77726:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>v,contentTitle:()=>c,default:()=>y,frontMatter:()=>N,metadata:()=>h,toc:()=>f});var n=a(3905),l=Object.defineProperty,r=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,m=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,p=(e,t,a)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))m.call(t,a)&&p(e,a,t[a]);if(o)for(var a of o(t))d.call(t,a)&&p(e,a,t[a]);return e},k=(e,t)=>r(e,i(t)),s=(e,t)=>{var a={};for(var n in e)m.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&o)for(var n of o(e))t.indexOf(n)<0&&d.call(e,n)&&(a[n]=e[n]);return a};const N={title:"MultiSetBase.Builder<T,Tp>",slug:"/rimbu/multiset/custom/MultiSetBase/Builder/interface"},c="interface MultiSetBase.Builder<T,Tp>",h={unversionedId:"rimbu_multiset/custom/MultiSetBase/Builder.interface",id:"rimbu_multiset/custom/MultiSetBase/Builder.interface",title:"MultiSetBase.Builder<T,Tp>",description:"undocumented",source:"@site/api/rimbu_multiset/custom/MultiSetBase/Builder.interface.mdx",sourceDirName:"rimbu_multiset/custom/MultiSetBase",slug:"/rimbu/multiset/custom/MultiSetBase/Builder/interface",permalink:"/api/rimbu/multiset/custom/MultiSetBase/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiSetBase.Builder<T,Tp>",slug:"/rimbu/multiset/custom/MultiSetBase/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"MultiSetBase (namespace)",permalink:"/api/rimbu/multiset/custom/MultiSetBase/namespace"},next:{title:"MultiSetBase.Context<UT,Tp>",permalink:"/api/rimbu/multiset/custom/MultiSetBase/Context/interface"}},v={},f=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>isEmpty</code>",id:"isempty",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>size</code>",id:"size",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>sizeDistinct</code>",id:"sizedistinct",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>add</code>",id:"add",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>addAll</code>",id:"addall",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"<code>addEntries</code>",id:"addentries",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"<code>build</code>",id:"build",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>count</code>",id:"count",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"<code>forEach</code>",id:"foreach",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"<code>has</code>",id:"has",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"<code>modifyCount</code>",id:"modifycount",level:3},{value:"Definition",id:"definition-10",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"<code>remove</code>",id:"remove",level:3},{value:"Definition",id:"definition-11",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-7",level:4},{value:"<code>removeAllEvery</code>",id:"removeallevery",level:3},{value:"Definition",id:"definition-12",level:4},{value:"Type parameters",id:"type-parameters-4",level:4},{value:"Parameters",id:"parameters-8",level:4},{value:"<code>removeAllSingle</code>",id:"removeallsingle",level:3},{value:"Definition",id:"definition-13",level:4},{value:"Type parameters",id:"type-parameters-5",level:4},{value:"Parameters",id:"parameters-9",level:4},{value:"<code>setCount</code>",id:"setcount",level:3},{value:"Definition",id:"definition-14",level:4},{value:"Parameters",id:"parameters-10",level:4}],b={toc:f},g="wrapper";function y(e){var t=e,{components:a}=t,l=s(t,["components"]);return(0,n.kt)(g,k(u(u({},b),l),{components:a,mdxType:"MDXLayout"}),(0,n.kt)("h1",u({},{id:"interface-multisetbasebuilderttp"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface MultiSetBase.Builder<T,Tp>")),(0,n.kt)("p",null,"undocumented"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/core/SortedMultiSet/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"SortedMultiSet.Builder<T>")),", ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/core/MultiSet/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSet.Builder<T>")),", ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/multiset/custom/MultiSetBuilder/class"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetBuilder<T,Tp,TpG>")),", ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/core/HashMultiSet/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashMultiSet.Builder<T>"))),(0,n.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Constraints"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",u({parentName:"tr"},{align:null})),(0,n.kt)("td",u({parentName:"tr"},{align:null})),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"Tp"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetBase.Types"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/multiset/custom/MultiSetBase/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"MultiSetBase.Types"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")))),(0,n.kt)("h2",u({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"isempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"isEmpty")),(0,n.kt)("p",null,"Returns true if there are no values in the builder.")),(0,n.kt)("h4",u({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly isEmpty: boolean;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toBuilder().isEmpty\n// => false\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"size"}),(0,n.kt)("inlineCode",{parentName:"h3"},"size")),(0,n.kt)("p",null,"Returns the amount of values in the builder.")),(0,n.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly size: number;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toBuilder().size\n// => 3\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"sizedistinct"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sizeDistinct")),(0,n.kt)("p",null,"Returns the amount of distinct values in the builder.")),(0,n.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sizeDistinct: number;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2).toBuilder().sizeDistinct\n// => 2\n")))),(0,n.kt)("h2",u({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"add"}),(0,n.kt)("inlineCode",{parentName:"h3"},"add")),(0,n.kt)("p",null,"Adds given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," to the builder.")),(0,n.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"add(value: T, amount?: number): boolean;"))),(0,n.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"amount")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.add(2)     // => true\ns.add(3, 5)  // => true\ns.add(3, 0)  // => false\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"addall"}),(0,n.kt)("inlineCode",{parentName:"h3"},"addAll")),(0,n.kt)("p",null,"Adds the values in given ",(0,n.kt)("inlineCode",{parentName:"p"},"values")," ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource")," to the builder.")),(0,n.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"addAll(values: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>): boolean;"))),(0,n.kt)("h4",u({},{id:"parameters-1"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"values")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<T>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.addAll(1, 3)   // => false\ns.addAll(2, 10)  // => true\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"addentries"}),(0,n.kt)("inlineCode",{parentName:"h3"},"addEntries")),(0,n.kt)("p",null,"Adds for each tuple of a value and amount in the given ",(0,n.kt)("inlineCode",{parentName:"p"},"entries"),", the amount of values to the builder.")),(0,n.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"addEntries(entries: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<readonly [T, number]>): boolean;"))),(0,n.kt)("h4",u({},{id:"parameters-2"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"entries")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<readonly [T, number]>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.addEntries([[1, 2], [2, 3]])   // => true\ns.addEntries([[1, 0], [3, 0]])   // => false\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"build"}),(0,n.kt)("inlineCode",{parentName:"h3"},"build")),(0,n.kt)("p",null,"Returns an immutable instance containing the values in this builder.")),(0,n.kt)("h4",u({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"build(): "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/WithElem/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"WithElem")),(0,n.kt)("inlineCode",{parentName:"p"},"<Tp, T>['normal'];"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\nconst s2: HashMultiSet<number> = m.build()\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"count"}),(0,n.kt)("inlineCode",{parentName:"h3"},"count")),(0,n.kt)("p",null,"Returns the amount of given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," in the builder.")),(0,n.kt)("h4",u({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"count<U = T>(value: RelatedTo<T, U>): number;"))),(0,n.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-3"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value to look for")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.count(10)    // => 0\ns.count(2)     // => 2\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"foreach"}),(0,n.kt)("inlineCode",{parentName:"h3"},"forEach")),(0,n.kt)("p",null,"Performs given function ",(0,n.kt)("inlineCode",{parentName:"p"},"f")," for each value of the collection, using given ",(0,n.kt)("inlineCode",{parentName:"p"},"state")," as initial traversal state.")),(0,n.kt)("h4",u({},{id:"definition-8"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"forEach(f: (value: T, index: number, halt: () => void) => void, state?: TraverseState): void;"))),(0,n.kt)("h4",u({},{id:"parameters-4"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"f")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"(value: T, index: number, halt: () => void) => void")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the function to perform for each value, receiving:",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"value"),": the next value",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"index"),": the index of the value",(0,n.kt)("br",null)," - ",(0,n.kt)("inlineCode",{parentName:"td"},"halt"),": a function that, if called, ensures that no new values are passed")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"state")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"TraverseState")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"param",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"state -")),(0,n.kt)("admonition",u({},{title:"throws",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"RibuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while looping over it")),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"HashMultiSet.of(1, 2, 2, 3).toBuilder().forEach((entry, i, halt) => {\nconsole.log(entry)\nif (i >= 1) halt()\n})\n// => logs [1, 1]  [2, 2]\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"has"}),(0,n.kt)("inlineCode",{parentName:"h3"},"has")),(0,n.kt)("p",null,"Returns true if the given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," is present in the builder.")),(0,n.kt)("h4",u({},{id:"definition-9"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"has<U = T>(value: RelatedTo<T, U>): boolean;"))),(0,n.kt)("h4",u({},{id:"type-parameters-2"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-5"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value to look for")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.has(2)   // => true\ns.has(10)  // => false\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"modifycount"}),(0,n.kt)("inlineCode",{parentName:"h3"},"modifyCount")),(0,n.kt)("p",null,"Changes the amount of given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," in the builder according to the result of given ",(0,n.kt)("inlineCode",{parentName:"p"},"update")," function.")),(0,n.kt)("h4",u({},{id:"definition-10"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"modifyCount(value: T, update: (currentCount: number) => number): boolean;"))),(0,n.kt)("h4",u({},{id:"parameters-6"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value of which to update the amount")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"update")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"(currentCount: number) => number")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"if the given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," does not exists, the ",(0,n.kt)("inlineCode",{parentName:"p"},"update")," function is called with 0.  @note if the result of ",(0,n.kt)("inlineCode",{parentName:"p"},"update")," is <= 0, the value will be removed (or not added)")),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.modifyCount(3, v => v)      // => false\ns.modifyCount(3, v => v + 1)  // => true\ns.modifyCount(2, v => v + 1)  // => true\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"remove"}),(0,n.kt)("inlineCode",{parentName:"h3"},"remove")),(0,n.kt)("p",null,"Removes given ",(0,n.kt)("inlineCode",{parentName:"p"},"amount")," or all of given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," from the builder.")),(0,n.kt)("h4",u({},{id:"definition-11"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"remove<U = T>(value: RelatedTo<T, U>, amount?: number "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," 'ALL'): number;"))),(0,n.kt)("h4",u({},{id:"type-parameters-3"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-7"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"RelatedTo<T, U>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value to remove")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"amount")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"number "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"td"}," 'ALL'")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.remove(10)    // => 0\ns.remove(1, 2)  // => 1\ns.remove(2, 2)  // => 2\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"removeallevery"}),(0,n.kt)("inlineCode",{parentName:"h3"},"removeAllEvery")),(0,n.kt)("p",null,"Removes every instance of the given ",(0,n.kt)("inlineCode",{parentName:"p"},"values")," from the builder.")),(0,n.kt)("h4",u({},{id:"definition-12"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"removeAllEvery<U = T>(values: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<RelatedTo<T, U>>): boolean;"))),(0,n.kt)("h4",u({},{id:"type-parameters-4"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-8"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"values")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<RelatedTo<T, U>>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.removeAllEvery([10, 11])   // => false\ns.removeAllEvery([1, 11])    // => true\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"removeallsingle"}),(0,n.kt)("inlineCode",{parentName:"h3"},"removeAllSingle")),(0,n.kt)("p",null,"Removes every single value in given ",(0,n.kt)("inlineCode",{parentName:"p"},"values")," from the builder.")),(0,n.kt)("h4",u({},{id:"definition-13"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"removeAllSingle<U = T>(values: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"p"},"<RelatedTo<T, U>>): boolean;"))),(0,n.kt)("h4",u({},{id:"type-parameters-5"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"U"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters-9"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"values")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/stream/StreamSource/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"StreamSource")),(0,n.kt)("inlineCode",{parentName:"td"},"<RelatedTo<T, U>>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.removeAllSingle([10, 11])   // => false\ns.removeAllSingle([1, 11])    // => true\n")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"setcount"}),(0,n.kt)("inlineCode",{parentName:"h3"},"setCount")),(0,n.kt)("p",null,"Sets the amount of given ",(0,n.kt)("inlineCode",{parentName:"p"},"value")," in the collection to ",(0,n.kt)("inlineCode",{parentName:"p"},"amount"),".")),(0,n.kt)("h4",u({},{id:"definition-14"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"setCount(value: T, amount: number): boolean;"))),(0,n.kt)("h4",u({},{id:"parameters-10"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"value")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"T")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the value for which to set the amount")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"amount")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"number")),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("admonition",u({},{title:"note",type:"note"}),(0,n.kt)("p",{parentName:"admonition"},"if amount <= 0, the value will be removed")),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const s = HashMultiSet.of(1, 2, 2).toBuilder()\ns.setCount(1, 1)    // => false\ns.setCount(1, 3)    // => true\n")))))}y.isMDXComponent=!0}}]);