# Serves the game as static files: there is no build step, so the image is
# just nginx, the files the browser loads and the time it was built.
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
COPY css/ /usr/share/nginx/html/css/
COPY assets/ /usr/share/nginx/html/assets/

# A release's image is built with RELEASED=true (release.yml), main's
# (:latest) without, so a world still being built shows only in :latest.
ARG RELEASED=false

# After every COPY, so any change to the image gets a new time.
RUN released=false; [ "$RELEASED" = true ] && released=true; \
  printf "export const BUILD_TIME = '%s';\nexport const RELEASED = %s;\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$released" \
  > /usr/share/nginx/html/src/build.js

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
