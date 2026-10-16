#!/bin/sh
# Build or preview the site in the ruby:3.3 image (same Ruby as CI), no local Ruby needed.
# Gems are cached in vendor/bundle (gitignored, excluded by Jekyll).
#
#   jekyll.sh build   production build into _site/, fails on Jekyll errors
#   jekyll.sh serve   preview with drafts + livereload at http://localhost:4000 (background container)
#   jekyll.sh logs    follow the preview container's output
#   jekyll.sh stop    stop the preview container
set -e
cd "$(git rev-parse --show-toplevel)"

IMAGE=ruby:3.3
NAME=jekyll-blog-preview
RUN_OPTS="--user $(id -u):$(id -g) -e HOME=/tmp -e BUNDLE_PATH=/site/vendor/bundle -v $PWD:/site -w /site"

case "$1" in
  build)
    docker run --rm $RUN_OPTS -e JEKYLL_ENV=production $IMAGE \
      sh -c 'bundle install --quiet && bundle exec jekyll build --strict_front_matter'
    ;;
  serve)
    docker rm -f $NAME >/dev/null 2>&1 || true
    docker run -d --name $NAME $RUN_OPTS -p 4000:4000 -p 35729:35729 $IMAGE \
      sh -c 'bundle install --quiet && bundle exec jekyll serve --host 0.0.0.0 --drafts --livereload --force_polling'
    echo "Preview starting at http://localhost:4000 (container $NAME)"
    ;;
  logs)
    docker logs -f $NAME
    ;;
  stop)
    docker rm -f $NAME >/dev/null 2>&1 && echo "Stopped $NAME" || echo "$NAME not running"
    ;;
  *)
    echo "usage: $0 build|serve|logs|stop" >&2
    exit 2
    ;;
esac
