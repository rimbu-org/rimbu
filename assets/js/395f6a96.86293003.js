"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[21346],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>s});var a=t(67294);function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){n(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function l(e,r){if(null==e)return{};var t,a,n=function(e,r){if(null==e)return{};var t,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||(n[t]=e[t]);return n}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var p=a.createContext({}),m=function(e){var r=a.useContext(p),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},u=function(e){var r=m(e.components);return a.createElement(p.Provider,{value:r},e.children)},c="mdxType",b={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},f=a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,i=e.originalType,p=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=m(t),f=n,s=c["".concat(p,".").concat(f)]||c[f]||b[f]||i;return t?a.createElement(s,o(o({ref:r},u),{},{components:t})):a.createElement(s,o({ref:r},u))}));function s(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var i=t.length,o=new Array(i);o[0]=f;var l={};for(var p in r)hasOwnProperty.call(r,p)&&(l[p]=r[p]);l.originalType=e,l[c]="string"==typeof e?e:n,o[1]=l;for(var m=2;m<i;m++)o[m]=t[m];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}f.displayName="MDXCreateElement"},67537:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>N,contentTitle:()=>d,default:()=>O,frontMatter:()=>s,metadata:()=>k,toc:()=>y});var a=t(3905),n=Object.defineProperty,i=Object.defineProperties,o=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,m=Object.prototype.propertyIsEnumerable,u=(e,r,t)=>r in e?n(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t,c=(e,r)=>{for(var t in r||(r={}))p.call(r,t)&&u(e,t,r[t]);if(l)for(var t of l(r))m.call(r,t)&&u(e,t,r[t]);return e},b=(e,r)=>i(e,o(r)),f=(e,r)=>{var t={};for(var a in e)p.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&l)for(var a of l(e))r.indexOf(a)<0&&m.call(e,a)&&(t[a]=e[a]);return t};const s={title:"@rimbu/core",slug:"/rimbu/core"},d="package @rimbu/core",k={unversionedId:"rimbu_core/index",id:"rimbu_core/index",title:"@rimbu/core",description:"The @rimbu/core package is a convenience package that exports most items from the following packages:",source:"@site/api/rimbu_core/index.mdx",sourceDirName:"rimbu_core",slug:"/rimbu/core",permalink:"/api/rimbu/core",draft:!1,tags:[],version:"current",frontMatter:{title:"@rimbu/core",slug:"/rimbu/core"},sidebar:"defaultSidebar",previous:{title:"Update",permalink:"/api/rimbu/common/Update/type"},next:{title:"@rimbu/deep",permalink:"/api/rimbu/deep"}},N={},y=[],h={toc:y},g="wrapper";function O(e){var r=e,{components:t}=r,n=f(r,["components"]);return(0,a.kt)(g,b(c(c({},h),n),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",c({},{id:"package-rimbucore"}),(0,a.kt)("inlineCode",{parentName:"h1"},"package @rimbu/core")),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"@rimbu/core")," package is a convenience package that exports most items from the following packages:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./bimap"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/bimap"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./bimultimap"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/bimultimap"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./collection-types"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/collection-types"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./common"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/common"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./deep"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/deep"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./graph"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/graph"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./hashed"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/hashed"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./list"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/list"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./multimap"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/multimap"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./multiset"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/multiset"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./ordered"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/ordered"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./proximity"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/proximity"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./sorted"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/sorted"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./stream"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/stream"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",c({parentName:"li"},{href:"./table"}),(0,a.kt)("inlineCode",{parentName:"a"},"@rimbu/table")))))}O.isMDXComponent=!0}}]);