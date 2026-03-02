
# Fix: Login Button Stuck on "Loading..."

## Problem
The login form gets stuck on "Loading..." because the `handleSubmit` function lacks error handling for unexpected exceptions. If the authentication call throws (e.g., network error), `setLoading(false)` never runs, leaving the button permanently disabled.

Additionally, calling `navigate()` directly during render (lines 21-24 in Auth.tsx, lines 24-27 in Index.tsx) is a React anti-pattern that can cause warnings and unpredictable behavior.

## Fix (2 files)

### 1. `src/pages/Auth.tsx`
- Wrap `handleSubmit` body in a `try/catch/finally` block so `setLoading(false)` always runs
- Replace the render-time `navigate()` call with a `<Navigate>` component from react-router-dom (proper declarative redirect)
- Add `console.log` for the sign-in response to help debug if the issue persists

### 2. `src/pages/Index.tsx`
- Replace the render-time `navigate("/auth")` call with a `<Navigate to="/auth" replace />` component

## Technical Details

```text
Auth.tsx changes:
- Import Navigate from react-router-dom
- if (user) return <Navigate to="/" replace />
- Wrap handleSubmit in try/catch/finally

Index.tsx changes:
- Import Navigate from react-router-dom
- if (!user) return <Navigate to="/auth" replace />
```

These are small, targeted fixes that should resolve the stuck loading state and make redirects work reliably.
