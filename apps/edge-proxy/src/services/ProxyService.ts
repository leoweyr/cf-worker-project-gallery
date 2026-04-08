import type { EdgeProxyEnvironment } from '../types/EdgeProxyEnvironment';
import type { ResolvedTargetContext } from '../types/ResolvedTargetContext';
import type { GalleryMeta } from '../types/GalleryMeta';
import { BodyInjector } from '../handlers/BodyInjector';
import { MetadataExtractor } from '../handlers/MetadataExtractor';
import { UrlResolver } from '../utils/UrlResolver';


export class ProxyService {
    private static readonly _UI_GALLERY_BUNDLE_PROXY_PATH: string = '/__project-gallery-ui-bundle.js';

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

    private _resolveTargetHostUrlMap(): string | null {
        const targetHostUrlMap: string | undefined = this._environment.TARGET_HOST_URL_MAP;

        if (!targetHostUrlMap) {
            return null;
        }

        return targetHostUrlMap;
    }

    private _stripOptionalQuotes(rawValue: string): string {
        const normalizedRawValue: string = this._normalizeTargetValue(rawValue);
        const hasDoubleQuotes: boolean = normalizedRawValue.startsWith('"') && normalizedRawValue.endsWith('"');
        const hasSingleQuotes: boolean = normalizedRawValue.startsWith('\'') && normalizedRawValue.endsWith('\'');

        if (!hasDoubleQuotes && !hasSingleQuotes) {
            return normalizedRawValue;
        }

        return this._normalizeTargetValue(normalizedRawValue.slice(1, -1));
    }

    private _parseTargetHostUrlMapFromJson(targetHostUrlMap: string): Record<string, string> | null {
        let parsedTargetHostUrlMap: unknown;

        try {
            parsedTargetHostUrlMap = JSON.parse(targetHostUrlMap);
        } catch {
            return null;
        }

        if (!parsedTargetHostUrlMap || typeof parsedTargetHostUrlMap !== 'object' || Array.isArray(parsedTargetHostUrlMap)) {
            return null;
        }

        const parsedTargetHostUrlMapRecord: Record<string, unknown> = parsedTargetHostUrlMap as Record<string, unknown>;
        const normalizedTargetHostUrlMapRecord: Record<string, string> = {};

        for (const [rawHostKey, rawTargetUrl] of Object.entries(parsedTargetHostUrlMapRecord)) {
            if (typeof rawTargetUrl !== 'string') {
                return null;
            }

            const normalizedHostKey: string = this._normalizeTargetValue(rawHostKey).toLowerCase();
            const normalizedTargetUrl: string = this._normalizeTargetValue(rawTargetUrl);

            if (!normalizedHostKey || !normalizedTargetUrl) {
                return null;
            }

            normalizedTargetHostUrlMapRecord[normalizedHostKey] = normalizedTargetUrl;
        }

        if (Object.keys(normalizedTargetHostUrlMapRecord).length === 0) {
            return null;
        }

        return normalizedTargetHostUrlMapRecord;
    }

    private _resolveMapEntrySeparatorIndex(normalizedMapEntry: string): number {
        const httpsSeparatorIndex: number = normalizedMapEntry.indexOf(':https://');
        const httpSeparatorIndex: number = normalizedMapEntry.indexOf(':http://');

        if (httpsSeparatorIndex >= 0 && httpSeparatorIndex >= 0) {
            return Math.min(httpsSeparatorIndex, httpSeparatorIndex);
        }

        if (httpsSeparatorIndex >= 0) {
            return httpsSeparatorIndex;
        }

        if (httpSeparatorIndex >= 0) {
            return httpSeparatorIndex;
        }

        return normalizedMapEntry.indexOf(':');
    }

