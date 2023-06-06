"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[27640],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=r.createContext({}),u=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(o.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=u(n),m=a,k=c["".concat(o,".").concat(m)]||c[m]||d[m]||l;return n?r.createElement(k,i(i({ref:t},p),{},{components:n})):r.createElement(k,i({ref:t},p))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,i=new Array(l);i[0]=m;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s[c]="string"==typeof e?e:a,i[1]=s;for(var u=2;u<l;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},15483:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>f,default:()=>N,frontMatter:()=>k,metadata:()=>y,toc:()=>h});var r=n(3905),a=Object.defineProperty,l=Object.defineProperties,i=Object.getOwnPropertyDescriptors,s=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,u=Object.prototype.propertyIsEnumerable,p=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,c=(e,t)=>{for(var n in t||(t={}))o.call(t,n)&&p(e,n,t[n]);if(s)for(var n of s(t))u.call(t,n)&&p(e,n,t[n]);return e},d=(e,t)=>l(e,i(t)),m=(e,t)=>{var n={};for(var r in e)o.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&s)for(var r of s(e))t.indexOf(r)<0&&u.call(e,r)&&(n[r]=e[r]);return n};const k={title:"Spy.ClsMeta<C,A>",slug:"/rimbu/spy/Spy/ClsMeta/interface"},f="interface Spy.ClsMeta<C,A>",y={unversionedId:"rimbu_spy/Spy/ClsMeta.interface",id:"rimbu_spy/Spy/ClsMeta.interface",title:"Spy.ClsMeta<C,A>",description:"The metadata object type for a spied class.",source:"@site/api/rimbu_spy/Spy/ClsMeta.interface.mdx",sourceDirName:"rimbu_spy/Spy",slug:"/rimbu/spy/Spy/ClsMeta/interface",permalink:"/api/rimbu/spy/Spy/ClsMeta/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"Spy.ClsMeta<C,A>",slug:"/rimbu/spy/Spy/ClsMeta/interface"},sidebar:"defaultSidebar",previous:{title:"Cls",permalink:"/api/rimbu/spy/Spy/Cls/type"},next:{title:"ClsObj",permalink:"/api/rimbu/spy/Spy/ClsObj/type"}},b={},h=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>constructorCalls</code>",id:"constructorcalls",level:3},{value:"Definition",id:"definition",level:4},{value:"<code>instances</code>",id:"instances",level:3},{value:"Definition",id:"definition-1",level:4},{value:"<code>nrInstances</code>",id:"nrinstances",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>clearInstances</code>",id:"clearinstances",level:3},{value:"Definition",id:"definition-3",level:4},{value:"<code>resetAllStubs</code>",id:"resetallstubs",level:3},{value:"Definition",id:"definition-4",level:4},{value:"<code>resetConstructorStub</code>",id:"resetconstructorstub",level:3},{value:"Definition",id:"definition-5",level:4},{value:"<code>resetInstanceStubs</code>",id:"resetinstancestubs",level:3},{value:"Definition",id:"definition-6",level:4},{value:"<code>setConstructorStub</code>",id:"setconstructorstub",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Parameters",id:"parameters",level:4}],v={toc:h},C="wrapper";function N(e){var t=e,{components:n}=t,a=m(t,["components"]);return(0,r.kt)(C,d(c(c({},v),a),{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",c({},{id:"interface-spyclsmetaca"}),(0,r.kt)("inlineCode",{parentName:"h1"},"interface Spy.ClsMeta<C,A>")),(0,r.kt)("p",null,"The metadata object type for a spied class."),(0,r.kt)("h2",c({},{id:"type-parameters"}),"Type parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Constraints"),(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),"C"),(0,r.kt)("td",c({parentName:"tr"},{align:null})),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"the class type")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),"A"),(0,r.kt)("td",c({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"any[]")),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"the class constructor parameter array type")))),(0,r.kt)("h2",c({},{id:"properties"}),"Properties"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"constructorcalls"}),(0,r.kt)("inlineCode",{parentName:"h3"},"constructorCalls")),(0,r.kt)("p",null,"Returns an array of received constructor call parameters.")),(0,r.kt)("h4",c({},{id:"definition"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"get constructorCalls(): A[];")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"instances"}),(0,r.kt)("inlineCode",{parentName:"h3"},"instances")),(0,r.kt)("p",null,"Returns an array of class instance metadata objects containing all instances created from the spy class.")),(0,r.kt)("h4",c({},{id:"definition-1"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"get instances(): "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/spy/Spy/ClsObj/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"Spy.ClsObj")),(0,r.kt)("inlineCode",{parentName:"p"},"<C, A>[];")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"nrinstances"}),(0,r.kt)("inlineCode",{parentName:"h3"},"nrInstances")),(0,r.kt)("p",null,"Returns the number of class instances created from the spy.")),(0,r.kt)("h4",c({},{id:"definition-2"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"get nrInstances(): number;")))),(0,r.kt)("h2",c({},{id:"methods"}),"Methods"),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"clearinstances"}),(0,r.kt)("inlineCode",{parentName:"h3"},"clearInstances")),(0,r.kt)("p",null,"Empties the history of created spy class instances.")),(0,r.kt)("h4",c({},{id:"definition-3"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"clearInstances(): void;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"resetallstubs"}),(0,r.kt)("inlineCode",{parentName:"h3"},"resetAllStubs")),(0,r.kt)("p",null,"Resets the current spy class constructor stub and all the instances method stubs.")),(0,r.kt)("h4",c({},{id:"definition-4"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"resetAllStubs(): void;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"resetconstructorstub"}),(0,r.kt)("inlineCode",{parentName:"h3"},"resetConstructorStub")),(0,r.kt)("p",null,"Resets the used constructor to the originally given constructor.")),(0,r.kt)("h4",c({},{id:"definition-5"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"resetConstructorStub(): void;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"resetinstancestubs"}),(0,r.kt)("inlineCode",{parentName:"h3"},"resetInstanceStubs")),(0,r.kt)("p",null,"Resets all the current instance method stubs.")),(0,r.kt)("h4",c({},{id:"definition-6"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"resetInstanceStubs(): void;")))),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("h3",c({},{id:"setconstructorstub"}),(0,r.kt)("inlineCode",{parentName:"h3"},"setConstructorStub")),(0,r.kt)("p",null,"Sets the used constructor stub function for new instances of the spy class.")),(0,r.kt)("h4",c({},{id:"definition-7"}),"Definition"),(0,r.kt)("code",null,(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"setConstructorStub(constructor: "),(0,r.kt)("a",c({parentName:"p"},{href:"/api/rimbu/spy/Func/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"Func")),(0,r.kt)("inlineCode",{parentName:"p"},"<A, C> "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"p"}," undefined): void;"))),(0,r.kt)("h4",c({},{id:"parameters"}),"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Name"),(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Type"),(0,r.kt)("th",c({parentName:"tr"},{align:null}),"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",c({parentName:"tr"},{align:null}),(0,r.kt)("inlineCode",{parentName:"td"},"constructor")),(0,r.kt)("td",c({parentName:"tr"},{align:null}),(0,r.kt)("a",c({parentName:"td"},{href:"/api/rimbu/spy/Func/type"}),(0,r.kt)("inlineCode",{parentName:"a"},"Func")),(0,r.kt)("inlineCode",{parentName:"td"},"<A, C> "),(0,r.kt)("code",null,"|"),(0,r.kt)("inlineCode",{parentName:"td"}," undefined")),(0,r.kt)("td",c({parentName:"tr"},{align:null}),"the function to use as constructor of the class"))))))}N.isMDXComponent=!0}}]);