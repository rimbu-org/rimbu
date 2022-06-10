"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[58223],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return s}});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=r.createContext({}),d=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=d(e.components);return r.createElement(p.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),f=d(n),s=i,m=f["".concat(p,".").concat(s)]||f[s]||c[s]||o;return n?r.createElement(m,a(a({ref:t},u),{},{components:n})):r.createElement(m,a({ref:t},u))}));function s(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=f;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var d=2;d<o;d++)a[d]=n[d];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},95814:function(e,t,n){n.r(t),n.d(t,{assets:function(){return y},contentTitle:function(){return s},default:function(){return v},frontMatter:function(){return f},metadata:function(){return m},toc:function(){return k}});var r=n(3905),i=Object.defineProperty,o=Object.defineProperties,a=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,u=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,c=(e,t)=>{for(var n in t||(t={}))p.call(t,n)&&u(e,n,t[n]);if(l)for(var n of l(t))d.call(t,n)&&u(e,n,t[n]);return e};const f={title:"SortedMap.Types",slug:"/rimbu/sorted/SortedMap/Types/interface"},s="interface SortedMap.Types",m={unversionedId:"rimbu_sorted/SortedMap/Types.interface",id:"rimbu_sorted/SortedMap/Types.interface",title:"SortedMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_sorted/SortedMap/Types.interface.mdx",sourceDirName:"rimbu_sorted/SortedMap",slug:"/rimbu/sorted/SortedMap/Types/interface",permalink:"/api/rimbu/sorted/SortedMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedMap.Types",slug:"/rimbu/sorted/SortedMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"SortedMap.NonEmpty<K,V>",permalink:"/api/rimbu/sorted/SortedMap/NonEmpty/interface"},next:{title:"SortedMap<K,V>",permalink:"/api/rimbu/sorted/SortedMap/interface"}},y={},k=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4}],b={toc:k};function v(e){var t,n=e,{components:i}=n,u=((e,t)=>{var n={};for(var r in e)p.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&d.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=c(c({},b),u),o(t,a({components:i,mdxType:"MDXLayout"}))),(0,r.kt)("h1",c({},{id:"interface-sortedmaptypes"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface SortedMap.Types")),(0,r.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,r.kt)("h2",c({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"builder"}),(0,r.kt)("inlineCode",{parentName:"h3"},"builder")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/sorted/map/SortedMap/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.Builder")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"context"}),(0,r.kt)("inlineCode",{parentName:"h3"},"context")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/sorted/map/SortedMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"nonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/sorted/map/SortedMap/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"normal"}),(0,r.kt)("inlineCode",{parentName:"h3"},"normal")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/sorted/map/SortedMap/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"SortedMap")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;")))))}v.isMDXComponent=!0}}]);