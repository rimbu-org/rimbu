"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[37073],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return s}});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,d=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),m=p(n),s=i,f=m["".concat(d,".").concat(s)]||m[s]||c[s]||o;return n?r.createElement(f,l(l({ref:t},u),{},{components:n})):r.createElement(f,l({ref:t},u))}));function s(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,l=new Array(o);l[0]=m;var a={};for(var d in t)hasOwnProperty.call(t,d)&&(a[d]=t[d]);a.originalType=e,a.mdxType="string"==typeof e?e:i,l[1]=a;for(var p=2;p<o;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},72637:function(e,t,n){n.r(t),n.d(t,{assets:function(){return k},contentTitle:function(){return s},default:function(){return v},frontMatter:function(){return m},metadata:function(){return f},toc:function(){return y}});var r=n(3905),i=Object.defineProperty,o=Object.defineProperties,l=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,u=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,c=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&u(e,n,t[n]);if(a)for(var n of a(t))p.call(t,n)&&u(e,n,t[n]);return e};const m={title:"OrderedSet.Types",slug:"/rimbu/ordered/OrderedSet/Types/interface"},s="interface OrderedSet.Types",f={unversionedId:"rimbu_ordered/OrderedSet/Types.interface",id:"rimbu_ordered/OrderedSet/Types.interface",title:"OrderedSet.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_ordered/OrderedSet/Types.interface.mdx",sourceDirName:"rimbu_ordered/OrderedSet",slug:"/rimbu/ordered/OrderedSet/Types/interface",permalink:"/api/rimbu/ordered/OrderedSet/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSet.Types",slug:"/rimbu/ordered/OrderedSet/Types/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSet.NonEmpty<T>",permalink:"/api/rimbu/ordered/OrderedSet/NonEmpty/interface"},next:{title:"OrderedSet<T>",permalink:"/api/rimbu/ordered/OrderedSet/interface"}},k={},y=[{value:"Properties",id:"properties",level:2},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-2",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>sourceContext</code>",id:"sourcecontext",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>sourceSet</code>",id:"sourceset",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>sourceSetNonEmpty</code>",id:"sourcesetnonempty",level:3},{value:"Definition",id:"definition-6",level:4}],b={toc:y};function v(e){var t,n=e,{components:i}=n,u=((e,t)=>{var n={};for(var r in e)d.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&a)for(var r of a(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=c(c({},b),u),o(t,l({components:i,mdxType:"MDXLayout"}))),(0,r.kt)("h1",c({},{id:"interface-orderedsettypes"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface OrderedSet.Types")),(0,r.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,r.kt)("h2",c({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"builder"}),(0,r.kt)("inlineCode",{parentName:"h3"},"builder")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSet/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSet.Builder")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"context"}),(0,r.kt)("inlineCode",{parentName:"h3"},"context")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSet/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSet.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"nonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSet/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSet.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"normal"}),(0,r.kt)("inlineCode",{parentName:"h3"},"normal")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSet/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSet")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"sourcecontext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceContext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceContext: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/set/RSet/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSet.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"sourceset"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceSet")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceSet: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/set/RSet/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSet")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"sourcesetnonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceSetNonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",c({},{id:"definition-6"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceSetNonEmpty: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/set/RSet/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSet.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))))}v.isMDXComponent=!0}}]);