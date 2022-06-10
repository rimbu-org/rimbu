"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[22504],{3905:function(e,t,a){a.d(t,{Zo:function(){return c},kt:function(){return m}});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),s=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},c=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=s(a),m=r,h=u["".concat(p,".").concat(m)]||u[m]||d[m]||i;return a?n.createElement(h,o(o({ref:t},c),{},{components:a})):n.createElement(h,o({ref:t},c))}));function m(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,o=new Array(i);o[0]=u;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var s=2;s<i;s++)o[s]=a[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},69318:function(e,t,a){a.d(t,{G:function(){return i}});var n=a(67294);function r(e){return e.replace(/</g,"%3C").replace(/>/g,"%3E")}function i(e){const t=r(`https://g.gravizo.com/svg?\n  @startuml;\n  skinparam monochrome true;\n  skinparam backgroundColor none;\n  skinparam classBackgroundColor darkslategrey;\n  skinparam classBorderColor gray;\n  skinparam classFontColor lightgray;\n  skinparam classStereotypeFontColor darkgray;\n  skinparam arrowColor lightgray;\n  skinparam linetype ortho;\n  ${e.contents}\n  @enduml;`);return n.createElement("img",{src:t,className:"diagram"})}},73203:function(e,t,a){a.d(t,{r:function(){return u}});var n=a(67294),r=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,c=(e,t,a)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;const d={previewwindow:"console",view:"split",editorsize:"60",codemirror:"1",moduleview:"1"};function u(e){const t=(a=((e,t)=>{for(var a in t||(t={}))p.call(t,a)&&c(e,a,t[a]);if(l)for(var a of l(t))s.call(t,a)&&c(e,a,t[a]);return e})({},d),r={module:`/src/${e.path}`},i(a,o(r)));var a,r;const u=function(e){let t="",a="";for(const n in e)t+=`${a}${n}=${e[n]}`,a="&";return""===t?"":`?${t}`}(t),m=`https://codesandbox.io/embed/github/vitoke/rimbu-sandbox/tree/main${u}`,h=`https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main${u}`;return n.createElement(n.Fragment,null,n.createElement("a",{target:"_blank",className:"button button--secondary",href:h,style:{marginBottom:10}},"Open file below in new window with full type-check"),n.createElement("iframe",{src:m,className:"codesandbox-iframe",sandbox:"allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"}))}},77180:function(e,t,a){a.r(t),a.d(t,{assets:function(){return f},contentTitle:function(){return k},default:function(){return g},frontMatter:function(){return h},metadata:function(){return y},toc:function(){return b}});var n=a(3905),r=a(69318);var i=a(73203),o=Object.defineProperty,l=Object.defineProperties,p=Object.getOwnPropertyDescriptors,s=Object.getOwnPropertySymbols,c=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,u=(e,t,a)=>t in e?o(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,m=(e,t)=>{for(var a in t||(t={}))c.call(t,a)&&u(e,a,t[a]);if(s)for(var a of s(t))d.call(t,a)&&u(e,a,t[a]);return e};const h={id:"map",slug:"./map",title:"Map"},k="Map",y={unversionedId:"collections/map",id:"collections/map",title:"Map",description:"A Map is a collection of entries, where each entry has a key and a value. Each key has exactly one value, and each key is unique. Values do not need to be unique.",source:"@site/docs/collections/map.mdx",sourceDirName:"collections",slug:"/collections/map",permalink:"/docs/collections/map",draft:!1,editUrl:"https://github.com/rimbu-org/rimbu/edit/master/website/docs/collections/map.mdx",tags:[],version:"current",frontMatter:{id:"map",slug:"./map",title:"Map"},sidebar:"sidebar",previous:{title:"List",permalink:"/docs/collections/list"},next:{title:"MultiMap",permalink:"/docs/collections/multimap"}},f={},b=[{value:"When to use",id:"when-to-use",level:2},{value:"HashMap",id:"hashmap",level:2},{value:"SortedMap",id:"sortedmap",level:2},{value:"OrderedMap",id:"orderedmap",level:2},{value:"Exports",id:"exports",level:2},{value:"Inheritance",id:"inheritance",level:2},{value:"Usage",id:"usage",level:2},{value:"Creation",id:"creation",level:3},{value:"Query",id:"query",level:3},{value:"Builder",id:"builder",level:3}],v={toc:b};function g(e){var t,a=e,{components:o}=a,u=((e,t)=>{var a={};for(var n in e)c.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(null!=e&&s)for(var n of s(e))t.indexOf(n)<0&&d.call(e,n)&&(a[n]=e[n]);return a})(a,["components"]);return(0,n.kt)("wrapper",(t=m(m({},v),u),l(t,p({components:o,mdxType:"MDXLayout"}))),(0,n.kt)("h1",m({},{id:"map"}),"Map"),(0,n.kt)("p",null,"A Map is a collection of entries, where each entry has a key and a value. Each key has exactly one value, and each key is unique. Values do not need to be unique."),(0,n.kt)("h2",m({},{id:"when-to-use"}),"When to use"),(0,n.kt)("p",null,"The Map is a useful when it is useful to assign values of objects to unique entities of a certain type. For example, consider currencies and their values. Using a Map we can assign a value to each currency, e.g. euro and dollar. We can update their values, and we can query the value of a specific currency. It does not really make much sense to query using a value to get a currency, so a ",(0,n.kt)("inlineCode",{parentName:"p"},"BiMap")," would not be useful in this case."),(0,n.kt)("div",m({},{className:"admonition admonition-info alert alert--info"}),(0,n.kt)("div",m({parentName:"div"},{className:"admonition-heading"}),(0,n.kt)("h5",{parentName:"div"},(0,n.kt)("span",m({parentName:"h5"},{className:"admonition-icon"}),(0,n.kt)("svg",m({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),(0,n.kt)("path",m({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),(0,n.kt)("div",m({parentName:"div"},{className:"admonition-content"}),(0,n.kt)("p",{parentName:"div"},"Rimbu provides one unordered immutable map implementation, being ",(0,n.kt)("inlineCode",{parentName:"p"},"HashMap"),", and two ordered immutable maps, being ",(0,n.kt)("inlineCode",{parentName:"p"},"SortedMap")," and ",(0,n.kt)("inlineCode",{parentName:"p"},"OrderedMap")))),(0,n.kt)("h2",m({},{id:"hashmap"}),"HashMap"),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"HashMap")," uses a ",(0,n.kt)("inlineCode",{parentName:"p"},"Hasher")," instance to convert values and objects into numbers that can be used to effeciently organize items within the collection. This results in the values being 'unordered', that is, iterating over the collection will not necessarily return the values in insertion order."),(0,n.kt)("h2",m({},{id:"sortedmap"}),"SortedMap"),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"SortedMap")," uses a ",(0,n.kt)("inlineCode",{parentName:"p"},"Comp")," instance that can compare two elements and return a number indicating whether they are equal or which one is 'larger'. The ",(0,n.kt)("inlineCode",{parentName:"p"},"Sortedap")," uses this method to keep the elements in sorted order, so that iteration will always return the elements in sorted order as well."),(0,n.kt)("h2",m({},{id:"orderedmap"}),"OrderedMap"),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"OrderedMap")," maintains an extra ",(0,n.kt)("inlineCode",{parentName:"p"},"List")," or the inserted keys in insertion order. At the cost of extra memory usage for the List, the ",(0,n.kt)("inlineCode",{parentName:"p"},"OrderedMap")," will return entries in the insertion order when iterating over its values."),(0,n.kt)("h2",m({},{id:"exports"}),"Exports"),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"@rimbu/core")," package exports the following ",(0,n.kt)("em",{parentName:"p"},"abstract")," Map TypeScript types:"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("a",m({parentName:"td"},{href:"/api/rimbu/collection-types/map/VariantMap/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"VariantMap<K, V>"))),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"a type-variant map with entries of key type K and value type V")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("a",m({parentName:"td"},{href:"/api/rimbu/collection-types/map/RMap/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"RMap<K, V>"))),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"a generic map with entries of key type K and value type V")))),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"@rimbu/core")," package exports the following ",(0,n.kt)("em",{parentName:"p"},"concrete")," Map TypeScript types:"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("a",m({parentName:"td"},{href:"/api/rimbu/hashed/map/HashMap/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"HashMap<K, V>"))),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"a map with entries of key type K and value type V, where keys are hashed with a ",(0,n.kt)("inlineCode",{parentName:"td"},"Hasher"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("a",m({parentName:"td"},{href:"/api/rimbu/sorted/SortedMap/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"SortedMap<K, V>"))),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"a map with entries of key type K and value type V, where keys are sorted with a ",(0,n.kt)("inlineCode",{parentName:"td"},"Comp"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),(0,n.kt)("a",m({parentName:"td"},{href:"/api/rimbu/ordered/OrderedMap/namespace"}),(0,n.kt)("inlineCode",{parentName:"a"},"OrderedMap<K, V>"))),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"a map with entries of key type K and value type V, where key insertion order is maintained")))),(0,n.kt)("h2",m({},{id:"inheritance"}),"Inheritance"),(0,n.kt)(r.G,{contents:"\ninterface Streamable<[K, V]>;\n\ninterface VariantMap<K, V>;\nabstract RMap<K, V>;\nclass HashMap<K, V>;\nclass SortedMap<K, V>;\n\nStreamable <|.. VariantMap;\nVariantMap <|-- RMap;\nRMap <|-- HashMap;\nRMap <|-- SortedMap;\n",mdxType:"UmlGraph"}),(0,n.kt)("h2",m({},{id:"usage"}),"Usage"),(0,n.kt)("h3",m({},{id:"creation"}),"Creation"),(0,n.kt)(i.r,{path:"map/create.ts",mdxType:"SandBox"}),(0,n.kt)("h3",m({},{id:"query"}),"Query"),(0,n.kt)(i.r,{path:"map/query.ts",mdxType:"SandBox"}),(0,n.kt)("h3",m({},{id:"builder"}),"Builder"),(0,n.kt)(i.r,{path:"map/build.ts",mdxType:"SandBox"}))}g.isMDXComponent=!0}}]);