![cf-worker-project-gallery](https://socialify.git.ci/leoweyr/cf-worker-project-gallery/image?description=1&font=Rokkitt&forks=1&issues=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fleoweyr%2Fcf-worker-project-gallery%2Frefs%2Fheads%2Fdevelop%2Fpackages%2Fui-gallery%2Fpublic%2Ficon.svg&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Light)

## 🚀 Deployment

1. Fork this repository to your GitHub account.

2. Configure GitHub Actions secrets and variables.

   | Secret                    | Description                                                                                                                          | How to Obtain                                                                                                                                                                                                                                                                                                   |
   |---------------------------|--------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
   | `CLOUDFLARE_API_TOKEN`    | Cloudflare API token used by GitHub Actions to deploy Workers and Pages.                                                             | 1. Open Cloudflare Dashboard and go to `My Profile -> API Tokens`.<br/>2. Click `Create Token` and select `Create Custom Token`.<br/>3. Grant account-level permissions: `Cloudflare Pages:Edit`, `Workers Scripts:Edit`, and `Workers Routes:Edit`.<br/>4. In `Account Resources`, include the target account. |
   | `CLOUDFLARE_ACCOUNT_ID`   | Cloudflare account identifier used by deployment actions.                                                                            | 1. Open Cloudflare Dashboard in your browser.<br/>2. Copy the account ID directly from the URL path, for example: `https://dash.cloudflare.com/<ACCOUNT_ID>/home/overview`.                                                                                                                                     |
   | `UI_GALLERY_GITHUB_TOKEN` | Token used by `ui-gallery` to fetch and parse GitHub repository information (repository name, stars, and forks) for the Git Info UI. | 1. Create a GitHub personal access token with read access to target repositories.<br/>2. Add it as repository secret `UI_GALLERY_GITHUB_TOKEN` in `Settings -> Secrets and variables -> Actions`.                                                                                                               |

   | Variable                         | Description                                                                                                           | How to Obtain                                                                                                                                                                                                                                                                                                      |
   |----------------------------------|-----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
   | `CLOUDFLARE_PAGES_PROJECT`       | Cloudflare Pages project name used to publish the `ui-gallery` bundle.                                                | 1. Open Cloudflare Dashboard and go to `Workers & Pages`.<br/>2. Create a new Pages project first (an empty project is fine for initialization).<br/>3. Set a custom project name, and `project-gallery-ui-gallery` is recommended.<br/>4. Use that exact project name as the value of `CLOUDFLARE_PAGES_PROJECT`. |
   | `CLOUDFLARE_TARGET_HOST_URL_MAP` | JSON object that maps incoming Worker hosts to the source URLs of target frontend project websites you want to proxy. | Must add this variable in `Production` environment.                                                                                                                                                                                                                                                                |

3. Set `CLOUDFLARE_TARGET_HOST_URL_MAP` as a valid JSON object, for example:

    ```json
    {
        "custom-domain.configured-in-workers.com": "https://source-url.target-frontend-project-website.com"
    }
    ```

    - For the first deployment, pre-set this value before triggering `Deploy Cloudflare`.
    - key: The request host that users access on your Worker custom domain. When users open this domain, project gallery will render and display the mapped target frontend project website.
    - value: The source URL of the target frontend project website you want to proxy, including `http://` or `https://`.
    - You can define multiple host-to-source-URL mappings.

4. After the first deployment, configure Worker custom domains manually in the Cloudflare dashboard:

    > [!IMPORTANT]
    >
    > Make sure every custom domain exactly matches a key in `CLOUDFLARE_TARGET_HOST_URL_MAP`.

    - Open `Workers & Pages`.
    - Select the Worker service `project-gallery-edge-proxy`.
    - Go to `Settings -> Domains & Routes` (or `Triggers`) and add custom domains.

5. Run deployment manually from GitHub Actions:

    - Open `Actions` and run `Deploy Cloudflare`.
    - Must use branch `master` for deployment.

## 🧭 Metadata Controls

Configure metadata in each target frontend project's `index.html` (`<head>`), because these metadata values directly affect project gallery global top navigation bar UI behavior.

| Metadata Rule                                                       | Global Top Nav Bar Behavior                                         |
|---------------------------------------------------------------------|---------------------------------------------------------------------|
| `<title>...</title>`                                                | Controls the title text shown.                                      |
| `<link rel="icon" href="...">`                                      | Controls the logo shown.                                            |
| `<meta name="git" content="https://github.com/<owner>/<repo>.git">` | Enables Git Info UI and displays repository name, stars, and forks. |
