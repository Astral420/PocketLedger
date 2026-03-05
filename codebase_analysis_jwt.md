# PocketLedger — Codebase Criticisms + JWT Architecture Advice

## Part 1: Codebase Criticisms

### 🔴 Critical Issues

#### 1. [login()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#22-41) controller is incomplete — tokens are generated but never returned
```typescript
// auth.controller.ts:33-34
const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
// ...and then nothing. No response is sent. The catch block is also empty.
```
The function generates both tokens but **never sends them back to the client**. The `catch` block is also completely empty — no response, no logging, nothing. This means if login fails, the client gets a *hanging request* that eventually times out.

#### 2. `jsonwebtoken` is imported but NOT installed as a runtime dependency
In [package.json](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/package.json), `jsonwebtoken` only appears in `devDependencies` as `@types/jsonwebtoken`. The actual `jsonwebtoken` package is **missing from `dependencies`**. This will crash at runtime in production.

#### 3. JWT payload inconsistency (`userId` vs `sub`)
- **auth.controller.ts** signs tokens with `{ userId: user.id }`
- **auth.middleware.ts** verifies and reads `payload.sub`

These don't match. The middleware will always get `undefined` for `req.userId`, meaning **authentication will silently fail** even with a valid token.

#### 4. [getUserByEmail()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/models/user.model.ts#15-21) returns `rows` (array), but consumers treat it inconsistently
- In [register()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#6-21): accesses `user.rows.length` — but [getUserByEmail](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/models/user.model.ts#15-21) already returns `rows`, so `user` IS the array. `user.rows` is `undefined`, meaning the duplicate-email check **never works**.
- In [login()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#22-41): accesses `user.password_hash` directly — but `user` is an array, so this is also `undefined`.

#### 5. SQL syntax error in [oauth.model.ts](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/models/oauth.model.ts)
```sql
INSERT INTO oauth_accounts (user_id, provider, provider_user_id, email)
VALUES ($1, $2, $3, $4)
DO UPDATE SET email = EXCLUDED.email
```
Missing `ON CONFLICT` clause. This should be `ON CONFLICT (provider, provider_user_id) DO UPDATE SET ...`. The current query will throw a PostgreSQL syntax error at runtime.

#### 6. Stray character on line 26 of [user.model.ts](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/models/user.model.ts)
```typescript
return rows;
};0    // ← stray "0" will cause a syntax/runtime issue
```

---

### 🟡 Moderate Issues

#### 7. No `cors` middleware is applied
`cors` is installed as a dependency but **never imported or used** in [app.ts](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/app.ts). Your React Native client will hit CORS issues when making API calls from a different origin (especially during web development/testing).

#### 8. Router is empty — no routes are registered
[routes/index.ts](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/routes/index.ts) creates a router but doesn't register any routes. The [register](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#6-21) and [login](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#22-41) controller functions exist but are unreachable because they are not wired to any endpoints.

#### 9. No input validation/sanitization
Neither [register()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#6-21) nor [login()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#22-41) validate the incoming `req.body`. No checks for missing fields, email format, password length, etc. This should be handled with a validation library like `zod` or `express-validator`.

#### 10. `refresh_tokens` table exists but has no model
Your migration defines a `refresh_tokens` table with `token_hash`, `expires_at`, `revoked_at`, etc. — excellent schema design. But there's **no corresponding model file** (`refresh_token.model.ts`) to interact with it.

#### 11. Client-side login does no API call
The [handleLogin()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/PocketLedger-client/src/app/%28auth%29/login.tsx#53-58) in [login.tsx](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/PocketLedger-client/src/app/%28auth%29/login.tsx) only validates input locally and then calls `router.replace("/(tabs)")` — it never calls the server. This is obviously placeholder behavior, but worth noting.

#### 12. No `AuthContext` or auth state management on the client
There's a [ThemeContext](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/PocketLedger-client/src/app/contexts/ThemeContext.tsx#64-67) but no `AuthContext`. You'll need a context to manage the authenticated user state, tokens, and provide [login](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#22-41)/`logout`/`refresh` functions globally.

---

### 🟢 Minor / Style Issues

#### 13. Nested `try/catch` in [requireAuth](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/middlewares/auth.middleware.ts#10-29) middleware
The double `try/catch` is redundant — the outer catch will never trigger since the inner one handles all errors from `jwt.verify()`.

#### 14. `services/` directory exists but is empty
The `services/` directory was created but has no files. This is fine as a placeholder but signals incomplete architectural planning.

#### 15. Error responses leak internal details
```typescript
res.status(500).json({ error: 'Internal server error', message: err });
```
Sending the raw `err` object to clients can leak stack traces and internal details. In production, only send generic messages.

---

## Part 2: JWT Implementation — Your Questions Answered

### Your Understanding is Correct

You are on the right track with the **dual-token pattern**:

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| **Access Token** | Short (15m) | Client-side async storage | Sent as `Authorization: Bearer <token>` on every API request |
| **Refresh Token** | Long (30d) | **Hash** stored in PostgreSQL; raw token on client-side secure storage | Used to get a new access token when the old one expires |

### Where to Store the Refresh Token (Server-Side)

**Yes, your PostgreSQL `refresh_tokens` table is the correct place.** Your migration already has an excellent schema for this:

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,      -- ✅ Store a hash, not the raw token
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ NULL,   -- ✅ Allows token revocation
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent  TEXT NULL,           -- ✅ Nice for identifying sessions
  ip_address  TEXT NULL
);
```

The key insight: you **never store the raw refresh token** in your database. You hash it (SHA-256 is sufficient, bcrypt is overkill here since the token is already high-entropy random data) and store the hash. When a client presents a refresh token, you hash the incoming token and compare it against the stored hash. This means even if your database is compromised, the attacker can't use the refresh tokens.

### Where to Store Tokens (Client-Side) — The Big Question

This is where your question about "async storage" comes in. In React Native, you have several options, and they are **not equal** in security:

---

### ❌ `@react-native-async-storage/async-storage` — **NOT recommended for tokens**

This is what most people think of as "async storage." It's essentially:
- **iOS**: Unencrypted `NSUserDefaults` / file storage
- **Android**: Unencrypted `SharedPreferences` / SQLite

> [!CAUTION]
> AsyncStorage is **not encrypted**. It stores data as plain text on disk. On rooted/jailbroken devices, any app can read this data. **Do NOT store refresh tokens here.**

It's fine for non-sensitive data (theme preference, cached UI state, onboarding flags), but not for tokens.

---

### ✅ `expo-secure-store` — **Recommended for your stack**

Since you're using **Expo SDK 55**, `expo-secure-store` is the natural choice:
- **iOS**: Uses the **iOS Keychain** (hardware-backed encryption)
- **Android**: Uses **Android Keystore** + **EncryptedSharedPreferences** (AES-256)

```
npx expo install expo-secure-store
```

```typescript
import * as SecureStore from 'expo-secure-store';

// Store
await SecureStore.setItemAsync('refresh_token', refreshToken);
await SecureStore.setItemAsync('access_token', accessToken);

// Retrieve
const token = await SecureStore.getItemAsync('access_token');

// Delete (on logout)
await SecureStore.deleteItemAsync('refresh_token');
await SecureStore.deleteItemAsync('access_token');
```

> [!TIP]
> Store **both** tokens in `expo-secure-store`. Yes, even the access token. The performance overhead is negligible (~1-2ms), and there's no good reason to store it insecurely when a secure option is available and free.

---

### ✅ `react-native-keychain` — **Alternative if you weren't using Expo**

For bare React Native projects, `react-native-keychain` provides direct Keychain/Keystore access. But since you're on Expo, `expo-secure-store` wraps the same native APIs and is simpler to integrate.

---

### Recommended Token Flow for Your App

Here's how the complete JWT flow should work in your PocketLedger app:

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Client (RN)                    Server (Express)                │
│  ─────────────                  ────────────────                │
│  POST /api/v1/auth/login  ──►  Validate credentials            │
│  { email, password }           Generate access_token (15m)      │
│                                Generate refresh_token (30d)     │
│                                Hash refresh_token with SHA-256  │
│                                Store hash in `refresh_tokens`   │
│                          ◄──   Return { access_token,           │
│                                         refresh_token }         │
│  Store both tokens in                                           │
│  expo-secure-store                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED REQUEST                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Client                         Server                          │
│  ──────                         ──────                          │
│  Read access_token from                                         │
│  SecureStore                                                    │
│  GET /api/v1/transactions ──►  requireAuth middleware           │
│  Authorization: Bearer <at>    Verify JWT signature + expiry    │
│                          ◄──   Return data (or 401 if expired)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TOKEN REFRESH FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Client                         Server                          │
│  ──────                         ──────                          │
│  Access token expired (401)                                     │
│  Read refresh_token from                                        │
│  SecureStore                                                    │
│  POST /api/v1/auth/refresh ──► Hash incoming refresh_token      │
│  { refresh_token }             Look up hash in `refresh_tokens` │
│                                Check: not expired, not revoked  │
│                                Generate NEW access_token        │
│                                (Optionally rotate refresh_token)│
│                           ◄──  Return { access_token,           │
│                                         refresh_token? }        │
│  Store new tokens in                                            │
│  SecureStore                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        LOGOUT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Client                         Server                          │
│  ──────                         ──────                          │
│  POST /api/v1/auth/logout ──►  Set `revoked_at = NOW()`        │
│  { refresh_token }             on the matching refresh_token    │
│                           ◄──  200 OK                           │
│  Delete both tokens from                                        │
│  SecureStore                                                    │
│  Navigate to login screen                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What You'll Need to Build (Summary)

**Server-side:**
1. Install `jsonwebtoken` as a runtime dependency (it's currently missing)
2. Create `refresh_token.model.ts` — CRUD for the `refresh_tokens` table
3. Fix JWT payload to use a consistent claim (`sub` is the standard)
4. Complete the [login()](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#22-41) controller to return tokens and save the refresh hash
5. Create `POST /api/v1/auth/refresh` endpoint
6. Create `POST /api/v1/auth/logout` endpoint
7. Fix all the bugs listed in Part 1

**Client-side:**
1. Install `expo-secure-store`
2. Create an `AuthContext` that manages tokens, user state, and exposes [login](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/server/src/controllers/auth.controller.ts#22-41)/`logout`/`refresh`
3. Create an API service layer (in `services/`) with an Axios/fetch interceptor that:
   - Attaches the access token to every request
   - On 401, automatically attempts a token refresh
   - On refresh failure, logs out the user
4. Wire [login.tsx](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/PocketLedger-client/src/app/%28auth%29/login.tsx) and [register.tsx](file:///Users/apple/Desktop/Dev%20Work/ReactNative/BudgetTracker/PocketLedger-client/src/app/%28auth%29/register.tsx) to hit actual API endpoints

### Direct Answer to Your Question

> **What async storage should I use?**

**Use `expo-secure-store`** for both tokens. It's part of the Expo ecosystem you're already using, it's hardware-backed encrypted storage, and it takes ~5 minutes to install and use. There is no reason to use `AsyncStorage` for tokens in 2026 — it's insecure and not appropriate for authentication credentials.

For anything **non-sensitive** (theme preference, cached category names, UI state), `@react-native-async-storage/async-storage` is perfectly fine.
