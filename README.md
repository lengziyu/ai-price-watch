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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment Notes (Avoid Runtime Data Conflicts)

This project stores admin runtime data in `ADMIN_DATA_DIR` (default: `.runtime/admin-data`) to avoid Git pull conflicts on server.

### Recommended production workflow

1. Set `ADMIN_DATA_DIR` in `.env` (example: `/opt/apps/ai-price-watch/.runtime/admin-data`).
2. Deploy with `./scripts/update-server.sh` only.
3. Do not run manual `git pull` before running the deploy script.

### Why this prevents conflicts

- Runtime JSON files are written to `ADMIN_DATA_DIR` outside tracked repo files.
- Deploy script can bootstrap data from legacy `data/admin/*.json` once, then future writes stay in runtime directory.
- Git updates no longer overwrite live admin content.
