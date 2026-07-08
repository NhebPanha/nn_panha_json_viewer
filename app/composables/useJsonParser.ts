import { ref } from 'vue'

export interface ASTNode {
  key: string
  inferredType: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'array' | 'object' | 'null' | 'any'
  isNullable: boolean
  isOptional: boolean
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/

export function useJsonParser() {
  function inferType(val: any): ASTNode['inferredType'] {
    if (val === null) return 'null'
    if (typeof val === 'string') {
      if (UUID_REGEX.test(val)) return 'uuid'
      if (DATE_REGEX.test(val)) return 'date'
      return 'string'
    }
    if (typeof val === 'number') return 'number'
    if (typeof val === 'boolean') return 'boolean'
    if (Array.isArray(val)) return 'array'
    if (typeof val === 'object') return 'object'
    return 'any'
  }

  function parseVal(key: string, val: any): ASTNode {
    const type = inferType(val)
    const node: ASTNode = {
      key,
      inferredType: type,
      isNullable: val === null,
      isOptional: false
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

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

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
      const isNextKey = /^\s*[a-zA-Z0-9_]+\s*:/.test(remaining)
      if (isNextKey) {
        const key = currentKey.trim()
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
    const key = currentKey.trim()
    const val = currentValue.trim()
    result[key] = parsePrimitiveOrNested(val)
  }

  return result
}

function parsePrimitiveOrNested(val: string): any {
  val = val.trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  if (val === 'true') return true
  if (val === 'false') return false
  if (val === 'null') return null
  if (!isNaN(Number(val)) && val !== '') return Number(val)
  
  if (val.startsWith('{') && val.endsWith('}')) {
    const nested = tryParsePrintedMap(val)
    if (nested !== null) return nested
  }
  
  return val
}
