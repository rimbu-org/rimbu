"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[30286],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return d}});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var u=r.createContext({}),p=function(e){var t=r.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(u.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,u=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),s=p(n),d=a,f=s["".concat(u,".").concat(d)]||s[d]||m[d]||i;return n?r.createElement(f,o(o({ref:t},c),{},{components:n})):r.createElement(f,o({ref:t},c))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=s;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},19389:function(e,t,n){n.r(t),n.d(t,{assets:function(){return b},contentTitle:function(){return d},default:function(){return C},frontMatter:function(){return s},metadata:function(){return f},toc:function(){return k}});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))u.call(t,n)&&c(e,n,t[n]);if(l)for(var n of l(t))p.call(t,n)&&c(e,n,t[n]);return e};const s={title:"MultiSetCreators",slug:"/rimbu/multiset/custom/MultiSetCreators/interface"},d="interface MultiSetCreators",f={unversionedId:"rimbu_multiset/custom/MultiSetCreators.interface",id:"rimbu_multiset/custom/MultiSetCreators.interface",title:"MultiSetCreators",description:"undocumented",source:"@site/api/rimbu_multiset/custom/MultiSetCreators.interface.mdx",sourceDirName:"rimbu_multiset/custom",slug:"/rimbu/multiset/custom/MultiSetCreators/interface",permalink:"/api/rimbu/multiset/custom/MultiSetCreators/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"MultiSetCreators",slug:"/rimbu/multiset/custom/MultiSetCreators/interface"},sidebar:"defaultSidebar",previous:{title:"MultiSetContext<UT,N,Tp>",permalink:"/api/rimbu/multiset/custom/MultiSetContext/class"},next:{title:"MultiSetEmpty<T,Tp>",permalink:"/api/rimbu/multiset/custom/MultiSetEmpty/class"}},b={},k=[{value:"Methods",id:"methods",level:2},{value:"<code>createContext</code>",id:"createcontext",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:3},{value:"Parameters",id:"parameters",level:4}],y={toc:k};function C(e){var t,n=e,{components:a}=n,c=((e,t)=>{var n={};for(var r in e)u.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=m(m({},y),c),i(t,o({components:a,mdxType:"MDXLayout"}))),(0,r.kt)("h1",m({},{id:"interface-multisetcreators"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface MultiSetCreators")),(0,r.kt)("p",null,"undocumented"),(0,r.kt)("h2",m({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"createcontext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"createContext")),(0,r.kt)("p",null,"Returns a new MultiSet context instance based on the given ",(0,r.kt)("inlineCode",{parentName:"p"},"options"),".")),(0,r.kt)("h4",m({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"createContext<UT>(options: {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"countMapContext: "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<UT>;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"}): "),(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/multiset/MultiSet/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"MultiSet.Context")),(0,r.kt)("inlineCode",{parentName:"p"},"<UT>;"))),(0,r.kt)("h3",m({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"UT"),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"the upper element type for which the context can create instances")))),(0,r.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"options")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"{"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"countMapContext: "),(0,r.kt)("a",m({parentName:"td"},{href:"/api/rimbu/collection-types/map/RMap/Context/interface"}),(0,r.kt)("inlineCode",{parentName:"a"},"RMap.Context")),(0,r.kt)("inlineCode",{parentName:"td"},"<UT>;"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"td"},"}")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"an object containing the following properties:",(0,r.kt)("br",null)," - countMapContext - the map context to use for key to count mapping"))))))}C.isMDXComponent=!0}}]);