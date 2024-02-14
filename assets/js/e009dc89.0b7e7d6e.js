"use strict";(self.webpackChunkrimbu_docs=self.webpackChunkrimbu_docs||[]).push([[93803],{3905:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>c});var a=t(67294);function l(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){l(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,a,l=function(e,n){if(null==e)return{};var t,a,l={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(l[t]=e[t]);return l}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(l[t]=e[t])}return l}var d=a.createContext({}),p=function(e){var n=a.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},u=function(e){var n=p(e.components);return a.createElement(d.Provider,{value:n},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},k=a.forwardRef((function(e,n){var t=e.components,l=e.mdxType,r=e.originalType,d=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),s=p(t),k=l,c=s["".concat(d,".").concat(k)]||s[k]||m[k]||r;return t?a.createElement(c,i(i({ref:n},u),{},{components:t})):a.createElement(c,i({ref:n},u))}));function c(e,n){var t=arguments,l=n&&n.mdxType;if("string"==typeof e||l){var r=t.length,i=new Array(r);i[0]=k;var o={};for(var d in n)hasOwnProperty.call(n,d)&&(o[d]=n[d]);o.originalType=e,o[s]="string"==typeof e?e:l,i[1]=o;for(var p=2;p<r;p++)i[p]=t[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,t)}k.displayName="MDXCreateElement"},84505:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>b,contentTitle:()=>h,default:()=>g,frontMatter:()=>c,metadata:()=>f,toc:()=>N});var a=t(3905),l=Object.defineProperty,r=Object.defineProperties,i=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,d=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,u=(e,n,t)=>n in e?l(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t,s=(e,n)=>{for(var t in n||(n={}))d.call(n,t)&&u(e,t,n[t]);if(o)for(var t of o(n))p.call(n,t)&&u(e,t,n[t]);return e},m=(e,n)=>r(e,i(n)),k=(e,n)=>{var t={};for(var a in e)d.call(e,a)&&n.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&o)for(var a of o(e))n.indexOf(a)<0&&p.call(e,a)&&(t[a]=e[a]);return t};const c={title:"Channel<T>",slug:"/rimbu/channel/Channel/interface"},h="interface Channel<T>",f={unversionedId:"rimbu_channel/Channel.interface",id:"rimbu_channel/Channel.interface",title:"Channel<T>",description:"A Rimbu Channel offers various ways to synchronize communication between asynchronous processes. These processes can send and receive messages in a blocking way. Channel messages are of type T, and channels can be buffered or unbuffered. A buffered channel can queue a given amount of messages before blocking the sender.",source:"@site/api/rimbu_channel/Channel.interface.mdx",sourceDirName:"rimbu_channel",slug:"/rimbu/channel/Channel/interface",permalink:"/api/rimbu/channel/Channel/interface",draft:!1,tags:[],version:"current",frontMatter:{title:"Channel<T>",slug:"/rimbu/channel/Channel/interface"},sidebar:"defaultSidebar",previous:{title:"Channel.Write<T>",permalink:"/api/rimbu/channel/Channel/Write/interface"},next:{title:"ChannelError (namespace)",permalink:"/api/rimbu/channel/ChannelError/namespace"}},b={},N=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"<code>capacity</code>",id:"capacity",level:3},{value:"Definition",id:"definition",level:4},{value:"Overrides",id:"overrides",level:4},{value:"<code>isClosed</code>",id:"isclosed",level:3},{value:"Definition",id:"definition-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"<code>isExhausted</code>",id:"isexhausted",level:3},{value:"Definition",id:"definition-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"<code>length</code>",id:"length",level:3},{value:"Definition",id:"definition-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Methods",id:"methods",level:2},{value:"<code>asyncStream</code>",id:"asyncstream",level:3},{value:"Definition",id:"definition-4",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"<code>close</code>",id:"close",level:3},{value:"Definition",id:"definition-5",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"<code>readable</code>",id:"readable",level:3},{value:"Definition",id:"definition-6",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"<code>receive</code>",id:"receive",level:3},{value:"Definitions",id:"definitions",level:4},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"<code>send</code>",id:"send",level:3},{value:"Definitions",id:"definitions-1",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Overrides",id:"overrides-8",level:4},{value:"<code>sendAll</code>",id:"sendall",level:3},{value:"Definitions",id:"definitions-2",level:4},{value:"Parameters",id:"parameters-2",level:4},{value:"Overrides",id:"overrides-9",level:4},{value:"<code>writable</code>",id:"writable",level:3},{value:"Definition",id:"definition-7",level:4},{value:"Overrides",id:"overrides-10",level:4}],C={toc:N},v="wrapper";function g(e){var n=e,{components:t}=n,l=k(n,["components"]);return(0,a.kt)(v,m(s(s({},C),l),{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",s({},{id:"interface-channelt"}),(0,a.kt)("inlineCode",{parentName:"h1"},"interface Channel<T>")),(0,a.kt)("p",null,"A Rimbu Channel offers various ways to synchronize communication between asynchronous processes. These processes can send and receive messages in a blocking way. Channel messages are of type T, and channels can be buffered or unbuffered. A buffered channel can queue a given amount of messages before blocking the sender."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Companion namespace:")," ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/namespace"}),"Channel")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Extends:")," ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Write/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Write<T>")),", ",(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Read/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Read<T>"))),(0,a.kt)("h2",s({},{id:"type-parameters"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Default"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"T"),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"void")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the channel message type")))),(0,a.kt)("h2",s({},{id:"properties"}),"Properties"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"capacity"}),(0,a.kt)("inlineCode",{parentName:"h3"},"capacity")),(0,a.kt)("p",null,"The maximum amount of messages the Channel can buffer. If 0, the channel is unbuffered and the communication is synchronous.")),(0,a.kt)("h4",s({},{id:"definition"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get capacity(): number;"))),(0,a.kt)("h4",s({},{id:"overrides"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Read/interface#capacity"}),"Read.capacity"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"isclosed"}),(0,a.kt)("inlineCode",{parentName:"h3"},"isClosed")),(0,a.kt)("p",null,"Returns true if the Channel is closed.")),(0,a.kt)("h4",s({},{id:"definition-1"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get isClosed(): boolean;"))),(0,a.kt)("h4",s({},{id:"overrides-1"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Write/interface#isClosed"}),"Write.isClosed"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"isexhausted"}),(0,a.kt)("inlineCode",{parentName:"h3"},"isExhausted")),(0,a.kt)("p",null,"Returns true if the channel is closed and there are no message in the buffer (length = 0), false otherwise.")),(0,a.kt)("h4",s({},{id:"definition-2"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get isExhausted(): boolean;"))),(0,a.kt)("h4",s({},{id:"overrides-2"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Read/interface#isExhausted"}),"Read.isExhausted"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"length"}),(0,a.kt)("inlineCode",{parentName:"h3"},"length")),(0,a.kt)("p",null,"The amount of messages currently in the read buffer.")),(0,a.kt)("h4",s({},{id:"definition-3"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"get length(): number;"))),(0,a.kt)("h4",s({},{id:"overrides-3"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Read/interface#length"}),"Read.length"))),(0,a.kt)("h2",s({},{id:"methods"}),"Methods"),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"asyncstream"}),(0,a.kt)("inlineCode",{parentName:"h3"},"asyncStream")),(0,a.kt)("p",null,"Returns an asynchronous stream of values.")),(0,a.kt)("h4",s({},{id:"definition-4"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"asyncStream(): "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncStream/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"AsyncStream")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,a.kt)("h4",s({},{id:"overrides-4"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncStreamable/interface#asyncStream"}),"AsyncStreamable.asyncStream"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"close"}),(0,a.kt)("inlineCode",{parentName:"h3"},"close")),(0,a.kt)("p",null,"Closes the channel. After a close, further send actions will throw.")),(0,a.kt)("h4",s({},{id:"definition-5"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"close(): void;"))),(0,a.kt)("h4",s({},{id:"overrides-5"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Write/interface#close"}),"Write.close"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"readable"}),(0,a.kt)("inlineCode",{parentName:"h3"},"readable")),(0,a.kt)("p",null,"Returns the Channel as a readonly Channel.Read instance.")),(0,a.kt)("h4",s({},{id:"definition-6"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"readable(): "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Read/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Read")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,a.kt)("h4",s({},{id:"overrides-6"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Read/interface#readable"}),"Read.readable"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"receive"}),(0,a.kt)("inlineCode",{parentName:"h3"},"receive")),(0,a.kt)("p",null,"Returns the next message sent to the Channel. Blocks if there are no messages.")),(0,a.kt)("h4",s({},{id:"definitions"}),"Definitions"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"receive<RT>(options: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"recover: (channelError: "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Error/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Error")),(0,a.kt)("inlineCode",{parentName:"p"},") => RT;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): Promise<T "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," RT>;"))),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"receive(options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"recover?: undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): Promise<T>;"))),(0,a.kt)("h4",s({},{id:"type-parameters-1"}),"Type parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),"RT"),(0,a.kt)("td",s({parentName:"tr"},{align:null}))))),(0,a.kt)("h4",s({},{id:"parameters"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"recover: (channelError: "),(0,a.kt)("a",s({parentName:"td"},{href:"/api/rimbu/channel/Channel/Error/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Error")),(0,a.kt)("inlineCode",{parentName:"td"},") => RT;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"(optional) the options to receive a message",(0,a.kt)("br",null)," - signal: (optional) an abort signal to cancel receiving",(0,a.kt)("br",null)," - timeoutMs: (optional) amount of milliseconds to wait for received message",(0,a.kt)("br",null)," - recover: (optional) a function that can be supplied to recover from a channel error")))),(0,a.kt)("h4",s({},{id:"overrides-7"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Read/interface#receive"}),"Read.receive"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"send"}),(0,a.kt)("inlineCode",{parentName:"h3"},"send")),(0,a.kt)("p",null,"Send the given ",(0,a.kt)("inlineCode",{parentName:"p"},"value")," message to the Channel. Blocks if the Channel is already at maximum capacity.")),(0,a.kt)("h4",s({},{id:"definitions-1"}),"Definitions"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"send(value: T, options: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"catchChannelErrors?: false "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): Promise<void>;"))),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"send(value: T, options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"catchChannelErrors: boolean;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): Promise<undefined "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Error/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Error")),(0,a.kt)("inlineCode",{parentName:"p"},">;"))),(0,a.kt)("h4",s({},{id:"parameters-1"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"value")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"T")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the message to send to the channel")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"catchChannelErrors?: false "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"(optional) the message send options",(0,a.kt)("br",null)," - signal: (optional) an abort signal to cancel sending",(0,a.kt)("br",null)," - timeoutMs: (optional) amount of milliseconds to wait for being able to send message",(0,a.kt)("br",null)," - recover: (optional) a function that can be supplied to recover from a channel error")))),(0,a.kt)("h4",s({},{id:"overrides-8"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Write/interface#send"}),"Write.send"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"sendall"}),(0,a.kt)("inlineCode",{parentName:"h3"},"sendAll")),(0,a.kt)("p",null,"Sequentially send all the values in the given ",(0,a.kt)("inlineCode",{parentName:"p"},"source")," to the channel. Blocks until all the values are sent.")),(0,a.kt)("h4",s({},{id:"definitions-2"}),"Definitions"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"sendAll(source: "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncStreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"AsyncStreamSource")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>, options: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"catchChannelErrors?: false "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): Promise<void>;"))),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"sendAll(source: "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/stream/async/AsyncStreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"AsyncStreamSource")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>, options?: {"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"catchChannelErrors: boolean;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"p"},"}): Promise<undefined "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"p"}," "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Error/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Error")),(0,a.kt)("inlineCode",{parentName:"p"},">;"))),(0,a.kt)("h4",s({},{id:"parameters-2"}),"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Name"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Type"),(0,a.kt)("th",s({parentName:"tr"},{align:null}),"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"source")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("a",s({parentName:"td"},{href:"/api/rimbu/stream/async/AsyncStreamSource/type"}),(0,a.kt)("inlineCode",{parentName:"a"},"AsyncStreamSource")),(0,a.kt)("inlineCode",{parentName:"td"},"<T>")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"a stream source containing the values to send")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"options")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),(0,a.kt)("inlineCode",{parentName:"td"},"{"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"signal?: AbortSignal "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"timeoutMs?: number "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"catchChannelErrors?: false "),(0,a.kt)("code",null,"|"),(0,a.kt)("inlineCode",{parentName:"td"}," undefined;"),(0,a.kt)("br",null),"\xa0","\xa0","\xa0","\xa0",(0,a.kt)("inlineCode",{parentName:"td"},"}")),(0,a.kt)("td",s({parentName:"tr"},{align:null}),"the message send options",(0,a.kt)("br",null)," - signal: (optional) an abort signal to cancel sending",(0,a.kt)("br",null)," - timeoutMs: (optional) amount of milliseconds to wait for being able to send message, for each separate message in the source",(0,a.kt)("br",null)," - recover: (optional) a function that can be supplied to recover from a channel error")))),(0,a.kt)("h4",s({},{id:"overrides-9"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Write/interface#sendAll"}),"Write.sendAll"))),(0,a.kt)("details",null,(0,a.kt)("summary",null,(0,a.kt)("h3",s({},{id:"writable"}),(0,a.kt)("inlineCode",{parentName:"h3"},"writable")),(0,a.kt)("p",null,"Returns the Channel as a write-only Channel.Write instance.")),(0,a.kt)("h4",s({},{id:"definition-7"}),"Definition"),(0,a.kt)("code",null,(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"writable(): "),(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Write/interface"}),(0,a.kt)("inlineCode",{parentName:"a"},"Channel.Write")),(0,a.kt)("inlineCode",{parentName:"p"},"<T>;"))),(0,a.kt)("h4",s({},{id:"overrides-10"}),"Overrides"),(0,a.kt)("p",null,(0,a.kt)("a",s({parentName:"p"},{href:"/api/rimbu/channel/Channel/Write/interface#writable"}),"Write.writable"))))}g.isMDXComponent=!0}}]);