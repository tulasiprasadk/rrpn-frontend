# Vercel Environment Variables for Frontend

## Required Variables

Copy this to Vercel Dashboard → Settings → Environment Variables

```
VITE_API_BASE=https://rrpn-backend.vercel.app
```

## How to Set in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your frontend project (rrpn-frontend)
3. Go to **Settings** → **Environment Variables**
4. Add `VITE_API_BASE` with value `https://rrpn-backend.vercel.app`
5. Make sure to select **Production** environment
6. Click **Save**

## Important Notes

- ⚠️ The variable name must start with `VITE_` for Vite to expose it
- ⚠️ After adding, you may need to redeploy for changes to take effect
- ⚠️ This tells the frontend where to find the backend API
