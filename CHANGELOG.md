# Changelog

All notable changes to this project will be documented in this file.

# [0.1.0] (2026-04-08)
### Bug Fixes

* **edge-proxy:** harden target parsing and subrequest fallback ([2305a91](https://github.com/leoweyr/cf-worker-project-gallery/commit/2305a91e65ad253dab1ddd35afe3057ddf78179f)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** simplify gallery meta extraction ([c385911](https://github.com/leoweyr/cf-worker-project-gallery/commit/c385911586c274414ce9acee44419e8b11d5a7fa)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** load ui gallery bundle through same-origin worker proxy ([48b32c6](https://github.com/leoweyr/cf-worker-project-gallery/commit/48b32c688e91873a41a68db4a26edbce6af8301f)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** enforce nav overlay stacking above proxied content ([7a550df](https://github.com/leoweyr/cf-worker-project-gallery/commit/7a550df737d5a3effd67e359e8ced0a2882f56e0)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** disable cached HTML revalidation for injected responses ([9591199](https://github.com/leoweyr/cf-worker-project-gallery/commit/9591199f6f7f1c2c90d4a28e79fc7eca91dc536b)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** treat gallery original content as viewport for proxied canvas app ([6c04318](https://github.com/leoweyr/cf-worker-project-gallery/commit/6c0431819f42cde5cd36a7d72cb37aaa97530bc5)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** normalize 100vh/100vw inline styles for proxied canvas apps ([a1b0c85](https://github.com/leoweyr/cf-worker-project-gallery/commit/a1b0c859bfd4910b2467c7b3f9bb9b20d4b1cb3f)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** use iframe isolation for viewport containment ([1ab8029](https://github.com/leoweyr/cf-worker-project-gallery/commit/1ab80299d32e203fb4f816ea6655b97a0f117839)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** preserve proxied route in iframe source ([ccbeef0](https://github.com/leoweyr/cf-worker-project-gallery/commit/ccbeef042c0a3b89cf55e77d9d23d83a7a43a7e9)) [@leoweyr](https://github.com/leoweyr)


### Features

* **ui-gallery:** add global nav ([4cf2899](https://github.com/leoweyr/cf-worker-project-gallery/commit/4cf28994ac5ef3c3b66d0c949577246fe93ad1aa)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** implement app ([448d5b0](https://github.com/leoweyr/cf-worker-project-gallery/commit/448d5b023ddeec2ee0eb26115c5c2a84336c7767)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** implement app ([60ae903](https://github.com/leoweyr/cf-worker-project-gallery/commit/60ae90315dd85458031d3d85ebd36d04565e62c9)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** only support custom-domain target routing ([15689e2](https://github.com/leoweyr/cf-worker-project-gallery/commit/15689e24a2990dc10503ca1007b43327b4ffad2d)) [@leoweyr](https://github.com/leoweyr)
* **edge-proxy:** support relaxed `TARGET_HOST_URL_MAP` parsing ([086cee8](https://github.com/leoweyr/cf-worker-project-gallery/commit/086cee8a4ad7e9ddb0b42d140fad0da603149efd)) [@leoweyr](https://github.com/leoweyr)


### DevOps

* add release workflows ([3f888a1](https://github.com/leoweyr/cf-worker-project-gallery/commit/3f888a12d9746989be7d4355ce9482f7bcc51b73)) [@leoweyr](https://github.com/leoweyr)
* **publish-release:** support bump TRB project node version ([18f1eea](https://github.com/leoweyr/cf-worker-project-gallery/commit/18f1eeaac71194d0b350b52921df993a8d017c32)) [@leoweyr](https://github.com/leoweyr)
* add deploy Cloudflare workflows ([d2cb97a](https://github.com/leoweyr/cf-worker-project-gallery/commit/d2cb97a5edd76bad6a41eaa9b949aca079374ce3)) [@leoweyr](https://github.com/leoweyr)
* checkout repository before running composite actions ([581b0ac](https://github.com/leoweyr/cf-worker-project-gallery/commit/581b0ac9bf1c48d4ec523dcf49bb10c012e91e4c)) [@leoweyr](https://github.com/leoweyr)
* remove duplicated pnpm version config in composite actions ([31d4edb](https://github.com/leoweyr/cf-worker-project-gallery/commit/31d4edbf9ed20cecc27a02abd845d54ebb594dde)) [@leoweyr](https://github.com/leoweyr)
* preserve `TARGET_HOST_URL_MAP` JSON and strip BOM before parsing ([d03de33](https://github.com/leoweyr/cf-worker-project-gallery/commit/d03de33d713fe0906d1bd357b04270a44d972499)) [@leoweyr](https://github.com/leoweyr)
* pass `TARGET_HOST_URL_MAP` via env to avoid quoted wrangler var name ([562cd93](https://github.com/leoweyr/cf-worker-project-gallery/commit/562cd935f967cc48e06fa9fd42a23b1ca7dfad57)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** define browser-safe process shim ([e1ac83a](https://github.com/leoweyr/cf-worker-project-gallery/commit/e1ac83a6c93f1fedcc37fdf01cab7076681b5822)) [@leoweyr](https://github.com/leoweyr)


### Documentation

* add deployment quickstart ([397a415](https://github.com/leoweyr/cf-worker-project-gallery/commit/397a4155ee4817a3881791ac1cf09ad166630f60)) [@leoweyr](https://github.com/leoweyr)
* clarify production setup for target host URL map ([d1c8cd0](https://github.com/leoweyr/cf-worker-project-gallery/commit/d1c8cd0d63365d99815d162e8cf657c168dabcf7)) [@leoweyr](https://github.com/leoweyr)



<!-- Generated by git-cliff. -->
