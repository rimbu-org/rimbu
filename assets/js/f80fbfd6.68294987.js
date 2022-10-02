"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[68985],{3905:(e,t,i)=>{i.d(t,{Zo:()=>h,kt:()=>u});var n=i(67294);function a(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function o(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function s(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?o(Object(i),!0).forEach((function(t){a(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):o(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function l(e,t){if(null==e)return{};var i,n,a=function(e,t){if(null==e)return{};var i,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)i=o[n],t.indexOf(i)>=0||(a[i]=e[i]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)i=o[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(a[i]=e[i])}return a}var r=n.createContext({}),c=function(e){var t=n.useContext(r),i=t;return e&&(i="function"==typeof e?e(t):s(s({},t),e)),i},h=function(e){var t=c(e.components);return n.createElement(r.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var i=e.components,a=e.mdxType,o=e.originalType,r=e.parentName,h=l(e,["components","mdxType","originalType","parentName"]),m=c(i),u=a,p=m["".concat(r,".").concat(u)]||m[u]||d[u]||o;return i?n.createElement(p,s(s({ref:t},h),{},{components:i})):n.createElement(p,s({ref:t},h))}));function u(e,t){var i=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=i.length,s=new Array(o);s[0]=m;var l={};for(var r in t)hasOwnProperty.call(t,r)&&(l[r]=t[r]);l.originalType=e,l.mdxType="string"==typeof e?e:a,s[1]=l;for(var c=2;c<o;c++)s[c]=i[c];return n.createElement.apply(null,s)}return n.createElement.apply(null,i)}m.displayName="MDXCreateElement"},85465:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>f,contentTitle:()=>u,default:()=>k,frontMatter:()=>m,metadata:()=>p,toc:()=>b});var n=i(3905),a=Object.defineProperty,o=Object.defineProperties,s=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,r=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,h=(e,t,i)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,d=(e,t)=>{for(var i in t||(t={}))r.call(t,i)&&h(e,i,t[i]);if(l)for(var i of l(t))c.call(t,i)&&h(e,i,t[i]);return e};const m={id:"advanced-list",slug:"./list",title:"List Advanced topics"},u=void 0,p={unversionedId:"advanced/advanced-list",id:"advanced/advanced-list",title:"List Advanced topics",description:"Implementation details",source:"@site/docs/advanced/list-advanced.mdx",sourceDirName:"advanced",slug:"/advanced/list",permalink:"/docs/advanced/list",draft:!1,editUrl:"https://github.com/rimbu-org/rimbu/edit/master/website/docs/advanced/list-advanced.mdx",tags:[],version:"current",frontMatter:{id:"advanced-list",slug:"./list",title:"List Advanced topics"},sidebar:"sidebar",previous:{title:"Collections in-depth",permalink:"/docs/advanced/in-depth"}},f={},b=[{value:"Implementation details",id:"implementation-details",level:2},{value:"Underlying structure",id:"underlying-structure",level:2},{value:"Block size",id:"block-size",level:3},{value:"Structure",id:"structure",level:3},{value:"Concatenation",id:"concatenation",level:3},{value:"Reversal",id:"reversal",level:3},{value:"Efficiency",id:"efficiency",level:2},{value:"Complexity",id:"complexity",level:3}],v={toc:b};function k(e){var t,i=e,{components:a}=i,h=((e,t)=>{var i={};for(var n in e)r.call(e,n)&&t.indexOf(n)<0&&(i[n]=e[n]);if(null!=e&&l)for(var n of l(e))t.indexOf(n)<0&&c.call(e,n)&&(i[n]=e[n]);return i})(i,["components"]);return(0,n.kt)("wrapper",(t=d(d({},v),h),o(t,s({components:a,mdxType:"MDXLayout"}))),(0,n.kt)("h2",d({},{id:"implementation-details"}),"Implementation details"),(0,n.kt)("p",null,"The Rimbu Immutable List structure is implemented in TypeScript as a block-based structure, similar to Vectors in Scala and Clojure. However the implementation differs radically in many ways from any known existing List/Vector implementation. One requirement for the Rimbu List was to allow for random insertion and deletion, which the other Vector implementations do not allow. There are other implementations (see below) that do allow insertion and deletion, however the Rimbu List uses a different approach."),(0,n.kt)("p",null,"To key to efficient insertion and deletion is to have efficient splits and concatenation. These should both be of complexity O(log(N)) for large N. When this is the case, it follows that insertion and deletion are also O(log(N)), since they can be represented as combinations of splits and concatenations. For example, imagine a List with elements (0, 1, 2, 3, 4, 5) (this is not a good example for O(log(N)) since N here is very small, but it serves as an example). We want to insert values (10, 11) at index 2. This can be done as follows:"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"Split the list at index 2: (0, 1), (2, 3, 4, 5)"),(0,n.kt)("li",{parentName:"ol"},"Concatenate the first part with the values to insert: (0, 1) + (10, 11) => (0, 1, 10, 11)"),(0,n.kt)("li",{parentName:"ol"},"Concatenate the result with the last part from 1: (0, 1, 10, 11) + (2, 3, 4, 5) => (0, 1, 10, 11, 2, 3, 4, 5)")),(0,n.kt)("p",null,"In total this takes 3 times O(log(N)), which is still O(log(N))."),(0,n.kt)("p",null,"Similarly, we can remove 2 values at index 2 from the same List (0, 1, 2, 3, 4, 5) as follows:"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"Split the list at index 2: (0, 1), (2, 3, 4, 5)"),(0,n.kt)("li",{parentName:"ol"},"Split the second list at index 2: (2, 3), (4, 5)"),(0,n.kt)("li",{parentName:"ol"},"Concatenate the first list from 1 with the second list from 2: (0, 1) + (4, 5) => (0, 1, 4, 5)")),(0,n.kt)("p",null,"Again, this takes 3 times O(log(N)), which is still O(log(N))."),(0,n.kt)("h2",d({},{id:"underlying-structure"}),"Underlying structure"),(0,n.kt)("h3",d({},{id:"block-size"}),"Block size"),(0,n.kt)("p",null,"As mentioned, a List is based on blocks of size S = 2^B where B >= 2. However, where default Scala and Clojure Vectors require all blocks to be exactly S = 2^B size, the List relaxes this requirement to be ((2^B) / 2) < S <= 2^B. Some more advanced implementations of Vectors also have such a relaxation to allow for more flexibility. Without this flexibility, it is not possible to concatenate in O(log(N)), since it may require shifting all elements in a Vector to make the blocks well aligned with another Vector."),(0,n.kt)("h3",d({},{id:"structure"}),"Structure"),(0,n.kt)("p",null,"Another difference with existing Vectors is the way blocks are connected and navigated to find elements at a certain index. A common Vector has one entry block, which contains information about its sub-blocks. Each sub-block again has information about its sub-blocks, until a leaf is reached which contains the element to be retrieved. This makes all operations relatively constant in access time: O(log(N)). Some implementations use 'caching' strategies to make successive access to values in the same block quicker."),(0,n.kt)("p",null,"The Rimbu List has a different strategy. At the entry level, is has pointers to 3 blocks: The first leaf block, the last leaf block, and a middle section. The middle section is a recursive List of Lists. More on that later. The consequence is that the first and last blocks are always immediately accessible: O(1). Often List-like structures are used mostly to append or prepend values and to look at the first and last values. The List is therefore very suitable for such cases."),(0,n.kt)("p",null,"Then about the middle section. As mentioned, this is a List of Lists. Meaning, that again, it has references to three parts: the first block of sub-lists, the last block of sub-lists, and a middle section again containing a List of sub-lists (and so forth). Because the first and last blocks now contain blocks instead of elements, finding a specific element requires finding the corresponding sub-list in the first or last block, and then retrieving the element in that sub-list. The consequence is that, while elements at the start or end of the list are accessed very quickly, elements at the middle of the collection take longer to retrieve (for a large collection or small block size), but still O(log(N))."),(0,n.kt)("h3",d({},{id:"concatenation"}),"Concatenation"),(0,n.kt)("p",null,"The nice thing about this structure is that splitting and concatenation become nice recursive features. In the case of a split, this involves finding the leaf block containing the split, splitting that leaf block, and setting the remainder of the block as the new top-level end block. The sub-block that used to point to the leaf block is split to no longer include the elements from the selected leaf block. The remained is concatenated with the middle section. This happens recursively. Since the amount of nesting levels of the tree is O(log(N)), it follows that the process of splitting is O(log(N))."),(0,n.kt)("p",null,"A similar process happens for concatenation. For List A and B to be concatenated, the last block of A and first block of B are concatenated. The resulting block is then appended to the middle section of List A, and the middle section of B is then concatenated. Again, this happens recursively for each level, resulting in O(log(N)) for concatenation."),(0,n.kt)("h3",d({},{id:"reversal"}),"Reversal"),(0,n.kt)("p",null,"Each block in a List can be reversed without copying the underlying data. Basically, each block has a boolean indicating whether the block elements should be read from left to right, or right to left. To reverse a block, the pointer to the elements remains the same, but the new block has an inverted boolean. Therefore, to reverse an entire List, each block needs to flip its switch. There are approx. log(N) blocks in a List, therefore reversing a List has complexity O(log(N))."),(0,n.kt)("p",null,"A List can have mixed reversed and non-reversed blocks, which is necessary to keep the same performance when concatenating a non-reversed and a reversed List. In such a case, at most some elements will need to be copied since within a block all elements need to have the same direction. But other blocks can be kept as is."),(0,n.kt)("h2",d({},{id:"efficiency"}),"Efficiency"),(0,n.kt)("h3",d({},{id:"complexity"}),"Complexity"),(0,n.kt)("p",null,"The nature of the List data structure is such that retrieving random elements has complexity O(logB(N)), where N is the length of the collection, and B is the block size. While not bad, this is still slow compared to an Array, which has constant access time (O(1))."),(0,n.kt)("p",null,"However, knowing the characteristics of the List implementation can help circumventing this drawback."),(0,n.kt)("p",null,"Firstly, retrieval time in a List depends on the index within the List. At both the start and the end of the List, the complexity is O(1). The complexity increases to a maximum of O(logB(N)) towards the middle of the List. The consequence is that, for large Lists, it takes more time to retrieve an element towards the middle of a list than at the start or end."),(0,n.kt)("p",null,"Secondly, the List makes it easy to retrieve subparts using ",(0,n.kt)("inlineCode",{parentName:"p"},".slice")," or ",(0,n.kt)("inlineCode",{parentName:"p"},".streamRange"),". Imagine we have a List of 10,000 elements. We have some algorithm that averages 10 consecutive values of the list at some index. The worst thing we can do is write a for-loop that performs ",(0,n.kt)("inlineCode",{parentName:"p"},"List.get(i)")," 10 times, because it will take 10 times O(logB(10000))."),(0,n.kt)("p",null,"A better idea would be to use the ",(0,n.kt)("inlineCode",{parentName:"p"},".slice")," or ",(0,n.kt)("inlineCode",{parentName:"p"},".streamRange")," methods. Both only take one time the O(logB(10000)) and then allow nearly constant time access to the subsequent values."),(0,n.kt)("p",null,"The same holds for many other methods, like ",(0,n.kt)("inlineCode",{parentName:"p"},".forEach")))}k.isMDXComponent=!0}}]);