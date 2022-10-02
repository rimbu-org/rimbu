"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[737],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>d});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),m=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},s=function(e){var t=m(e.components);return n.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=m(r),d=a,f=c["".concat(p,".").concat(d)]||c[d]||u[d]||i;return r?n.createElement(f,o(o({ref:t},s),{},{components:r})):n.createElement(f,o({ref:t},s))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=c;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var m=2;m<i;m++)o[m]=r[m];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},5032:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>k,contentTitle:()=>d,default:()=>N,frontMatter:()=>c,metadata:()=>f,toc:()=>b});var n=r(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&s(e,r,t[r]);if(l)for(var r of l(t))m.call(t,r)&&s(e,r,t[r]);return e};const c={title:"Transformer_2 (namespace)",slug:"/rimbu/stream/Transformer_2/namespace"},d="namespace Transformer_2",f={unversionedId:"rimbu_stream/Transformer_2/index",id:"rimbu_stream/Transformer_2/index",title:"Transformer_2 (namespace)",description:"A Reducer that produces instances of StreamSource.",source:"@site/api/rimbu_stream/Transformer_2/index.mdx",sourceDirName:"rimbu_stream/Transformer_2",slug:"/rimbu/stream/Transformer_2/namespace",permalink:"/api/rimbu/stream/Transformer_2/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"Transformer_2 (namespace)",slug:"/rimbu/stream/Transformer_2/namespace"},sidebar:"defaultSidebar",previous:{title:"Streamable<T>",permalink:"/api/rimbu/stream/Streamable/interface"},next:{title:"NonEmpty",permalink:"/api/rimbu/stream/Transformer_2/NonEmpty/type"}},k={},b=[{value:"Functions",id:"functions",level:2},{value:"<code>distinctPrevious</code>",id:"distinctprevious",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:5},{value:"Parameters",id:"parameters",level:4},{value:"Constants",id:"constants",level:2}],y={toc:b};function N(e){var t,r=e,{components:a}=r,s=((e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&l)for(var n of l(e))t.indexOf(n)<0&&m.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=u(u({},y),s),i(t,o({components:a,mdxType:"MDXLayout"}))),(0,n.kt)("h1",u({},{id:"namespace-transformer_2"}),(0,n.kt)("inlineCode",{parentName:"h1"},"namespace Transformer_2")),(0,n.kt)("p",null,"A Reducer that produces instances of ",(0,n.kt)("inlineCode",{parentName:"p"},"StreamSource"),"."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Companion type:")," ",(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/Transformer_2/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Transformer_2<T,R>"))),(0,n.kt)("h2",u({},{id:"functions"}),"Functions"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",u({},{id:"distinctprevious"}),(0,n.kt)("inlineCode",{parentName:"h3"},"distinctPrevious")),(0,n.kt)("p",null,"Returns a transformer that returns only those elements from the input that are different to previous element according to the optionally given ",(0,n.kt)("inlineCode",{parentName:"p"},"eq")," function.")),(0,n.kt)("h4",u({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"function distinctPrevious<T>(eq?: "),(0,n.kt)("a",u({parentName:"p"},{href:"/api/rimbu/common/Eq/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Eq")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>): Transformer<T>;"))),(0,n.kt)("h5",u({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",u({parentName:"tr"},{align:null}))))),(0,n.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("inlineCode",{parentName:"td"},"eq")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),(0,n.kt)("a",u({parentName:"td"},{href:"/api/rimbu/common/Eq/type"}),(0,n.kt)("inlineCode",{parentName:"a"},"Eq")),(0,n.kt)("inlineCode",{parentName:"td"},"<T>")),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"(default: ",(0,n.kt)("inlineCode",{parentName:"td"},"Eq.objectIs"),") the equality testing function")))),(0,n.kt)("admonition",u({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"Stream.of(1, 1, 2, 3, 2, 2)\n.transform(Transformer.distinctPrevious())\n.toArray()\n// => [1, 2, 3, 2]\n")))),(0,n.kt)("h2",u({},{id:"constants"}),"Constants"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",u({parentName:"tr"},{align:null}),"window"),(0,n.kt)("td",u({parentName:"tr"},{align:null}),"Returns a transformer that produces windows/collections of ",(0,n.kt)("inlineCode",{parentName:"td"},"windowSize")," size, each window starting ",(0,n.kt)("inlineCode",{parentName:"td"},"skipAmount")," of elements after the previous, and optionally collected by a custom reducer.")))))}N.isMDXComponent=!0}}]);