import type {
  BaseDeclaredItem,
  BaseDocumentedItem,
  BaseItem,
  BasePropertyItem,
  CanBeOptional,
  CanBeStatic,
  ExcerptTokenRange,
  HasItemContainer,
  HasName,
  HasParamaterList,
  HasReturnType,
  HasTypeParameterList,
} from './index.ts';

export interface ApiCallSignature
  extends HasTypeParameterList,
    HasParamaterList,
    HasReturnType,
    BaseDeclaredItem {
  kind: 'CallSignature';
}

export interface ApiClass
  extends BaseDeclaredItem,
    HasItemContainer,
    HasTypeParameterList,
    HasName {
  kind: 'Class';
  extendsTokenRange?: ExcerptTokenRange;
  implementsTokenRanges: ExcerptTokenRange[];
}

export interface ApiConstructor extends HasParamaterList, BaseDeclaredItem {
  kind: 'Constructor';
}

export interface ApiConstructSignature
  extends HasTypeParameterList,
    HasParamaterList,
    HasReturnType,
    BaseDeclaredItem {
  kind: 'ConstructSignature';
}

export interface ApiEntryPoint extends HasItemContainer, HasName, BaseItem {
  kind: 'EntryPoint';
}

export interface ApiEnum extends HasItemContainer, HasName, BaseDeclaredItem {
  kind: 'Enum';
}

export interface ApiEnumMember extends HasName, BaseDeclaredItem {
  kind: 'EnumMember';
  initializerTokenRange: ExcerptTokenRange;
}

export interface ApiFunction
  extends HasName,
    HasTypeParameterList,
    HasParamaterList,
    HasReturnType,
    BaseDeclaredItem {
  kind: 'Function';
}

export interface ApiIndexSignature
  extends HasParamaterList,
    HasReturnType,
    BaseDeclaredItem {
  kind: 'IndexSignature';
}

export interface ApiInterface
  extends HasItemContainer,
    HasName,
    HasTypeParameterList,
    BaseDeclaredItem {
  kind: 'Interface';
  extendsTokenRanges?: ExcerptTokenRange[];
}

export interface ApiMethod
  extends HasName,
    HasTypeParameterList,
    HasParamaterList,
    HasReturnType,
    CanBeStatic,
    CanBeOptional,
    BaseDeclaredItem {
  kind: 'Method';
}

export interface ApiMethodSignature
  extends HasName,
    HasTypeParameterList,
    HasParamaterList,
    HasReturnType,
    CanBeOptional,
    BaseDeclaredItem {
  kind: 'MethodSignature';
}

export interface ApiNamespace
  extends HasItemContainer,
    HasName,
    BaseDeclaredItem {
  kind: 'Namespace';
}

export interface ApiPackage
  extends HasItemContainer,
    HasName,
    BaseDocumentedItem {
  kind: 'Package';
}

export interface ApiProperty extends CanBeStatic, BasePropertyItem {
  kind: 'Property';
}

export interface ApiPropertySignature extends BasePropertyItem {
  kind: 'PropertySignature';
}

export interface ApiTypeAlias
  extends BaseDeclaredItem,
    HasTypeParameterList,
    HasName {
  kind: 'TypeAlias';
  typeTokenRange: ExcerptTokenRange;
}

export interface ApiVariable extends BaseDeclaredItem, HasName {
  kind: 'Variable';
  variableTypeTokenRange: ExcerptTokenRange;
}
// export function convert(apiExtractorJson: ApiExtractorJson) {}

// convert(data);

export type ApiItem =
  | ApiCallSignature
  | ApiClass
  | ApiConstructor
  | ApiConstructSignature
  | ApiEntryPoint
  | ApiEnum
  | ApiEnumMember
  | ApiFunction
  | ApiIndexSignature
  | ApiInterface
  | ApiMethod
  | ApiMethodSignature
  | ApiNamespace
  | ApiPackage
  | ApiProperty
  | ApiPropertySignature
  | ApiTypeAlias
  | ApiVariable;

export type ApiKind = ApiItem['kind'];

export type ApiItemKind<K extends ApiKind> = ApiItem & { kind: K };

// export type ApiItemVisitor = {
//   [K in ApiKind]?: (value: ApiItemKind<K>) => void;
// };
