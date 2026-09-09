# GitHub Repository Manager V3

## Vercel deployment

1. Upload/import this entire project. The Vercel Root Directory must be the folder containing `package.json` and `app/`.
2. Vercel automatically detects Next.js.
3. Add Environment Variable:
   `GITHUB_TOKEN=YOUR_TOKEN`
4. Redeploy.

## Important

Do not use `NEXT_PUBLIC_GITHUB_TOKEN`.

Replace All creates a new Git tree containing only the ZIP files, creates a normal commit whose parent is the previous commit, and moves the default branch to it. Thus old files disappear from the current branch while Git history remains.

The ZIP must be a normal project ZIP. Do not include node_modules or .next unless needed.
