"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[97751],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>u});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),l=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},s=function(e){var t=l(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),c=l(r),u=a,h=c["".concat(p,".").concat(u)]||c[u]||m[u]||o;return r?n.createElement(h,i(i({ref:t},s),{},{components:r})):n.createElement(h,i({ref:t},s))}));function u(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=c;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d.mdxType="string"==typeof e?e:a,i[1]=d;for(var l=2;l<o;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},55958:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>f,contentTitle:()=>u,default:()=>b,frontMatter:()=>c,metadata:()=>h,toc:()=>y});var n=r(3905),a=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,d=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,m=(e,t)=>{for(var r in t||(t={}))p.call(t,r)&&s(e,r,t[r]);if(d)for(var r of d(t))l.call(t,r)&&s(e,r,t[r]);return e};const c={title:"OrderedHashSet.NonEmpty<T>",slug:"/rimbu/ordered/OrderedHashSet/NonEmpty/interface"},u="interface OrderedHashSet.NonEmpty<T>",h={unversionedId:"rimbu_ordered/OrderedHashSet/NonEmpty.interface",id:"rimbu_ordered/OrderedHashSet/NonEmpty.interface",title:"OrderedHashSet.NonEmpty<T>",description:"A non-empty type-invariant immutable Ordered HashSet of value type T. In the Set, there are no duplicate values. See the Set documentation and the OrderedHashSet API documentation",source:"@site/api/rimbu_ordered/OrderedHashSet/NonEmpty.interface.mdx",sourceDirName:"rimbu_ordered/OrderedHashSet",slug:"/rimbu/ordered/OrderedHashSet/NonEmpty/interface",permalink:"/api/rimbu/ordered/OrderedHashSet/NonEmpty/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"OrderedHashSet.NonEmpty<T>",slug:"/rimbu/ordered/OrderedHashSet/NonEmpty/interface"},sidebar:"defaultSidebar",previous:{title:"OrderedHashSet.Context<UT>",permalink:"/api/rimbu/ordered/OrderedHashSet/Context/interface"},next:{title:"OrderedHashSet.Types",permalink:"/api/rimbu/ordered/OrderedHashSet/Types/interface"}},f={},y=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>stream</code>",id:"stream",level:3},{value:"Definition",id:"definition",level:4}],O={toc:y};function b(e){var t,r=e,{components:a}=r,s=((e,t)=>{var r={};for(var n in e)p.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&d)for(var n of d(e))t.indexOf(n)<0&&l.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=m(m({},O),s),o(t,i({components:a,mdxType:"MDXLayout"}))),(0,n.kt)("h1",m({},{id:"interface-orderedhashsetnonemptyt"}),(0,n.kt)("inlineCode",{parentName:"h1"},"interface OrderedHashSet.NonEmpty<T>")),(0,n.kt)("p",null,"A non-empty type-invariant immutable Ordered HashSet of value type T. In the Set, there are no duplicate values. See the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/docs/collections/set"}),"Set documentation")," and the ",(0,n.kt)("a",m({parentName:"p"},{href:"https://rimbu.org/api/rimbu/ordered/set/OrderedHashSet/interface"}),"OrderedHashSet API documentation")),(0,n.kt)("h2",m({},{id:"type-parameters"}),"Type parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,n.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,n.kt)("td",m({parentName:"tr"},{align:null}),"the value type")))),(0,n.kt)("admonition",m({},{title:"note",type:"note"}),(0,n.kt)("ul",{parentName:"admonition"},(0,n.kt)("li",{parentName:"ul"},"The OrderedHashSet keeps the insertion order of values, thus iterators and stream will also reflect this order. - The OrderedHashSet wraps around a HashSet instance, thus has the same time complexity as the HashSet. - The OrderedHashSet keeps the key insertion order in a List, thus its space complexity is higher than a regular HashSet."))),(0,n.kt)("admonition",m({},{title:"example",type:"note"}),(0,n.kt)("pre",{parentName:"admonition"},(0,n.kt)("code",m({parentName:"pre"},{className:"language-ts"}),"const s1 = OrderedHashSet.empty<string>()\nconst s2 = OrderedHashSet.of('a', 'b', 'c')\n"))),(0,n.kt)("h2",m({},{id:"methods"}),"Methods"),(0,n.kt)("details",null,(0,n.kt)("summary",null,(0,n.kt)("h3",m({},{id:"stream"}),(0,n.kt)("inlineCode",{parentName:"h3"},"stream")),(0,n.kt)("p",null,"undocumented")),(0,n.kt)("h4",m({},{id:"definition"}),"Definition"),(0,n.kt)("code",null,(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"stream(): "),(0,n.kt)("a",m({parentName:"p"},{href:"/api/rimbu/stream/Stream/NonEmpty/interface"}),(0,n.kt)("inlineCode",{parentName:"a"},"Stream.NonEmpty")),(0,n.kt)("inlineCode",{parentName:"p"},"<T>;")))))}b.isMDXComponent=!0}}]);