"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[74738],{3905:(e,r,a)=>{a.d(r,{Zo:()=>d,kt:()=>h});var t=a(67294);function n(e,r,a){return r in e?Object.defineProperty(e,r,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[r]=a,e}function p(e,r){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),a.push.apply(a,t)}return a}function o(e){for(var r=1;r<arguments.length;r++){var a=null!=arguments[r]?arguments[r]:{};r%2?p(Object(a),!0).forEach((function(r){n(e,r,a[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):p(Object(a)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(a,r))}))}return e}function i(e,r){if(null==e)return{};var a,t,n=function(e,r){if(null==e)return{};var a,t,n={},p=Object.keys(e);for(t=0;t<p.length;t++)a=p[t],r.indexOf(a)>=0||(n[a]=e[a]);return n}(e,r);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(t=0;t<p.length;t++)a=p[t],r.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var l=t.createContext({}),u=function(e){var r=t.useContext(l),a=r;return e&&(a="function"==typeof e?e(r):o(o({},r),e)),a},d=function(e){var r=u(e.components);return t.createElement(l.Provider,{value:r},e.children)},c="mdxType",s={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},m=t.forwardRef((function(e,r){var a=e.components,n=e.mdxType,p=e.originalType,l=e.parentName,d=i(e,["components","mdxType","originalType","parentName"]),c=u(a),m=n,h=c["".concat(l,".").concat(m)]||c[m]||s[m]||p;return a?t.createElement(h,o(o({ref:r},d),{},{components:a})):t.createElement(h,o({ref:r},d))}));function h(e,r){var a=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var p=a.length,o=new Array(p);o[0]=m;var i={};for(var l in r)hasOwnProperty.call(r,l)&&(i[l]=r[l]);i.originalType=e,i[c]="string"==typeof e?e:n,o[1]=i;for(var u=2;u<p;u++)o[u]=a[u];return t.createElement.apply(null,o)}return t.createElement.apply(null,a)}m.displayName="MDXCreateElement"},11539:(e,r,a)=>{a.r(r),a.d(r,{assets:()=>y,contentTitle:()=>f,default:()=>k,frontMatter:()=>h,metadata:()=>b,toc:()=>g});var t=a(3905),n=Object.defineProperty,p=Object.defineProperties,o=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,d=(e,r,a)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[r]=a,c=(e,r)=>{for(var a in r||(r={}))l.call(r,a)&&d(e,a,r[a]);if(i)for(var a of i(r))u.call(r,a)&&d(e,a,r[a]);return e},s=(e,r)=>p(e,o(r)),m=(e,r)=>{var a={};for(var t in e)l.call(e,t)&&r.indexOf(t)<0&&(a[t]=e[t]);if(null!=e&&i)for(var t of i(e))r.indexOf(t)<0&&u.call(e,t)&&(a[t]=e[t]);return a};const h={title:"ArrowValuedGraphHashed<N,V>",slug:"/rimbu/graph/ArrowValuedGraphHashed/interface"},f="interface ArrowValuedGraphHashed<N,V>",b={unversionedId:"rimbu_graph/ArrowValuedGraphHashed.interface",id:"rimbu_graph/ArrowValuedGraphHashed.interface",title:"ArrowValuedGraphHashed<N,V>",description:"An type-invariant immutable valued arrow (directed) graph. The nodes are internally maintained using HashMaps See the Graph documentation and the ArrowValuedGraphHashed API documentation",source:"@site/api/rimbu_graph/ArrowValuedGraphHashed.interface.mdx",sourceDirName:"rimbu_graph",slug:"/rimbu/graph/ArrowValuedGraphHashed/interface",permalink:"/api/rimbu/graph/ArrowValuedGraphHashed/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ArrowValuedGraphHashed<N,V>",slug:"/rimbu/graph/ArrowValuedGraphHashed/interface"},sidebar:"defaultSidebar",previous:{title:"ArrowValuedGraphHashed.Types",permalink:"/api/rimbu/graph/ArrowValuedGraphHashed/Types/interface"},next:{title:"ArrowValuedGraphSorted (namespace)",permalink:"/api/rimbu/graph/ArrowValuedGraphSorted/namespace"}},y={},g=[{value:"Type parameters",id:"type-parameters",level:2}],w={toc:g},v="wrapper";function k(e){var r=e,{components:a}=r,n=m(r,["components"]);return(0,t.kt)(v,s(c(c({},w),n),{components:a,mdxType:"MDXLayout"}),(0,t.kt)("h1",c({},{id:"interface-arrowvaluedgraphhashednv"}),(0,t.kt)("inlineCode",{parentName:"h1"},"interface ArrowValuedGraphHashed<N,V>")),(0,t.kt)("p",null,"An type-invariant immutable valued arrow (directed) graph. The nodes are internally maintained using HashMaps See the ",(0,t.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,t.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ArrowValuedGraphHashed/interface"}),"ArrowValuedGraphHashed API documentation")),(0,t.kt)("p",null,(0,t.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,t.kt)("a",c({parentName:"p"},{href:"/api/rimbu/graph/ArrowValuedGraphHashed/namespace"}),"ArrowValuedGraphHashed")),(0,t.kt)("p",null,(0,t.kt)("strong",{parentName:"p"},"Implemented by:")," ",(0,t.kt)("a",c({parentName:"p"},{href:"/api/rimbu/graph/ArrowValuedGraphHashed/NonEmpty/interface"}),(0,t.kt)("inlineCode",{parentName:"a"},"ArrowValuedGraphHashed.NonEmpty<N,V>"))),(0,t.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,t.kt)("table",null,(0,t.kt)("thead",{parentName:"table"},(0,t.kt)("tr",{parentName:"thead"},(0,t.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,t.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,t.kt)("tbody",{parentName:"table"},(0,t.kt)("tr",{parentName:"tbody"},(0,t.kt)("td",c({parentName:"tr"},{align:null}),"N"),(0,t.kt)("td",c({parentName:"tr"},{align:null}),"the node type")),(0,t.kt)("tr",{parentName:"tbody"},(0,t.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,t.kt)("td",c({parentName:"tr"},{align:null}),"the connection value type")))),(0,t.kt)("admonition",c({},{title:"example",type:"note"}),(0,t.kt)("pre",{parentName:"admonition"},(0,t.kt)("code",c({parentName:"pre"},{className:"language-ts"}),"const g1 = ArrowValuedGraphHashed.empty<number, string>()\nconst g2 = ArrowValuedGraphHashed.of([1], [2, 3, 'a'], [2, 4, 'b'])\n"))))}k.isMDXComponent=!0}}]);