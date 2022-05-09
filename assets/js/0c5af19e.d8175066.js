"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[54358],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return d}});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),u=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),s=u(n),d=a,f=s["".concat(p,".").concat(d)]||s[d]||m[d]||i;return n?r.createElement(f,o(o({ref:t},c),{},{components:n})):r.createElement(f,o({ref:t},c))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=s;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},94813:function(e,t,n){n.r(t),n.d(t,{assets:function(){return g},contentTitle:function(){return d},default:function(){return y},frontMatter:function(){return s},metadata:function(){return f},toc:function(){return b}});var r=n(3905),a=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,m=(e,t)=>{for(var n in t||(t={}))p.call(t,n)&&c(e,n,t[n]);if(l)for(var n of l(t))u.call(t,n)&&c(e,n,t[n]);return e};const s={title:"Range_2 (namespace)",slug:"/rimbu/common/Range_2/namespace"},d="namespace Range_2",f={unversionedId:"rimbu_common/Range_2/index",id:"rimbu_common/Range_2/index",title:"Range_2 (namespace)",description:"A range definition for any type of (orderable) value. If a start or end is defined, a tuple can be used where the second item is a boolean indicating whether that end is inclusive (true) or exclusive (false).",source:"@site/api/rimbu_common/Range_2/index.mdx",sourceDirName:"rimbu_common/Range_2",slug:"/rimbu/common/Range_2/namespace",permalink:"/api/rimbu/common/Range_2/namespace",draft:!1,tags:[],version:"current",frontMatter:{title:"Range_2 (namespace)",slug:"/rimbu/common/Range_2/namespace"}},g={},b=[{value:"Functions",id:"functions",level:2},{value:"<code>getNormalizedRange</code>",id:"getnormalizedrange",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters",level:3},{value:"Parameters",id:"parameters",level:4}],k={toc:b};function y(e){var t,n=e,{components:a}=n,c=((e,t)=>{var n={};for(var r in e)p.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&l)for(var r of l(e))t.indexOf(r)<0&&u.call(e,r)&&(n[r]=e[r]);return n})(n,["components"]);return(0,r.kt)("wrapper",(t=m(m({},k),c),i(t,o({components:a,mdxType:"MDXLayout"}))),(0,r.kt)("h1",m({},{id:"namespace-range_2"}),(0,r.kt)("inlineCode",{parentName:"h1"},"namespace Range_2")),(0,r.kt)("p",null,"A range definition for any type of (orderable) value. If a start or end is defined, a tuple can be used where the second item is a boolean indicating whether that end is inclusive (true) or exclusive (false).\nA Range of type T can have one of the following forms:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"{ end: T }"),(0,r.kt)("li",{parentName:"ul"},"{ end: ","[T, boolean]"," }"),(0,r.kt)("li",{parentName:"ul"},"{ start: T }"),(0,r.kt)("li",{parentName:"ul"},"{ start: T, end: T }"),(0,r.kt)("li",{parentName:"ul"},"{ start: T, end: ","[T, boolean]"," }"),(0,r.kt)("li",{parentName:"ul"},"{ start: ","[T, boolean]"," }"),(0,r.kt)("li",{parentName:"ul"},"{ start: ","[T, boolean]",", end: T }"),(0,r.kt)("li",{parentName:"ul"},"{ start: ","[T, boolean]",", end: ","[T, boolean]"," }")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Companion type:")," ",(0,r.kt)("a",m({parentName:"p"},{href:"/api/rimbu/common/Range_2/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"Range_2<T>"))),(0,r.kt)("h2",m({},{id:"functions"}),"Functions"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",m({},{id:"getnormalizedrange"}),(0,r.kt)("inlineCode",{parentName:"h3"},"getNormalizedRange")),(0,r.kt)("p",null,"Simplifies a given ",(0,r.kt)("inlineCode",{parentName:"p"},"range")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Range")," input for easier processing, by returning optional start and end ranges including whether they are inclusive or exclusive")),(0,r.kt)("h4",m({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"function getNormalizedRange<T>(range: Range<T>): {"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"start?: [T, boolean];"),(0,r.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"end?: [T, boolean];"),(0,r.kt)("br",null),"\xa0","\xa0",(0,r.kt)("inlineCode",{parentName:"p"},"};"))),(0,r.kt)("h3",m({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),"T"),(0,r.kt)("td",m({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",m({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",m({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"range")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"Range<T>")),(0,r.kt)("td",m({parentName:"tr"},{align:null}),"the ",(0,r.kt)("inlineCode",{parentName:"td"},"Range")," to use"))))))}y.isMDXComponent=!0}}]);