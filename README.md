This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Description rich text

The Description field is Quill (`react-quill-new` → `quill@~2.0.3`). Two things about
its output are worth knowing before you touch `lib/api.ts`:

- **Quill turns every space into `&nbsp;`.** Its HTML serializer literally runs
  `escapeText(...).replaceAll(" ", "&nbsp;")`, and `react-quill-new` uses
  `getSemanticHTML()` by default. A submitted paragraph therefore arrives downstream as a
  single unbreakable token, and the admin portal — which draws descriptions with
  `overflow-wrap: anywhere` — had to split it mid-word ("Court street for lo / cal
  vendors"). That was ENG-425.
- **Quill writes blank lines as `<p></p>`,** which has no line box and vanishes when
  rendered as HTML.

`prepareDescriptionHtml()` in `lib/text.ts` fixes both, and is the only thing that should
be applied to a description on its way out. Both submit paths in `lib/api.ts` — the free
`submitBasicEvent` and the paid `createFeaturedCheckout` — call it. Add a third submit path
and it must call it too.

## Tests

```bash
npm test   # node --test over lib/**/*.test.ts, no framework
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
