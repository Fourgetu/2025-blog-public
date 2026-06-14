# Blog Deployment Checklist

This fork is prepared for Vercel deployment.

## Vercel

1. Import `https://github.com/Fourgetu/2025-blog-public`.
2. Keep the default framework settings detected by Vercel.
3. Add these environment variables for Production, Preview, and Development:

```env
NEXT_PUBLIC_GITHUB_OWNER=Fourgetu
NEXT_PUBLIC_GITHUB_REPO=2025-blog-public
NEXT_PUBLIC_GITHUB_BRANCH=main
NEXT_PUBLIC_GITHUB_APP_ID=<your GitHub App ID>
NEXT_PUBLIC_GITHUB_ENCRYPT_KEY=<random public encryption key>
BLOG_SLUG_KEY=
```

## GitHub App

Create a GitHub App from GitHub Developer Settings:

- Disable Webhook.
- Repository permissions: Contents `Read and write`.
- Install only on `Fourgetu/2025-blog-public`.
- Download the Private Key and keep it off GitHub.

After Vercel redeploys, use the app Private Key in the blog UI when publishing content.
