# 🚀 Deployment Guide - JSON Model Generator

**Version:** `v0.1.0`

This application is built using **Nuxt 4** and is fully client-side capable, meaning it runs instantly in the browser.

---

## ⚡ Quick Deployment (Vercel)

The easiest way to deploy this application is through Vercel:

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to the **[Vercel Dashboard](https://vercel.com?utm_source=chatgpt.com)**.
3. Click **"Add New"** → **"Project"** and import your repository.
4. Vercel will automatically detect the **Nuxt** framework preset.
5. Click **"Deploy"**.

Your application will be live at a Vercel-generated subdomain (e.g. `json-model-generator.vercel.app`) in under a minute.

---

## 🏗️ Production Build Locally

To build and test the production-ready package locally:

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Generate the Production Bundle

```bash
npm run build
```

### 3. Preview the Build Locally

```bash
npm run preview
```

The preview server will start at:

```text
http://localhost:3000
```

---

## 📦 Release Information

| Version | Release Date | Description                                                                                                                                                              |
| ------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v0.1.0  | July 2026    | Initial release of JSON Model Generator with JSON formatting, validation, multi-language model generation, theme support (Light, Dark, System), and Nuxt 4 architecture. |

---

## 🛠️ Tech Stack

* Nuxt 4
* Vue 3
* TypeScript
* Tailwind CSS 4
* Pinia
* Monaco Editor
* Prettier
* Vercel Deployment

---

## 📄 License

MIT License © 2026 JSON Model Generator
