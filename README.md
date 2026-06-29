# README.md

## gdcompile

Build custom Godot Engine templates (editor + export templates) on-demand.

### What it does

Compile Godot from source with custom module flags and Mono support. No local build tools required. Returns a ZIP with editor + export templates for all platforms (Windows, macOS, Linux, Web, Android, iOS).

### Features

- Select Godot version (fetched from GitHub API)
- Toggle Mono (C# support)
- Custom module flags (e.g., module_3d_enabled=no)
- Real-time build status with auto-download
- Anti-abuse: FingerprintJS, 4 builds lifetime, 2 builds/day

### Tech Stack

- Frontend: Next.js, Pico.css, TypeScript
- Backend: Next.js API routes, Supabase (PostgreSQL)
- Compute: GitHub Actions (MVP)

### Setup

1. Clone: `git clone https://github.com/yourusername/gdcompile.git`
2. Install: `npm install`
3. Create `.env.local`:
```
GITHUB_TOKEN=your_token
BUILD_REPO_OWNER=yourusername
BUILD_REPO_NAME=action_godot_builder
WORKFLOW_ID=build.yml
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

4. Run: `npm run dev`

### Architecture

Frontend (Vercel) -> API Routes -> GitHub Actions -> Supabase

### Roadmap

- Complete: Next.js setup, build form, API routes, Supabase DB, GitHub Actions integration, polling, download endpoint
- In Progress: Vercel deployment, daily build cap, landing page
- Planned: AWS migration (API Gateway + Lambda + SQS + ECS Fargate + S3)

### Limitations

- 30-60 min build time
- 4 builds lifetime per user
- Godot 4.6+ only
- 1 active build at a time

### Credits

- Godot Icon by Zayronxio on Icon-Icons.com
- appsinacup for action_godot_builder

