import { useJsonParser, type ASTNode, toPascalCase } from './useJsonParser'

export function useCodeGenerator() {
  const { parseJson, collectModels } = useJsonParser()

  // Main code generator entry point
  function generate(jsonStr: string, language: string, framework: string, rootName: string = 'Root'): string {
    if (!jsonStr.trim()) return ''

    let ast: ASTNode | null = null
    try {
      ast = parseJson(jsonStr)
    } catch (e: any) {
      return `// Invalid JSON: ${e.message}`
    }

    if (!ast) return '// Empty JSON input'

    const finalRootName = toPascalCase(rootName.trim()) || 'Root'
    if (ast.inferredType === 'object') {
      ast.typeName = finalRootName
    } else if (ast.inferredType === 'array' && ast.children?.[0] && ast.children[0].inferredType === 'object') {
      ast.children[0].typeName = finalRootName
    }

    const models = collectModels(ast)
    // Make sure we include the root model if it's an object
    if (ast.inferredType === 'object' && !models.some(m => m.typeName === finalRootName)) {
      models.push(ast)
    }

    // Direct generators
    switch (language) {
      case 'typescript':
      case 'nodejs':
        return generateTypeScript(models, framework)
      case 'flutter':
        return generateFlutter(models, framework)
      case 'laravel':
        return generateLaravel(models, framework)
      case 'php':
        return generatePHP(models, framework)
      case 'java':
        return generateJava(models, framework)
      case 'spring_boot':
        return generateSpringBoot(models, framework)
      case 'kotlin':
        return generateKotlin(models, framework)
      case 'swift':
        return generateSwift(models, framework)
      case 'go':
        return generateGo(models, framework)
      case 'csharp':
        return generateCSharp(models, framework)
      case 'asp_net':
        return generateAspNet(models, framework)
      case 'nestjs':
        return generateNestJS(models, framework)
      case 'javascript':
        return generateJavaScript(models, framework)
      case 'prisma':
        return generatePrisma(models)
      case 'mongoose':
        return generateMongoose(models)
      case 'sequelize':
        return generateSequelize(models)
      case 'typeorm':
        return generateTypeORM(models)
      case 'graphql':
        return generateGraphQL(models, framework)
      case 'openapi':
        return generateOpenAPI(models)
      case 'python':
        return generatePython(models, framework)
      case 'rust':
        return generateRust(models)
      case 'zod':
        return generateZod(models)
      case 'json_schema':
        return generateJsonSchema(models)
      default:
        return `// Language '${language}' not implemented yet.`
    }
  }

  // --- TYPESCRIPT / NODEJS ---
  function getTsType(node: ASTNode): string {
    let base = 'any'
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'string'
    else if (node.inferredType === 'number') base = 'number'
    else if (node.inferredType === 'boolean') base = 'boolean'
    else if (node.inferredType === 'date') base = 'Date | string'
    else if (node.inferredType === 'object') base = node.typeName || 'any'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = child ? `${getTsType(child)}[]` : 'any[]'
    }
    else if (node.inferredType === 'union') {
      const members = (node.unionTypes || []).map(m => getTsType({ ...m, isNullable: false }))
      base = members.length ? Array.from(new Set(members)).join(' | ') : 'any'
    }
    return base + (node.isNullable ? ' | null' : '')
  }

  function generateTypeScript(models: ASTNode[], style: string): string {
    let code = ''
    for (const model of models) {
      const isInterface = style === 'interface'
      code += `export ${isInterface ? 'interface' : 'type'} ${model.typeName} ${isInterface ? '' : '= '}{\n`
      if (model.children) {
        for (const child of model.children) {
          const typeStr = getTsType(child)
          const opt = child.isOptional ? '?' : ''
          code += `  ${child.key}${opt}: ${typeStr};\n`
        }
      }
      code += `}${isInterface ? '' : ';'}\n\n`
    }
    return code.trim()
  }

  // --- DART / FLUTTER ---
  function getDartType(node: ASTNode): string {
    let base = 'dynamic'
    // Colors are kept as String (QuickType-style pure Dart — no Flutter Color import).
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'String'
    else if (node.inferredType === 'number') base = node.isInteger ? 'int' : 'double'
    else if (node.inferredType === 'boolean') base = 'bool'
    else if (node.inferredType === 'date') base = 'DateTime'
    else if (node.inferredType === 'object') base = node.typeName || 'dynamic'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = child ? `List<${getDartType(child)}>` : 'List<dynamic>'
    }
    else if (node.inferredType === 'union') base = 'dynamic'
    return base
  }

  function generateFlutter(models: ASTNode[], style: string): string {
    if (style === 'freezed') return generateFreezed(models)
    if (style === 'json_serializable') return generateJsonSerializable(models)

    function toCamelCase(str: string): string {
      if (!str) return ''
      if (str === 'CID' || str === 'cid') return 'cid'
      const parts = str.split(/[-_\s]+/)
      return parts.map((part, index) => {
        if (index === 0) return part.toLowerCase()
        return part.charAt(0).toUpperCase() + part.slice(1)
      }).join('')
    }

    const rootName = models[0]?.typeName || 'Welcome'
    const rootNameCamel = rootName.charAt(0).toLowerCase() + rootName.slice(1)

    let code = ''
    code += `// To parse this JSON data, do\n`
    code += `//\n`
    code += `//     final ${rootNameCamel} = ${rootNameCamel}FromJson(jsonString);\n\n`
    code += `import 'dart:convert';\n`

    const isEquatable = style === 'equatable'
    if (isEquatable) {
      code += "import 'package:equatable/equatable.dart';\n"
    }
    code += '\n'

    code += `${rootName} ${rootNameCamel}FromJson(String str) => ${rootName}.fromJson(json.decode(str));\n\n`
    code += `String ${rootNameCamel}ToJson(${rootName} data) => json.encode(data.toJson());\n\n`

    for (const model of models) {
      code += `class ${model.typeName} ${isEquatable ? 'extends Equatable ' : ''}{\n`
      
      const fieldPrefix = isEquatable ? 'final ' : ''

      // Fields
      if (model.children) {
        for (const child of model.children) {
          const typeStr = getDartType(child)
          const isNull = child.isNullable || child.isOptional
          const fieldName = toCamelCase(child.key)
          code += `    ${fieldPrefix}${typeStr}${isNull ? '?' : ''} ${fieldName};\n`
        }
      }
      code += '\n'

      // Constructor
      code += `    ${model.typeName}({\n`
      if (model.children) {
        for (const child of model.children) {
          const isNull = child.isNullable || child.isOptional
          const fieldName = toCamelCase(child.key)
          code += `        ${isNull ? '' : 'required '}this.${fieldName},\n`
        }
      }
      code += '    });\n\n'

      // From JSON
      code += `    factory ${model.typeName}.fromJson(Map<String, dynamic> json) => ${model.typeName}(\n`
      if (model.children) {
        for (const child of model.children) {
          const key = child.key
          const fieldName = toCamelCase(key)
          const isNull = child.isNullable || child.isOptional
          if (child.inferredType === 'object') {
            const innerName = child.typeName || 'dynamic'
            if (isNull) {
              code += `        ${fieldName}: json["${key}"] == null ? null : ${innerName}.fromJson(json["${key}"]),\n`
            } else {
              code += `        ${fieldName}: ${innerName}.fromJson(json["${key}"]),\n`
            }
          } else if (child.inferredType === 'array' && child.children?.[0]?.inferredType === 'object') {
            const innerName = child.children[0].typeName || 'dynamic'
            if (isNull) {
              code += `        ${fieldName}: json["${key}"] == null ? null : List<${innerName}>.from(json["${key}"].map((x) => ${innerName}.fromJson(x))),\n`
            } else {
              code += `        ${fieldName}: List<${innerName}>.from(json["${key}"].map((x) => ${innerName}.fromJson(x))),\n`
            }
          } else if (child.inferredType === 'date') {
            if (isNull) {
              code += `        ${fieldName}: json["${key}"] == null ? null : DateTime.parse(json["${key}"]),\n`
            } else {
              code += `        ${fieldName}: DateTime.parse(json["${key}"]),\n`
            }
          } else {
            code += `        ${fieldName}: json["${key}"],\n`
          }
        }
      }
      code += '    );\n\n'

      // To JSON
      code += '    Map<String, dynamic> toJson() => {\n'
      if (model.children) {
        for (const child of model.children) {
          const key = child.key
          const fieldName = toCamelCase(key)
          const isNull = child.isNullable || child.isOptional
          if (child.inferredType === 'object') {
            code += `        "${key}": ${fieldName}${isNull ? '?' : ''}.toJson(),\n`
          } else if (child.inferredType === 'array' && child.children?.[0]?.inferredType === 'object') {
            if (isNull) {
              code += `        "${key}": ${fieldName} == null ? null : List<dynamic>.from(${fieldName}!.map((x) => x.toJson())),\n`
            } else {
              code += `        "${key}": List<dynamic>.from(${fieldName}.map((x) => x.toJson())),\n`
            }
          } else if (child.inferredType === 'date') {
            code += `        "${key}": ${fieldName}${isNull ? '?' : ''}.toIso8601String(),\n`
          } else {
            code += `        "${key}": ${fieldName},\n`
          }
        }
      }
      code += '    };\n'

      // Equatable props
      if (isEquatable) {
        code += '\n    @override\n    List<Object?> get props => [\n'
        if (model.children) {
          for (const child of model.children) {
            code += `        ${toCamelCase(child.key)},\n`
          }
        }
        code += '    ];\n'
      }

      code += '}\n\n'
    }
    return code.trim()
  }

  function generateFreezed(models: ASTNode[]): string {
    let code = "import 'package:freezed_annotation/freezed_annotation.dart';\n"
    code += "\n"
    code += "part 'models.freezed.dart';\n"
    code += "part 'models.g.dart';\n\n"

    for (const model of models) {
      code += '@freezed\n'
      code += `class ${model.typeName} with _\$${model.typeName} {\n`
      code += `  const factory ${model.typeName}({\n`
      if (model.children) {
        for (const child of model.children) {
          const typeStr = getDartType(child)
          const isNull = child.isNullable || child.isOptional
          code += `    ${isNull ? '' : 'required '}${typeStr}${isNull ? '?' : ''} ${child.key},\n`
        }
      }
      code += `  }) = _${model.typeName};\n\n`
      code += `  factory ${model.typeName}.fromJson(Map<String, dynamic> json) => _\$${model.typeName}FromJson(json);\n`
      code += '}\n\n'
    }
    return code.trim()
  }

  function generateJsonSerializable(models: ASTNode[]): string {
    let code = "import 'package:json_annotation/json_annotation.dart';\n"
    code += "\n"
    code += "part 'models.g.dart';\n\n"

    for (const model of models) {
      code += '@JsonSerializable(explicitToJson: true)\n'
      code += `class ${model.typeName} {\n`
      if (model.children) {
        for (const child of model.children) {
          const typeStr = getDartType(child)
          const isNull = child.isNullable || child.isOptional
          code += `  final ${typeStr}${isNull ? '?' : ''} ${child.key};\n`
        }
      }
      code += '\n'
      code += `  ${model.typeName}({\n`
      if (model.children) {
        for (const child of model.children) {
          const isNull = child.isNullable || child.isOptional
          code += `    ${isNull ? '' : 'required '}this.${child.key},\n`
        }
      }
      code += '  });\n\n'
      code += `  factory ${model.typeName}.fromJson(Map<String, dynamic> json) => _\$${model.typeName}FromJson(json);\n`
      code += `  Map<String, dynamic> toJson() => _\$${model.typeName}ToJson(this);\n`
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- LARAVEL / PHP ---
  function getPhpType(node: ASTNode): string {
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') return 'string'
    if (node.inferredType === 'number') return node.isInteger ? 'int' : 'float'
    if (node.inferredType === 'boolean') return 'bool'
    if (node.inferredType === 'date') return 'DateTime'
    if (node.inferredType === 'object') return node.typeName || 'array'
    if (node.inferredType === 'array') return 'array'
    return 'mixed'
  }

  function generatePHP(models: ASTNode[], style: string): string {
    let code = "<?php\n\nnamespace App\\Models;\n\n"
    for (const model of models) {
      code += `class ${model.typeName}\n{\n`
      if (model.children) {
        for (const child of model.children) {
          const typeStr = getPhpType(child)
          const nullable = child.isNullable || child.isOptional ? '?' : ''
          code += `    public ${nullable}${typeStr} $${child.key};\n`
        }
        code += '\n'
        // Constructor
        code += `    public function __construct(\n`
        for (const child of model.children) {
          const typeStr = getPhpType(child)
          const nullable = child.isNullable || child.isOptional ? '?' : ''
          code += `        ${nullable}${typeStr} $${child.key},\n`
        }
        code += `    ) {\n`
        for (const child of model.children) {
          code += `        $this->${child.key} = $${child.key};\n`
        }
        code += `    }\n`
      }
      code += '}\n\n'
    }
    return code.trim()
  }

  function generateLaravel(models: ASTNode[], style: string): string {
    if (style === 'dto') return generatePHP(models, 'dto')
    
    let code = "<?php\n\nnamespace App\\Http\\Resources;\n\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Http\\Resources\\Json\\JsonResource;\n\n"
    
    if (style === 'resource') {
      for (const model of models) {
        code += `class ${model.typeName}Resource extends JsonResource\n{\n`
        code += '    /**\n     * Transform the resource into an array.\n     *\n     * @return array<string, mixed>\n     */\n'
        code += '    public function toArray(Request $request): array\n    {\n'
        code += '        return [\n'
        if (model.children) {
          for (const child of model.children) {
            code += `            '${child.key}' => $this->${child.key},\n`
          }
        }
        code += '        ];\n'
        code += '    }\n'
        code += '}\n\n'
      }
      return code.trim()
    }

    if (style === 'cast') {
      for (const model of models) {
        code += `class ${model.typeName}Cast implements \\Illuminate\\Contracts\\Database\\Eloquent\\CastsAttributes\n{\n`
        code += '    public function get($model, string $key, $value, array $attributes)\n    {\n'
        code += '        return $value ? json_decode($value, true) : null;\n    }\n\n'
        code += '    public function set($model, string $key, $value, array $attributes)\n    {\n'
        code += '        return json_encode($value);\n    }\n'
        code += '}\n\n'
      }
      return code.trim()
    }

    // Default: Laravel Model
    code = "<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\n\n"
    for (const model of models) {
      code += `class ${model.typeName} extends Model\n{\n`
      code += `    protected $table = '${model.typeName.toLowerCase()}s';\n\n`
      code += '    protected $fillable = [\n'
      if (model.children) {
        for (const child of model.children) {
          code += `        '${child.key}',\n`
        }
      }
      code += '    ];\n\n'
      code += '    protected $casts = [\n'
      if (model.children) {
        for (const child of model.children) {
          if (child.inferredType === 'date') {
            code += `        '${child.key}' => 'datetime',\n`
          } else if (child.inferredType === 'boolean') {
            code += `        '${child.key}' => 'boolean',\n`
          } else if (child.inferredType === 'array' || child.inferredType === 'object') {
            code += `        '${child.key}' => 'array',\n`
          }
        }
      }
      code += '    ];\n'
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- JAVA / SPRING BOOT ---
  function getJavaType(node: ASTNode): string {
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') return 'String'
    if (node.inferredType === 'number') return node.isInteger ? 'Integer' : 'Double'
    if (node.inferredType === 'boolean') return 'Boolean'
    if (node.inferredType === 'date') return 'java.time.Instant'
    if (node.inferredType === 'object') return node.typeName || 'Object'
    if (node.inferredType === 'array') {
      const child = node.children?.[0]
      return `java.util.List<${child ? getJavaType(child) : 'Object'}>`
    }
    return 'Object'
  }

  function generateJava(models: ASTNode[], style: string): string {
    let code = ''
    for (const model of models) {
      if (style === 'record') {
        code += `public record ${model.typeName}(\n`
        if (model.children) {
          const params = model.children.map(child => `    ${getJavaType(child)} ${child.key}`)
          code += params.join(',\n')
        }
        code += '\n) {}\n\n'
      } else {
        const isLombok = style === 'lombok'
        if (isLombok) {
          code += '@lombok.Data\n@lombok.NoArgsConstructor\n@lombok.AllArgsConstructor\n'
        }
        code += `public class ${model.typeName} {\n`
        if (model.children) {
          for (const child of model.children) {
            code += `    private ${getJavaType(child)} ${child.key};\n`
          }
          if (!isLombok) {
            // Getters/Setters
            code += '\n'
            for (const child of model.children) {
              const typeStr = getJavaType(child)
              const capKey = child.key.charAt(0).toUpperCase() + child.key.slice(1)
              // Getter
              code += `    public ${typeStr} get${capKey}() {\n`
              code += `        return this.${child.key};\n`
              code += '    }\n\n'
              // Setter
              code += `    public void set${capKey}(${typeStr} ${child.key}) {\n`
              code += `        this.${child.key} = ${child.key};\n`
              code += '    }\n\n'
            }
          }
        }
        code += '}\n\n'
      }
    }
    return code.trim()
  }

  function generateSpringBoot(models: ASTNode[], style: string): string {
    if (style === 'record') return generateJava(models, 'record')
    
    let code = ''
    const isEntity = style === 'entity'
    
    for (const model of models) {
      if (isEntity) {
        code += '@jakarta.persistence.Entity\n@jakarta.persistence.Table(name = "' + model.typeName.toLowerCase() + '")\n'
      }
      code += `@lombok.Data\npublic class ${model.typeName} {\n`
      
      if (model.children) {
        let first = true
        for (const child of model.children) {
          if (isEntity && first) {
            code += '    @jakarta.persistence.Id\n'
            if (child.inferredType === 'uuid') {
              code += '    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)\n'
            } else {
              code += '    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)\n'
            }
            first = false
          }
          code += `    private ${getJavaType(child)} ${child.key};\n`
        }
      }
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- KOTLIN ---
  function getKotlinType(node: ASTNode): string {
    let base = 'Any'
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'String'
    else if (node.inferredType === 'number') base = node.isInteger ? 'Int' : 'Double'
    else if (node.inferredType === 'boolean') base = 'Boolean'
    else if (node.inferredType === 'date') base = 'java.time.Instant'
    else if (node.inferredType === 'object') base = node.typeName || 'Any'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `List<${child ? getKotlinType(child) : 'Any'}>`
    }
    return base + (node.isNullable || node.isOptional ? '?' : '')
  }

  function generateKotlin(models: ASTNode[], style: string): string {
    let code = ''
    for (const model of models) {
      code += `data class ${model.typeName}(\n`
      if (model.children) {
        const fields = model.children.map(child => `    val ${child.key}: ${getKotlinType(child)}`)
        code += fields.join(',\n')
      }
      code += '\n)\n\n'
    }
    return code.trim()
  }

  // --- SWIFT ---
  function getSwiftType(node: ASTNode): string {
    let base = 'Any'
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'String'
    else if (node.inferredType === 'number') base = node.isInteger ? 'Int' : 'Double'
    else if (node.inferredType === 'boolean') base = 'Bool'
    else if (node.inferredType === 'date') base = 'Date'
    else if (node.inferredType === 'object') base = node.typeName || 'Any'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `[${child ? getSwiftType(child) : 'Any'}]`
    }
    return base + (node.isNullable || node.isOptional ? '?' : '')
  }

  function generateSwift(models: ASTNode[], style: string): string {
    let code = "import Foundation\n\n"
    for (const model of models) {
      code += `struct ${model.typeName}: Codable {\n`
      if (model.children) {
        for (const child of model.children) {
          code += `    let ${child.key}: ${getSwiftType(child)}\n`
        }
      }
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- GO ---
  function getGoType(node: ASTNode): string {
    let base = 'interface{}'
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'string'
    else if (node.inferredType === 'number') base = node.isInteger ? 'int' : 'float64'
    else if (node.inferredType === 'boolean') base = 'bool'
    else if (node.inferredType === 'date') base = 'time.Time'
    else if (node.inferredType === 'object') base = node.typeName || 'struct{}'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `[]${child ? getGoType(child) : 'interface{}'}`
    }
    return (node.isNullable || node.isOptional ? '*' : '') + base
  }

  function generateGo(models: ASTNode[], style: string): string {
    let code = "package models\n\nimport \"time\"\n\n"
    for (const model of models) {
      code += `type ${model.typeName} struct {\n`
      if (model.children) {
        for (const child of model.children) {
          const capName = child.key.charAt(0).toUpperCase() + child.key.slice(1)
          code += `\t${capName} ${getGoType(child)} \`json:"${child.key}${child.isOptional ? ',omitempty' : ''}"\`\n`
        }
      }
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- C# / ASP.NET ---
  function getCSharpType(node: ASTNode): string {
    let base = 'object'
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'string'
    else if (node.inferredType === 'number') base = node.isInteger ? 'int' : 'double'
    else if (node.inferredType === 'boolean') base = 'bool'
    else if (node.inferredType === 'date') base = 'DateTime'
    else if (node.inferredType === 'object') base = node.typeName || 'object'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `List<${child ? getCSharpType(child) : 'object'}>`
    }
    return base + (node.isNullable || node.isOptional ? '?' : '')
  }

  function generateCSharp(models: ASTNode[], style: string): string {
    let code = "using System;\nusing System.Collections.Generic;\nusing System.Text.Json.Serialization;\n\nnamespace App.Models\n{\n"
    for (const model of models) {
      if (style === 'record') {
        code += `    public record ${model.typeName}(\n`
        if (model.children) {
          const params = model.children.map(child => {
            const capName = child.key.charAt(0).toUpperCase() + child.key.slice(1)
            return `        [property: JsonPropertyName("${child.key}")] ${getCSharpType(child)} ${capName}`
          })
          code += params.join(',\n')
        }
        code += '\n    );\n\n'
      } else {
        code += `    public class ${model.typeName}\n    {\n`
        if (model.children) {
          for (const child of model.children) {
            const capName = child.key.charAt(0).toUpperCase() + child.key.slice(1)
            code += `        [JsonPropertyName("${child.key}")]\n`
            code += `        public ${getCSharpType(child)} ${capName} { get; set; }\n\n`
          }
        }
        code += '    }\n\n'
      }
    }
    code += '}'
    return code
  }

  function generateAspNet(models: ASTNode[], style: string): string {
    let code = "using System;\nusing System.ComponentModel.DataAnnotations;\n\nnamespace App.Entities\n{\n"
    const isEntity = style === 'entity'

    for (const model of models) {
      code += `    public class ${model.typeName}\n    {\n`
      if (model.children) {
        let first = true
        for (const child of model.children) {
          const capName = child.key.charAt(0).toUpperCase() + child.key.slice(1)
          if (isEntity && first) {
            code += '        [Key]\n'
            first = false
          }
          if (!child.isNullable && !child.isOptional) {
            code += '        [Required]\n'
          }
          code += `        public ${getCSharpType(child)} ${capName} { get; set; }\n\n`
        }
      }
      code += '    }\n\n'
    }
    code += '}'
    return code
  }

  // --- NESTJS ---
  function generateNestJS(models: ASTNode[], style: string): string {
    let code = ''
    const isDto = style === 'dto'
    if (isDto) {
      code += "import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';\n"
      code += "import { Type } from 'class-transformer';\n\n"
    } else {
      code += "import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';\n\n"
    }

    for (const model of models) {
      if (isDto) {
        code += `export class ${model.typeName}Dto {\n`
        if (model.children) {
          for (const child of model.children) {
            if (child.isOptional || child.isNullable) {
              code += '  @IsOptional()\n'
            }
            if (child.inferredType === 'string' || child.inferredType === 'uuid') {
              code += '  @IsString()\n'
            } else if (child.inferredType === 'number') {
              code += '  @IsNumber()\n'
            } else if (child.inferredType === 'boolean') {
              code += '  @IsBoolean()\n'
            } else if (child.inferredType === 'object') {
              code += `  @ValidateNested()\n  @Type(() => ${child.typeName}Dto)\n`
            } else if (child.inferredType === 'array') {
              code += '  @IsArray()\n'
              if (child.children?.[0]?.inferredType === 'object') {
                code += `  @ValidateNested({ each: true })\n  @Type(() => ${child.children[0].typeName}Dto)\n`
              }
            }
            code += `  ${child.key}${child.isOptional ? '?' : ''}: ${getTsType(child)};\n\n`
          }
        }
        code += '}\n\n'
      } else {
        code += `@Entity('${model.typeName.toLowerCase()}s')\n`
        code += `export class ${model.typeName}Entity {\n`
        if (model.children) {
          let first = true
          for (const child of model.children) {
            if (first) {
              code += `  @PrimaryGeneratedColumn(${child.inferredType === 'uuid' ? "'uuid'" : ''})\n`
              first = false
            } else {
              code += '  @Column()\n'
            }
            code += `  ${child.key}: ${getTsType(child)};\n\n`
          }
        }
        code += '}\n\n'
      }
    }
    return code.trim()
  }

  // --- JAVASCRIPT / JSDOC ---
  function generateJavaScript(models: ASTNode[], style: string): string {
    let code = ''
    for (const model of models) {
      code += `/**\n * @typedef {Object} ${model.typeName}\n`
      if (model.children) {
        for (const child of model.children) {
          let jsDocType = 'any'
          if (child.inferredType === 'string' || child.inferredType === 'uuid') jsDocType = 'string'
          else if (child.inferredType === 'number') jsDocType = 'number'
          else if (child.inferredType === 'boolean') jsDocType = 'boolean'
          else if (child.inferredType === 'date') jsDocType = 'string|Date'
          else if (child.inferredType === 'object') jsDocType = child.typeName || 'Object'
          else if (child.inferredType === 'array') {
            const childEl = child.children?.[0]
            jsDocType = childEl ? `Array<${childEl.typeName || childEl.inferredType}>` : 'Array'
          }
          else if (child.inferredType === 'union') {
            const members = (child.unionTypes || []).map(m => m.typeName || m.inferredType)
            jsDocType = members.length ? Array.from(new Set(members)).join('|') : 'any'
          }

          if (child.isNullable) jsDocType += '|null'
          const keyStr = child.isOptional ? `[${child.key}]` : child.key
          code += ` * @property {${jsDocType}} ${keyStr}\n`
        }
      }
      code += ' */\n\n'
    }
    return code.trim()
  }

  // --- PRISMA SCHEMA ---
  function getPrismaType(node: ASTNode): string {
    if (node.inferredType === 'string') return 'String'
    if (node.inferredType === 'uuid') return 'String'
    if (node.inferredType === 'color') return 'String'
    if (node.inferredType === 'number') return 'Float' // or Int
    if (node.inferredType === 'boolean') return 'Boolean'
    if (node.inferredType === 'date') return 'DateTime'
    if (node.inferredType === 'object') return node.typeName || 'Json'
    if (node.inferredType === 'array') {
      const child = node.children?.[0]
      return child?.inferredType === 'object' ? `${child.typeName}[]` : 'Json'
    }
    return 'Json'
  }

  function generatePrisma(models: ASTNode[]): string {
    let code = 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\n'
    for (const model of models) {
      code += `model ${model.typeName} {\n`
      if (model.children) {
        let first = true
        for (const child of model.children) {
          let typeStr = getPrismaType(child)
          let decorators = ''
          if (first) {
            decorators = ' @id'
            if (child.inferredType === 'uuid') {
              decorators += ' @default(uuid())'
            } else if (child.inferredType === 'number') {
              typeStr = 'Int'
              decorators += ' @default(autoincrement())'
            }
            first = false
          }
          const nullable = child.isNullable || child.isOptional ? '?' : ''
          code += `  ${child.key} ${typeStr}${nullable}${decorators}\n`
        }
      }
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- MONGOOSE ---
  function getMongooseType(node: ASTNode): string {
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') return 'String'
    if (node.inferredType === 'number') return 'Number'
    if (node.inferredType === 'boolean') return 'Boolean'
    if (node.inferredType === 'date') return 'Date'
    if (node.inferredType === 'object') return node.typeName ? `${node.typeName}Schema` : 'Object'
    if (node.inferredType === 'array') {
      const child = node.children?.[0]
      return `[${child ? getMongooseType(child) : 'Schema.Types.Mixed'}]`
    }
    return 'Schema.Types.Mixed'
  }

  function generateMongoose(models: ASTNode[]): string {
    let code = "import { Schema, model } from 'mongoose';\n\n"
    
    // Sub schemas first
    for (const model of models) {
      if (model.typeName === 'Root') continue
      code += `const ${model.typeName}Schema = new Schema({\n`
      if (model.children) {
        for (const child of model.children) {
          const typeStr = getMongooseType(child)
          const req = !child.isNullable && !child.isOptional ? ', required: true' : ''
          code += `  ${child.key}: { type: ${typeStr}${req} },\n`
        }
      }
      code += '});\n\n'
    }

    // Root Schema and Model
    const root = models.find(m => m.typeName === 'Root')
    if (root) {
      code += `const RootSchema = new Schema({\n`
      if (root.children) {
        for (const child of root.children) {
          const typeStr = getMongooseType(child)
          const req = !child.isNullable && !child.isOptional ? ', required: true' : ''
          code += `  ${child.key}: { type: ${typeStr}${req} },\n`
        }
      }
      code += '});\n\n'
      code += "export const RootModel = model('Root', RootSchema);\n"
    }

    return code.trim()
  }

  // --- SEQUELIZE ---
  function generateSequelize(models: ASTNode[]): string {
    let code = "import { DataTypes } from 'sequelize';\nimport { sequelize } from './database';\n\n"
    for (const model of models) {
      code += `export const ${model.typeName} = sequelize.define('${model.typeName}', {\n`
      if (model.children) {
        let first = true
        for (const child of model.children) {
          let seqType = 'DataTypes.STRING'
          if (child.inferredType === 'number') seqType = 'DataTypes.DOUBLE'
          else if (child.inferredType === 'boolean') seqType = 'DataTypes.BOOLEAN'
          else if (child.inferredType === 'date') seqType = 'DataTypes.DATE'
          else if (child.inferredType === 'array' || child.inferredType === 'object') seqType = 'DataTypes.JSON'

          code += `  ${child.key}: {\n`
          code += `    type: ${seqType},\n`
          if (first) {
            code += '    primaryKey: true,\n'
            if (child.inferredType === 'number') {
              code += '    autoIncrement: true,\n'
            }
            first = false
          }
          code += `    allowNull: ${child.isNullable || child.isOptional ? 'true' : 'false'}\n`
          code += '  },\n'
        }
      }
      code += '});\n\n'
    }
    return code.trim()
  }

  // --- TYPEORM ---
  function generateTypeORM(models: ASTNode[]): string {
    return generateNestJS(models, 'entity')
  }

  // --- GRAPHQL ---
  function getGraphQlType(node: ASTNode): string {
    let base = 'String'
    if (node.inferredType === 'number') base = 'Float'
    else if (node.inferredType === 'boolean') base = 'Boolean'
    else if (node.inferredType === 'object') base = node.typeName || 'JSON'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `[${child ? getGraphQlType(child) : 'JSON'}]`
    }
    return base + (node.isNullable || node.isOptional ? '' : '!')
  }

  function generateGraphQL(models: ASTNode[], style: string): string {
    let code = ''
    const keyword = style === 'input' ? 'input' : 'type'
    for (const model of models) {
      code += `${keyword} ${model.typeName} {\n`
      if (model.children) {
        for (const child of model.children) {
          code += `  ${child.key}: ${getGraphQlType(child)}\n`
        }
      }
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- OPENAPI ---
  function getOpenApiType(node: ASTNode): any {
    if (node.inferredType === 'string') return { type: 'string' }
    if (node.inferredType === 'uuid') return { type: 'string', format: 'uuid' }
    if (node.inferredType === 'color') return { type: 'string', format: 'color' }
    if (node.inferredType === 'number') return { type: 'number' }
    if (node.inferredType === 'boolean') return { type: 'boolean' }
    if (node.inferredType === 'date') return { type: 'string', format: 'date-time' }
    if (node.inferredType === 'object') return { $ref: `#/components/schemas/${node.typeName}` }
    if (node.inferredType === 'array') {
      const child = node.children?.[0]
      return {
        type: 'array',
        items: child ? getOpenApiType(child) : { type: 'object' }
      }
    }
    if (node.inferredType === 'union') {
      return { oneOf: (node.unionTypes || []).map(getOpenApiType) }
    }
    return { type: 'object' }
  }

  function generateOpenAPI(models: ASTNode[]): string {
    const schemas: Record<string, any> = {}
    for (const model of models) {
      const properties: Record<string, any> = {}
      const required: string[] = []

      if (model.children) {
        for (const child of model.children) {
          properties[child.key] = getOpenApiType(child)
          if (!child.isNullable && !child.isOptional) {
            required.push(child.key)
          }
        }
      }

      schemas[model.typeName || ''] = {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {})
      }
    }

    const openApiDoc = {
      openapi: '3.0.0',
      info: {
        title: 'JSON Model API Schema',
        version: '1.0.0'
      },
      components: {
        schemas
      }
    }

    return JSON.stringify(openApiDoc, null, 2)
  }

  function snakeCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
  }

  // --- PYTHON (dataclass / pydantic / TypedDict) ---
  function getPythonType(node: ASTNode): string {
    let base = 'Any'
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'str'
    else if (node.inferredType === 'number') base = node.isInteger ? 'int' : 'float'
    else if (node.inferredType === 'boolean') base = 'bool'
    else if (node.inferredType === 'date') base = 'datetime'
    else if (node.inferredType === 'object') base = `'${node.typeName || 'Any'}'`
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `List[${child ? getPythonType(child) : 'Any'}]`
    }
    else if (node.inferredType === 'union') {
      const members = (node.unionTypes || []).map(getPythonType)
      base = members.length ? `Union[${Array.from(new Set(members)).join(', ')}]` : 'Any'
    }
    return (node.isNullable || node.isOptional) ? `Optional[${base}]` : base
  }

  function generatePython(models: ASTNode[], style: string): string {
    const isPydantic = style === 'pydantic'
    const isTypedDict = style === 'typeddict'

    let header = 'from __future__ import annotations\n'
    header += 'from typing import List, Optional, Union, Any'
    if (isTypedDict) header += ', TypedDict'
    header += '\n'
    header += 'from datetime import datetime\n'
    if (isPydantic) header += 'from pydantic import BaseModel\n'
    else if (!isTypedDict) header += 'from dataclasses import dataclass\n'
    header += '\n\n'

    let code = ''
    for (const model of models) {
      if (isPydantic) {
        code += `class ${model.typeName}(BaseModel):\n`
      } else if (isTypedDict) {
        code += `class ${model.typeName}(TypedDict):\n`
      } else {
        code += `@dataclass\nclass ${model.typeName}:\n`
      }
      const children = model.children || []
      if (children.length === 0) {
        code += '    pass\n'
      } else {
        for (const child of children) {
          code += `    ${snakeCase(child.key)}: ${getPythonType(child)}\n`
        }
      }
      code += '\n\n'
    }
    return (header + code).trim()
  }

  // --- RUST (serde) ---
  function getRustType(node: ASTNode): string {
    let base = 'serde_json::Value'
    if (node.inferredType === 'string' || node.inferredType === 'uuid' || node.inferredType === 'color') base = 'String'
    else if (node.inferredType === 'number') base = node.isInteger ? 'i64' : 'f64'
    else if (node.inferredType === 'boolean') base = 'bool'
    else if (node.inferredType === 'date') base = 'String'
    else if (node.inferredType === 'object') base = node.typeName || 'serde_json::Value'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `Vec<${child ? getRustType(child) : 'serde_json::Value'}>`
    }
    else if (node.inferredType === 'union') base = 'serde_json::Value'
    return (node.isNullable || node.isOptional) ? `Option<${base}>` : base
  }

  function generateRust(models: ASTNode[]): string {
    let code = 'use serde::{Deserialize, Serialize};\n\n'
    for (const model of models) {
      code += '#[derive(Debug, Clone, Serialize, Deserialize)]\n'
      code += `pub struct ${model.typeName} {\n`
      if (model.children) {
        for (const child of model.children) {
          const field = snakeCase(child.key)
          if (field !== child.key) {
            code += `    #[serde(rename = "${child.key}")]\n`
          }
          code += `    pub ${field}: ${getRustType(child)},\n`
        }
      }
      code += '}\n\n'
    }
    return code.trim()
  }

  // --- ZOD ---
  function getZodType(node: ASTNode): string {
    let base = 'z.any()'
    if (node.inferredType === 'string' || node.inferredType === 'color') base = 'z.string()'
    else if (node.inferredType === 'uuid') base = 'z.string().uuid()'
    else if (node.inferredType === 'number') base = 'z.number()'
    else if (node.inferredType === 'boolean') base = 'z.boolean()'
    else if (node.inferredType === 'date') base = 'z.coerce.date()'
    else if (node.inferredType === 'object') base = node.typeName ? `${node.typeName}Schema` : 'z.any()'
    else if (node.inferredType === 'array') {
      const child = node.children?.[0]
      base = `z.array(${child ? getZodType(child) : 'z.any()'})`
    }
    else if (node.inferredType === 'union') {
      const members = (node.unionTypes || []).map(getZodType)
      base = members.length > 1 ? `z.union([${members.join(', ')}])` : (members[0] || 'z.any()')
    }
    if (node.isNullable) base += '.nullable()'
    if (node.isOptional) base += '.optional()'
    return base
  }

  function generateZod(models: ASTNode[]): string {
    let code = 'import { z } from "zod";\n\n'
    for (const model of models) {
      code += `export const ${model.typeName}Schema = z.object({\n`
      if (model.children) {
        for (const child of model.children) {
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(child.key) ? child.key : `"${child.key}"`
          code += `  ${safeKey}: ${getZodType(child)},\n`
        }
      }
      code += '});\n'
      code += `export type ${model.typeName} = z.infer<typeof ${model.typeName}Schema>;\n\n`
    }
    return code.trim()
  }

  // --- JSON SCHEMA (Draft-07) ---
  function getJsonSchemaType(node: ASTNode): any {
    if (node.inferredType === 'string') return { type: 'string' }
    if (node.inferredType === 'uuid') return { type: 'string', format: 'uuid' }
    if (node.inferredType === 'color') return { type: 'string' }
    if (node.inferredType === 'number') return { type: node.isInteger ? 'integer' : 'number' }
    if (node.inferredType === 'boolean') return { type: 'boolean' }
    if (node.inferredType === 'date') return { type: 'string', format: 'date-time' }
    if (node.inferredType === 'object') return { $ref: `#/definitions/${node.typeName}` }
    if (node.inferredType === 'array') {
      const child = node.children?.[0]
      return { type: 'array', items: child ? getJsonSchemaType(child) : {} }
    }
    if (node.inferredType === 'union') {
      return { oneOf: (node.unionTypes || []).map(getJsonSchemaType) }
    }
    return {}
  }

  function generateJsonSchema(models: ASTNode[]): string {
    const definitions: Record<string, any> = {}
    for (const model of models) {
      const properties: Record<string, any> = {}
      const required: string[] = []
      if (model.children) {
        for (const child of model.children) {
          properties[child.key] = getJsonSchemaType(child)
          if (!child.isNullable && !child.isOptional) required.push(child.key)
        }
      }
      definitions[model.typeName || 'Root'] = {
        type: 'object',
        properties,
        ...(required.length ? { required } : {})
      }
    }
    // Root is the last model emitted (collectModels reverses dependencies first).
    const rootName = models[models.length - 1]?.typeName || 'Root'
    const doc = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: `#/definitions/${rootName}`,
      definitions
    }
    return JSON.stringify(doc, null, 2)
  }

  return {
    generate
  }
}
