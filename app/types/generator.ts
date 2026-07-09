// Shared domain types for the JSON Model Generator.

/** A selectable target language and its generation-style options. */
export interface LanguageOption {
  id: string
  name: string
  options: GenerationStyleOption[]
}

/** A single generation style (e.g. Interface, DTO, Entity) for a language. */
export interface GenerationStyleOption {
  id: string
  name: string
}

/** Inferred primitive/complex type produced by the JSON parser. */
export type InferredType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'uuid'
  | 'color'
  | 'object'
  | 'array'
  | 'null'
