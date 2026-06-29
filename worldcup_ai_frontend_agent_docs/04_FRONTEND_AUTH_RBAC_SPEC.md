# 04 FRONTEND AUTH AND RBAC SPEC

## Roles

```ts
export type UserRole = 'GUEST' | 'USER' | 'PREMIUM' | 'ADMIN';
```

The backend returns only authenticated roles: `USER`, `PREMIUM`, `ADMIN`. Frontend may use `GUEST` locally when `/auth/me` returns 401.

## Route Access

| Route | Guest | USER | PREMIUM | ADMIN |
|---|---:|---:|---:|---:|
| `/` | yes | yes | yes | no general use |
| `/login` | yes | redirect | redirect | redirect |
| `/register` | yes | no | no | admin create page only |
| `/matches*` | no | yes | yes | no |
| `/teams*` | no | yes | yes | no |
| `/players*` | no | yes | yes | no |
| `/champion-predictions*` | no | yes | yes | no |
| `/news*` | no | yes | yes | no |
| `/profile` | no | yes | yes | no |
| `/favorites` | no | yes | yes | no |
| `/admin/*` | no | no | no | yes |

## Navigation Rules

### Guest

Show:

- Home
- Login
- Register

Hide:

- main app nav
- user dropdown
- floating chat

### USER / PREMIUM

Show:

- Matches
- Teams
- Players
- Champion Predictions
- News
- user dropdown: Profile, Favorites, Logout
- floating general chat

### ADMIN

Show only:

- Admin Accounts
- Register Admin
- Logout

Hide:

- Matches
- Teams
- Players
- Champion Predictions
- News
- Favorites
- Floating chat
- Profile page

## Premium UI Rules

Only PREMIUM sees:

- News translation button
- Deep chat panels
- Champion prediction recalculation button
- Model disagreement details if provided by API

USER should see upgrade/permission notice or hide the controls. If an API returns 403, display a permission error.

## Login Redirect Rules

Use backend `redirectPath` when available.

Fallback:

```ts
if (role === 'ADMIN') router.replace('/admin/accounts');
else router.replace('/matches');
```
