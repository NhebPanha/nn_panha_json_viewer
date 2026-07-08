# SYSTEM INSTRUCTION

You are a senior software architect, senior Nuxt developer, UI/UX designer, and DevOps engineer.

Before generating any code, you MUST inspect and analyze the current project.

---

# PHASE 1 — PROJECT DISCOVERY

Read and analyze all files inside:

```bash
.agents/skills/**
```

Including:

```bash
.agents/skills/*.md
.agents/skills/*.txt
.agents/skills/*.yaml
.agents/skills/*.yml
.agents/skills/**/*.md
.agents/skills/**/*.txt
.agents/skills/**/*.yaml
.agents/skills/**/*.yml
```

Extract:

* Coding standards
* Naming conventions
* Architecture patterns
* Component patterns
* Composable patterns
* State management patterns
* Folder structure conventions
* Error handling conventions
* API conventions
* Design system conventions
* Testing conventions
* Documentation conventions

Treat these files as the project's source of truth.

If anything in this prompt conflicts with `.agents/skills`, prioritize `.agents/skills`.

Do not generate code until analysis is completed.

Output:

```text
✓ Skills loaded
✓ Architecture identified
✓ Standards identified
✓ Components identified
✓ Risks identified
✓ Build plan created
```

---

# PROJECT OVERVIEW

Build a modern SaaS web application called:

# JSON Model Generator

A next-generation alternative to QuickType.

Reference:

https://app.quicktype.io

Do NOT copy their UI.

Create a significantly more modern experience inspired by:

* Vercel
* Linear
* Raycast
* Stripe
* Supabase
* Shadcn
* GitHub

---

# GOAL

Allow developers to:

1. Paste JSON
2. Upload JSON file
3. Validate JSON
4. Format JSON
5. Minify JSON
6. Generate models
7. Generate DTOs
8. Generate entities
9. Generate schemas
10. Generate API models
11. Copy generated code
12. Download generated code

Everything must happen instantly in the browser.

---

# TECH STACK

Framework:

* Nuxt 4
* Vue 3
* TypeScript

Styling:

* Tailwind CSS v4

State:

* Pinia

Utilities:

* VueUse

Editor:

* Monaco Editor

Theme:

* Nuxt Color Mode

Icons:

* Nuxt Icon

Deployment:

* Vercel

Linting:

* ESLint
* Prettier

Package Manager:

* pnpm

---

# THEME SYSTEM

Implement:

## Light

Professional white theme

## Dark

Developer-first dark theme

## System

Automatically follow OS preference

Persist theme selection.

Use:

```ts
@nuxtjs/color-mode
```

Default:

```ts
system
```

---

# COLOR SYSTEM

Light:

Primary:
#2563EB

Secondary:
#7C3AED

Background:
#FFFFFF

Card:
#F8FAFC

Border:
#E2E8F0

Dark:

Background:
#020617

Surface:
#0F172A

Card:
#111827

Border:
#334155

Primary:
#3B82F6

Success:
#22C55E

Warning:
#F59E0B

Danger:
#EF4444

---

# MAIN FEATURE

## JSON INPUT

Support:

* Paste JSON
* Upload JSON
* Drag & Drop JSON

Formats:

* .json
* .txt

Editor:

Monaco Editor

Features:

* Syntax highlighting
* Auto formatting
* Error markers
* JSON validation
* Line number errors
* Auto save

---

# JSON TO CODE GENERATION

Generate models for:

## Flutter

Options:

* Plain Dart Model
* Equatable Model
* Freezed Model
* Json Serializable Model

## Laravel

Options:

* Model
* DTO
* Resource
* Cast Class

## PHP

Options:

* Class
* DTO

## Java

Options:

* POJO
* Record
* Lombok Model

## Spring Boot

Options:

* Entity
* DTO
* Record

## Kotlin

Options:

* Data Class

## Swift

Options:

* Codable Model

## Go

Options:

* Struct

## C#

Options:

* Class
* Record

## ASP.NET

Options:

* Entity
* DTO