    private _parseTargetHostUrlMapFromRelaxedFormat(targetHostUrlMap: string): Record<string, string> | null {
        const hasWrappedBraces: boolean = targetHostUrlMap.startsWith('{') && targetHostUrlMap.endsWith('}');
        const normalizedMapBody: string = hasWrappedBraces
            ? this._normalizeTargetValue(targetHostUrlMap.slice(1, -1))
            : targetHostUrlMap;

        if (!normalizedMapBody) {
            return null;
        }

        const mapEntries: string[] = normalizedMapBody.split(',');
        const normalizedTargetHostUrlMapRecord: Record<string, string> = {};

        for (const rawMapEntry of mapEntries) {
            const normalizedMapEntry: string = this._normalizeTargetValue(rawMapEntry);

            if (!normalizedMapEntry) {
                return null;
            }

            const entrySeparatorIndex: number = this._resolveMapEntrySeparatorIndex(normalizedMapEntry);

            if (entrySeparatorIndex <= 0) {
                return null;
            }

            const rawHostKey: string = normalizedMapEntry.slice(0, entrySeparatorIndex);
            const rawTargetUrl: string = normalizedMapEntry.slice(entrySeparatorIndex + 1);
            const normalizedHostKey: string = this._normalizeTargetValue(this._stripOptionalQuotes(rawHostKey)).toLowerCase();
            const normalizedTargetUrl: string = this._normalizeTargetValue(this._stripOptionalQuotes(rawTargetUrl));

            if (!normalizedHostKey || !normalizedTargetUrl) {
                return null;
            }

            normalizedTargetHostUrlMapRecord[normalizedHostKey] = normalizedTargetUrl;
        }

        if (Object.keys(normalizedTargetHostUrlMapRecord).length === 0) {
            return null;
        }

        return normalizedTargetHostUrlMapRecord;
    }

    private _parseTargetHostUrlMap(targetHostUrlMap: string): Record<string, string> | null {
        const parsedJsonTargetHostUrlMap: Record<string, string> | null = this._parseTargetHostUrlMapFromJson(targetHostUrlMap);

        if (parsedJsonTargetHostUrlMap) {
            return parsedJsonTargetHostUrlMap;
        }

        return this._parseTargetHostUrlMapFromRelaxedFormat(targetHostUrlMap);
    }

