"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[83541],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>s});var a=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,l=function(e,t){if(null==e)return{};var n,a,l={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var p=a.createContext({}),m=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},o=function(e){var t=m(e.components);return a.createElement(p.Provider,{value:t},e.children)},u="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},N=a.forwardRef((function(e,t){var n=e.components,l=e.mdxType,r=e.originalType,p=e.parentName,o=d(e,["components","mdxType","originalType","parentName"]),u=m(n),N=l,s=u["".concat(p,".").concat(N)]||u[N]||k[N]||r;return n?a.createElement(s,i(i({ref:t},o),{},{components:n})):a.createElement(s,i({ref:t},o))}));function s(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var r=n.length,i=new Array(r);i[0]=N;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[u]="string"==typeof e?e:l,i[1]=d;for(var m=2;m<r;m++)i[m]=n[m];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}N.displayName="MDXCreateElement"},24907:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>v,contentTitle:()=>c,default:()=>y,frontMatter:()=>s,metadata:()=>h,toc:()=>f});var a=n(3905),l=Object.defineProperty,r=Object.defineProperties,i=Object.getOwnPropertyDescriptors,d=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,o=(e,t,n)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))p.call(t,n)&&o(e,n,t[n]);if(d)for(var n of d(t))m.call(t,n)&&o(e,n,t[n]);return e},k=(e,t)=>r(e,i(t)),N=(e,t)=>{var n={};for(var a in e)p.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&d)for(var a of d(e))t.indexOf(a)<0&&m.call(e,a)&&(n[a]=e[a]);return n};const s={title:"BlockBuilder<T,C>",slug:"/rimbu/list/custom/BlockBuilder/interface"},c="interface BlockBuilder<T,C>",h={unversionedId:"rimbu_list/custom/BlockBuilder.interface",id:"rimbu_list/custom/BlockBuilder.interface",title:"BlockBuilder<T,C>",description:"undocumented",source:"@site/api/rimbu_list/custom/BlockBuilder.interface.mdx",sourceDirName:"rimbu_list/custom",slug:"/rimbu/list/custom/BlockBuilder/interface",permalink:"/api/rimbu/list/custom/BlockBuilder/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"BlockBuilder<T,C>",slug:"/rimbu/list/custom/BlockBuilder/interface"},sidebar:"defaultSidebar",previous:{title:"Block<T,TS,C>",permalink:"/api/rimbu/list/custom/Block/interface"},next:{title:"BuilderBase<T,C>",permalink:"/api/rimbu/list/custom/BuilderBase/interface"}},v={},f=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>children</code>",id:"children",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>length</code>",id:"length",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>level</code>",id:"level",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>nrChildren</code>",id:"nrchildren",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>append</code>",id:"append",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>build</code>",id:"build",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>buildMap</code>",id:"buildmap",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>concat</code>",id:"concat",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"<code>copy</code>",id:"copy",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"<code>dropFirst</code>",id:"dropfirst",level:3},{value:"Definition",id:"definition-9",level:4},{value:"<code>dropLast</code>",id:"droplast",level:3},{value:"Definition",id:"definition-10",level:4},{value:"<code>forEach</code>",id:"foreach",level:3},{value:"Definition",id:"definition-11",level:4},{value:"Parameters",id:"parameters-4",level:4},{value:"<code>get</code>",id:"get",level:3},{value:"Definition",id:"definition-12",level:4},{value:"Type parameters",id:"type-parameters-2",level:4},{value:"Parameters",id:"parameters-5",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>insert</code>",id:"insert",level:3},{value:"Definition",id:"definition-13",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"<code>prepend</code>",id:"prepend",level:3},{value:"Definition",id:"definition-14",level:4},{value:"Parameters",id:"parameters-7",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"<code>remove</code>",id:"remove",level:3},{value:"Definition",id:"definition-15",level:4},{value:"Parameters",id:"parameters-8",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"<code>splitRight</code>",id:"splitright",level:3},{value:"Definition",id:"definition-16",level:4},{value:"Parameters",id:"parameters-9",level:4},{value:"<code>updateAt</code>",id:"updateat",level:3},{value:"Definition",id:"definition-17",level:4},{value:"Type parameters",id:"type-parameters-3",level:4},{value:"Parameters",id:"parameters-10",level:4}],b={toc:f},g="wrapper";function y(e){var t=e,{components:n}=t,l=N(t,["components"]);return(0,a.kt)(g,k(u(u({},b),l),{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",u({},{id:"interface-blockbuildertc"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface BlockBuilder<T,C>")),(0,a.kt)("p",null,"undocumented"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"BuilderBase<T,C>"))),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/NonLeafBlockBuilder/class"}),(0,a.kt)("inlineCode",{parentName:"a"},"NonLeafBlockBuilder<T,C>")),", ",(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/LeafBlockBuilder/class"}),(0,a.kt)("inlineCode",{parentName:"a"},"LeafBlockBuilder<T>"))),(0,a.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",u({parentName:"tr"},{align:null})),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"C"),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"unknown")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")))),(0,a.kt)("h2",u({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"children"}),(0,a.kt)("inlineCode",{parentName:"h3"},"children")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"children: C[];")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"length"}),(0,a.kt)("inlineCode",{parentName:"h3"},"length")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly length: number;"))),(0,a.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#length"}),"BuilderBase.length"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"level"}),(0,a.kt)("inlineCode",{parentName:"h3"},"level")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"level: number;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"nrchildren"}),(0,a.kt)("inlineCode",{parentName:"h3"},"nrChildren")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"nrChildren: number;")))),(0,a.kt)("h2",u({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"append"}),(0,a.kt)("inlineCode",{parentName:"h3"},"append")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"append(value: C): void;"))),(0,a.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"C")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#append"}),"BuilderBase.append"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"build"}),(0,a.kt)("inlineCode",{parentName:"h3"},"build")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"build(): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/List/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"List")),(0,a.kt)("inlineCode",{parentName:"p"},"<T> "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/NonLeaf/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"NonLeaf")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,a.kt)("h4",u({},{id:"overrides-2"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#build"}),"BuilderBase.build"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"buildmap"}),(0,a.kt)("inlineCode",{parentName:"h3"},"buildMap")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"buildMap<T2>(f: (value: T) => T2): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/List/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"List")),(0,a.kt)("inlineCode",{parentName:"p"},"<T2> "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/NonLeaf/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"NonLeaf")),(0,a.kt)("inlineCode",{parentName:"p"},"<T2>;"))),(0,a.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"T2"),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-1"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"f")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"(value: T) => T2")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides-3"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#buildMap"}),"BuilderBase.buildMap"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"concat"}),(0,a.kt)("inlineCode",{parentName:"h3"},"concat")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"concat(other: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BlockBuilder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"BlockBuilder")),(0,a.kt)("inlineCode",{parentName:"p"},"<T, C>, prependOther?: boolean): void;"))),(0,a.kt)("h4",u({},{id:"parameters-2"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"other")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/list/custom/BlockBuilder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"BlockBuilder")),(0,a.kt)("inlineCode",{parentName:"td"},"<T, C>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"prependOther")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"copy"}),(0,a.kt)("inlineCode",{parentName:"h3"},"copy")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-8"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"copy(children: C[], length: number): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BlockBuilder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"BlockBuilder")),(0,a.kt)("inlineCode",{parentName:"p"},"<T, C>;"))),(0,a.kt)("h4",u({},{id:"parameters-3"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"children")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"C[]")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"length")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"dropfirst"}),(0,a.kt)("inlineCode",{parentName:"h3"},"dropFirst")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-9"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"dropFirst(): C;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"droplast"}),(0,a.kt)("inlineCode",{parentName:"h3"},"dropLast")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-10"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"dropLast(): C;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"foreach"}),(0,a.kt)("inlineCode",{parentName:"h3"},"forEach")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-11"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"forEach(f: (value: T, index: number, halt: () => void) => void, options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"reversed?: boolean;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"state?: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/TraverseState/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"TraverseState")),(0,a.kt)("inlineCode",{parentName:"p"},";"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): void;"))),(0,a.kt)("h4",u({},{id:"parameters-4"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"f")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"(value: T, index: number, halt: () => void) => void")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"reversed?: boolean;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"state?: "),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/TraverseState/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"TraverseState")),(0,a.kt)("inlineCode",{parentName:"td"},";"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"get"}),(0,a.kt)("inlineCode",{parentName:"h3"},"get")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-12"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get<O>(index: number, otherwise?: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"p"},"<O>): T "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," O;"))),(0,a.kt)("h4",u({},{id:"type-parameters-2"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"O"),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-5"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"td"},"<O>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides-4"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#get"}),"BuilderBase.get"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"insert"}),(0,a.kt)("inlineCode",{parentName:"h3"},"insert")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-13"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"insert(index: number, value: T): void;"))),(0,a.kt)("h4",u({},{id:"parameters-6"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides-5"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#insert"}),"BuilderBase.insert"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"prepend"}),(0,a.kt)("inlineCode",{parentName:"h3"},"prepend")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-14"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"prepend(value: C): void;"))),(0,a.kt)("h4",u({},{id:"parameters-7"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"C")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides-6"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#prepend"}),"BuilderBase.prepend"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"remove"}),(0,a.kt)("inlineCode",{parentName:"h3"},"remove")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-15"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"remove(index: number): T;"))),(0,a.kt)("h4",u({},{id:"parameters-8"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"overrides-7"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BuilderBase/interface#remove"}),"BuilderBase.remove"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"splitright"}),(0,a.kt)("inlineCode",{parentName:"h3"},"splitRight")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-16"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"splitRight(index?: number): "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/list/custom/BlockBuilder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"BlockBuilder")),(0,a.kt)("inlineCode",{parentName:"p"},"<T, C>;"))),(0,a.kt)("h4",u({},{id:"parameters-9"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",u({},{id:"updateat"}),(0,a.kt)("inlineCode",{parentName:"h3"},"updateAt")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",u({},{id:"definition-17"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"updateAt<O>(index: number, update: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/Update/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Update")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>, otherwise?: "),(0,a.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"p"},"<O>): T "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," O;"))),(0,a.kt)("h4",u({},{id:"type-parameters-3"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),"O"),(0,a.kt)("td",u({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",u({},{id:"parameters-10"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"update")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/Update/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Update")),(0,a.kt)("inlineCode",{parentName:"td"},"<T>")),(0,a.kt)("td",u({parentName:"tr"},{align:null}))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/OptLazy/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"OptLazy")),(0,a.kt)("inlineCode",{parentName:"td"},"<O>")),(0,a.kt)("td",u({parentName:"tr"},{align:null})))))))}y.isMDXComponent=!0}}]);