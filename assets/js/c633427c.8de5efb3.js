"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[97132],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>h});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),s=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=s(n),m=r,h=d["".concat(p,".").concat(m)]||d[m]||u[m]||o;return n?a.createElement(h,i(i({ref:t},c),{},{components:n})):a.createElement(h,i({ref:t},c))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=m;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[d]="string"==typeof e?e:r,i[1]=l;for(var s=2;s<o;s++)i[s]=n[s];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},88508:(e,t,n)=>{n.d(t,{r:()=>h});var a=n(67294),r=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,p=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,d=(e,t)=>{for(var n in t||(t={}))p.call(t,n)&&c(e,n,t[n]);if(l)for(var n of l(t))s.call(t,n)&&c(e,n,t[n]);return e},u=(e,t)=>o(e,i(t));const m={previewwindow:"console",view:"split",editorsize:"60",codemirror:"1",moduleview:"1"};function h(e){const t=function(e){let t="",n="";for(const a in e)t+=`${n}${a}=${e[a]}`,n="&";return""===t?"":`?${t}`}(u(d({},m),{module:`/src/${e.path}`})),n=`https://codesandbox.io/embed/github/vitoke/rimbu-sandbox/tree/main${t}`,r=`https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main${t}`;return a.createElement(a.Fragment,null,a.createElement("a",{target:"_blank",className:"button button--secondary",href:r,style:{marginBottom:10}},"Open file below in new window with full type-check"),a.createElement("iframe",{src:n,className:"codesandbox-iframe",sandbox:"allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"}))}},19722:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>v,contentTitle:()=>f,default:()=>O,frontMatter:()=>b,metadata:()=>y,toc:()=>k});var a=n(3905),r=n(88508),o=Object.defineProperty,i=Object.defineProperties,l=Object.getOwnPropertyDescriptors,p=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,d=(e,t,n)=>t in e?o(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,u=(e,t)=>{for(var n in t||(t={}))s.call(t,n)&&d(e,n,t[n]);if(p)for(var n of p(t))c.call(t,n)&&d(e,n,t[n]);return e},m=(e,t)=>i(e,l(t)),h=(e,t)=>{var n={};for(var a in e)s.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&p)for(var a of p(e))t.indexOf(a)<0&&c.call(e,a)&&(n[a]=e[a]);return n};const b={id:"deep-path",slug:"./path",title:"Deep Path"},f=void 0,y={unversionedId:"deep/deep-path",id:"deep/deep-path",title:"Deep Path",description:"Overview",source:"@site/docs/deep/path.mdx",sourceDirName:"deep",slug:"/deep/path",permalink:"/docs/deep/path",draft:!1,editUrl:"https://github.com/rimbu-org/rimbu/edit/master/website/docs/deep/path.mdx",tags:[],version:"current",frontMatter:{id:"deep-path",slug:"./path",title:"Deep Path"},sidebar:"sidebar",previous:{title:"Deep Patch",permalink:"/docs/deep/patch"},next:{title:"Protected",permalink:"/docs/deep/protected"}},v={},k=[{value:"Overview",id:"overview",level:2},{value:"Example sandbox",id:"example-sandbox",level:3},{value:"Details of the <code>Path</code> types.",id:"details-of-the-path-types",level:2},{value:"Read-only paths, <code>Path.Get&lt;T&gt;</code>",id:"read-only-paths-pathgett",level:3},{value:"Writable paths, <code>Path.Set&lt;T&gt;</code>",id:"writable-paths-pathsett",level:3}],g={toc:k},w="wrapper";function O(e){var t=e,{components:n}=t,o=h(t,["components"]);return(0,a.kt)(w,m(u(u({},g),o),{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h2",u({},{id:"overview"}),"Overview"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Path")," is a function to easily retrieve and update a possibly nested property in an (immutable) object in TypeScript.\nAs shown in the ",(0,a.kt)("inlineCode",{parentName:"p"},"Patch")," documentation, it can be quite hard to update an immutable object without helpers.\nThat ",(0,a.kt)("inlineCode",{parentName:"p"},"Path")," object allows you to specify the location of a nested property using a string:"),(0,a.kt)("pre",null,(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"import { Deep } from '@rimbu/core';\n\nconst person = {\n  name: 'Bart',\n  address: {\n    street: 'Evergreen Terrace',\n    number: 742,\n  },\n};\n\n// set the address number to 760\nconst updatedPerson1 = Deep.patchAt(person, 'address.number', 760);\n\n// get the person street\n// usually not very useful, but has its use cases\nconst street = Deep.getAt(person, 'address.street');\n")),(0,a.kt)("h3",u({},{id:"example-sandbox"}),"Example sandbox"),(0,a.kt)("p",null,"The following CodeSandbox shows more examples of how to use the ",(0,a.kt)("inlineCode",{parentName:"p"},"Path")," object:"),(0,a.kt)(r.r,{path:"deep/path.ts",mdxType:"SandBox"}),(0,a.kt)("h2",u({},{id:"details-of-the-path-types"}),"Details of the ",(0,a.kt)("inlineCode",{parentName:"h2"},"Path")," types."),(0,a.kt)("p",null,"Paths into values can be of two types: ",(0,a.kt)("strong",{parentName:"p"},"read-only")," or ",(0,a.kt)("strong",{parentName:"p"},"writable"),". Read-only paths are\nused in methods like ",(0,a.kt)("inlineCode",{parentName:"p"},"Deep.getAt")," to retrieve values in objects. In this case, optional\nchaining is allowed, so that undefined is returned if any value in the path is null or undefined."),(0,a.kt)("p",null,"Writable paths are used in methods like ",(0,a.kt)("inlineCode",{parentName:"p"},"Deep.patchAt"),". Here the value needs to be read, but also updated\nback into the result object. Having optional chaining would complicate the behavior of such methods. For\nthis reason, optional chaining is not allowed for these methods."),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"Path.Result")," type determines the result of applying a specific string path to a given value."),(0,a.kt)("p",null,"Paths have a similar format to normal TypeScript chaining:"),(0,a.kt)("pre",null,(0,a.kt)("code",u({parentName:"pre"},{className:"language-ts"}),"const v = {\n  a: [1, 2],\n  b: {\n    c: { d: true } as { d: boolean } | null,\n  },\n};\n\n// equivalent\nconst r1 = v.a[0];\nconst r2 = Deep.getAt(v, 'a[0]');\n\n// equivalent\nconst r3 = v.b.c?.d;\nconst r4 = Deep.getAt(v, 'b.c?.d');\n")),(0,a.kt)("h3",u({},{id:"read-only-paths-pathgett"}),"Read-only paths, ",(0,a.kt)("inlineCode",{parentName:"h3"},"Path.Get<T>")),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"Path.Get")," type represents a read-only path supporting optional chaining."),(0,a.kt)("p",null,"This includes:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"simple property access, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: { b: 2 } }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a.b"')),(0,a.kt)("li",{parentName:"ul"},"simple array access, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: [1, 2] }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a[0]"')),(0,a.kt)("li",{parentName:"ul"},"simple tuple access, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: [1, { b: 3 }] as [number, { b: number }] }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a[1].b"')),(0,a.kt)("li",{parentName:"ul"},"optional array nested content access, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: [{ b: 1 }] as { b: number}[] }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a[0]?.b"')),(0,a.kt)("li",{parentName:"ul"},"optional property chaining, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: null as { b: number} | null }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a?.b"'))),(0,a.kt)("h3",u({},{id:"writable-paths-pathsett"}),"Writable paths, ",(0,a.kt)("inlineCode",{parentName:"h3"},"Path.Set<T>")),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"Path.Set")," type represents a writable path into values, which are\nmore limited than read-only paths."),(0,a.kt)("p",null,"Writable paths support:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"simple property access, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: { b: 2 } }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a.b"')),(0,a.kt)("li",{parentName:"ul"},"simple array access, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: [1, 2] }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a[0]"')),(0,a.kt)("li",{parentName:"ul"},"simple tuple access, e.g. for ",(0,a.kt)("inlineCode",{parentName:"li"},"{ a: [1, { b: 3 }] as [number, { b: number }] }")," -> ",(0,a.kt)("inlineCode",{parentName:"li"},'"a[1].b"'))))}O.isMDXComponent=!0}}]);