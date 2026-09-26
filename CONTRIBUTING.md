# Contributing

Thanks for helping improve this project. This guide covers the local setup and
the checks every change is expected to pass.

## Requirements

| Tool       | Version | Notes                                    |
| ---------- | ------- | ---------------------------------------- |
| Node.js    | 22.x    | Developed and verified on 22.14.0        |
| npm        | 11.x    | Ships with Node 22                       |
| PostgreSQL | 15+     | Any reachable instance works             |

## Setup

```bash
# 1. Install both workspaces
npm run install:all

# 2. Configure the backend
cp backend/.env.example backend/.env
# Windows: copy backend\.env.example backend\.env

# 3. Set a real JWT_SECRET in backend/.env
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 4. Create the database schema
createdb charity            # Windows: createdb charity
npm --prefix backend run prisma:migrate:dev

# 5. Create an administrator account
npm --prefix backend run user:create -- admin@example.org "a-strong-password"
```

Then start the two processes in separate terminals:

```bash
npm run dev:backend     # http://localhost:3000, Swagger at /api/docs
npm run dev:frontend    # http://localhost:5173
```

## Checks to run before opening a pull request

Run all four from the repository root:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

`format` rewrites files in place if Prettier disagrees. Keep formatting
committed, since `format:check` runs in CI.

## Code style

- Prettier and ESLint own formatting. Do not hand-tune whitespace.
- Relative imports in the backend carry an explicit `.js` extension, because the
  API is ESM (`"type": "module"` with TypeScript `nodenext`).
- The backend compiles with `tsc`, not `nest build`.
- Money is stored as `Decimal(14,2)` and must never pass through a float.
- `donationDate` is a calendar date stored as `YYYY-MM-DD` with no timezone
  conversion. See the design notes in the README before touching date handling.

## Database changes

Schema changes need a migration committed alongside them:

```bash
npm --prefix backend run prisma:migrate:dev -- --name describe_your_change
```

Commit the files under `backend/prisma/migrations/`. Never edit an existing
migration that has already been applied to a shared database.

## Pull requests

- Keep the change focused on one topic.
- Explain the reasoning in the description, especially for anything touching
  auth, permissions, or money.
- Note any new environment variable in `backend/.env.example`.
- If you add a dependency, say why the existing ones do not cover it.

## Reporting bugs

Open an issue with what you did, what you expected, and what happened instead,
including the relevant console output. See [SECURITY.md](SECURITY.md) for
anything that is a security problem rather than a bug.

## License

Contributions are accepted under the [MIT License](LICENSE).
