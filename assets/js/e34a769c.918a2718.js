"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[14082],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var i=n(67294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,l=function(e,t){if(null==e)return{};var n,i,l={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var d=i.createContext({}),u=function(e){var t=i.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=u(e.components);return i.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},s=i.forwardRef((function(e,t){var n=e.components,l=e.mdxType,o=e.originalType,d=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),m=u(n),s=l,f=m["".concat(d,".").concat(s)]||m[s]||c[s]||o;return n?i.createElement(f,r(r({ref:t},p),{},{components:n})):i.createElement(f,r({ref:t},p))}));function f(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var o=n.length,r=new Array(o);r[0]=s;var a={};for(var d in t)hasOwnProperty.call(t,d)&&(a[d]=t[d]);a.originalType=e,a[m]="string"==typeof e?e:l,r[1]=a;for(var u=2;u<o;u++)r[u]=n[u];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}s.displayName="MDXCreateElement"},52735:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>y,contentTitle:()=>k,default:()=>N,frontMatter:()=>f,metadata:()=>h,toc:()=>b});var i=n(3905),l=Object.defineProperty,o=Object.defineProperties,r=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&p(e,n,t[n]);if(a)for(var n of a(t))u.call(t,n)&&p(e,n,t[n]);return e},c=(e,t)=>o(e,r(t)),s=(e,t)=>{var n={};for(var i in e)d.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&a)for(var i of a(e))t.indexOf(i)<0&&u.call(e,i)&&(n[i]=e[i]);return n};const f={title:"HashTableSortedColumn.Types",slug:"/rimbu/table/HashTableSortedColumn/Types/interface"},k="interface HashTableSortedColumn.Types",h={unversionedId:"rimbu_table/HashTableSortedColumn/Types.interface",id:"rimbu_table/HashTableSortedColumn/Types.interface",title:"HashTableSortedColumn.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_table/HashTableSortedColumn/Types.interface.mdx",sourceDirName:"rimbu_table/HashTableSortedColumn",slug:"/rimbu/table/HashTableSortedColumn/Types/interface",permalink:"/api/rimbu/table/HashTableSortedColumn/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashTableSortedColumn.Types",slug:"/rimbu/table/HashTableSortedColumn/Types/interface"},sidebar:"defaultSidebar",previous:{title:"HashTableSortedColumn.NonEmpty<R,C,V>",permalink:"/api/rimbu/table/HashTableSortedColumn/NonEmpty/interface"},next:{title:"HashTableSortedColumn<R,C,V>",permalink:"/api/rimbu/table/HashTableSortedColumn/interface"}},y={},b=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>columnContext</code>",id:"columncontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>row</code>",id:"row",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>rowContext</code>",id:"rowcontext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>rowMap</code>",id:"rowmap",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>rowMapNonEmpty</code>",id:"rowmapnonempty",level:3},{value:"Definition",id:"definition-8",level:4},{value:"<code>rowNonEmpty</code>",id:"rownonempty",level:3},{value:"Definition",id:"definition-9",level:4}],C={toc:b},v="wrapper";function N(e){var t=e,{components:n}=t,l=s(t,["components"]);return(0,i.kt)(v,c(m(m({},C),l),{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",m({},{id:"interface-hashtablesortedcolumntypes"}),(0,i.kt)("inlineCode",{parentName:"h1"},"interface HashTableSortedColumn.Types")),(0,i.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,i.kt)("h2",m({},{id:"properties"}),"Properties"),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"builder"}),(0,i.kt)("inlineCode",{parentName:"h3"},"builder")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/HashTableSortedColumn/Builder/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"HashTableSortedColumn.Builder")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_R'], this['_C'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"columncontext"}),(0,i.kt)("inlineCode",{parentName:"h3"},"columnContext")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly columnContext: SortedMap.Context<this['_C']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"context"}),(0,i.kt)("inlineCode",{parentName:"h3"},"context")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/HashTableSortedColumn/Context/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"HashTableSortedColumn.Context")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_R'], this['_C']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"nonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/HashTableSortedColumn/NonEmpty/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"HashTableSortedColumn.NonEmpty")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_R'], this['_C'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"normal"}),(0,i.kt)("inlineCode",{parentName:"h3"},"normal")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,i.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/HashTableSortedColumn/interface"}),(0,i.kt)("inlineCode",{parentName:"a"},"HashTableSortedColumn")),(0,i.kt)("inlineCode",{parentName:"p"},"<this['_R'], this['_C'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"row"}),(0,i.kt)("inlineCode",{parentName:"h3"},"row")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly row: SortedMap<this['_C'], this['_V']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rowcontext"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowContext")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowContext: HashMap.Context<this['_R']>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rowmap"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowMap")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowMap: HashMap<this['_R'], SortedMap.NonEmpty<this['_C'], this['_V']>>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rowmapnonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowMapNonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-8"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowMapNonEmpty: HashMap.NonEmpty<this['_R'], SortedMap.NonEmpty<this['_C'], this['_V']>>;")))),(0,i.kt)("details",null,(0,i.kt)("summary",null,(0,i.kt)("h3",m({},{id:"rownonempty"}),(0,i.kt)("inlineCode",{parentName:"h3"},"rowNonEmpty")),(0,i.kt)("p",null,"undocumented")),(0,i.kt)("h4",m({},{id:"definition-9"}),"Definition"),(0,i.kt)("code",null,(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"readonly rowNonEmpty: SortedMap.NonEmpty<this['_C'], this['_V']>;")))))}N.isMDXComponent=!0}}]);