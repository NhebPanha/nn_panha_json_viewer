import { ref } from 'vue'

export interface ASTNode {
  key: string
  inferredType: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'color' | 'array' | 'object' | 'union' | 'null' | 'any'
  isNullable: boolean
  isOptional: boolean
  isInteger?: boolean
  children?: ASTNode[]     // Array element type or object properties
  unionTypes?: ASTNode[]   // Member types when inferredType === 'union'
  typeName?: string        // PascalCase inferred name for objects
}

export function toPascalCase(str: string): string {
  if (!str) return 'Root'
  return str
    .replace(/[^a-zA-Z0-9_]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

/**
 * Naive English singularization, QuickType-style, used to name array-element
 * types after their property (e.g. `tags` → `Tag`, `categories` → `Category`).
 */
export function singularize(word: string): string {
  if (!word) return word
  if (/ies$/i.test(word)) return word.replace(/ies$/i, 'y')
  if (/(ses|xes|zes|ches|shes)$/i.test(word)) return word.replace(/es$/i, '')
  if (/ss$/i.test(word)) return word
  if (/s$/i.test(word)) return word.replace(/s$/i, '')
  return word
}

export function cleanKey(key: string): string {
  let k = key.trim()
  while (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'")) ||
    (k.startsWith('\\"') && k.endsWith('\\"')) ||
    (k.startsWith("\\'") && k.endsWith("\\'"))
  ) {
    if (k.startsWith('\\"') && k.endsWith('\\"')) {
      k = k.slice(2, -2)
    } else if (k.startsWith("\\'") && k.endsWith("\\'")) {
      k = k.slice(2, -2)
    } else {
      k = k.slice(1, -1)
    }
    k = k.trim()
  }
  k = k.replace(/\\"/g, '').replace(/\\'/g, '').replace(/"/g, '').replace(/'/g, '')
  return k.trim()
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^0x([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

export function useJsonParser() {
  function inferType(val: any): ASTNode['inferredType'] {
    if (val === null) return 'null'
    if (typeof val === 'string') {
      if (UUID_REGEX.test(val)) return 'uuid'
      if (DATE_REGEX.test(val)) return 'date'
      if (HEX_COLOR_REGEX.test(val)) return 'color'
      return 'string'
    }
    if (typeof val === 'number') return 'number'
    if (typeof val === 'boolean') return 'boolean'
    if (Array.isArray(val)) return 'array'
    if (typeof val === 'object') return 'object'
    return 'any'
  }

  function parseVal(key: string, val: any): ASTNode {
    const cleanK = cleanKey(key)
    const type = inferType(val)
    const node: ASTNode = {
      key: cleanK,
      inferredType: type,
      isNullable: val === null,
      isOptional: false
    }

    if (type === 'number') {
      node.isInteger = Number.isInteger(val)
    }

    if (type === 'object' && val !== null) {
      node.typeName = toPascalCase(key)
      node.children = Object.entries(val).map(([k, v]) => parseVal(k, v))
    } else if (type === 'array' && val !== null) {
      if (val.length === 0) {
        node.children = [{
          key: 'element',
          inferredType: 'any',
          isNullable: false,
          isOptional: false
        }]
      } else {
        // Sample the array elements and merge their shapes into one element type.
        // The element type is named after the singularized property (QuickType style):
        // `tags` → `Tag`, `results` → `Result`.
        const elementNodes = val.map((item: any) => parseVal('element', item))
        const elementTypeName = singularize(toPascalCase(key)) || 'Item'
        const mergedNode = mergeASTNodes(elementNodes, elementTypeName)
        node.children = [mergedNode]
      }
    }

    return node
  }

  function mergeASTNodes(nodes: ASTNode[], fallbackTypeName: string): ASTNode {
    if (nodes.length === 0) {
      return { key: 'element', inferredType: 'any', isNullable: false, isOptional: false }
    }

    // If all are of same simple type, return it
    const types = new Set(nodes.map(n => n.inferredType))
    const isNullable = nodes.some(n => n.isNullable)

    if (types.size === 1) {
      const base = { ...nodes[0], isNullable }
      if (base.inferredType === 'number') {
        base.isInteger = nodes.every(n => n.isInteger)
      }
      if (base.inferredType === 'object') {
        base.typeName = toPascalCase(fallbackTypeName)
        base.children = mergeObjectChildren(nodes.map(n => n.children || []))
      } else if (base.inferredType === 'array') {
        const innerChildren = nodes.map(n => n.children?.[0]).filter(Boolean) as ASTNode[]
        base.children = [mergeASTNodes(innerChildren, fallbackTypeName + 'Inner')]
      }
      return base
    }

    // Resolve Nullable mixed types
    if (types.has('null')) {
      types.delete('null')
      if (types.size === 1) {
        const baseType = Array.from(types)[0]
        const nonNullNodes = nodes.filter(n => n.inferredType !== 'null')
        const merged = mergeASTNodes(nonNullNodes, fallbackTypeName)
        merged.isNullable = true
        return merged
      }
    }

    // Date & String mix -> default to string
    if (types.has('date') && types.has('string')) {
      types.delete('date')
    }
    // UUID & String mix -> default to string
    if (types.has('uuid') && types.has('string')) {
      types.delete('uuid')
    }
    // Color & String mix -> default to string
    if (types.has('color') && types.has('string')) {
      types.delete('color')
    }

    if (types.size === 1) {
      const baseType = Array.from(types)[0]
      const nonNullNodes = nodes.filter(n => n.inferredType !== 'null')
      const merged = mergeASTNodes(nonNullNodes, fallbackTypeName)
      merged.isNullable = isNullable
      return merged
    }

    // Genuinely mixed types -> build a union (QuickType style), grouping and
    // merging each constituent type so object members keep their own shape.
    const nonNullNodes = nodes.filter(n => n.inferredType !== 'null')
    const groups = new Map<string, ASTNode[]>()
    for (const n of nonNullNodes) {
      if (!groups.has(n.inferredType)) groups.set(n.inferredType, [])
      groups.get(n.inferredType)!.push(n)
    }
    const unionTypes = Array.from(groups.entries()).map(([type, group], i) =>
      mergeASTNodes(group, `${fallbackTypeName}${type === 'object' && i > 0 ? i + 1 : ''}`)
    )

    // A single surviving group (plus null) is just a nullable of that type.
    if (unionTypes.length === 1) {
      unionTypes[0].isNullable = isNullable
      return unionTypes[0]
    }

    return {
      key: 'element',
      inferredType: 'union',
      isNullable,
      isOptional: false,
      unionTypes
    }
  }

  function mergeObjectChildren(childrenGroups: ASTNode[][]): ASTNode[] {
    const keysMap = new Map<string, ASTNode[]>()
    for (const group of childrenGroups) {
      for (const node of group) {
        if (!keysMap.has(node.key)) {
          keysMap.set(node.key, [])
        }
        keysMap.get(node.key)!.push(node)
      }
    }

    const mergedChildren: ASTNode[] = []
    const totalGroups = childrenGroups.length

    for (const [key, nodes] of keysMap.entries()) {
      const isOptional = nodes.length < totalGroups
      const isNullable = nodes.some(n => n.isNullable)
      const merged = mergeASTNodes(nodes, toPascalCase(key))
      merged.key = key
      merged.isOptional = isOptional
      merged.isNullable = merged.isNullable || isNullable
      mergedChildren.push(merged)
    }

    return mergedChildren
  }

  // Parse raw JSON into AST
  function parseJson(jsonStr: string): ASTNode | null {
    const trimmed = jsonStr.trim()
    if (!trimmed) return null

    try {
      const parsed = JSON.parse(trimmed)
      return parseVal('root', parsed)
    } catch (e: any) {
      // Only attempt the relaxed recovery for genuine printed-map input.
      if (looksLikePrintedMap(trimmed)) {
        try {
          const parsedObj = tryParsePrintedMap(trimmed)
          if (parsedObj && Object.keys(parsedObj).length > 0) {
            return parseVal('root', parsedObj)
          }
        } catch (err) {
          console.error('[JSON Model Generator] Failed to parse as printed map:', err)
        }
      }

      // Best-effort repair so models can still be generated from broken JSON.
      const repaired = repairJson(trimmed)
      if (repaired) {
        console.warn(
          '[JSON Model Generator] Invalid JSON recovered via best-effort repair. Original error:',
          e.message
        )
        try {
          return parseVal('root', JSON.parse(repaired))
        } catch (err) {
          console.error('[JSON Model Generator] Repaired JSON still failed to parse:', err)
        }
      }
      throw e
    }
  }

  // Structural signature of a node, used to deduplicate identical object shapes.
  function structuralSignature(node: ASTNode): string {
    switch (node.inferredType) {
      case 'object':
        return '{' + (node.children || [])
          .map(c => `${c.key}${c.isOptional ? '?' : ''}:${structuralSignature(c)}`)
          .sort()
          .join(',') + '}'
      case 'array':
        return '[' + (node.children?.[0] ? structuralSignature(node.children[0]) : 'any') + ']'
      case 'union':
        return '(' + (node.unionTypes || []).map(structuralSignature).sort().join('|') + ')'
      default:
        return node.inferredType
    }
  }

  // Deeply collect object models, merging structurally-identical shapes into a
  // single named type (QuickType behaviour) instead of emitting Foo, Foo1, Foo2…
  function collectModels(rootNode: ASTNode): ASTNode[] {
    const models: ASTNode[] = []
    const usedNames = new Set<string>()
    const sigToName = new Map<string, string>()

    function uniqueName(base: string): string {
      const root = base || 'Root'
      let name = root
      let counter = 1
      while (usedNames.has(name)) {
        name = `${root}${counter}`
        counter++
      }
      usedNames.add(name)
      return name
    }

    function traverse(node: ASTNode) {
      if (node.inferredType === 'object' && node.children) {
        const sig = structuralSignature(node)
        const existing = sigToName.get(sig)
        if (existing) {
          // Identical shape already emitted — reuse its type name, don't re-emit.
          node.typeName = existing
          return
        }

        const finalTypeName = uniqueName(node.typeName || 'Root')
        node.typeName = finalTypeName
        sigToName.set(sig, finalTypeName)
        models.push(node)

        for (const child of node.children) {
          traverse(child)
        }
      } else if (node.inferredType === 'array' && node.children) {
        for (const child of node.children) {
          traverse(child)
        }
      } else if (node.inferredType === 'union' && node.unionTypes) {
        for (const member of node.unionTypes) {
          traverse(member)
        }
      }
    }

    traverse(rootNode)
    // Reverse so nested dependencies are declared before their consumers.
    return models.reverse()
  }

  return {
    parseJson,
    collectModels
  }
}

/**
 * Heuristic: does the input look like a relaxed "printed map" (Dart/JS object
 * output) with UNQUOTED identifier keys, rather than standard JSON?
 *
 * Standard JSON always quotes its keys, so if JSON.parse fails on quoted-key
 * input it's a real syntax error that must be surfaced — we only fall back to
 * the lenient parser when there's evidence of unquoted keys.
 */
export function looksLikePrintedMap(str: string): boolean {
  return /[{,]\s*[A-Za-z_$][\w$]*\s*:/.test(str)
}

/**
 * Best-effort repair of common JSON mistakes so models can still be generated
 * from slightly-broken input. Handles missing commas between values, trailing
 * commas, single-quoted strings, unquoted keys/values, `//` and block comments,
 * and unclosed braces/brackets.
 *
 * Returns the repaired JSON string, or null if it still can't be parsed.
 */
export function repairJson(input: string): string | null {
  const src = input.trim()
  if (!src) return null

  let out = ''
  const stack: string[] = []
  let i = 0

  const lastMeaningful = (): string => {
    for (let k = out.length - 1; k >= 0; k--) {
      const c = out[k]
      if (c && !/\s/.test(c)) return c
    }
    return ''
  }

  // A new value starting right after a completed value means a comma is missing.
  const commaIfNeeded = () => {
    const lc = lastMeaningful()
    if (lc === '"' || lc === '}' || lc === ']' || /[0-9A-Za-z_]/.test(lc)) out += ','
  }

  while (i < src.length) {
    const ch = src[i]!

    if (/\s/.test(ch)) { out += ch; i++; continue }

    // Comments
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++
      continue
    }
    if (ch === '/' && src[i + 1] === '*') {
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++
      i += 2
      continue
    }

    // Strings (normalise single quotes to double)
    if (ch === '"' || ch === "'") {
      commaIfNeeded()
      const quote = ch
      i++
      out += '"'
      let escaped = false
      while (i < src.length) {
        const c = src[i]!
        if (escaped) { out += c; escaped = false; i++; continue }
        if (c === '\\') { out += c; escaped = true; i++; continue }
        if (c === quote) { i++; break }
        if (c === '"') { out += '\\"'; i++; continue }
        out += c; i++
      }
      out += '"'
      continue
    }

    if (ch === '{' || ch === '[') {
      commaIfNeeded()
      stack.push(ch)
      out += ch
      i++
      continue
    }

    if (ch === '}' || ch === ']') {
      out = out.replace(/,\s*$/, '') // drop trailing comma
      if (stack.length) stack.pop()
      out += ch
      i++
      continue
    }

    if (ch === ':' || ch === ',') { out += ch; i++; continue }

    // Numbers
    if (/[-0-9]/.test(ch)) {
      commaIfNeeded()
      while (i < src.length && /[-+0-9.eE]/.test(src[i]!)) { out += src[i]; i++ }
      continue
    }

    // Identifiers: literals, unquoted keys, or unquoted string values
    if (/[A-Za-z_$]/.test(ch)) {
      let ident = ''
      while (i < src.length && /[\w$.\-]/.test(src[i]!)) { ident += src[i]; i++ }
      let j = i
      while (j < src.length && /\s/.test(src[j]!)) j++
      commaIfNeeded()
      if (src[j] === ':') out += `"${ident}"`
      else if (ident === 'true' || ident === 'false' || ident === 'null') out += ident
      else out += `"${ident}"`
      continue
    }

    i++ // skip anything unrecognised
  }

  out = out.replace(/,\s*$/, '')
  while (stack.length) {
    out += stack.pop() === '{' ? '}' : ']'
  }

  try {
    JSON.parse(out)
    return out
  } catch {
    return null
  }
}

export function tryParsePrintedMap(str: string): any {
  let content = str.trim()
  if (!content.startsWith('{') || !content.endsWith('}')) {
    return null
  }
  content = content.slice(1, -1).trim()

  const result: Record<string, any> = {}
  
  let braceCount = 0
  let bracketCount = 0
  let currentKey = ''
  let currentValue = ''
  let inKey = true
  let inString = false
  let stringChar = ''
  let isEscaped = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (isEscaped) {
      isEscaped = false
      if (inKey) {
        currentKey += char
      } else {
        currentValue += char
      }
      continue
    }

    if (char === '\\') {
      isEscaped = true
      if (inKey) {
        currentKey += char
      } else {
        currentValue += char
      }
      continue
    }

    // Toggle string literal bounds
    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
        stringChar = ''
      }
      
      if (inKey) {
        currentKey += char
      } else {
        currentValue += char
      }
      continue
    }

    if (inString) {
      if (inKey) {
        currentKey += char
      } else {
        currentValue += char
      }
      continue
    }

    // Process characters outside string literals
    if (char === '{') {
      braceCount++
      if (!inKey) currentValue += char
    } else if (char === '}') {
      braceCount--
      if (!inKey) currentValue += char
    } else if (char === '[') {
      bracketCount++
      if (!inKey) currentValue += char
    } else if (char === ']') {
      bracketCount--
      if (!inKey) currentValue += char
    } else if (char === ':' && braceCount === 0 && bracketCount === 0 && inKey) {
      inKey = false
    } else if (char === ',' && braceCount === 0 && bracketCount === 0 && !inKey) {
      const remaining = content.slice(i + 1)
      const isNextKey = /^\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\\"(?:[^"\\]|\\.)*\\"|\\'(?:[^'\\]|\\.)*\\'|[^\s:]+)\s*:/.test(remaining)
      if (isNextKey) {
        const key = cleanKey(currentKey)
        const val = currentValue.trim()
        result[key] = parsePrimitiveOrNested(val)
        
        currentKey = ''
        currentValue = ''
        inKey = true
      } else {
        currentValue += char
      }
    } else {
      if (inKey) {
        currentKey += char
      } else {
        currentValue += char
      }
    }
  }

  if (currentKey.trim()) {
    const key = cleanKey(currentKey)
    const val = currentValue.trim()
    result[key] = parsePrimitiveOrNested(val)
  }

  return result
}

function parsePrimitiveOrNested(val: string): any {
  val = val.trim()
  
  // Clean up outer quotes and escaped quotes of string values
  let cleanVal = val
  while (
    (cleanVal.startsWith('"') && cleanVal.endsWith('"')) ||
    (cleanVal.startsWith("'") && cleanVal.endsWith("'")) ||
    (cleanVal.startsWith('\\"') && cleanVal.endsWith('\\"')) ||
    (cleanVal.startsWith("\\'") && cleanVal.endsWith("\\'"))
  ) {
    if (cleanVal.startsWith('\\"') && cleanVal.endsWith('\\"')) {
      cleanVal = cleanVal.slice(2, -2)
    } else if (cleanVal.startsWith("\\'") && cleanVal.endsWith("\\'")) {
      cleanVal = cleanVal.slice(2, -2)
    } else {
      cleanVal = cleanVal.slice(1, -1)
    }
    cleanVal = cleanVal.trim()
  }
  
  // Check primitive types
  if (cleanVal === 'true') return true
  if (cleanVal === 'false') return false
  if (cleanVal === 'null') return null
  if (!isNaN(Number(cleanVal)) && cleanVal !== '') return Number(cleanVal)
  
  if (cleanVal.startsWith('[') && cleanVal.endsWith(']')) {
    const inner = cleanVal.slice(1, -1).trim()
    if (!inner) return []
    const elements: any[] = []
    let currentElement = ''
    let bCount = 0
    let brCount = 0
    let inString = false
    let stringChar = ''
    let isEscaped = false
    
    for (let i = 0; i < inner.length; i++) {
      const char = inner[i]
      if (isEscaped) {
        isEscaped = false
        currentElement += char
        continue
      }
      if (char === '\\') {
        isEscaped = true
        currentElement += char
        continue
      }
      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (stringChar === char) {
          inString = false
          stringChar = ''
        }
        currentElement += char
        continue
      }
      
      if (inString) {
        currentElement += char
        continue
      }
      
      if (char === '{') bCount++
      else if (char === '}') bCount--
      else if (char === '[') brCount++
      else if (char === ']') brCount--
      
      if (char === ',' && bCount === 0 && brCount === 0) {
        elements.push(parsePrimitiveOrNested(currentElement))
        currentElement = ''
      } else {
        currentElement += char
      }
    }
    if (currentElement.trim()) {
      elements.push(parsePrimitiveOrNested(currentElement))
    }
    return elements
  }
  
  if (cleanVal.startsWith('{') && cleanVal.endsWith('}')) {
    const nested = tryParsePrintedMap(cleanVal)
    if (nested !== null) return nested
  }
  
  // Clean slash escapes common in raw strings
  return cleanVal.replace(/\\\\\//g, '/').replace(/\\\//g, '/')
}
