"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[35189],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>m});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var p=a.createContext({}),d=function(e){var t=a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},s=function(e){var t=d(e.components);return a.createElement(p.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},h=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=d(r),h=n,m=c["".concat(p,".").concat(h)]||c[h]||u[h]||o;return r?a.createElement(m,i(i({ref:t},s),{},{components:r})):a.createElement(m,i({ref:t},s))}));function m(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,i=new Array(o);i[0]=h;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[c]="string"==typeof e?e:n,i[1]=l;for(var d=2;d<o;d++)i[d]=r[d];return a.createElement.apply(null,i)}return a.createElement.apply(null,r)}h.displayName="MDXCreateElement"},88508:(e,t,r)=>{r.d(t,{r:()=>m});var a=r(67294),n=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&s(e,r,t[r]);if(l)for(var r of l(t))d.call(t,r)&&s(e,r,t[r]);return e},u=(e,t)=>o(e,i(t));const h={previewwindow:"console",view:"split",editorsize:"60",codemirror:"1",moduleview:"1"};function m(e){const t=function(e){let t="",r="";for(const a in e)t+=`${r}${a}=${e[a]}`,r="&";return""===t?"":`?${t}`}(u(c({},h),{module:`/src/${e.path}`})),r=`https://codesandbox.io/embed/github/vitoke/rimbu-sandbox/tree/main${t}`,n=`https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main${t}`;return a.createElement(a.Fragment,null,a.createElement("a",{target:"_blank",className:"button button--secondary",href:n,style:{marginBottom:10}},"Open file below in new window with full type-check"),a.createElement("iframe",{src:r,className:"codesandbox-iframe",sandbox:"allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"}))}},12474:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>y,contentTitle:()=>f,default:()=>O,frontMatter:()=>g,metadata:()=>b,toc:()=>v});var a=r(3905),n=r(88508),o=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?o(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))d.call(t,r)&&c(e,r,t[r]);if(p)for(var r of p(t))s.call(t,r)&&c(e,r,t[r]);return e},h=(e,t)=>i(e,l(t)),m=(e,t)=>{var r={};for(var a in e)d.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&p)for(var a of p(e))t.indexOf(a)<0&&s.call(e,a)&&(r[a]=e[a]);return r};const g={id:"edge-graph",slug:"./edge-graph",title:"Edge Graph"},f="EdgeGraph<N>",b={unversionedId:"collections/graph/edge-graph",id:"collections/graph/edge-graph",title:"Edge Graph",description:"An EdgeGraph is an undirected Graph where the edges have no values. This structure is useful for situations in which elements of the same type can have relations to each other. The relation is either there or not there. The relation is bidirectional, so A -> B also implies that B -> A.",source:"@site/docs/collections/graph/edge-graph.mdx",sourceDirName:"collections/graph",slug:"/collections/graph/edge-graph",permalink:"/docs/collections/graph/edge-graph",draft:!1,editUrl:"https://github.com/rimbu-org/rimbu/edit/master/website/docs/collections/graph/edge-graph.mdx",tags:[],version:"current",frontMatter:{id:"edge-graph",slug:"./edge-graph",title:"Edge Graph"},sidebar:"sidebar",previous:{title:"Arrow Valued Graph",permalink:"/docs/collections/graph/arrow-valued-graph"},next:{title:"Edge Valued Graph",permalink:"/docs/collections/graph/edge-valued-graph"}},y={},v=[{value:"Usage",id:"usage",level:2},{value:"Creation",id:"creation",level:3},{value:"Query",id:"query",level:3},{value:"Motivation",id:"motivation",level:3},{value:"Builder",id:"builder",level:3}],k={toc:v},w="wrapper";function O(e){var t=e,{components:r}=t,o=m(t,["components"]);return(0,a.kt)(w,h(u(u({},k),o),{components:r,mdxType:"MDXLayout"}),(0,a.kt)("h1",u({},{id:"edgegraphn"}),(0,a.kt)("inlineCode",{parentName:"h1"},"EdgeGraph<N>")),(0,a.kt)("p",null,"An ",(0,a.kt)("inlineCode",{parentName:"p"},"EdgeGraph")," is an undirected ",(0,a.kt)("inlineCode",{parentName:"p"},"Graph")," where the edges have no values. This structure is useful for situations in which elements of the same type can have relations to each other. The relation is either there or not there. The relation is bidirectional, so ",(0,a.kt)("inlineCode",{parentName:"p"},"A -> B")," also implies that ",(0,a.kt)("inlineCode",{parentName:"p"},"B -> A"),"."),(0,a.kt)("admonition",u({},{type:"info"}),(0,a.kt)("p",{parentName:"admonition"},"Like all ",(0,a.kt)("inlineCode",{parentName:"p"},"Graph")," implementations, these graphs can contain cycles and isolated nodes are allowed.")),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"@rimbu/core")," package exports the following immutable ArrowGraph TypeScript types:"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/EdgeGraph/namespace"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraph<N>"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"a generic undirected graph with nodes of type N")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/EdgeGraphHashed/namespace"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraphHashed<N>"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"an undirected graph with hashed nodes of type N")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",u({parentName:"tr"},{align:null}),(0,a.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/EdgeGraphSorted/namespace"}),(0,a.kt)("inlineCode",{parentName:"a"},"EdgeGraphSorted<N>"))),(0,a.kt)("td",u({parentName:"tr"},{align:null}),"an undirected graph with sorted nodes of type N")))),(0,a.kt)("h2",u({},{id:"usage"}),"Usage"),(0,a.kt)("h3",u({},{id:"creation"}),"Creation"),(0,a.kt)(n.r,{path:"graph/edge/non-valued/create.ts",mdxType:"SandBox"}),(0,a.kt)("h3",u({},{id:"query"}),"Query"),(0,a.kt)(n.r,{path:"graph/edge/non-valued/query.ts",mdxType:"SandBox"}),(0,a.kt)("h3",u({},{id:"motivation"}),"Motivation"),(0,a.kt)(n.r,{path:"graph/edge/non-valued/motivation.ts",mdxType:"SandBox"}),(0,a.kt)("h3",u({},{id:"builder"}),"Builder"),(0,a.kt)(n.r,{path:"graph/edge/non-valued/builder.ts",mdxType:"SandBox"}))}O.isMDXComponent=!0}}]);