# LSPD SOP Handbook

A standalone, dark-themed SOP reference site for the Backstreets Police Department.

## Files
- `index.html` — website layout
- `styles.css` — visual design
- `app.js` — handbook renderer, navigation, and search
- `handbook.md` — editable source content copied from the supplied master SOP reference
- `.github/workflows/pages.yml` — automatic GitHub Pages deployment

## Publish with GitHub Pages
1. Upload all files and folders from this package to the repository root.
2. Open **Settings → Pages**.
3. Under Build and deployment, select **GitHub Actions**.
4. Open the **Actions** tab and wait for “Deploy LSPD SOP Handbook to GitHub Pages” to finish.
5. The website URL will be `https://LSPD-Government.github.io/LSPD-SOP-Handbook/`.

## Updating SOPs
Edit `handbook.md`, keep the `#` headings for main sections and `##` headings for subsections, then commit the change. GitHub Actions will redeploy the site automatically.

## Important
The handbook content is preserved from the supplied master reference. Conflicting or unclear policies are not silently resolved. Confirm flagged items with Command before treating them as final policy.