"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[72576],{3905:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return u}});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),l=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=l(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,c=d(e,["components","mdxType","originalType","parentName"]),s=l(r),u=a,f=s["".concat(p,".").concat(u)]||s[u]||m[u]||o;return r?n.createElement(f,i(i({ref:t},c),{},{components:r})):n.createElement(f,i({ref:t},c))}));function u(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=s;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d.mdxType="string"==typeof e?e:a,i[1]=d;for(var l=2;l<o;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},66365:function(e,t,r){r.r(t),r.d(t,{assets:function(){return y},contentTitle:function(){return u},default:function(){return S},frontMatter:function(){return s},metadata:function(){return f},toc:function(){return h}});var n=r(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,d=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&c(e,r,t[r]);if(d)for(var r of d(t))l.call(t,r)&&c(e,r,t[r]);return e};const s={title:"OrderedSortedSet.NonEmpty<T>",slug:"/rimbu/ordered/OrderedSortedSet/NonEmpty/interface"},u="interface OrderedSortedSet.NonEmpty<T>",f={unversionedId:"rimbu_ordered/OrderedSortedSet/NonEmpty.interface",id:"rimbu_ordered/OrderedSortedSet/NonEmpty.interface",title:"OrderedSortedSet.NonEmpty<T>",description:"A non-empty type-invariant immutable Ordered SortedSet of value type T. In the Set, there are no duplicate values. See the Set documentation and the OrderedSortedSet API documentation",source:"@site/api/rimbu_ordered/OrderedSortedSet/NonEmpty.interface.mdx",sourceDirName:"rimbu_ordered/OrderedSortedSet",slug:"/rimbu/ordered/OrderedSortedSet/NonEmpty/interface",permalink:"/api/rimbu/ordered/OrderedSortedSet/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedSortedSet.NonEmpty<T>",slug:"/rimbu/ordered/OrderedSortedSet/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedSortedSet.Context<UT>",permalink:"/api/rimbu/ordered/OrderedSortedSet/Context/interface"},next:{title:"OrderedSortedSet.Types",permalink:"/api/rimbu/ordered/OrderedSortedSet/Types/interface"}},y={},h=[{value:"Type parameters",id:"type-parameters",level:3},{value:"Methods",id:"methods",level:2},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition",level:4}],v={toc:h};function S(e){var t,r=e,{components:a}=r,c=((e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&d)for(var n of d(e))t.indexOf(n)<0&&l.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=m(m({},v),c),o(t,i({components:a,mdxType:"MDXLayout"}))),(0,n.kt)("h1",m({},{id:"interface-orderedsortedsetnonemptyt"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface OrderedSortedSet.NonEmpty<T>")),(0,n.kt)("p",null,"A non-empty type-invariant immutable Ordered SortedSet of value type T. In the Set, there are no duplicate values. See the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedSortedSet/interface"}),"OrderedSortedSet API documentation")),(0,n.kt)("h3",m({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))),(0,n.kt)("div",m({},{className:"admonition admonition-note alert alert--secondary"}),(0,n.kt)("div",m({parentName:"div"},{className:"admonition-heading"}),(0,n.kt)("h5",{parentName:"div"},(0,n.kt)("span",m({parentName:"h5"},{className:"admonition-icon"}),(0,n.kt)("svg",m({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),(0,n.kt)("path",m({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),(0,n.kt)("div",m({parentName:"div"},{className:"admonition-content"}),(0,n.kt)("ul",{parentName:"div"},(0,n.kt)("li",{parentName:"ul"},"The OrderedSortedSet keeps the insertion order of values, thus iterators and stream will also reflect this order. - The OrderedSortedSet wraps around a SortedSet instance, thus has the same time complexity as the SortedSet. - The OrderedSortedSet keeps the key insertion order in a List, thus its space complexity is higher than a regular SortedSet.")))),(0,n.kt)("div",m({},{className:"admonition admonition-note alert alert--secondary"}),(0,n.kt)("div",m({parentName:"div"},{className:"admonition-heading"}),(0,n.kt)("h5",{parentName:"div"},(0,n.kt)("span",m({parentName:"h5"},{className:"admonition-icon"}),(0,n.kt)("svg",m({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),(0,n.kt)("path",m({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"example")),(0,n.kt)("div",m({parentName:"div"},{className:"admonition-content"}),(0,n.kt)("pre",{parentName:"div"},(0,n.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"const s1 = OrderedSortedSet.empty<string>()\nconst s2 = OrderedSortedSet.of('a', 'b', 'c')\n")))),(0,n.kt)("h2",m({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"stream"}),(0,n.kt)("inlineCode",{parentName:"h3"},"stream")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"stream(): "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/Stream/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"Stream.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;")))))}S.isMDXComponent=!0}}]);