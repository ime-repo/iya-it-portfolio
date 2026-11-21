# Iya M. Elardo — IT Portfolio

A responsive portfolio built with Next.js, TypeScript, and CSS. The visual system uses a dark midnight palette with lime, electric-blue, and coral accents. The project uses typography and CSS layouts rather than third-party logos or decorative artwork.

## Run locally

1. Install Node.js (LTS): https://nodejs.org/
2. Open this project folder in VS Code (the folder that contains `package.json`).
3. Open Terminal and run:

```bash
npm install
npm run dev
```

4. Visit http://localhost:3000

## Customize the design

### Change the colors

Open `app/globals.css` and edit the variables near the top under `QUICK CUSTOMIZATION`:

- `--bg`: overall page background
- `--surface` and `--surface-2`: cards and panels
- `--ink`: main text
- `--muted`: secondary text
- `--accent`: main highlight color
- `--accent-2`: secondary highlight
- `--accent-3`: third highlight

The rest of the stylesheet uses these variables, so changing them updates the theme throughout the site.

### Change your content

Open `app/page.tsx`:

- Edit the `projects` array to add, remove, or update project entries.
- Edit `skillGroups` to change the skills and tools shown.
- Edit the introduction and education text directly in the page component.
- Change the `mailto:` address to your preferred public contact email.

Project filters (All, Development, Design, Documentation) are generated from the project categories. Keep a project's `category` as one of those four values so filtering works.

## Add your resume

Copy your current PDF into `public/` and name it `resume.pdf`. The navigation and contact section already link to `/resume.pdf`.

## Interaction and transitions

- Navigation links move to page sections.
- Project category filters switch the visible project cards.
- Each project has an expandable details area.
- Hover, filter, and reveal transitions are intentionally subtle.
- Reduced-motion preferences are respected.

## Deploy for free

1. Create a GitHub account and a repository for this portfolio.
2. Push this project to the repository.
3. Sign in to Vercel with GitHub: https://vercel.com/
4. Import the repository and deploy.
5. Vercel will provide a public `*.vercel.app` URL you can add to your resume.

Review the current Vercel Hobby plan terms before deploying.

## Accuracy note

Project entries describe the contributions currently listed in the resume. The project panels are typographic placeholders, not screenshots or logos from the original applications. Replace them with authentic screenshots or remove them as appropriate once original project materials are available.
