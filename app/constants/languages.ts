import type { LanguageOption } from '~/types/generator'

/**
 * Single source of truth for every target language and its generation styles.
 * Consumed by the generator store, the code generator, and the /languages page.
 */
export const LANGUAGES: LanguageOption[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    options: [
      { id: 'interface', name: 'Interface' },
      { id: 'type', name: 'Type' }
    ]
  },
  {
    id: 'flutter',
    name: 'Flutter (Dart)',
    options: [
      { id: 'plain', name: 'Plain Dart Model' },
      { id: 'equatable', name: 'Equatable Model' },
      { id: 'freezed', name: 'Freezed Model' },
      { id: 'json_serializable', name: 'Json Serializable Model' }
    ]
  },
  {
    id: 'laravel',
    name: 'Laravel (PHP)',
    options: [
      { id: 'model', name: 'Model' },
      { id: 'dto', name: 'DTO' },
      { id: 'resource', name: 'Resource' },
      { id: 'cast', name: 'Cast Class' }
    ]
  },
  {
    id: 'php',
    name: 'PHP',
    options: [
      { id: 'class', name: 'Class' },
      { id: 'dto', name: 'DTO' }
    ]
  },
  {
    id: 'java',
    name: 'Java',
    options: [
      { id: 'pojo', name: 'POJO' },
      { id: 'record', name: 'Record' },
      { id: 'lombok', name: 'Lombok Model' }
    ]
  },
  {
    id: 'spring_boot',
    name: 'Spring Boot',
    options: [
      { id: 'entity', name: 'Entity' },
      { id: 'dto', name: 'DTO' },
      { id: 'record', name: 'Record' }
    ]
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    options: [
      { id: 'data_class', name: 'Data Class' }
    ]
  },
  {
    id: 'swift',
    name: 'Swift',
    options: [
      { id: 'codable', name: 'Codable Model' }
    ]
  },
  {
    id: 'go',
    name: 'Go',
    options: [
      { id: 'struct', name: 'Struct' }
    ]
  },
  {
    id: 'csharp',
    name: 'C#',
    options: [
      { id: 'class', name: 'Class' },
      { id: 'record', name: 'Record' }
    ]
  },
  {
    id: 'asp_net',
    name: 'ASP.NET',
    options: [
      { id: 'entity', name: 'Entity' },
      { id: 'dto', name: 'DTO' }
    ]
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    options: [
      { id: 'interface', name: 'Interface' },
      { id: 'type', name: 'Type' }
    ]
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    options: [
      { id: 'dto', name: 'DTO' },
      { id: 'entity', name: 'Entity' }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    options: [
      { id: 'jsdoc', name: 'JSDoc Type' }
    ]
  },
  {
    id: 'prisma',
    name: 'Prisma',
    options: [
      { id: 'schema', name: 'Prisma Schema' }
    ]
  },
  {
    id: 'mongoose',
    name: 'Mongoose',
    options: [
      { id: 'schema', name: 'Schema' }
    ]
  },
  {
    id: 'sequelize',
    name: 'Sequelize',
    options: [
      { id: 'model', name: 'Model' }
    ]
  },
  {
    id: 'typeorm',
    name: 'TypeORM',
    options: [
      { id: 'entity', name: 'Entity' }
    ]
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    options: [
      { id: 'type', name: 'Type' },
      { id: 'input', name: 'Input' }
    ]
  },
  {
    id: 'openapi',
    name: 'OpenAPI',
    options: [
      { id: 'schema', name: 'Schema' }
    ]
  }
]
