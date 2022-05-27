"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[71102],{3905:function(e,n,t){t.d(n,{Zo:function(){return d},kt:function(){return h}});var a=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function r(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},l=Object.keys(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var p=a.createContext({}),u=function(e){var n=a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):r(r({},n),e)),t},d=function(e){var n=u(e.components);return a.createElement(p.Provider,{value:n},e.children)},m={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},s=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,l=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),s=u(t),h=i,c=s["".concat(p,".").concat(h)]||s[h]||m[h]||l;return t?a.createElement(c,r(r({ref:n},d),{},{components:t})):a.createElement(c,r({ref:n},d))}));function h(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var l=t.length,r=new Array(l);r[0]=s;var o={};for(var p in n)hasOwnProperty.call(n,p)&&(o[p]=n[p]);o.originalType=e,o.mdxType="string"==typeof e?e:i,r[1]=o;for(var u=2;u<l;u++)r[u]=t[u];return a.createElement.apply(null,r)}return a.createElement.apply(null,t)}s.displayName="MDXCreateElement"},95907:function(e,n,t){t.r(n),t.d(n,{assets:function(){return k},contentTitle:function(){return h},default:function(){return C},frontMatter:function(){return s},metadata:function(){return c},toc:function(){return f}});var a=t(3905),i=Object.defineProperty,l=Object.defineProperties,r=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,d=(e,n,t)=>n in e?i(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t,m=(e,n)=>{for(var t in n||(n={}))p.call(n,t)&&d(e,t,n[t]);if(o)for(var t of o(n))u.call(n,t)&&d(e,t,n[t]);return e};const s={title:"HashTableHashColumn.Types",slug:"/rimbu/table/HashTableHashColumn/Types/interface"},h="interface HashTableHashColumn.Types",c={unversionedId:"rimbu_table/HashTableHashColumn/Types.interface",id:"rimbu_table/HashTableHashColumn/Types.interface",title:"HashTableHashColumn.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_table/HashTableHashColumn/Types.interface.mdx",sourceDirName:"rimbu_table/HashTableHashColumn",slug:"/rimbu/table/HashTableHashColumn/Types/interface",permalink:"/api/rimbu/table/HashTableHashColumn/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashTableHashColumn.Types",slug:"/rimbu/table/HashTableHashColumn/Types/interface"},sidebar:"defaultSidebar",previous:{title:"HashTableHashColumn.NonEmpty<R,C,V>",permalink:"/api/rimbu/table/HashTableHashColumn/NonEmpty/interface"},next:{title:"HashTableHashColumn<R,C,V>",permalink:"/api/rimbu/table/HashTableHashColumn/interface"}},k={},f=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>columnContext</code>",id:"columncontext",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>row</code>",id:"row",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>rowContext</code>",id:"rowcontext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>rowMap</code>",id:"rowmap",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>rowMapNonEmpty</code>",id:"rowmapnonempty",level:3},{value:"Definition",id:"definition-8",level:4},{value:"<code>rowNonEmpty</code>",id:"rownonempty",level:3},{value:"Definition",id:"definition-9",level:4}],b={toc:f};function C(e){var n,t=e,{components:i}=t,d=((e,n)=>{var t={};for(var a in e)p.call(e,a)&&n.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&o)for(var a of o(e))n.indexOf(a)<0&&u.call(e,a)&&(t[a]=e[a]);return t})(t,["components"]);return(0,a.kt)("wrapper",(n=m(m({},b),d),l(n,r({components:i,mdxType:"MDXLayout"}))),(0,a.kt)("h1",m({},{id:"interface-hashtablehashcolumntypes"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface HashTableHashColumn.Types")),(0,a.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,a.kt)("h2",m({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"builder"}),(0,a.kt)("inlineCode",{parentName:"h3"},"builder")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/hash-row/HashTableHashColumn/Builder/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashTableHashColumn.Builder")),(0,a.kt)("inlineCode",{parentName:"p"},"<"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_C'],"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_V']"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},">;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"columncontext"}),(0,a.kt)("inlineCode",{parentName:"h3"},"columnContext")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly columnContext: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/Context/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap.Context")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_C']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"context"}),(0,a.kt)("inlineCode",{parentName:"h3"},"context")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/hash-row/HashTableHashColumn/Context/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashTableHashColumn.Context")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_R'], this['_C']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"nonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/hash-row/HashTableHashColumn/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashTableHashColumn.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_C'],"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_V']"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},">;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"normal"}),(0,a.kt)("inlineCode",{parentName:"h3"},"normal")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/table/hash-row/HashTableHashColumn/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashTableHashColumn")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_R'], this['_C'], this['_V']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"row"}),(0,a.kt)("inlineCode",{parentName:"h3"},"row")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly row: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"rowcontext"}),(0,a.kt)("inlineCode",{parentName:"h3"},"rowContext")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly rowContext: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/Context/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap.Context")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_R']>;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"rowmap"}),(0,a.kt)("inlineCode",{parentName:"h3"},"rowMap")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly rowMap: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap")),(0,a.kt)("inlineCode",{parentName:"p"},"<"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},">;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"rowmapnonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"rowMapNonEmpty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-8"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly rowMapNonEmpty: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"this['_R'],"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0",(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>"),(0,a.kt)("br",null),"\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},">;")))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",m({},{id:"rownonempty"}),(0,a.kt)("inlineCode",{parentName:"h3"},"rowNonEmpty")),(0,a.kt)("p",null,"undocumented")),(0,a.kt)("h4",m({},{id:"definition-9"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readonly rowNonEmpty: "),(0,a.kt)("a",m({parentName:"p"},{href:"/api/rimbu/hashed/map/HashMap/NonEmpty/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"HashMap.NonEmpty")),(0,a.kt)("inlineCode",{parentName:"p"},"<this['_C'], this['_V']>;")))))}C.isMDXComponent=!0}}]);