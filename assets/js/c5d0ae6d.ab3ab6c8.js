"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[87040],{3905:function(e,t,r){r.d(t,{Zo:function(){return s},kt:function(){return d}});var n=r(67294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},s=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),f=p(r),d=o,m=f["".concat(l,".").concat(d)]||f[d]||u[d]||i;return r?n.createElement(m,a(a({ref:t},s),{},{components:r})):n.createElement(m,a({ref:t},s))}));function d(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=r.length,a=new Array(i);a[0]=f;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:o,a[1]=c;for(var p=2;p<i;p++)a[p]=r[p];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},51695:function(e,t,r){r.r(t),r.d(t,{assets:function(){return h},contentTitle:function(){return d},default:function(){return y},frontMatter:function(){return f},metadata:function(){return m},toc:function(){return b}});var n=r(3905),o=Object.defineProperty,i=Object.defineProperties,a=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,s=(e,t,r)=>t in e?o(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,u=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&s(e,r,t[r]);if(c)for(var r of c(t))p.call(t,r)&&s(e,r,t[r]);return e};const f={id:"overview",slug:"./overview",title:"Overview",sidebar_position:1},d=void 0,m={unversionedId:"deep/overview",id:"deep/overview",title:"Overview",description:"Aside from collections, Rimbu also offers tools to handle plain JS/TypeScript objects as immutable objects. These tools do not actually add functionality or change those plain objects, but use the compiler's type checking to offer protection against modifying data in objects.",source:"@site/docs/deep/overview.mdx",sourceDirName:"deep",slug:"/deep/overview",permalink:"/docs/deep/overview",draft:!1,editUrl:"https://github.com/rimbu-org/rimbu/edit/master/website/docs/deep/overview.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{id:"overview",slug:"./overview",title:"Overview",sidebar_position:1},sidebar:"sidebar",previous:{title:"Table",permalink:"/docs/collections/table"},next:{title:"Deep Match",permalink:"/docs/deep/match"}},h={},b=[{value:"Protected",id:"protected",level:2},{value:"Patch",id:"patch",level:2},{value:"Match",id:"match",level:2},{value:"Path",id:"path",level:2},{value:"Tuple",id:"tuple",level:2}],v={toc:b};function y(e){var t,r=e,{components:o}=r,s=((e,t)=>{var r={};for(var n in e)l.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&c)for(var n of c(e))t.indexOf(n)<0&&p.call(e,n)&&(r[n]=e[n]);return r})(r,["components"]);return(0,n.kt)("wrapper",(t=u(u({},v),s),i(t,a({components:o,mdxType:"MDXLayout"}))),(0,n.kt)("p",null,"Aside from collections, Rimbu also offers tools to handle plain JS/TypeScript objects as immutable objects. These tools do not actually add functionality or change those plain objects, but use the compiler's type checking to offer protection against modifying data in objects."),(0,n.kt)("h2",u({},{id:"protected"}),"Protected"),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," function and type cast a plain JS object to an object that, according to its type, is deeply readonly."),(0,n.kt)("p",null,"See ",(0,n.kt)("a",u({parentName:"p"},{href:"./protected"}),"Protected")," for more information."),(0,n.kt)("h2",u({},{id:"patch"}),"Patch"),(0,n.kt)("p",null,"With immutable objects its often desirable to create copies where some properties are modified. The ",(0,n.kt)("inlineCode",{parentName:"p"},"patch")," function offers a convenient way to do this."),(0,n.kt)("p",null,"See ",(0,n.kt)("a",u({parentName:"p"},{href:"./patch"}),"Patch")," for more information."),(0,n.kt)("h2",u({},{id:"match"}),"Match"),(0,n.kt)("p",null,"In a similar fashion to ",(0,n.kt)("inlineCode",{parentName:"p"},"patch"),", the ",(0,n.kt)("inlineCode",{parentName:"p"},"Match")," object offers methods to easily check if data in an object satisfies a number of characteristics."),(0,n.kt)("p",null,"See ",(0,n.kt)("a",u({parentName:"p"},{href:"./match"}),"Match")," for more information."),(0,n.kt)("h2",u({},{id:"path"}),"Path"),(0,n.kt)("p",null,"Sometimes it is convenient to use a string to identify a path within a nested object where a property can be found. The ",(0,n.kt)("inlineCode",{parentName:"p"},"Path")," object offers methods to both patch and get a value from an object using a string path, and accurately type the result."),(0,n.kt)("p",null,"See ",(0,n.kt)("a",u({parentName:"p"},{href:"./path"}),"Path")," for more information."),(0,n.kt)("h2",u({},{id:"tuple"}),"Tuple"),(0,n.kt)("p",null,"Sometimes it is useful to create immutable tuples as data. However, with the TS compiler type inference it is sometimes challenging to get the types right. The ",(0,n.kt)("inlineCode",{parentName:"p"},"Tuple")," constructor helps in this case."),(0,n.kt)("p",null,"See ",(0,n.kt)("a",u({parentName:"p"},{href:"./tuple"}),"Tuple")," for more information."))}y.isMDXComponent=!0}}]);