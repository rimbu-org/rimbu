"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[28873],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>b});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var p=r.createContext({}),u=function(e){var t=r.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=u(e.components);return r.createElement(p.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,p=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),s=u(a),b=n,d=s["".concat(p,".").concat(b)]||s[b]||c[b]||o;return a?r.createElement(d,l(l({ref:t},m),{},{components:a})):r.createElement(d,l({ref:t},m))}));function b(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,l=new Array(o);l[0]=s;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i.mdxType="string"==typeof e?e:n,l[1]=i;for(var u=2;u<o;u++)l[u]=a[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}s.displayName="MDXCreateElement"},66572:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>f,contentTitle:()=>b,default:()=>k,frontMatter:()=>s,metadata:()=>d,toc:()=>y});var r=a(3905),n=Object.defineProperty,o=Object.defineProperties,l=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,m=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,c=(e,t)=>{for(var a in t||(t={}))p.call(t,a)&&m(e,a,t[a]);if(i)for(var a of i(t))u.call(t,a)&&m(e,a,t[a]);return e};const s={title:"HashTableSortedColumn<R,C,V>",slug:"/rimbu/table/HashTableSortedColumn/interface"},b="interface HashTableSortedColumn<R,C,V>",d={unversionedId:"rimbu_table/HashTableSortedColumn.interface",id:"rimbu_table/HashTableSortedColumn.interface",title:"HashTableSortedColumn<R,C,V>",description:"A type-invariant immutable Table of row key type R, column key type C, and value type V. In the Table, a combination of a row and column key has exactly one value. See the Table documentation and the HashTableSortedColumn API documentation",source:"@site/api/rimbu_table/HashTableSortedColumn.interface.mdx",sourceDirName:"rimbu_table",slug:"/rimbu/table/HashTableSortedColumn/interface",permalink:"/api/rimbu/table/HashTableSortedColumn/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"HashTableSortedColumn<R,C,V>",slug:"/rimbu/table/HashTableSortedColumn/interface"},sidebar:"defaultSidebar",previous:{title:"HashTableSortedColumn.Types",permalink:"/api/rimbu/table/HashTableSortedColumn/Types/interface"},next:{title:"SortedTableHashColumn (namespace)",permalink:"/api/rimbu/table/SortedTableHashColumn/namespace"}},f={},y=[{value:"Type parameters",id:"type-parameters",level:2}],h={toc:y};function k(e){var t,a=e,{components:n}=a,m=((e,t)=>{var a={};for(var r in e)p.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&i)for(var r of i(e))t.indexOf(r)<0&&u.call(e,r)&&(a[r]=e[r]);return a})(a,["components"]);return(0,r.kt)("wrapper",(t=c(c({},h),m),o(t,l({components:n,mdxType:"MDXLayout"}))),(0,r.kt)("h1",c({},{id:"interface-hashtablesortedcolumnrcv"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface HashTableSortedColumn<R,C,V>")),(0,r.kt)("p",null,"A type-invariant immutable Table of row key type R, column key type C, and value type V. In the Table, a combination of a row and column key has exactly one value. See the ",(0,r.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/docs/collections/table"}),"Table documentation")," and the ",(0,r.kt)("a",c({parentName:"p"},{href:"https://rimbu.org/api/rimbu/table/hash-row/HashTableSortedColumn/interface"}),"HashTableSortedColumn API documentation"),"  "),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/table/HashTableSortedColumn/namespace"}),"HashTableSortedColumn")),(0,r.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),"R"),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"the row key type")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),"C"),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"the column key type")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),"V"),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"the value type")))),(0,r.kt)("admonition",c({},{title:"note",type:"note"}),(0,r.kt)("ul",{parentName:"admonition"},(0,r.kt)("li",{parentName:"ul"},"The HashTableSortedColumn uses a HashMap to map row keys to column. - The HashTableSortedColumn uses SortedMaps to map column keys to values."))),(0,r.kt)("admonition",c({},{title:"example",type:"note"}),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",c({parentName:"pre"},{className:"language-ts"}),"const t1 = HashTableSortedColumn.empty<number, string, boolean>()\nconst t2 = HashTableSortedColumn.of([1, 'a', true], [2, 'a', false])\n"))))}k.isMDXComponent=!0}}]);