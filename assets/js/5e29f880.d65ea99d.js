"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[37318],{3905:function(e,t,n){n.d(t,{Zo:function(){return s},kt:function(){return m}});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=p(n),m=i,f=c["".concat(d,".").concat(m)]||c[m]||u[m]||a;return n?r.createElement(f,o(o({ref:t},s),{},{components:n})):r.createElement(f,o({ref:t},s))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=c;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},34346:function(e,t,n){n.r(t),n.d(t,{assets:function(){return k},contentTitle:function(){return m},default:function(){return h},frontMatter:function(){return c},metadata:function(){return f},toc:function(){return y}});var r=n(3905),i=Object.defineProperty,a=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,s=(e,t,n)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))d.call(t,n)&&s(e,n,t[n]);if(l)for(var n of l(t))p.call(t,n)&&s(e,n,t[n]);return e};const c={title:"OrderedSetBase.Types",slug:"/rimbu/ordered/set-custom/OrderedSetBase/Types/interface"},m="interface OrderedSetBase.Types",f={unversionedId:"rimbu_ordered/set-custom/OrderedSetBase/Types.interface",id:"rimbu_ordered/set-custom/OrderedSetBase/Types.interface",title:"OrderedSetBase.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_ordered/set-custom/OrderedSetBase/Types.interface.mdx",sourceDirName:"rimbu_ordered/set-custom/OrderedSetBase",slug:"/rimbu/ordered/set-custom/OrderedSetBase/Types/interface",permalink:"/api/rimbu/ordered/set-custom/OrderedSetBase/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSetBase.Types",slug:"/rimbu/ordered/set-custom/OrderedSetBase/Types/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSetBase.NonEmpty<T,Tp>",permalink:"/api/rimbu/ordered/set-custom/OrderedSetBase/NonEmpty/interface"},next:{title:"OrderedSetBase<T,Tp>",permalink:"/api/rimbu/ordered/set-custom/OrderedSetBase/interface"}},k={},y=[{value:"Properties",id:"properties",level:2},{value:"<code>_T</code>",id:"_t",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>sourceBuilder</code>",id:"sourcebuilder",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>sourceContext</code>",id:"sourcecontext",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>sourceSet</code>",id:"sourceset",level:3},{value:"Definition",id:"definition-7",level:4},{value:"<code>sourceSetNonEmpty</code>",id:"sourcesetnonempty",level:3},{value:"Definition",id:"definition-8",level:4}],v={toc:y};function h(e){var t,n=e,{components:i}=n,s=((e,t)=>{var n={};for(var r in e)d.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=u(u({},v),s),a(t,o({components:i,mdxType:"MDXLayout"}))),(0,r.kt)("h1",u({},{id:"interface-orderedsetbasetypes"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface OrderedSetBase.Types")),(0,r.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Extends:")," ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSetBase.Types"))),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSet/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSet.Types")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedSortedSet/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSortedSet.Types")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set/OrderedHashSet/Types/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedHashSet.Types")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set-custom/OrderedSetTypes/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSetTypes"))),(0,r.kt)("h2",u({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"_t"}),(0,r.kt)("inlineCode",{parentName:"h3"},"_T")),(0,r.kt)("p",null,"The element type.")),(0,r.kt)("h4",u({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly _T: T;"))),(0,r.kt)("h4",u({},{id:"overrides"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/map-custom/Elem/interface#_T"}),"Elem._T"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"builder"}),(0,r.kt)("inlineCode",{parentName:"h3"},"builder")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set-custom/OrderedSetBase/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSetBase.Builder")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;"))),(0,r.kt)("h4",u({},{id:"overrides-1"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/Types/interface#builder"}),"Types.builder"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"context"}),(0,r.kt)("inlineCode",{parentName:"h3"},"context")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set-custom/OrderedSetBase/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSetBase.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;"))),(0,r.kt)("h4",u({},{id:"overrides-2"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/Types/interface#context"}),"Types.context"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"nonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set-custom/OrderedSetBase/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSetBase.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;"))),(0,r.kt)("h4",u({},{id:"overrides-3"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/Types/interface#nonEmpty"}),"Types.nonEmpty"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"normal"}),(0,r.kt)("inlineCode",{parentName:"h3"},"normal")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/ordered/set-custom/OrderedSetBase/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"OrderedSetBase")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;"))),(0,r.kt)("h4",u({},{id:"overrides-4"}),"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/Types/interface#normal"}),"Types.normal"))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"sourcebuilder"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceBuilder")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceBuilder: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/Builder/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSetBase.Builder")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"sourcecontext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceContext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-6"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceContext: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSetBase.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"sourceset"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceSet")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-7"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceSet: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSetBase")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"sourcesetnonempty"}),(0,r.kt)("inlineCode",{parentName:"h3"},"sourceSetNonEmpty")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-8"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"readonly sourceSetNonEmpty: "),(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/RSetBase/NonEmpty/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RSetBase.NonEmpty")),(0,r.kt)("inlineCode",{parentName:"p"},"<this['_T']>;")))))}h.isMDXComponent=!0}}]);