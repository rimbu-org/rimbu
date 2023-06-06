"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[86311],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),m=p(n),s=a,k=m["".concat(d,".").concat(s)]||m[s]||c[s]||i;return n?r.createElement(k,o(o({ref:t},u),{},{components:n})):r.createElement(k,o({ref:t},u))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=s;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[m]="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},21619:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>y,contentTitle:()=>f,default:()=>v,frontMatter:()=>k,metadata:()=>b,toc:()=>h});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,u=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&u(e,n,t[n]);if(l)for(var n of l(t))p.call(t,n)&&u(e,n,t[n]);return e},c=(e,t)=>i(e,o(t)),s=(e,t)=>{var n={};for(var r in e)d.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n};const k={title:"SortedMap.Builder<K,V>",slug:"/rimbu/core/SortedMap/Builder/interface"},f="interface SortedMap.Builder<K,V>",b={unversionedId:"rimbu_core/SortedMap/Builder.interface",id:"rimbu_core/SortedMap/Builder.interface",title:"SortedMap.Builder<K,V>",description:"A mutable SortedMap builder used to efficiently create new immutable instances. See the Map documentation and the SortedMap.Builder API documentation",source:"@site/api/rimbu_core/SortedMap/Builder.interface.mdx",sourceDirName:"rimbu_core/SortedMap",slug:"/rimbu/core/SortedMap/Builder/interface",permalink:"/api/rimbu/core/SortedMap/Builder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedMap.Builder<K,V>",slug:"/rimbu/core/SortedMap/Builder/interface"},sidebar:"defaultSidebar",previous:{title:"SortedMap (namespace)",permalink:"/api/rimbu/core/SortedMap/namespace"},next:{title:"SortedMap.Context<UK>",permalink:"/api/rimbu/core/SortedMap/Context/interface"}},y={},h=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>getAtIndex</code>",id:"getatindex",level:3},{value:"Definitions",id:"definitions",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>max</code>",id:"max",level:3},{value:"Definitions",id:"definitions-1",level:4},{value:"<code>min</code>",id:"min",level:3},{value:"Definitions",id:"definitions-2",level:4}],g={toc:h},N="wrapper";function v(e){var t=e,{components:n}=t,a=s(t,["components"]);return(0,r.kt)(N,c(m(m({},g),a),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",m({},{id:"interface-sortedmapbuilderkv"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface SortedMap.Builder<K,V>")),(0,r.kt)("p",null,"A mutable ",(0,r.kt)("inlineCode",{parentName:"p"},"SortedMap")," builder used to efficiently create new immutable instances. See the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/map"}),"Map documentation")," and the ",(0,r.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/sorted/map/SortedMap/Builder/interface"}),"SortedMap.Builder API documentation")),(0,r.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"K"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"the key type")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"V"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))),(0,r.kt)("h2",m({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"getatindex"}),(0,r.kt)("inlineCode",{parentName:"h3"},"getAtIndex")),(0,r.kt)("p",null,"Returns the entry with its key at the given index of the key sort order of the SortedMap builder, or a fallback value (default: undefined) if the index is out of bounds.")),(0,r.kt)("h4",m({},{id:"definitions"}),"Definitions"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"getAtIndex(index: number): readonly [K, V] "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," undefined;"))),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"getAtIndex<O>(index: number, otherwise: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): readonly [K, V] "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O;"))),(0,r.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"index")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"the index in the key sort order")))),(0,r.kt)("admonition",m({},{title:"note",type:"note"}),(0,r.kt)("p",{parentName:"admonition"},"negative index values will retrieve the values from the end of the sort order, e.g. -1 is the last value")),(0,r.kt)("admonition",m({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();\nconsole.log(b.getAtIndex(1))\n// => ['b', 2]\nconsole.log(b.getAtIndex(-1))\n// => ['d', 4]\nconsole.log(b.getAtIndex(10))\n// => undefined\nconsole.log(b.getAtIndex(10, 'q'))\n// => 'q'\n")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"max"}),(0,r.kt)("inlineCode",{parentName:"h3"},"max")),(0,r.kt)("p",null,"Returns the entry with the maximum key of the SortedMap Builder, or a fallback value (default: undefined) if the builder is empty.")),(0,r.kt)("h4",m({},{id:"definitions-1"}),"Definitions"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"max(): readonly [K, V] "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," undefined;"))),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"max<O>(otherwise: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): readonly [K, V] "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O;"))),(0,r.kt)("admonition",m({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();\nconsole.log(b.max())\n// => ['a', 1]\nconsole.log(b.max('q'))\n// => ['a', 1]\nconsole.log(SortedMap.builder().max())\n// => undefined\nconsole.log(SortedMap.builder().max('q'))\n// => 'q'\n")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"min"}),(0,r.kt)("inlineCode",{parentName:"h3"},"min")),(0,r.kt)("p",null,"Returns the entry with the minimum key of the SortedMap Builder, or a fallback value (default: undefined) if the builder is empty.")),(0,r.kt)("h4",m({},{id:"definitions-2"}),"Definitions"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"min(): readonly [K, V] "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," undefined;"))),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"min<O>(otherwise: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,r.kt)("inlineCode",{parentName:"p"},"<O>): readonly [K, V] "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O;"))),(0,r.kt)("admonition",m({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"const b = SortedMap.of(['b', 2], ['d', 4], ['a', 1], ['c', 3]).toBuilder();\nconsole.log(b.min())\n// => ['a', 1]\nconsole.log(b.min('q'))\n// => ['a', 1]\nconsole.log(SortedMap.builder().min())\n// => undefined\nconsole.log(SortedMap.builder().min('q'))\n// => 'q'\n")))))}v.isMDXComponent=!0}}]);