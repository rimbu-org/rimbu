"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[85594],{3905:function(e,t,r){r.d(t,{Zo:function(){return p},kt:function(){return f}});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var a=n.createContext({}),u=function(e){var t=n.useContext(a),r=t;return e&&(r="function"==typeof e?e(t):d(d({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(a.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,a=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=u(r),f=i,s=m["".concat(a,".").concat(f)]||m[f]||c[f]||o;return r?n.createElement(s,d(d({ref:t},p),{},{components:r})):n.createElement(s,d({ref:t},p))}));function f(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,d=new Array(o);d[0]=m;var l={};for(var a in t)hasOwnProperty.call(t,a)&&(l[a]=t[a]);l.originalType=e,l.mdxType="string"==typeof e?e:i,d[1]=l;for(var u=2;u<o;u++)d[u]=r[u];return n.createElement.apply(null,d)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},23693:function(e,t,r){r.r(t),r.d(t,{assets:function(){return k},contentTitle:function(){return f},default:function(){return b},frontMatter:function(){return m},metadata:function(){return s},toc:function(){return y}});var n=r(3905),i=Object.defineProperty,o=Object.defineProperties,d=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,a=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))a.call(t,r)&&p(e,r,t[r]);if(l)for(var r of l(t))u.call(t,r)&&p(e,r,t[r]);return e};const m={title:"OrderedSortedSet.Types",slug:"/rimbu/ordered/OrderedSortedSet/Types/interface"},f="interface OrderedSortedSet.Types",s={unversionedId:"rimbu_ordered/OrderedSortedSet/Types.interface",id:"rimbu_ordered/OrderedSortedSet/Types.interface",title:"OrderedSortedSet.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_ordered/OrderedSortedSet/Types.interface.mdx",sourceDirName:"rimbu_ordered/OrderedSortedSet",slug:"/rimbu/ordered/OrderedSortedSet/Types/interface",permalink:"/api/rimbu/ordered/OrderedSortedSet/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSortedSet.Types",slug:"/rimbu/ordered/OrderedSortedSet/Types/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSortedSet.NonEmpty<T>",permalink:"/api/rimbu/ordered/OrderedSortedSet/NonEmpty/interface"},next:{title:"OrderedSortedSet<T>",permalink:"/api/rimbu/ordered/OrderedSortedSet/interface"}},k={},y=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>sourceContext</code>",id:"sourcecontext",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>sourceSet</code>",id:"sourceset",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>sourceSetNonEmpty</code>",id:"sourcesetnonempty",level:3},{value:"Definition",id:"definition-6",level:4}],S={toc:y};function b(e){var t,r=e,{components:i}=r,p=((e,t)=>{var r={};for(var n in e)a.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&l)for(var n of l(e))t.indexOf(n)<0&&u.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=c(c({},S),p),o(t,d({components:i,mdxType:"MDXLayout"}))),(0,n.kt)("h1",c({},{id:"interface-orderedsortedsettypes"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface OrderedSortedSet.Types")),(0,n.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,n.kt)("h2",c({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSortedSet/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSortedSet.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"context"}),(0,n.kt)("inlineCode",{parentName:"h3"},"context")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSortedSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSortedSet.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSortedSet/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSortedSet.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"normal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"normal")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSortedSet/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedSortedSet")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"sourcecontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sourceContext")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sourceContext: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/sorted/SortedSet/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"SortedSet.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"sourceset"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sourceSet")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sourceSet: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/sorted/SortedSet/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"SortedSet")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"sourcesetnonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sourceSetNonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sourceSetNonEmpty: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/sorted/SortedSet/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"SortedSet.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))))}b.isMDXComponent=!0}}]);