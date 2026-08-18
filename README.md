# startCodingForTeens
A little website to help others get stated with coding games

## Deploy

Build and run the site in a container:

```
docker compose up -d --build
```

This publishes the site on `http://localhost:80` (container name: `start-coding-for-teens`).

To make it reachable via `rideandcode.dev`, in the Cloudflare dashboard under **DNS > Records**, edit the `A` records for `rideandcode.dev` and `www.rideandcode.dev` so `Content` is the public IP of the machine running this container, with `Proxy status` set to **Proxied**. Make sure that host allows inbound traffic on port `80` (and `443` if you enable HTTPS to visitors under SSL/TLS).
