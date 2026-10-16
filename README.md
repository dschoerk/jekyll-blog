# Dominik's Blog

[![Build and deploy staging](https://github.com/dschoerk/jekyll-blog/actions/workflows/staging.yml/badge.svg)](https://github.com/dschoerk/jekyll-blog/actions/workflows/staging.yml)
[![Deploy production](https://github.com/dschoerk/jekyll-blog/actions/workflows/production.yml/badge.svg)](https://github.com/dschoerk/jekyll-blog/actions/workflows/production.yml)

Jekyll source of [schoerkhuber.at](https://schoerkhuber.at), using the [minima](https://github.com/jekyll/minima) theme.

- **Production:** https://schoerkhuber.at
- **Staging:** https://dschoerk.github.io/jekyll-blog/

## Local development with the devcontainer

Requirements: Docker and VS Code with the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

1. Open the repository in VS Code and run **Dev Containers: Reopen in Container**. The container is based on `mcr.microsoft.com/devcontainers/jekyll`.
2. In the container's terminal, install the gems (only needed once, or after changing the `Gemfile`):

   ```sh
   bundle install
   ```

3. Serve the site and rebuild on every change:

   ```sh
   bundle exec jekyll serve --livereload
   ```

   VS Code forwards the port, so the site is available at http://localhost:4000 and reloads in the browser when you save a file. Add `--drafts` to include posts from `_drafts/`.

   Changes to `_config.yml` are not picked up by the watcher, so restart `jekyll serve` after editing it.

To only build the site (output goes to `_site/`):

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

## Deployment

| Environment | Trigger | Workflow |
|---|---|---|
| Staging (GitHub Pages) | Push to `main` | [staging.yml](.github/workflows/staging.yml) |
| Production (schoerkhuber.at, rsync over SSH) | Push a `v*` tag, or run the workflow manually | [production.yml](.github/workflows/production.yml) |

To release to production:

```sh
git tag v$(date +%F)
git push origin --tags
```

[deploy.sh](deploy.sh) is a manual fallback that builds locally and rsyncs to the server.
