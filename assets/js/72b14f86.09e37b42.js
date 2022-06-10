"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[14374],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return s}});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var m=r.createContext({}),p=function(e){var t=r.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(m.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,m=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),d=p(n),s=a,b=d["".concat(m,".").concat(s)]||d[s]||u[s]||o;return n?r.createElement(b,l(l({ref:t},c),{},{components:n})):r.createElement(b,l({ref:t},c))}));function s(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,l=new Array(o);l[0]=d;var i={};for(var m in t)hasOwnProperty.call(t,m)&&(i[m]=t[m]);i.originalType=e,i.mdxType="string"==typeof e?e:a,l[1]=i;for(var p=2;p<o;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},42133:function(e,t,n){n.r(t),n.d(t,{assets:function(){return y},contentTitle:function(){return s},default:function(){return k},frontMatter:function(){return d},metadata:function(){return b},toc:function(){return f}});var r=n(3905),a=Object.defineProperty,o=Object.defineProperties,l=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,m=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))m.call(t,n)&&c(e,n,t[n]);if(i)for(var n of i(t))p.call(t,n)&&c(e,n,t[n]);return e};const d={title:"SortedTableSortedColumn.NonEmpty<R,C,V>",slug:"/rimbu/table/SortedTableSortedColumn/NonEmpty/interface"},s="interface SortedTableSortedColumn.NonEmpty<R,C,V>",b={unversionedId:"rimbu_table/SortedTableSortedColumn/NonEmpty.interface",id:"rimbu_table/SortedTableSortedColumn/NonEmpty.interface",title:"SortedTableSortedColumn.NonEmpty<R,C,V>",description:"A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V. In the Table, a combination of a row and column key has exactly one value. See the Table documentation and the SortedTableSortedColumn API documentation",source:"@site/api/rimbu_table/SortedTableSortedColumn/NonEmpty.interface.mdx",sourceDirName:"rimbu_table/SortedTableSortedColumn",slug:"/rimbu/table/SortedTableSortedColumn/NonEmpty/interface",permalink:"/api/rimbu/table/SortedTableSortedColumn/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"SortedTableSortedColumn.NonEmpty<R,C,V>",slug:"/rimbu/table/SortedTableSortedColumn/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"SortedTableSortedColumn.Context<UR,UC>",permalink:"/api/rimbu/table/SortedTableSortedColumn/Context/interface"},next:{title:"SortedTableSortedColumn.Types",permalink:"/api/rimbu/table/SortedTableSortedColumn/Types/interface"}},y={},f=[{value:"Type parameters",id:"type-parameters",level:3}],v={toc:f};function k(e){var t,n=e,{components:a}=n,c=((e,t)=>{var n={};for(var r in e)m.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&i)for(var r of i(e))t.indexOf(r)<0&&p.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=u(u({},v),c),o(t,l({components:a,mdxType:"MDXLayout"}))),(0,r.kt)("h1",u({},{id:"interface-sortedtablesortedcolumnnonemptyrcv"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface SortedTableSortedColumn.NonEmpty<R,C,V>")),(0,r.kt)("p",null,"A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V. In the Table, a combination of a row and column key has exactly one value. See the ",(0,r.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/docs/collections/table"}),"Table documentation")," and the ",(0,r.kt)("a",u({parentName:"p"},{href:"https://rimbu.org/api/rimbu/table/sorted-row/SortedTableSortedColumn/interface"}),"SortedTableSortedColumn API documentation"),"  "),(0,r.kt)("h3",u({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"R"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"the row key type")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"C"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"the column key type")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"V"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"the value type")))),(0,r.kt)("div",u({},{className:"admonition admonition-note alert alert--secondary"}),(0,r.kt)("div",u({parentName:"div"},{className:"admonition-heading"}),(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",u({parentName:"h5"},{className:"admonition-icon"}),(0,r.kt)("svg",u({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),(0,r.kt)("path",u({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),(0,r.kt)("div",u({parentName:"div"},{className:"admonition-content"}),(0,r.kt)("ul",{parentName:"div"},(0,r.kt)("li",{parentName:"ul"},"The SortedTableSortedColumn uses a SortedMap to map row keys to column. - The SortedTableSortedColumn uses SortedMaps to map column keys to values.")))),(0,r.kt)("div",u({},{className:"admonition admonition-note alert alert--secondary"}),(0,r.kt)("div",u({parentName:"div"},{className:"admonition-heading"}),(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",u({parentName:"h5"},{className:"admonition-icon"}),(0,r.kt)("svg",u({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),(0,r.kt)("path",u({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"example")),(0,r.kt)("div",u({parentName:"div"},{className:"admonition-content"}),(0,r.kt)("pre",{parentName:"div"},(0,r.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const t1 = SortedTableSortedColumn.empty<number, string, boolean>()\nconst t2 = SortedTableSortedColumn.of([1, 'a', true], [2, 'a', false])\n")))))}k.isMDXComponent=!0}}]);