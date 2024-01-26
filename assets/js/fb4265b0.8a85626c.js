"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[3790],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>k});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),l=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},m=function(e){var t=l(e.components);return r.createElement(s.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),u=l(a),d=n,k=u["".concat(s,".").concat(d)]||u[d]||c[d]||i;return a?r.createElement(k,o(o({ref:t},m),{},{components:a})):r.createElement(k,o({ref:t},m))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,o=new Array(i);o[0]=d;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p[u]="string"==typeof e?e:n,o[1]=p;for(var l=2;l<i;l++)o[l]=a[l];return r.createElement.apply(null,o)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},67434:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>T,frontMatter:()=>k,metadata:()=>N,toc:()=>I});var r=a(3905),n=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,m=(e,t,a)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))s.call(t,a)&&m(e,a,t[a]);if(p)for(var a of p(t))l.call(t,a)&&m(e,a,t[a]);return e},c=(e,t)=>i(e,o(t)),d=(e,t)=>{var a={};for(var r in e)s.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&p)for(var r of p(e))t.indexOf(r)<0&&l.call(e,r)&&(a[r]=e[r]);return a};const k={title:"FastIteratorBase<T>",slug:"/rimbu/stream/custom/FastIteratorBase/class"},f="abstract class FastIteratorBase<T>",N={unversionedId:"rimbu_stream/custom/FastIteratorBase.class",id:"rimbu_stream/custom/FastIteratorBase.class",title:"FastIteratorBase<T>",description:"A base class for FastIterator instances, that takes implements the default next function based on the abstract fastNext function.",source:"@site/api/rimbu_stream/custom/FastIteratorBase.class.mdx",sourceDirName:"rimbu_stream/custom",slug:"/rimbu/stream/custom/FastIteratorBase/class",permalink:"/api/rimbu/stream/custom/FastIteratorBase/class",draft:!1,tags:[],version:"current",frontMatter:{title:"FastIteratorBase<T>",slug:"/rimbu/stream/custom/FastIteratorBase/class"},sidebar:"defaultSidebar",previous:{title:"DropWhileIterator<T>",permalink:"/api/rimbu/stream/custom/DropWhileIterator/class"},next:{title:"FilterApplyIterator<T,A>",permalink:"/api/rimbu/stream/custom/FilterApplyIterator/class"}},b={},I=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Methods",id:"methods",level:2},{value:"<code>fastNext</code>",id:"fastnext",level:3},{value:"Definition",id:"definition",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"<code>next</code>",id:"next",level:3},{value:"Definition",id:"definition-1",level:4}],h={toc:I},y="wrapper";function T(e){var t=e,{components:a}=t,n=d(t,["components"]);return(0,r.kt)(y,c(u(u({},h),n),{components:a,mdxType:"MDXLayout"}),(0,r.kt)("h1",u({},{id:"abstract-class-fastiteratorbaset"}),(0,r.kt)("inlineCode",{parentName:"h1"},"abstract class FastIteratorBase<T>")),(0,r.kt)("p",null,"A base class for ",(0,r.kt)("inlineCode",{parentName:"p"},"FastIterator")," instances, that takes implements the default ",(0,r.kt)("inlineCode",{parentName:"p"},"next")," function based on the abstract ",(0,r.kt)("inlineCode",{parentName:"p"},"fastNext")," function."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Extended by:")," ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/ArrayReverseIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"ArrayReverseIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/RandomIntIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"RandomIntIterator")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/SplitWhereIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"SplitWhereIterator<T,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/PrependIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"PrependIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/IndexedIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"IndexedIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/MapApplyIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"MapApplyIterator<T,A,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/FilterApplyIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"FilterApplyIterator<T,A>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/MapIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"MapIterator<T,T2>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/IndicesOfIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"IndicesOfIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/RangeDownIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"RangeDownIterator")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/IndicesWhereIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"IndicesWhereIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/DropWhileIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"DropWhileIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/ReduceIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"ReduceIterator<I,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/SplitOnSeqIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"SplitOnSeqIterator<T,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/ZipWithIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"ZipWithIterator<I,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/TakeIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"TakeIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/CollectIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"CollectIterator<T,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/TakeWhileIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"TakeWhileIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/AlwaysIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"AlwaysIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/DropIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"DropIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/FilterPureIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"FilterPureIterator<T,A>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/WindowIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"WindowIterator<T,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/DistinctPreviousIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"DistinctPreviousIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/ZipAllWithItererator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"ZipAllWithItererator<I,F,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/MapPureIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"MapPureIterator<T,A,T2>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/ConcatIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"ConcatIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/RangeUpIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"RangeUpIterator")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/FilterIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"FilterIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/IntersperseIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"IntersperseIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/ArrayIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"ArrayIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/SplitOnIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"SplitOnIterator<T,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/AppendIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"AppendIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/UnfoldIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"UnfoldIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/ReduceAllIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"ReduceAllIterator<I,R>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/RepeatIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"RepeatIterator<T>")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/RandomIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"RandomIterator")),", ",(0,r.kt)("a",u({parentName:"p"},{href:"/api/rimbu/stream/custom/FlatMapIterator/class"}),(0,r.kt)("inlineCode",{parentName:"a"},"FlatMapIterator<T,T2>"))),(0,r.kt)("h2",u({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"T"),(0,r.kt)("td",u({parentName:"tr"},{align:null}),"undocumented")))),(0,r.kt)("h2",u({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"fastnext"}),(0,r.kt)("inlineCode",{parentName:"h3"},"fastNext")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"abstract fastNext<O>(otherwise?: OptLazy<O>): T "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," O;"))),(0,r.kt)("h4",u({},{id:"type-parameters-1"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),"O"),(0,r.kt)("td",u({parentName:"tr"},{align:null}))))),(0,r.kt)("h4",u({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",u({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"otherwise")),(0,r.kt)("td",u({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"OptLazy<O>")),(0,r.kt)("td",u({parentName:"tr"},{align:null})))))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",u({},{id:"next"}),(0,r.kt)("inlineCode",{parentName:"h3"},"next")),(0,r.kt)("p",null,"undocumented")),(0,r.kt)("h4",u({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"next(): IteratorResult<T>;")))))}T.isMDXComponent=!0}}]);