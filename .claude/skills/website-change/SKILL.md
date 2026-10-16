---
name: website-change
description: Author a change to the schoerkhuber.at Jekyll website — a new or edited blog post, a page (about, publications, CV), styling, layouts/includes, or _config.yml. Works on a feature branch with regular commits, verifies the build, and only merges and pushes to main after the user explicitly approves. Use whenever the user asks to write, edit, fix, restyle or publish anything on the site or blog.
---

# Author a change to the website

The site is a Jekyll 4 blog on the `minima` theme. A push to `main` deploys **staging**
(GitHub Pages, served under a subpath). Production (schoerkhuber.at) deploys only on a `v*`
tag, so pushing to `main` never touches production.

Follow the phases in order. Don't skip the approval gate.

## 1. Start a branch

```sh
git status --short          # must be clean; if not, ask the user what to do with the changes
git switch main && git pull --ff-only
git switch -c <kind>/<slug> # e.g. post/sam3dbody, fix/list-markers, style/category-pills, page/about
```

If you're already on a feature branch for this change, for example from an earlier session,
stay on it and rebase it onto an up-to-date `main` instead.

## 2. Make the change in small, committed steps

Commit after each logical step, such as the post skeleton, then the images, then a styling
tweak, so the user can review and revert steps one at a time. Write each commit message as a
short imperative sentence in the style of `git log --oneline`, for example "Add paragraph spacing
to post content", and end it with the session's attribution trailer. Stage specific paths, not
`git add -A`, and never commit `_site/`, `vendor/` or `.jekyll-cache/`.

### Repo conventions

- **Posts** go in `_posts/YYYY-MM-DD-slug.md` with front matter:
  ```yaml
  ---
  layout: post
  title: "Title in quotes"
  date:   YYYY-MM-DD HH:MM:SS +0000
  categories: weekend-projects machine-learning
  ---
  ```
  Jekyll **silently skips posts dated in the future**, and that includes later today in UTC.
  Use a time that has already passed, and check the post appears in the build output.
- **Drafts** go in `_drafts/slug.md` without a date prefix. They show up only in the preview,
  because it runs with `--drafts`. To publish one, move it to `_posts/` with a date.
- **Category pills:** the categories listed under `category_pills:` in `_config.yml` get a pill
  next to the date. Add an entry there for a new category that should have a pill.
- **Images and files** go in `assets/images/`, or under `assets/` for other files. Always
  reference them with `relative_url`, because staging runs under a subpath:
  `![alt]({{ '/assets/images/foo.png' | relative_url }})`. The same goes for internal links:
  `{{ '/about/' | relative_url }}` or `{% post_url 2026-10-16-slug %}`.
- **Theme overrides** live in `_layouts/` (`home.html`, `post.html`), `_includes/`
  (`custom-head.html`, `category-pills.html`) and `_sass/minima/`. Before editing an override,
  check what upstream minima does.
- Leave unfinished parts as `<!-- TODO: ... -->` comments for the user, not invented content.
  When writing prose for the user's own posts, keep their first-person voice and don't make up
  personal experiences or results.

## 3. Verify

Use the bundled script. It runs Jekyll in the `ruby:3.3` Docker image, so no local Ruby is
needed.

```sh
.claude/skills/website-change/scripts/jekyll.sh build   # must succeed; Sass @import deprecation warnings are normal
```

After building, check the output directly. A new post should exist at
`_site/<categories>/<yyyy>/<mm>/<dd>/<slug>.html`, every image it references should exist, and a
`grep` over the generated HTML should find no broken `{{` or `{%`.

Start the live preview for the user to look at:

```sh
.claude/skills/website-change/scripts/jekyll.sh serve   # http://localhost:4000, includes drafts, reloads on save
.claude/skills/website-change/scripts/jekyll.sh logs    # if something looks wrong
```

Changes to `_config.yml` are not picked up while the preview runs, so run `serve` again after
editing it.

## 4. Ask for approval

Hand the change over for review with:

- a short summary of what changed and why
- `git log --oneline main..HEAD` and `git diff --stat main...HEAD`
- the preview URL and the specific pages to look at
- any TODOs left for the user

Then **stop and wait**. Iterate on the user's feedback with more commits on the branch. Only an
explicit approval of this change, such as "approved", "ship it" or "push it", lets you continue.
Approval of an earlier change doesn't carry over to this one. Don't push the feature branch to
origin unless the user asks.

## 5. Merge and push to main (only after approval)

```sh
git switch main && git pull --ff-only
git rebase main <branch> && git switch main   # only if main moved
git merge --ff-only <branch>
.claude/skills/website-change/scripts/jekyll.sh build   # one last check on the merged result
git push origin main
git branch -d <branch>
.claude/skills/website-change/scripts/jekyll.sh stop
```

If the user prefers to keep the individual commits out of `main`, use `git merge --squash`
instead. Never force-push `main`.

Tell the user the push went out and that staging, https://dschoerk.github.io/jekyll-blog/,
updates once the "Build and deploy staging" workflow finishes. `gh run watch` follows it.
Releasing to production is a separate step: `git tag v$(date +%F) && git push origin --tags`.
Only tag when the user asks for it.
