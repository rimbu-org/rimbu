"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[35189],{3905:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return h}});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),d=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=d(e.components);return n.createElement(p.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=d(r),h=a,m=u["".concat(p,".").concat(h)]||u[h]||s[h]||o;return r?n.createElement(m,i(i({ref:t},c),{},{components:r})):n.createElement(m,i({ref:t},c))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=u;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var d=2;d<o;d++)i[d]=r[d];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},73203:function(e,t,r){r.d(t,{r:function(){return u}});var n=r(67294),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;const s={previewwindow:"console",view:"split",editorsize:"60",codemirror:"1",moduleview:"1"};function u(e){const t=(r=((e,t)=>{for(var r in t||(t={}))p.call(t,r)&&c(e,r,t[r]);if(l)for(var r of l(t))d.call(t,r)&&c(e,r,t[r]);return e})({},s),a={module:`/src/${e.path}`},o(r,i(a)));var r,a;const u=function(e){let t="",r="";for(const n in e)t+=`${r}${n}=${e[n]}`,r="&";return""===t?"":`?${t}`}(t),h=`https://codesandbox.io/embed/github/vitoke/rimbu-sandbox/tree/main${u}`,m=`https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main${u}`;return n.createElement(n.Fragment,null,n.createElement("a",{target:"_blank",className:"button button--secondary",href:m,style:{marginBottom:10}},"Open file below in new window with full type-check"),n.createElement("iframe",{src:h,className:"codesandbox-iframe",sandbox:"allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"}))}},5907:function(e,t,r){r.r(t),r.d(t,{assets:function(){return f},contentTitle:function(){return m},default:function(){return y},frontMatter:function(){return h},metadata:function(){return g},toc:function(){return b}});var n=r(3905),a=r(73203),o=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?o(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))d.call(t,r)&&s(e,r,t[r]);if(p)for(var r of p(t))c.call(t,r)&&s(e,r,t[r]);return e};const h={id:"edge-graph",slug:"./edge-graph",title:"Edge Graph"},m="EdgeGraph<N>",g={unversionedId:"collections/graph/edge-graph",id:"collections/graph/edge-graph",title:"Edge Graph",description:"An EdgeGraph is an undirected Graph where the edges have no values. This structure is useful for situations in which elements of the same type can have relations to each other. The relation is either there or not there. The relation is bidirectional, so A -> B also implies that B -> A.",source:"@site/docs/collections/graph/edge-graph.mdx",sourceDirName:"collections/graph",slug:"/collections/graph/edge-graph",permalink:"/docs/collections/graph/edge-graph",draft:!1,editUrl:"https://github.com/rimbu-org/rimbu/edit/master/website/docs/collections/graph/edge-graph.mdx",tags:[],version:"current",frontMatter:{id:"edge-graph",slug:"./edge-graph",title:"Edge Graph"},sidebar:"sidebar",previous:{title:"Arrow Valued Graph",permalink:"/docs/collections/graph/arrow-valued-graph"},next:{title:"Edge Valued Graph",permalink:"/docs/collections/graph/edge-valued-graph"}},f={},b=[{value:"Usage",id:"usage",level:2},{value:"Creation",id:"creation",level:3},{value:"Query",id:"query",level:3},{value:"Motivation",id:"motivation",level:3},{value:"Builder",id:"builder",level:3}],v={toc:b};function y(e){var t,r=e,{components:o}=r,s=((e,t)=>{var r={};for(var n in e)d.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&p)for(var n of p(e))t.indexOf(n)<0&&c.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=u(u({},v),s),i(t,l({components:o,mdxType:"MDXLayout"}))),(0,n.kt)("h1",u({},{id:"edgegraphn"}),(0,n.kt)("inlineCode",{parentName:"h1"},"EdgeGraph<N>")),(0,n.kt)("p",null,"An ",(0,n.kt)("inlineCode",{parentName:"p"},"EdgeGraph")," is an undirected ",(0,n.kt)("inlineCode",{parentName:"p"},"Graph")," where the edges have no values. This structure is useful for situations in which elements of the same type can have relations to each other. The relation is either there or not there. The relation is bidirectional, so ",(0,n.kt)("inlineCode",{parentName:"p"},"A -> B")," also implies that ",(0,n.kt)("inlineCode",{parentName:"p"},"B -> A"),"."),(0,n.kt)("div",u({},{className:"admonition admonition-info alert alert--info"}),(0,n.kt)("div",u({parentName:"div"},{className:"admonition-heading"}),(0,n.kt)("h5",{parentName:"div"},(0,n.kt)("span",u({parentName:"h5"},{className:"admonition-icon"}),(0,n.kt)("svg",u({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),(0,n.kt)("path",u({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),(0,n.kt)("div",u({parentName:"div"},{className:"admonition-content"}),(0,n.kt)("p",{parentName:"div"},"Like all ",(0,n.kt)("inlineCode",{parentName:"p"},"Graph")," implementations, these graphs can contain cycles and isolated nodes are allowed."))),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"@rimbu/core")," package exports the following immutable ArrowGraph TypeScript types:"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/EdgeGraph/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"EdgeGraph<N>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"a generic undirected graph with nodes of type N")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/EdgeGraphHashed/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"EdgeGraphHashed<N>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"an undirected graph with hashed nodes of type N")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/graph/EdgeGraphSorted/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"EdgeGraphSorted<N>"))),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"an undirected graph with sorted nodes of type N")))),(0,n.kt)("h2",u({},{id:"usage"}),"Usage"),(0,n.kt)("h3",u({},{id:"creation"}),"Creation"),(0,n.kt)(a.r,{path:"graph/edge/non-valued/create.ts",mdxType:"SandBox"}),(0,n.kt)("h3",u({},{id:"query"}),"Query"),(0,n.kt)(a.r,{path:"graph/edge/non-valued/query.ts",mdxType:"SandBox"}),(0,n.kt)("h3",u({},{id:"motivation"}),"Motivation"),(0,n.kt)(a.r,{path:"graph/edge/non-valued/motivation.ts",mdxType:"SandBox"}),(0,n.kt)("h3",u({},{id:"builder"}),"Builder"),(0,n.kt)(a.r,{path:"graph/edge/non-valued/builder.ts",mdxType:"SandBox"}))}y.isMDXComponent=!0}}]);