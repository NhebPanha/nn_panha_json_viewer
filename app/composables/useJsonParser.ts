import { ref } from 'vue'

export interface ASTNode {
  key: string
  inferredType: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'color' | 'array' | 'object' | 'null' | 'any'
  isNullable: boolean
  isOptional: boolean
  isInteger?: boolean
  children?: ASTNode[] // Array element type or object properties
  typeName?: string    // PascalCase inferred name for objects
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
        // Sample the array elements to merge shapes
        const elementNodes = val.map((item: any) => parseVal('element', item))
        const mergedNode = mergeASTNodes(elementNodes, toPascalCase(key) + 'Item')
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

    // Default to 'any' for highly varied types
    return {
      key: 'element',
      inferredType: 'any',
      isNullable,
      isOptional: false
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
      try {
        const parsedObj = tryParsePrintedMap(trimmed)
        if (parsedObj && Object.keys(parsedObj).length > 0) {
          return parseVal('root', parsedObj)
        }
      } catch (err) {
        console.error('Failed to parse as printed map:', err)
      }
      throw e
    }
  }

  // Deeply collect all unique object structures
  function collectModels(rootNode: ASTNode): ASTNode[] {
    const models: ASTNode[] = []
    const visited = new Set<string>()

    function traverse(node: ASTNode) {
      if (node.inferredType === 'object' && node.children) {
        const typeName = node.typeName || 'Root'
        
        // Handle name collision
        let finalTypeName = typeName
        let counter = 1
        while (visited.has(finalTypeName)) {
          finalTypeName = `${typeName}_${counter}`
          counter++
        }
        
        node.typeName = finalTypeName
        visited.add(finalTypeName)
        models.push(node)
        
        for (const child of node.children) {
          traverse(child)
        }
      } else if (node.inferredType === 'array' && node.children) {
        for (const child of node.children) {
          traverse(child)
        }
      }
    }

    traverse(rootNode)
    // Reverse so dependencies (nested models) are declared first or structured logically
    return models.reverse()
  }

  return {
    parseJson,
    collectModels
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
