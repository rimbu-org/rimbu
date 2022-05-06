import { SortedMap } from '@rimbu/sorted/map/index.ts';
import { ArrowGraphHashed } from '@rimbu/graph/mod.ts';

import { DocBlock, DocComment } from '~/json-model/index.ts';

type Mapped<T> = SortedMap.Builder<string, T>;

interface Base<K extends string> {
  kind: K;
  name: string;
}

export interface Model {
  packages: Mapped<Package>;
  items: Mapped<Class | Interface>;
  roots: Set<string>;
  namespaces: Mapped<Namespace>;
  inheritance: ArrowGraphHashed.Builder<string>;
  slugs: Mapped<string>;
}

export interface Package extends Base<'package'> {
  slug: string;
  namespace: Namespace;
  id: string;
  name: string;
  rootPackage: string;
  subPackage?: string;
}

export interface Namespace extends Base<'namespace'> {
  canonicalReference: string;
  slug: string;
  description: string;
  docBlocks: DocBlock[];
  namespaces: Mapped<Namespace>;
  interfaces: Mapped<Interface>;
  classes: Mapped<Class>;
  functions: Mapped<Function>;
  methods: Mapped<Method>;
  variables: Mapped<Variable>;
  types: Mapped<TypeAlias>;
  companion?: Interface | TypeAlias;
}

export type InterfaceOrClass = Interface | Class;

export interface Interface extends Base<'interface'> {
  nameWithParams: string;
  canonicalReference: string;
  slug: string;
  description: string;
  typeParameters: TypeParam[];
  docBlocks: DocBlock[];
  properties: Mapped<Property>;
  methods: Mapped<Method>;
  extends: Set<Interface | string>;
  implementedBy: Set<InterfaceOrClass>;
  companion?: Namespace;
}

export interface Class extends Base<'class'> {
  nameWithParams: string;
  canonicalReference: string;
  slug: string;
  description: string;
  typeParameters: TypeParam[];
  docBlocks: DocBlock[];
  properties: Mapped<Property>;
  methods: Mapped<Method>;
  implements: Set<Interface | string>;
  extends?: Class | string;
  extendedBy: Set<Class>;
  isAbstract: boolean;
}

export interface Overload {
  typeParams: TypeParam[];
  params: Param[];
  codeTokens: () => string;
}

export interface Method extends Base<'method'> {
  doc: DocComment;
  ownerName: string;
  isAbstract: boolean;
  sources: Method[];
  link: string;
  overloads: Overload[];
}

export interface Property extends Base<'property'> {
  description: string;
  ownerName: string;
  docBlocks: DocBlock[];
  isAbstract: boolean;
  sources: Property[];
  codeTokens: () => string;
  link: string;
}

export interface Function extends Base<'function'> {
  description: string;
  docBlocks: DocBlock[];
  typeParams: TypeParam[];
  params: Param[];
  returnType: () => string;
  codeTokens: () => string;
}

export interface Variable extends Base<'variable'> {
  canonicalReference: string;
  slug: string;
  description: string;
  docBlocks: DocBlock[];
  typeRef: string | undefined;
  codeTokens: () => string;
}

export interface TypeAlias extends Base<'typealias'> {
  nameWithParams: string;
  canonicalReference: string;
  slug: string;
  description: string;
  docBlocks: DocBlock[];
  codeTokens: () => string;
  companion?: Namespace;
}

export interface TypeParam extends Base<'typeparam'> {
  description: string;
  definition: string;
  constraint?: () => string;
  defaultType?: () => string;
}

export interface Param extends Base<'param'> {
  description: string;
  type: () => string;
}
