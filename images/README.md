# Chapter 4 figure images

Screenshots referenced by `chapter4-implementation.md`. Filenames match the figure
numbers in the chapter, so inserting them is a direct lookup.

Naming: `fig-4.NN-short-description.png`

Captured at 1440px wide, `deviceScaleFactor: 2` (so 2880px actual), which keeps
text sharp in print.

---

## Status

### ✅ Captured automatically

| Figure | File | Source |
|---|---|---|
| 4.5 | `fig-4.05-swagger-index.png` | `localhost:5000/api-docs` |
| 4.6 | `fig-4.06-swagger-matching-endpoint.png` | Swagger, Matching tag + operation expanded |
| 4.7 | `fig-4.07-swagger-authorize.png` | Swagger, Authorize dialog open |
| 4.10 | `fig-4.10-registration.png` | `localhost:5173/register` |
| 4.12 | `fig-4.12-login.png` | `localhost:5173/login` |

### ✅ Captured automatically (authenticated)

Captured through a temporary test account, which was deleted from the database
afterwards.

| Figure | File | Screen |
|---|---|---|
| 4.13 | `fig-4.13-manage-profile.png` | Manage Profile panel |
| **4.14** | `fig-4.14-dashboard-suggestions.png` | **Dashboard with ranked suggestions — the key figure** |
| 4.15 | `fig-4.15-verified-suggestion.png` | Suggestion rail with peers and groups |
| 4.16 | `fig-4.16-verification-dashboard.png` | Verification status per subject |
| 4.19 | `fig-4.19-messaging-two-accounts.png` | Inbox (single account) |
| 4.20 | `fig-4.20-create-group.png` | Create group, privacy options |
| 4.21 | `fig-4.21-explore-groups.png` | Explore Groups |
| 4.23 | `fig-4.23-feed.png` | Learning resource feed |
| 4.25 | `fig-4.25-create-post.png` | Create post form |
| 4.28 | `fig-4.28-dashboard-mobile.png` | Dashboard, mobile viewport |
| 4.29 | `fig-4.29-chat-mobile.png` | Chat, mobile viewport |

**16 of 29 figures captured.** All are already embedded in
`chapter4-implementation.md`.

## Capturing the rest

The automation script is `scripts/capture-screenshots.js` in the repository root.
It drives a real Chrome instance through the running application.

**Prerequisites**

1. Backend running on port 5000, frontend on 5173.
2. A test account whose email is already verified, with subjects declared, at
   least one group, and at least one post — otherwise the screens are empty and
   evidence nothing.

**Run**

```bash
node scripts/capture-screenshots.js --email you@example.com --password 'yourpassword'
```

Files are written into this folder with the names listed above.

---

## Before submitting

- [ ] Every image inserted into `chapter4-implementation.md` in place of its
      `[SCREENSHOT n]` placeholder
- [ ] No password, token or real email address visible in any image
- [ ] Data populated so no screen appears empty
- [ ] Consistent browser window size across all web figures


---

## Still outstanding (13)

Require a desktop application, a private inbox, or manual interaction:

| Figure | What to capture |
|---|---|
| 4.1 | VS Code with the project open |
| 4.2–4.4 | MongoDB Compass: collections, a user document, a verification document |
| 4.8–4.9 | Postman: login and suggestions requests |
| 4.11 | The verification email as received |
| 4.17–4.18 | Quiz in progress and quiz result (needs a subject with attempts remaining) |
| 4.22 | Group administrator's view of a pending join request |
| 4.24 | A post with its comment thread open |
| 4.26–4.27 | Admin dashboard and user management — re-run the script with `--admin-email` and `--admin-password` |

## Note on the captured images

Three of the four existing accounts show a broken avatar. Their database paths are
correct; the image **files** are absent from `backend/uploads/`, because that
folder did not exist before the upload fix and the originals were never written.
Only Merrick's picture, uploaded after the fix, survives.

To improve these figures, re-upload profile pictures for those accounts and run
the capture script again.
