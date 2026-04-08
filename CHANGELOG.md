# Changelog

All notable changes to this project will be documented in this file.

# [0.2.1](https://github.com/leoweyr/cf-worker-project-gallery/compare/v0.2.0...v0.2.1) (2026-04-08)
### Bug Fixes

* **ui-gallery:** restore proxied site keyboard shortcuts after closing sidebar ([ccd14f6](https://github.com/leoweyr/cf-worker-project-gallery/commit/ccd14f65d240a9387deda5b34b6cfc3d4331192a)) [@leoweyr](https://github.com/leoweyr)



# [0.2.0](https://github.com/leoweyr/cf-worker-project-gallery/compare/v0.1.0...v0.2.0) (2026-04-08)
### Bug Fixes

* **edge-proxy:** restore proxied site keyboard shortcuts in iframe code ([f0628bc](https://github.com/leoweyr/cf-worker-project-gallery/commit/f0628bc7c5713da8363dddc83b4c1bf766ba2cf3)) [@leoweyr](https://github.com/leoweyr)


### Features

* **ui-gallery:** add local injection harness ([a0d6fcc](https://github.com/leoweyr/cf-worker-project-gallery/commit/a0d6fccdfddc8eae482bebed1a4a06ce167ae37d)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** set global nav icon-title spacing to 16px ([11727f4](https://github.com/leoweyr/cf-worker-project-gallery/commit/11727f4cde61c592f41110663c30d2ca4e46c379)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** add powered-by badge to global nav ([c702e02](https://github.com/leoweyr/cf-worker-project-gallery/commit/c702e0221340063e0b0e6f69847129f94eeeb1f5)) [@leoweyr](https://github.com/leoweyr)
* add git metadata extraction and GitHub info UI ([f024ca8](https://github.com/leoweyr/cf-worker-project-gallery/commit/f024ca89caaf2ec7d818a27dca48dcb0483a1f6c)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** add primary menu navigation with overflow dropdown ([492674d](https://github.com/leoweyr/cf-worker-project-gallery/commit/492674d0e86b49ae50953d7e2377983651801560)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** add responsive sidebar navigation for mobile viewport ([50ebb06](https://github.com/leoweyr/cf-worker-project-gallery/commit/50ebb069db2e512847b56dd6aede44eb6fae328a)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** use hamburger icon for primary menu overflow trigger ([7e9b2fc](https://github.com/leoweyr/cf-worker-project-gallery/commit/7e9b2fcef72f419bfb8bae65197705daa449d63f)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** add slide-in animation for mobile sidebar opening ([5c14f4d](https://github.com/leoweyr/cf-worker-project-gallery/commit/5c14f4db315a1ccc27f0c276a7b61a5f693d3d16)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** redesign sidebar ([a5190f2](https://github.com/leoweyr/cf-worker-project-gallery/commit/a5190f2174e38b6bb25fbe7e98354f954e544bf3)) [@leoweyr](https://github.com/leoweyr)


### DevOps

* sync Cloudflare Pages production branch for production deploys ([264e644](https://github.com/leoweyr/cf-worker-project-gallery/commit/264e64488239bcbb9f08ebee59334dd869c072a2)) [@leoweyr](https://github.com/leoweyr)
* **ui-gallery:** expose UI gallery token in Vite env ([d941f4d](https://github.com/leoweyr/cf-worker-project-gallery/commit/d941f4d417dea5a0c4860af638bebcd3da6c15d9)) [@leoweyr](https://github.com/leoweyr)
* auto sync `UI_GALLERY_GITHUB_TOKEN` to Cloudflare Pages ([dbb5684](https://github.com/leoweyr/cf-worker-project-gallery/commit/dbb56840a957c5e9054c449cdfbfc570dce92020)) [@leoweyr](https://github.com/leoweyr)


### Documentation

* add project banner ([042471c](https://github.com/leoweyr/cf-worker-project-gallery/commit/042471c92b3aa6d8fb8f435fce7a8eb574e9e581)) [@leoweyr](https://github.com/leoweyr)


### Miscellaneous Tasks

* add icon ([74ba50c](https://github.com/leoweyr/cf-worker-project-gallery/commit/74ba50cd858fe49d850b35935d122bef767f4764)) [@leoweyr](https://github.com/leoweyr)



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
