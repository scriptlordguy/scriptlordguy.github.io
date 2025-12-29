# scriptlordguy.github.io
A minimal GitHub Pages site for the Boblox project.

## Website
This repository hosts a placeholder website for **Boblox**. The sit⁰1e is currently a simple "Coming soon" page (`index.html`).

Once you're ready, you can replace the placeholder with the full Boblox site content.

**Note:** This commit triggers the GitHub Pages deployment workflow to publish the placeholder site.

---

## Local preview

You can preview the site locally with either Python or Node.js.

- Using Python 3 (no dependencies):

```bash
# make script executable (first time)
chmod +x ./start.sh
# run the local server (defaults to port 8000)
./start.sh
```
Open http://localhost:8000 in your browser.

- Using Node.js (no extra packages required):

```bash
# run with Node.js (defaults to port 8080)
npm start
# for production with Docker
docker build -t boblox .
docker run -p 8080:8080 boblox
```
Open http://localhost:8080 in your browser.

---

Docker and CI

- A `Dockerfile` and `docker-compose.yml` are included to package and run the app in production.
- There's a GitHub Actions workflow at `.github/workflows/docker-publish.yml` that builds and pushes a Docker image to GitHub Container Registry (GHCR) on push to `main`. It uses the repo `GITHUB_TOKEN` so no extra secrets are needed to publish to GHCR.

Running locally with Docker (recommended for a production-like run):

```bash
# build and run with docker-compose
docker compose up --build -d
# open http://localhost:8080
```

Publishing to a host (example options):

- Render / Fly / DigitalOcean: push the GHCR image `ghcr.io/<owner>/<repo>:latest` to your host or configure the service to deploy from GHCR. Add any provider-specific secrets (API key, service ID) to the repo and enable the optional deploy job in the workflow.
- Self-hosting / VPS: pull the image and run `docker run -p 8080:8080 ghcr.io/<owner>/<repo>:latest`.

Note: The workflow includes a commented template to show how you might call Render's deploy API — replace/enable it with your provider credentials if you want automatic host deploys when pushing to `main`.

---

boblox game begin
