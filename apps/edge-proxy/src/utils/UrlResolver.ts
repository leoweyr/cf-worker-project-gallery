export class UrlResolver {
    public static resolve(baseUrl: string, relativeUrl: string): string {

        if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://') || relativeUrl.startsWith('//')) {
            return relativeUrl;
        }

        try {
            return new URL(relativeUrl, baseUrl).href;
        } catch {
            return relativeUrl;
        }

    }
}
