# Deployment

How Blenke Husis & Urinjakten runs on the server, and how to set it up. The
same server and pattern as urinecollector (`../urinecollector/docs/deployment.md`):
the host's nginx owns ports 80 and 443 and forwards the game's address to a
container bound to localhost.

## Overview

- **Image:** `ghcr.io/abenazer/blenkehusis`, public, so pulling needs no
  login. `:latest` follows every push to `main` that changes the game;
  `:<version>` is published only by a release (see "Releases" in `AGENTS.md`).
  The server runs a release, pinned in its compose file, so work in progress
  on `main` doesn't reach players.
- **Server:** the `minecraft` host, 158.174.113.213, the same as
  urin.narkotikafritt.se. nginx 1.24 (Ubuntu package) on the host, Let's
  Encrypt certificates with certbot.
- **Port:** 8085 on 127.0.0.1 (8080, 8082, 8083 and 8084 are taken).
- **Address:** https://blenke.narkotikafritt.se/. Its A record is at Inleed.
  The game's presentation page is https://blhu.narkotikafritt.se/
  (`../narko-sites/sites/blenkehusis/`).

## Status (2026-11-08)

- [x] DNS: `blenke` A record at Inleed.
- [x] Image public on ghcr.io; `0.1.0` released.
- [x] Container running on the server (step 1).
- [x] nginx site (step 2).
- [x] Certificate (step 3), valid to 2027-02-06.
- [x] Checked from outside (step 4).

## Setup

### 1. The container

`~/compose_files/blenke_husis/docker-compose.yml`, a copy of
`docker-compose.server.yml`. First check that 8085 is free:

```bash
ss -ltn | grep -q ':8085 ' && echo "8085 taken" || echo "8085 free"
mkdir -p ~/compose_files/blenke_husis && cd ~/compose_files/blenke_husis
# copy docker-compose.server.yml here as docker-compose.yml, then:
docker compose config | head -20   # ports should show 127.0.0.1 and 8085
docker compose pull && docker compose up -d
curl -s http://127.0.0.1:8085/healthz; curl -s http://127.0.0.1:8085/ | grep '<title>'
```

Pasting a heredoc into a terminal can flatten its indentation, and YAML
without it fails with "services must be a mapping". The same file on one
line (JSON is YAML) survives any paste:

```bash
echo '{"services":{"blenkehusis":{"image":"ghcr.io/abenazer/blenkehusis:0.3.0","container_name":"blenkehusis","ports":["127.0.0.1:8085:80"],"restart":"unless-stopped","security_opt":["no-new-privileges:true"]}}}' > docker-compose.yml
```

The image has its own health check (`/healthz`), so the compose file doesn't
need one.

### 2. The nginx site

```bash
sudo tee /etc/nginx/sites-available/blenke.narkotikafritt.se > /dev/null <<'EOF'
# Blenke Husis & Urinjakten: the container on 127.0.0.1:8085, over HTTPS via certbot.
server {
    listen 80;
    listen [::]:80;
    server_name blenke.narkotikafritt.se;

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo ln -s ../sites-available/blenke.narkotikafritt.se /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. The certificate

```bash
sudo certbot --nginx -d blenke.narkotikafritt.se --redirect
```

Certbot adds the HTTPS server block to the site file and redirects HTTP to
HTTPS. Renewal is automatic, as for the other sites.

### 4. Check from outside

From another machine:

```bash
curl -sI https://blenke.narkotikafritt.se/ | head -3          # HTTP/2 200
curl -sI http://blenke.narkotikafritt.se/ | grep -i location  # → https://
curl -s -m 5 http://blenke.narkotikafritt.se:8085/ || echo "8085 closed"
```

Then play it in a browser: the version under the game should say the release it runs (0.3.0).

## Updating to a new release

After the release workflow has published `:<version>`, on the server:

```bash
cd ~/compose_files/blenke_husis
sed -i 's/blenkehusis:[0-9.]*/blenkehusis:<version>/' docker-compose.yml
docker compose pull && docker compose up -d
```

Keep `docker-compose.server.yml` in this repo on the same tag.

urinecollector's server updates itself from `:latest` within a minute of
each push, by something not yet found (its `docs/deployment.md`,
"Updating"). With a pinned tag that can't change this game, but check that
the container still runs the pinned image after a push to `main`:
`docker inspect blenkehusis --format '{{.Config.Image}}'`.
