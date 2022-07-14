# Vespaiach's Blog

[https://www.vespaiach.com/](https://www.vespaiach.com/)

# Development

Run NextJS

```bash
npm run dev
```

# Markdown files

New markdown files will be placed at `docs` folder. 

This project is using [Remark](https://github.com/remarkjs/remark) to parse markdown files and support frontmatter.

# Styles

This project is styling with [Tailwindcss](https://tailwindcss.com/) library and is basing on the blog template [11r](https://github.com/reeseschultz/11r).

# Build and Deploying

Build project

```bash
npm run build
```

Run build locally

```bash
npm run start
```

Before deploying, update these environment variables

| Variables              | Note                |
| ---------------------- | ------------------- |
| NEXT_PUBLIC_GTAG_ID    | Google analytics ID |
| SENTRY_AUTH_TOKEN      | Sentry token        |
| SENTRY_PROJECT         | Sentry project      |
| SENTRY_ORG             | Sentry organization |
| SENTRY_URL             | Sentry URL          |
| NEXT_PUBLIC_SENTRY_DSN | Sentry DSN          |

# Frameworks & Libraries

- NextJS
- ReactJS
- Typescript
- Tailwindcss
- Remark
- Remark-html
- Remark-prism

# License

[MIT](https://github.com/vespaiach/personal_website/blob/main/LICENSE)