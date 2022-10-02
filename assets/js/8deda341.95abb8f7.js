"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[23871],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>c});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=i.createContext({}),p=function(e){var t=i.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=p(e.components);return i.createElement(d.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},k=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,d=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),k=p(n),c=r,f=k["".concat(d,".").concat(c)]||k[c]||m[c]||o;return n?i.createElement(f,l(l({ref:t},u),{},{components:n})):i.createElement(f,l({ref:t},u))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=k;var a={};for(var d in t)hasOwnProperty.call(t,d)&&(a[d]=t[d]);a.originalType=e,a.mdxType="string"==typeof e?e:r,l[1]=a;for(var p=2;p<o;p++)l[p]=n[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}k.displayName="MDXCreateElement"},96520:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>c,default:()=>y,frontMatter:()=>k,metadata:()=>f,toc:()=>b});var i=n(3905),r=Object.defineProperty,o=Object.defineProperties,l=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,u=(e,t,n)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&u(e,n,t[n]);if(a)for(var n of a(t))p.call(t,n)&&u(e,n,t[n]);return e};const k={title:"SortedTableSortedColumn.Types",slug:"/rimbu/table/SortedTableSortedColumn/Types/interface"},c="interface SortedTableSortedColumn.Types",f={unversionedId:"rimbu_table/SortedTableSortedColumn/Types.interface",id:"rimbu_table/SortedTableSortedColumn/Types.interface",title:"SortedTableSortedColumn.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_table/SortedTableSortedColumn/Types.interface.mdx",sourceDirName:"rimbu_table/SortedTableSortedColumn",slug:"/rimbu/table/SortedTableSortedColumn/Types/interface",permalink:"/api/rimbu/table/SortedTableSortedColumn/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedTableSortedColumn.Types",slug:"/rimbu/table/SortedTableSortedColumn/Types/interface"},sidebar:"defaultSidebar",previous:{title:"SortedTableSortedColumn.NonEmpty<R,C,V>",permalink:"/api/rimbu/table/SortedTableSortedColumn/NonEmpty/interface"},next:{title:"SortedTableSortedColumn<R,C,V>",permalink:"/api/rimbu/table/SortedTableSortedColumn/interface"}},s={},b=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>columnContext</code>",id:"columncontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>row</code>",id:"row",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>rowContext</code>",id:"rowcontext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>rowMap</code>",id:"rowmap",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>rowMapNonEmpty</code>",id:"rowmapnonempty",level:3},{value:"Definition",id:"definition-8",level:4},{value:"<code>rowNonEmpty</code>",id:"rownonempty",level:3},{value:"Definition",id:"definition-9",level:4}],C={toc:b};function y(e){var t,n=e,{components:r}=n,u=((e,t)=>{var n={};for(var i in e)d.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&a)for(var i of a(e))t.indexOf(i)<0&&p.call(e,i)&&(n[i]=e[i]);return n})(n,["components"]);return(0,i.kt)("wrapper",(t=m(m({},C),u),o(t,l({components:r,mdxType:"MDXLayout"}))),(0,i.kt)("h1",m({},{id:"interface-sortedtablesortedcolumntypes"}),(0,i.kt)("inlineCode",{parentName:"h1"},"interface SortedTableSortedColumn.Types")),(0,i.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,i.kt)("h2",m({},{id:"properties"}),"Properties"),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"builder"}),(0,i.kt)("inlineCode",{parentName:"h3"},"builder")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/sorted-row/SortedTableSortedColumn/Builder/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedTableSortedColumn.Builder")),(0,i.kt)("inlineCode",{parentName:"p"},"<"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_C'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_V']"),(0,i.kt)("br",null),"\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},">;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"columncontext"}),(0,i.kt)("inlineCode",{parentName:"h3"},"columnContext")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly columnContext: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/Context/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap.Context")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_C']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"context"}),(0,i.kt)("inlineCode",{parentName:"h3"},"context")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/sorted-row/SortedTableSortedColumn/Context/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedTableSortedColumn.Context")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_R'], this['_C']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"nonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/sorted-row/SortedTableSortedColumn/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedTableSortedColumn.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_C'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_V']"),(0,i.kt)("br",null),"\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},">;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"normal"}),(0,i.kt)("inlineCode",{parentName:"h3"},"normal")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/sorted-row/SortedTableSortedColumn/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedTableSortedColumn")),(0,i.kt)("inlineCode",{parentName:"p"},"<"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_C'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_V']"),(0,i.kt)("br",null),"\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},">;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"row"}),(0,i.kt)("inlineCode",{parentName:"h3"},"row")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly row: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rowcontext"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowContext")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowContext: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/Context/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap.Context")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_R']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rowmap"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowMap")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowMap: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap")),(0,i.kt)("inlineCode",{parentName:"p"},"<"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>"),(0,i.kt)("br",null),"\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},">;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rowmapnonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowMapNonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-8"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowMapNonEmpty: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,i.kt)("br",null),"\xa0","\xa0","\xa0",(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>"),(0,i.kt)("br",null),"\xa0","\xa0",(0,i.kt)("inlineCode",{parentName:"p"},">;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rownonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowNonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-9"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowNonEmpty: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/sorted/SortedMap/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"SortedMap.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>;")))))}y.isMDXComponent=!0}}]);