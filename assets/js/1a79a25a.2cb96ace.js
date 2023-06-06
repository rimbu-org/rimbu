"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[71474],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function p(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),m=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):p(p({},r),e)),t},c=function(e){var r=m(e.components);return n.createElement(l.Provider,{value:r},e.children)},u="mdxType",s={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=m(t),d=a,f=u["".concat(l,".").concat(d)]||u[d]||s[d]||o;return t?n.createElement(f,p(p({ref:r},c),{},{components:t})):n.createElement(f,p({ref:r},c))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,p=new Array(o);p[0]=d;var i={};for(var l in r)hasOwnProperty.call(r,l)&&(i[l]=r[l]);i.originalType=e,i[u]="string"==typeof e?e:a,p[1]=i;for(var m=2;m<o;m++)p[m]=t[m];return n.createElement.apply(null,p)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},97448:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>b,contentTitle:()=>h,default:()=>w,frontMatter:()=>f,metadata:()=>y,toc:()=>g});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,p=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,c=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,u=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&c(e,t,r[t]);if(i)for(var t of i(r))m.call(r,t)&&c(e,t,r[t]);return e},s=(e,r)=>o(e,p(r)),d=(e,r)=>{var t={};for(var n in e)l.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&i)for(var n of i(e))r.indexOf(n)<0&&m.call(e,n)&&(t[n]=e[n]);return t};const f={title:"ArrowGraph.NonEmpty<N>",slug:"/rimbu/graph/ArrowGraph/NonEmpty/interface"},h="interface ArrowGraph.NonEmpty<N>",y={unversionedId:"rimbu_graph/ArrowGraph/NonEmpty.interface",id:"rimbu_graph/ArrowGraph/NonEmpty.interface",title:"ArrowGraph.NonEmpty<N>",description:"A non-empty type-invariant immutable arrow (directed) graph. See the Graph documentation and the ArrowGraph API documentation",source:"@site/api/rimbu_graph/ArrowGraph/NonEmpty.interface.mdx",sourceDirName:"rimbu_graph/ArrowGraph",slug:"/rimbu/graph/ArrowGraph/NonEmpty/interface",permalink:"/api/rimbu/graph/ArrowGraph/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ArrowGraph.NonEmpty<N>",slug:"/rimbu/graph/ArrowGraph/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"ArrowGraph.Context<UN>",permalink:"/api/rimbu/graph/ArrowGraph/Context/interface"},next:{title:"ArrowGraph.Types",permalink:"/api/rimbu/graph/ArrowGraph/Types/interface"}},b={},g=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition",level:4}],N={toc:g},k="wrapper";function w(e){var r=e,{components:t}=r,a=d(r,["components"]);return(0,n.kt)(k,s(u(u({},N),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",u({},{id:"interface-arrowgraphnonemptyn"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface ArrowGraph.NonEmpty<N>")),(0,n.kt)("p",null,"A non-empty type-invariant immutable arrow (directed) graph. See the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,n.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraph/interface"}),"ArrowGraph API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/graph/ArrowGraph/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrowGraph<N>"))),(0,n.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"N"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"the node type")))),(0,n.kt)("h2",u({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"stream"}),(0,n.kt)("inlineCode",{parentName:"h3"},"stream")),(0,n.kt)("p",null,"Returns a non-empty ",(0,n.kt)("inlineCode",{parentName:"p"},"Stream")," containing all graph elements of this collection as single tuples for isolated nodes and 2-valued tuples of nodes for connections.")),(0,n.kt)("h4",u({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"stream(): Stream.NonEmpty<[N] "),(0,n.kt)("code",null,"|"),(0,n.kt)("inlineCode",{parentName:"p"}," Link<N>>;"))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]\n")))))}w.isMDXComponent=!0}}]);