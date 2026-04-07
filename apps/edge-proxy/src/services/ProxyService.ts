import type { EdgeProxyEnvironment } from '../types/EdgeProxyEnvironment';
import type { ResolvedTargetContext } from '../types/ResolvedTargetContext';
import type { GalleryMeta } from '../types/GalleryMeta';
import { BodyInjector } from '../handlers/BodyInjector';
import { MetadataExtractor } from '../handlers/MetadataExtractor';
import { UrlResolver } from '../utils/UrlResolver';


export class ProxyService {
    private readonly _request: Request;
    private readonly _environment: Env & EdgeProxyEnvironment;

    public constructor(request: Request, environment: Env & EdgeProxyEnvironment) {
        this._request = request;
        this._environment = environment;
    }

    private _resolveTargetContext(): ResolvedTargetContext | Response {
        const mappedTargetUrl: URL | null = this._resolveTargetFromHostMap();

        if (mappedTargetUrl) {
            const resolvedTargetContext: ResolvedTargetContext = {
                targetUrl: mappedTargetUrl
            };

            return resolvedTargetContext;
        }

        return new Response(JSON.stringify({
            error: 'Missing target host mapping.',
            hint: 'Configure TARGET_HOST_URL_MAP with current request host as the key.'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
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

    private _resolveTargetFromHostMap(): URL | null {
        const targetHostUrlMap: string | undefined = this._environment.TARGET_HOST_URL_MAP;

        if (!targetHostUrlMap) {
            return null;
        }

        const normalizedTargetHostUrlMap: string = targetHostUrlMap.replace(/^\uFEFF+/, '').trim();

        if (!normalizedTargetHostUrlMap) {
            return null;
        }

        let parsedTargetHostUrlMap: unknown;

        try {
            parsedTargetHostUrlMap = JSON.parse(normalizedTargetHostUrlMap);
        } catch {
            return null;
        }

        if (!parsedTargetHostUrlMap || typeof parsedTargetHostUrlMap !== 'object' || Array.isArray(parsedTargetHostUrlMap)) {
            return null;
        }

        const requestHostname: string = new URL(this._request.url).hostname.toLowerCase();
        const targetHostUrlMapRecord: Record<string, unknown> = parsedTargetHostUrlMap as Record<string, unknown>;
        const resolvedTargetValue: unknown = targetHostUrlMapRecord[requestHostname];

        if (typeof resolvedTargetValue !== 'string') {
            return null;
        }

        const normalizedResolvedTargetValue: string = this._normalizeTargetValue(resolvedTargetValue);

        return this._parseHttpUrl(normalizedResolvedTargetValue);
    }

    private _buildFetchTargetUrl(resolvedTargetContext: ResolvedTargetContext): string {
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
        const uiGalleryBundleUrl: string = this._resolveUiGalleryBundleUrl();

        const bodyInjector: BodyInjector = new BodyInjector(galleryMeta, uiGalleryBundleUrl);

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

    private _resolveUiGalleryBundleUrl(): string {
        const url: URL = new URL(this._request.url);
        const customUiGalleryBundleUrl: string | null = url.searchParams.get('ui_gallery_bundle');
        const environmentUiGalleryBundleUrl: string | undefined = this._environment.UI_GALLERY_BUNDLE_URL;
        const isDevelopment: boolean = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

        if (customUiGalleryBundleUrl) {
            return customUiGalleryBundleUrl;
        }

        if (environmentUiGalleryBundleUrl) {
            return environmentUiGalleryBundleUrl;
        }

        return isDevelopment
            ? 'http://localhost:5173/dist/global-ui-bundle.js'
            : 'https://cdn.example.com/global-ui-bundle.js';
    }

    private _createFinalResponse(transformedResponse: Response): Response {
        const newHeaders: Headers = new Headers(transformedResponse.headers);
        newHeaders.delete('Content-Security-Policy');
        newHeaders.delete('X-Frame-Options');
        newHeaders.set('X-Gallery-Injected', 'true');

        return new Response(transformedResponse.body, {
            status: transformedResponse.status,
            statusText: transformedResponse.statusText,
            headers: newHeaders
        });
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
            return originResponse;
        }

        const transformedResponse: Response = await this._transformHtmlResponse(
            originResponse,
            resolvedTargetContext.targetUrl.toString()
        );

        return this._createFinalResponse(transformedResponse);
    }
}
