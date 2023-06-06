"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[54433],{3905:(e,r,t)=>{t.d(r,{Zo:()=>m,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),c=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},m=function(e){var r=c(e.components);return n.createElement(l.Provider,{value:r},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},s=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),d=c(t),s=a,f=d["".concat(l,".").concat(s)]||d[s]||u[s]||o;return t?n.createElement(f,i(i({ref:r},m),{},{components:t})):n.createElement(f,i({ref:r},m))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=s;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p[d]="string"==typeof e?e:a,i[1]=p;for(var c=2;c<o;c++)i[c]=t[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}s.displayName="MDXCreateElement"},65550:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>b,contentTitle:()=>y,default:()=>w,frontMatter:()=>f,metadata:()=>h,toc:()=>N});var n=t(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,m=(e,r,t)=>r in e?a(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,d=(e,r)=>{for(var t in r||(r={}))l.call(r,t)&&m(e,t,r[t]);if(p)for(var t of p(r))c.call(r,t)&&m(e,t,r[t]);return e},u=(e,r)=>o(e,i(r)),s=(e,r)=>{var t={};for(var n in e)l.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&p)for(var n of p(e))r.indexOf(n)<0&&c.call(e,n)&&(t[n]=e[n]);return t};const f={title:"ArrowGraphSorted.NonEmpty<N>",slug:"/rimbu/core/ArrowGraphSorted/NonEmpty/interface"},y="interface ArrowGraphSorted.NonEmpty<N>",h={unversionedId:"rimbu_core/ArrowGraphSorted/NonEmpty.interface",id:"rimbu_core/ArrowGraphSorted/NonEmpty.interface",title:"ArrowGraphSorted.NonEmpty<N>",description:"A non-empty type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the Graph documentation and the ArrowGraphSorted API documentation",source:"@site/api/rimbu_core/ArrowGraphSorted/NonEmpty.interface.mdx",sourceDirName:"rimbu_core/ArrowGraphSorted",slug:"/rimbu/core/ArrowGraphSorted/NonEmpty/interface",permalink:"/api/rimbu/core/ArrowGraphSorted/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"ArrowGraphSorted.NonEmpty<N>",slug:"/rimbu/core/ArrowGraphSorted/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"ArrowGraphSorted.Context<UN>",permalink:"/api/rimbu/core/ArrowGraphSorted/Context/interface"},next:{title:"ArrowGraphSorted.Types",permalink:"/api/rimbu/core/ArrowGraphSorted/Types/interface"}},b={},N=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4}],k={toc:N},v="wrapper";function w(e){var r=e,{components:t}=r,a=s(r,["components"]);return(0,n.kt)(v,u(d(d({},k),a),{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",d({},{id:"interface-arrowgraphsortednonemptyn"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface ArrowGraphSorted.NonEmpty<N>")),(0,n.kt)("p",null,"A non-empty type-invariant immutable valued arrow (directed) graph. The connections are internally maintained using sorted collections See the ",(0,n.kt)("a",d({parentName:"p"},{href:"https://rimbu.org/docs/collections/graph"}),"Graph documentation")," and the ",(0,n.kt)("a",d({parentName:"p"},{href:"https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/interface"}),"ArrowGraphSorted API documentation")),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Extends:")," ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/core/Streamable/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"Streamable.NonEmpty<T>")),", ",(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/core/ArrowGraphSorted/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"ArrowGraphSorted<N>"))),(0,n.kt)("h2",d({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",d({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",d({parentName:"tr"},{align:null}),"N"),(0,n.kt)("td",d({parentName:"tr"},{align:null}),"the node type")))),(0,n.kt)("h2",d({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",d({},{id:"stream"}),(0,n.kt)("inlineCode",{parentName:"h3"},"stream")),(0,n.kt)("p",null,"Returns a non-empty Stream containing all entries of this collection as tuples of key and value.")),(0,n.kt)("h4",d({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"stream(): "),(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/core/Stream/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"Stream.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<GraphElement<N>>;"))),(0,n.kt)("admonition",d({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",d({parentName:"pre"},{className:"language-ts"}),"ArrowValuedGraphSorted.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()\n// => [[1, 2, 'a'], [2, 3, 'b']]\n"))),(0,n.kt)("h4",d({},{id:"overrides"}),"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",d({parentName:"p"},{href:"/api/rimbu/core/Streamable/NonEmpty/interface#stream"}),"NonEmpty.stream"))))}w.isMDXComponent=!0}}]);