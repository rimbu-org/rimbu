import type {
  ApiItem,
  Excerpt,
  ExcerptToken,
  ExcerptTokenRange,
  ParameterOptions,
  TypeParameterOptions,
} from './index.ts';

export interface BaseItem {
  canonicalReference: string;
}

export interface BaseDocumentedItem extends BaseItem {
  docComment?: string;
}

export interface BaseDeclaredItem extends BaseDocumentedItem {
  excerptTokens: ExcerptToken[];
}

export interface BasePropertyItem
  extends HasName,
    CanBeOptional,
    BaseDeclaredItem {
  propertyTypeTokenRange: ExcerptTokenRange;
}

export interface HasParamaterList {
  overloadIndex: number;
  parameters: ParameterOptions[];
}

export interface HasTypeParameterList {
  typeParameters?: TypeParameterOptions[];
}

export interface HasReturnType {
  returnTypeExcerpt: Excerpt;
}

export interface HasItemContainer {
  members: ApiItem[];
}

export interface HasName {
  name: string;
}

export interface CanBeStatic {
  isStatic: boolean;
}

export interface CanBeOptional {
  isOptional: boolean;
}
