"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[30980],{3905:function(e,r,t){t.d(r,{Zo:function(){return u},kt:function(){return m}});var n=t(67294);function i(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function d(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach((function(r){i(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function l(e,r){if(null==e)return{};var t,n,i=function(e,r){if(null==e)return{};var t,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||(i[t]=e[t]);return i}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var o=n.createContext({}),p=function(e){var r=n.useContext(o),t=r;return e&&(t="function"==typeof e?e(r):d(d({},r),e)),t},u=function(e){var r=p(e.components);return n.createElement(o.Provider,{value:r},e.children)},c={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},s=n.forwardRef((function(e,r){var t=e.components,i=e.mdxType,a=e.originalType,o=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),s=p(t),m=i,k=s["".concat(o,".").concat(m)]||s[m]||c[m]||a;return t?n.createElement(k,d(d({ref:r},u),{},{components:t})):n.createElement(k,d({ref:r},u))}));function m(e,r){var t=arguments,i=r&&r.mdxType;if("string"==typeof e||i){var a=t.length,d=new Array(a);d[0]=s;var l={};for(var o in r)hasOwnProperty.call(r,o)&&(l[o]=r[o]);l.originalType=e,l.mdxType="string"==typeof e?e:i,d[1]=l;for(var p=2;p<a;p++)d[p]=t[p];return n.createElement.apply(null,d)}return n.createElement.apply(null,t)}s.displayName="MDXCreateElement"},52842:function(e,r,t){t.r(r),t.d(r,{assets:function(){return f},contentTitle:function(){return m},default:function(){return h},frontMatter:function(){return s},metadata:function(){return k},toc:function(){return v}});var n=t(3905),i=Object.defineProperty,a=Object.defineProperties,d=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?i(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,c=(e,r)=>{for(var t in r||(r={}))o.call(r,t)&&u(e,t,r[t]);if(l)for(var t of l(r))p.call(r,t)&&u(e,t,r[t]);return e};const s={title:"OrderedMap.Types",slug:"/rimbu/ordered/map/OrderedMap/Types/interface"},m="interface OrderedMap.Types",k={unversionedId:"rimbu_ordered/map/OrderedMap/Types.interface",id:"rimbu_ordered/map/OrderedMap/Types.interface",title:"OrderedMap.Types",description:"Utility interface that provides higher-kinded types for this collection.",source:"@site/api/rimbu_ordered/map/OrderedMap/Types.interface.mdx",sourceDirName:"rimbu_ordered/map/OrderedMap",slug:"/rimbu/ordered/map/OrderedMap/Types/interface",permalink:"/api/rimbu/ordered/map/OrderedMap/Types/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedMap.Types",slug:"/rimbu/ordered/map/OrderedMap/Types/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedMap.NonEmpty<K,V>",permalink:"/api/rimbu/ordered/map/OrderedMap/NonEmpty/interface"},next:{title:"OrderedMap<K,V>",permalink:"/api/rimbu/ordered/map/OrderedMap/interface"}},f={},v=[{value:"Properties",id:"properties",level:2},{value:"<code>_K</code>",id:"_k",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>_V</code>",id:"_v",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>builder</code>",id:"builder",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>context</code>",id:"context",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"<code>nonEmpty</code>",id:"nonempty",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>normal</code>",id:"normal",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"<code>sourceBuilder</code>",id:"sourcebuilder",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"<code>sourceContext</code>",id:"sourcecontext",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"<code>sourceMap</code>",id:"sourcemap",level:3},{value:"Definition",id:"definition-8",level:4},{value:"Overrides",id:"overrides-8",level:4},{value:"<code>sourceMapNonEmpty</code>",id:"sourcemapnonempty",level:3},{value:"Definition",id:"definition-9",level:4},{value:"Overrides",id:"overrides-9",level:4}],y={toc:v};function h(e){var r,t=e,{components:i}=t,u=((e,r)=>{var t={};for(var n in e)o.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&l)for(var n of l(e))r.indexOf(n)<0&&p.call(e,n)&&(t[n]=e[n]);return t})(t,["components"]);return(0,n.kt)("wrapper",(r=c(c({},y),u),a(r,d({components:i,mdxType:"MDXLayout"}))),(0,n.kt)("h1",c({},{id:"interface-orderedmaptypes"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface OrderedMap.Types")),(0,n.kt)("p",null,"Utility interface that provides higher-kinded types for this collection."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedMapBase.Types"))),(0,n.kt)("h2",c({},{id:"properties"}),"Properties"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"_k"}),(0,n.kt)("inlineCode",{parentName:"h3"},"_K")),(0,n.kt)("p",null,"The key type.")),(0,n.kt)("h4",c({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly _K: K;"))),(0,n.kt)("h4",c({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/KeyValue/interface#_K"}),"KeyValue._K"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"_v"}),(0,n.kt)("inlineCode",{parentName:"h3"},"_V")),(0,n.kt)("p",null,"The value type.")),(0,n.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly _V: V;"))),(0,n.kt)("h4",c({},{id:"overrides-1"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/set-custom/KeyValue/interface#_V"}),"KeyValue._V"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"builder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"builder")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly builder: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedMap.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,n.kt)("h4",c({},{id:"overrides-2"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#builder"}),"Types.builder"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"context"}),(0,n.kt)("inlineCode",{parentName:"h3"},"context")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly context: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K']>;"))),(0,n.kt)("h4",c({},{id:"overrides-3"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#context"}),"Types.context"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"nonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"nonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-4"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly nonEmpty: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedMap.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,n.kt)("h4",c({},{id:"overrides-4"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#nonEmpty"}),"Types.nonEmpty"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"normal"}),(0,n.kt)("inlineCode",{parentName:"h3"},"normal")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-5"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly normal: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map/OrderedMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,n.kt)("h4",c({},{id:"overrides-5"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#normal"}),"Types.normal"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"sourcebuilder"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sourceBuilder")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-6"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sourceBuilder: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Builder/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap.Builder")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,n.kt)("h4",c({},{id:"overrides-6"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#sourceBuilder"}),"Types.sourceBuilder"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"sourcecontext"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sourceContext")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-7"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sourceContext: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K']>;"))),(0,n.kt)("h4",c({},{id:"overrides-7"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#sourceContext"}),"Types.sourceContext"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"sourcemap"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sourceMap")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-8"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sourceMap: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,n.kt)("h4",c({},{id:"overrides-8"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#sourceMap"}),"Types.sourceMap"))),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",c({},{id:"sourcemapnonempty"}),(0,n.kt)("inlineCode",{parentName:"h3"},"sourceMapNonEmpty")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",c({},{id:"definition-9"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"readonly sourceMapNonEmpty: "),(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<this['_K'], this['_V']>;"))),(0,n.kt)("h4",c({},{id:"overrides-9"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",c({parentName:"p"},{href:"/api/rimbu/ordered/map-custom/OrderedMapBase/Types/interface#sourceMapNonEmpty"}),"Types.sourceMapNonEmpty"))))}h.isMDXComponent=!0}}]);