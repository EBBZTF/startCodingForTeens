# startCodingForTeens
A little website to help others get stated with coding games

## Deploy (Cloudflare Tunnel)

1. Copy `.env.example` to `.env` and paste in the tunnel token from the Cloudflare Zero Trust dashboard (Networks > Tunnels > your tunnel > install command — the value after `--token`).
2. `docker compose up -d --build`

This runs the site (reachable locally at `http://localhost:8080` for testing) plus a `cloudflared` connector that tunnels it out to whatever public hostname you configured in the tunnel's **Public Hostname** tab. No public IP or port forwarding needed — works from a laptop behind NAT.