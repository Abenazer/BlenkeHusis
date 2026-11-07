# Deployment

How Blenke Husis & Urinjakten runs on the server. **Not set up yet.**

The plan is the same as for urinecollector, whose
`../urinecollector/docs/deployment.md` has the full steps:

- **Image:** `ghcr.io/abenazer/superlelle`, made public so pulling needs no
  login. `:latest` follows every push to `main` that changes the game;
  `:<version>` is published only by a release (see "Releases" in `AGENTS.md`).
- **Server:** the host's nginx owns ports 80 and 443 and forwards the game's
  address to the container on `127.0.0.1:<port>`, with a Let's Encrypt
  certificate from certbot.
- **Address:** https://blenke.narkotikafritt.se/. Its A record (at Inleed)
  points at 158.174.113.213, the same server as urin.narkotikafritt.se.
  Nothing is set up there for it yet: no nginx site, certificate or
  container. The game's presentation page is
  https://blhu.narkotikafritt.se/ (`narko-sites/sites/blenkehusis/`).

Fill in the real container directory, port, nginx site and certificate here
when it's done.
