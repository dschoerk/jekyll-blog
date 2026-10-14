#!/bin/sh
# Manual fallback; normally deploy via the "Deploy production" GitHub Actions workflow
set -e
REMOTE_PATH=/home/dominik/dockerscripts/static_blog/static
REMOTE_HOST=schoerkhuber.at
JEKYLL_ENV=production bundle exec jekyll build
rsync -az --delete --delay-updates _site/ $REMOTE_HOST:$REMOTE_PATH/
