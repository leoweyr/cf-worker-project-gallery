import type { ResolvedTargetContext } from '../types/ResolvedTargetContext';
import type { GalleryMeta } from '../types/GalleryMeta';
import { BodyInjector } from '../handlers/BodyInjector';
import { MetadataExtractor } from '../handlers/MetadataExtractor';
import { UrlResolver } from '../utils/UrlResolver';


export class ProxyService {
    private static readonly _TARGET_COOKIE_NAME: string = 'gallery_target';

    private readonly _request: Request;
    private readonly _environment: Env;

    public constructor(request: Request, environment: Env) {
        this._request = request;
        this._environment = environment;
    }

    private _resolveTargetContext(): ResolvedTargetContext | Response {
        const queryTargetValue: string | null = this._getQueryTargetValue();

        if (queryTargetValue) {
            const parsedQueryTargetUrl: URL | null = this._parseHttpUrl(queryTargetValue);

            if (!parsedQueryTargetUrl) {
                return new Response(JSON.stringify({
                    error: 'Invalid target URL',
                    provided: queryTargetValue
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            return {
                targetUrl: parsedQueryTargetUrl,
                hasExplicitTarget: true
            };
        }

        const refererTargetUrl: URL | null = this._resolveTargetFromReferer();

        if (refererTargetUrl) {
            return {
                targetUrl: refererTargetUrl,
                hasExplicitTarget: false
            };
        }

        const cookieTargetUrl: URL | null = this._resolveTargetFromCookie();

        if (cookieTargetUrl) {
            return {
                targetUrl: cookieTargetUrl,
                hasExplicitTarget: false
            };
        }

        return new Response(JSON.stringify({
            error: 'Missing target parameter',
            usage: '/?target=https://example.com'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    private _getQueryTargetValue(): string | null {
        const url: URL = new URL(this._request.url);
        const targetUrl: string | null = url.searchParams.get('target');

        if (!targetUrl) {
            return null;
        }

        return this._normalizeTargetValue(targetUrl);
    }

    private _normalizeTargetValue(targetValue: string): string {
        return targetValue.replace(/^\uFEFF+/, '').trim();
    }

    private _parseHttpUrl(targetValue: string): URL | null {
        try {
            const parsedUrl: URL = new URL(targetValue);

            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                return null;
            }

            return parsedUrl;
        } catch {
            return null;
        }
    }

    private _resolveTargetFromReferer(): URL | null {
        const refererHeaderValue: string | null = this._request.headers.get('Referer');

        if (!refererHeaderValue) {
            return null;
        }

        try {
            const refererUrl: URL = new URL(refererHeaderValue);
            const refererTargetValue: string | null = refererUrl.searchParams.get('target');

            if (!refererTargetValue) {
                return null;
            }

            const normalizedRefererTargetValue: string = this._normalizeTargetValue(refererTargetValue);

            return this._parseHttpUrl(normalizedRefererTargetValue);
        } catch {
            return null;
        }
    }

    private _resolveTargetFromCookie(): URL | null {
        const cookieHeaderValue: string | null = this._request.headers.get('Cookie');

        if (!cookieHeaderValue) {
            return null;
        }

        const encodedTargetValue: string | null = this._extractCookieValue(
            cookieHeaderValue,
            ProxyService._TARGET_COOKIE_NAME
        );

        if (!encodedTargetValue) {
            return null;
        }

        try {
            const decodedTargetValue: string = decodeURIComponent(encodedTargetValue);
            const normalizedTargetValue: string = this._normalizeTargetValue(decodedTargetValue);
            return this._parseHttpUrl(normalizedTargetValue);
        } catch {
            return null;
        }
    }

    private _extractCookieValue(cookieHeaderValue: string, cookieName: string): string | null {
        const cookieSegments: string[] = cookieHeaderValue.split(';');

        for (const cookieSegment of cookieSegments) {
            const normalizedCookieSegment: string = cookieSegment.trim();
            const cookiePrefix: string = `${cookieName}=`;

            if (normalizedCookieSegment.startsWith(cookiePrefix)) {
                return normalizedCookieSegment.slice(cookiePrefix.length);
            }
        }

        return null;
    }

    private _buildFetchTargetUrl(resolvedTargetContext: ResolvedTargetContext): string {
        if (resolvedTargetContext.hasExplicitTarget) {
            return resolvedTargetContext.targetUrl.toString();
        }

        const requestUrl: URL = new URL(this._request.url);
        const requestPathWithQuery: string = `${requestUrl.pathname}${requestUrl.search}`;
        return new URL(requestPathWithQuery, `${resolvedTargetContext.targetUrl.origin}/`).toString();
    }

    private async _fetchOrigin(fetchTargetUrl: string): Promise<Response | null> {
        const proxyRequest: Request = new Request(fetchTargetUrl, {
            method: this._request.method,
            headers: this._request.headers,
            redirect: 'follow'
        });

        try {
            return await fetch(proxyRequest);
        } catch (fetchError) {
            return null;
        }
    }

    private async _transformHtmlResponse(originResponse: Response, targetUrl: string): Promise<Response> {
        const galleryMeta: GalleryMeta = await this._extractMetadata(originResponse, targetUrl);
        const uiBundleUrl: string = this._resolveUiBundleUrl();

        const bodyInjector: BodyInjector = new BodyInjector(galleryMeta, uiBundleUrl);

        const injectionRewriter: HTMLRewriter = new HTMLRewriter()
            .on('body', bodyInjector.createBodyHandler())
            .on('body', bodyInjector.createBodyEndHandler());

        return injectionRewriter.transform(originResponse);
    }

    private async _extractMetadata(originResponse: Response, targetUrl: string): Promise<GalleryMeta> {
        const metadataExtractor: MetadataExtractor = new MetadataExtractor();

        const metadataRewriter: HTMLRewriter = new HTMLRewriter()
            .on('title', metadataExtractor.createTitleHandler())
            .on('link', metadataExtractor.createLinkHandler());

        const clonedResponse: Response = originResponse.clone();
        await metadataRewriter.transform(clonedResponse).text();

        const rawMeta: GalleryMeta = metadataExtractor.getGalleryMeta();

        return {
            title: rawMeta.title || 'Untitled Project',
            iconUrl: rawMeta.iconUrl ? UrlResolver.resolve(targetUrl, rawMeta.iconUrl) : ''
        };
    }

    private _resolveUiBundleUrl(): string {
        const url: URL = new URL(this._request.url);
        const customUiBundleUrl: string | null = url.searchParams.get('ui_bundle');
        const isDevelopment: boolean = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

        if (customUiBundleUrl) {
            return customUiBundleUrl;
        }

        return isDevelopment
            ? 'http://localhost:5173/dist/global-ui-bundle.js'
            : 'https://cdn.example.com/global-ui-bundle.js';
    }

    private _createFinalResponse(transformedResponse: Response, targetUrl: URL): Response {
        const newHeaders: Headers = new Headers(transformedResponse.headers);
        newHeaders.delete('Content-Security-Policy');
        newHeaders.delete('X-Frame-Options');
        newHeaders.set('X-Gallery-Injected', 'true');
        newHeaders.append('Set-Cookie', this._createTargetCookie(targetUrl));

        return new Response(transformedResponse.body, {
            status: transformedResponse.status,
            statusText: transformedResponse.statusText,
            headers: newHeaders
        });
    }

    private _attachTargetCookie(response: Response, targetUrl: URL): Response {
        const responseHeaders: Headers = new Headers(response.headers);
        responseHeaders.append('Set-Cookie', this._createTargetCookie(targetUrl));

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });
    }

    private _createTargetCookie(targetUrl: URL): string {
        const encodedTargetUrl: string = encodeURIComponent(targetUrl.toString());
        return `${ProxyService._TARGET_COOKIE_NAME}=${encodedTargetUrl}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800`;
    }

    private _createErrorResponse(message: string, status: number): Response {
        return new Response(JSON.stringify({
            error: message
        }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    public async handle(): Promise<Response> {
        const resolvedTargetContextResult: ResolvedTargetContext | Response = this._resolveTargetContext();

        if (resolvedTargetContextResult instanceof Response) {
            return resolvedTargetContextResult;
        }

        const resolvedTargetContext: ResolvedTargetContext = resolvedTargetContextResult;
        const fetchTargetUrl: string = this._buildFetchTargetUrl(resolvedTargetContext);
        const originResponse: Response | null = await this._fetchOrigin(fetchTargetUrl);

        if (!originResponse) {
            return this._createErrorResponse('Failed to fetch target URL', 502);
        }

        const contentType: string = originResponse.headers.get('Content-Type') || '';

        if (!contentType.includes('text/html')) {
            return this._attachTargetCookie(originResponse, resolvedTargetContext.targetUrl);
        }

        const transformedResponse: Response = await this._transformHtmlResponse(
            originResponse,
            resolvedTargetContext.targetUrl.toString()
        );

        return this._createFinalResponse(transformedResponse, resolvedTargetContext.targetUrl);
    }
}
