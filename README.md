# Cloudflare R2 File Explorer

UI for interacting with audio files in an R2 bucket. Uses [Hono](https://hono.dev) with [Cloudflare R2 + Workers](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/).

Super basic UI right now bc I am rendering on server with Hono and just threw in Water CSS. Will probably add more features with SolidJS or something.

## Start

```sh
# Install dependencies
bun install

# Next, make sure you've logged in
bunx wrangler login

# Create your R2 bucket
bunx wrangler r2 bucket create <YOUR_BUCKET_NAME>

# Add config to wrangler.toml as instructed

# Start the worker locally in dev mode
bun run dev
```

press `b` to open the UI in your browser.