## Node.js

Options:

* Interface
* Type

## NestJS

Options:

* DTO
* Entity

## TypeScript

Options:

* Interface
* Type

## JavaScript

Options:

* JSDoc Type

## Prisma

Options:

* Prisma Schema

## Mongoose

Options:

* Schema

## Sequelize

Options:

* Model

## TypeORM

Options:

* Entity

## GraphQL

Options:

* Type
* Input

## OpenAPI

Options:

* Schema

---

# ADVANCED GENERATION

Support:

Nested Objects

Arrays

Nullable Fields

Union Types

Enums

Date Detection

UUID Detection

Boolean Detection

Map Types

Dynamic Objects

Optional Fields

Recursive Structures

---

# USER INTERFACE

Layout:

```text
┌──────────────────────────────────────────────┐
│ Header                                       │
├──────────────────────────────────────────────┤
│                                               │
│ JSON Input          Generated Code            │
│                                               │
│                                               │
├──────────────────────────────────────────────┤
│ Generation Settings                           │
└──────────────────────────────────────────────┘
```

---

# HEADER

Logo

Project Name

Navigation

* Home
* Documentation
* Languages
* Github

Theme Switcher

---

# LEFT PANEL

JSON Editor

Actions:

* Upload
* Format
* Minify
* Validate
* Clear

---

# RIGHT PANEL

Generated Code

Actions:

* Copy
* Download
* Fullscreen
* Word Wrap

---

# SETTINGS PANEL

Language Selector

Framework Selector

Generation Style Selector

Generate Button

---

# EXTRA FEATURES

Search JSON

Search Generated Code

Copy Path

Expand All

Collapse All

Line Highlighting

Keyboard Shortcuts

Ctrl+Enter

Generate

Ctrl+Shift+F

Format JSON

Ctrl+Shift+C

Copy Code

---

# ANALYTICS

Architecture should allow:

* Plausible
* Google Analytics
* Umami

without code refactoring.

---

# ACCESSIBILITY

WCAG Compliant

Keyboard Navigation

Screen Reader Support

Focus States

---

# PERFORMANCE

Requirements:

* SSR Compatible
* Lazy Loading
* Dynamic Imports
* Route Splitting
* Optimized Bundle
* Fast First Paint
* Fast Hydration

Target Lighthouse:

Performance > 95

Accessibility > 95

SEO > 95

Best Practices > 95

---

# FOLDER STRUCTURE

Create:

```text
app/
components/
composables/
layouts/
pages/
stores/
types/
utils/
constants/
server/
public/
assets/
```

Follow conventions discovered in `.agents/skills`.

---

# COMPONENTS

Create reusable components:

JsonEditor.vue

CodePreview.vue

LanguageSelector.vue

FrameworkSelector.vue

ThemeSwitcher.vue

JsonToolbar.vue

FileUpload.vue

CodeToolbar.vue

GenerationSettings.vue

Header.vue

Footer.vue

LoadingState.vue

ErrorState.vue

EmptyState.vue

---

# COMPOSABLES

Create:

useJsonParser.ts

useCodeGenerator.ts

useTheme.ts

useClipboard.ts

useDownload.ts

useFileUpload.ts

---

# STORES

Create:

editor.store.ts

generator.store.ts

theme.store.ts

---

# SEO

Implement:

Meta Tags

Open Graph

Twitter Cards

Sitemap

Robots

Structured Data

---

# DEPLOYMENT

Target:

Vercel

Generate:

* vercel.json
* nuxt.config.ts
* environment variable examples
* deployment guide

---

# OUTPUT REQUIREMENTS

Generate:

1. Architecture Analysis
2. Project Structure
3. Component Tree
4. Database-Free Architecture
5. State Management Design
6. UI Design System
7. Full Source Code
8. Tailwind 4 Setup
9. Nuxt 4 Setup
10. Vercel Configuration
11. Deployment Instructions

All code must be production-ready, scalable, maintainable, strongly typed, and follow the standards discovered from `.agents/skills`.