    private _resolveTargetFromHostMap(): URL | null {
        const targetHostUrlMap: string | null = this._resolveTargetHostUrlMap();

        if (!targetHostUrlMap) {
            return null;
        }

        const normalizedTargetHostUrlMap: string = this._normalizeTargetValue(targetHostUrlMap);

        if (!normalizedTargetHostUrlMap) {
            return null;
        }

        const parsedTargetHostUrlMapRecord: Record<string, string> | null = this._parseTargetHostUrlMap(normalizedTargetHostUrlMap);

        if (!parsedTargetHostUrlMapRecord) {
            return null;
        }

        const requestHostname: string = new URL(this._request.url).hostname.toLowerCase();
        const resolvedTargetValue: string | undefined = parsedTargetHostUrlMapRecord[requestHostname];

        if (!resolvedTargetValue) {
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

    private _buildUiGalleryBundleProxyUrl(): string {
        const requestUrl: URL = new URL(this._request.url);
        const proxyUrl: URL = new URL(ProxyService._UI_GALLERY_BUNDLE_PROXY_PATH, requestUrl.origin);
        const customUiGalleryBundleUrl: string | null = requestUrl.searchParams.get('ui_gallery_bundle');

        if (customUiGalleryBundleUrl) {
            proxyUrl.searchParams.set('ui_gallery_bundle', customUiGalleryBundleUrl);
        }

        return `${proxyUrl.pathname}${proxyUrl.search}`;
    }

    private async _fetchOrigin(fetchTargetUrl: string): Promise<Response | null> {
        const proxyRequestHeaders: Headers = new Headers(this._request.headers);
        proxyRequestHeaders.delete('If-None-Match');
        proxyRequestHeaders.delete('If-Modified-Since');
        proxyRequestHeaders.delete('If-Match');
        proxyRequestHeaders.delete('If-Unmodified-Since');
        proxyRequestHeaders.delete('If-Range');

        const proxyRequest: Request = new Request(fetchTargetUrl, {
            method: this._request.method,
            headers: proxyRequestHeaders,
            redirect: 'follow'
        });

        try {
            return await fetch(proxyRequest);
        } catch (fetchError) {
            return null;
        }
    }

    private async _createUiGalleryBundleResponse(): Promise<Response> {
        const uiGalleryBundleUrl: string = this._resolveUiGalleryBundleUrl();

        try {
            const uiGalleryBundleResponse: Response = await fetch(uiGalleryBundleUrl, {
                method: 'GET',
                redirect: 'follow'
            });

            if (!uiGalleryBundleResponse.ok) {
                return this._createErrorResponse('Failed to fetch UI gallery bundle URL', 502);
            }

            const responseHeaders: Headers = new Headers(uiGalleryBundleResponse.headers);
            responseHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
            responseHeaders.set('Cache-Control', 'public, max-age=300');

            return new Response(uiGalleryBundleResponse.body, {
                status: uiGalleryBundleResponse.status,
                statusText: uiGalleryBundleResponse.statusText,
                headers: responseHeaders
            });
        } catch {
            return this._createErrorResponse('Failed to fetch UI gallery bundle URL', 502);
        }
    }

    private async _transformHtmlResponse(originResponse: Response, targetUrl: string): Promise<Response> {
        const galleryMeta: GalleryMeta = await this._extractMetadata(originResponse, targetUrl);
        const uiGalleryBundleUrl: string = this._buildUiGalleryBundleProxyUrl();

        const bodyInjector: BodyInjector = new BodyInjector(galleryMeta, uiGalleryBundleUrl, targetUrl);

        // Use iframe shell mode to ensure CSS viewport units in the original content
        // reference the iframe dimensions instead of the browser viewport.
        const iframeShellDocument: string = bodyInjector.createIframeShellDocument();

        return new Response(iframeShellDocument, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
    }

    private async _extractMetadata(originResponse: Response, targetUrl: string): Promise<GalleryMeta> {
        const metadataExtractor: MetadataExtractor = new MetadataExtractor();

        const metadataRewriter: HTMLRewriter = new HTMLRewriter()
            .on('title', metadataExtractor.createTitleHandler())
            .on('link', metadataExtractor.createLinkHandler())
            .on('meta', metadataExtractor.createMetaHandler());

        const clonedResponse: Response = originResponse.clone();
        await metadataRewriter.transform(clonedResponse).text();

        const rawMeta: GalleryMeta = metadataExtractor.getGalleryMeta();

        return {
            title: rawMeta.title || 'Untitled Project',
            iconUrl: rawMeta.iconUrl ? UrlResolver.resolve(targetUrl, rawMeta.iconUrl) : '',
            gitUrl: rawMeta.gitUrl || ''
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
        newHeaders.delete('ETag');
        newHeaders.delete('Last-Modified');
        newHeaders.delete('Age');
        newHeaders.set('X-Gallery-Injected', 'true');
        newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        newHeaders.set('Pragma', 'no-cache');
        newHeaders.set('Expires', '0');

        return new Response(transformedResponse.body, {
            status: transformedResponse.status,
            statusText: transformedResponse.statusText,
            headers: newHeaders
        });
    }

    private _createRawContentResponse(originResponse: Response): Response {
        // Return the original HTML content without gallery injection.
        // This is used when the content is loaded inside the gallery iframe.
        const newHeaders: Headers = new Headers(originResponse.headers);
        newHeaders.delete('Content-Security-Policy');
        newHeaders.delete('X-Frame-Options');
        newHeaders.set('X-Gallery-Raw', 'true');

        return new Response(originResponse.body, {
            status: originResponse.status,
            statusText: originResponse.statusText,
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
        const requestUrl: URL = new URL(this._request.url);

        if (requestUrl.pathname === ProxyService._UI_GALLERY_BUNDLE_PROXY_PATH) {
            return await this._createUiGalleryBundleResponse();
        }

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

        // Check if this is a raw content request from the gallery iframe.
        // When __gallery_raw=1 is present, return the original HTML without gallery injection.
        const isRawContentRequest: boolean = requestUrl.searchParams.get('__gallery_raw') === '1';

        if (isRawContentRequest) {
            return this._createRawContentResponse(originResponse);
        }

        const transformedResponse: Response = await this._transformHtmlResponse(
            originResponse,
            fetchTargetUrl
        );

        return this._createFinalResponse(transformedResponse);
    }
}
