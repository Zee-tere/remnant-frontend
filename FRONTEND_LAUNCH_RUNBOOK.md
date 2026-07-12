# Remnant Frontend Launch Runbook

This project deploys the Next.js frontend with SST's AWS Nextjs component. The backend is already on AWS, so the frontend only needs the public API/socket URLs and the launch feature flags.

## 1. Local Checks

From `remnant-frontend`:

```bash
node -v
npm ci
npm run build
```

Use Node 20 or newer for SST/OpenNext deployment.

This repo has `images.unoptimized = true` in `next.config.ts`. The app uses public/static image tags, not `next/image`, and disabling the optimizer avoids OpenNext's Windows image-optimization bundling failure:

```text
ENOENT: no such file or directory, mkdtemp ... open-next-install-...\image-optimization-function
```

## 2. Required Environment Values

Create a local `.env` for SST deploys, or export these in the shell before deploying:

```bash
NEXT_PUBLIC_API_URL=https://36yevvooae.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_SOCKET_URL=https://36yevvooae.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_ESCROW_ENABLED=false
```

The frontend auth flow does not need public Cognito env vars. It reads Hosted UI config from the backend `/auth/config` endpoint.

The Hosted UI flow uses authorization code + PKCE. In Cognito, the app client must allow:

- Authorization code grant
- OpenID, email, and profile scopes
- Google identity provider, if Google sign-in is enabled
- No client secret for the browser app client

## 3. AWS Prerequisites

Before deploying production:

- Confirm AWS CLI access to account `158128612346`.
- Use region `us-east-1`.
- Confirm Route 53 hosted zone for `remnantmarket.co` exists.
- Remove stale apex or `www` A/AAAA/CNAME records that could conflict with SST-created aliases. Leave NS/SOA records.
- Confirm the API allows CORS from the final frontend domain. The backend origin helper now allows `remnantmarket.co` and `www.remnantmarket.co`; production env should still set `FRONTEND_URL` and `ALLOWED_ORIGINS` explicitly.

## 4. First SST Deploy

SST is configured in `sst.config.ts`.

Dev/staging deploy:

```bash
npm run deploy:dev
```

Production deploy:

```bash
npm run deploy:prod
```

Production uses:

- `remnantmarket.co`
- `www.remnantmarket.co` redirected to apex
- `NEXT_PUBLIC_ESCROW_ENABLED=false`

## 5. Cognito Updates

After SST returns the production URL and DNS is live, update the Cognito app client callback/logout URLs.

Add:

```text
https://remnantmarket.co/auth/callback
```

For dev-stage CloudFront testing, temporarily add:

```text
https://YOUR_DEV_CLOUDFRONT_DOMAIN/auth/callback
```

Keep local callback URLs only if you still need local auth testing.

## 6. GitHub Actions Setup

The workflow is at `.github/workflows/deploy-frontend.yml`.

Add these GitHub Actions secrets:

```text
AWS_DEPLOY_ROLE_ARN
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SOCKET_URL
```

Recommended values:

```text
NEXT_PUBLIC_API_URL=https://36yevvooae.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_SOCKET_URL=https://36yevvooae.execute-api.us-east-1.amazonaws.com
```

The workflow deploys on pushes to `main` and can also be run manually with `workflow_dispatch`.

## 7. Production Smoke Test

Check these before announcing launch:

- Homepage renders on desktop and phone.
- Header search submits correctly.
- Category carousel opens marketplace with the right category filter.
- Marketplace filters match newly listed item categories.
- Guest listing upload works and stays capped at 4 images.
- Authenticated listing upload allows up to 8 images.
- Login/signup round trip through Cognito Hosted UI works.
- Google sign-in opens Cognito Hosted UI with the Google provider and returns through `/auth/callback`.
- `/auth/callback` restores the user into the app.
- Escrow/payment UI is hidden.
- HTTPS padlock is valid.
- `www.remnantmarket.co` redirects to `remnantmarket.co`.
- CloudWatch logs exist for the deployed frontend Lambdas.

## 8. If Deployment Fails

- If SST cannot download Pulumi locally, rerun with normal internet access.
- If ACM validation is stuck, check Route 53 validation records and stale records.
- If API requests fail in production, check API Gateway CORS for `https://remnantmarket.co`.
- If auth redirects fail, check Cognito callback URL spelling exactly.
- If deploy fails on IAM, expand the GitHub deploy role temporarily, deploy once, then tighten permissions after the stack stabilizes.
