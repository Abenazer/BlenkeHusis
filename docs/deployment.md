# Deployment

How Super Lelle: Urine Hunt runs on the server. **Not set up yet.**

The plan is the same as for urinecollector, whose
`../urinecollector/docs/deployment.md` has the full steps:

- **Image:** `ghcr.io/abenazer/superlelle`, made public so pulling needs no
  login. `:latest` follows every push to `main` that changes the game;
  `:<version>` is published only by a release (see "Releases" in `AGENTS.md`).
- **Server:** the host's nginx owns ports 80 and 443 and forwards the game's
  address to the container on `127.0.0.1:<port>`, with a Let's Encrypt
  certificate from certbot.
- **Address:** not chosen yet.

Fill in the real container directory, port, nginx site and certificate here
when it's done.
