import { GalleryMeta } from '../types/GalleryMeta';
import { MetadataExtractor } from '../handlers/MetadataExtractor';
import { BodyInjector } from '../handlers/BodyInjector';
import { UrlResolver } from '../utils/UrlResolver';


export class ProxyService {
    private readonly _request: Request;
    private readonly _environment: Env;

    public constructor(request: Request, environment: Env) {
        this._request = request;
        this._environment = environment;
    }

    private _validateRequest(): Response | null {
        const url: URL = new URL(this._request.url);
        const targetUrl: string | null = url.searchParams.get('target');

        if (!targetUrl) {
            return new Response(JSON.stringify({
                error: 'Missing target parameter',
                usage: '/?target=https://example.com'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            const decodedTargetUrl: string = decodeURIComponent(targetUrl);
            new URL(decodedTargetUrl);
        } catch {
            return new Response(JSON.stringify({
                error: 'Invalid target URL',
                provided: targetUrl
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return null;
    }

    private _extractTargetUrl(): string {
        const url: URL = new URL(this._request.url);
        const targetUrl: string = url.searchParams.get('target')!;
        return decodeURIComponent(targetUrl);
    }

    private async _fetchOrigin(targetUrl: string): Promise<Response | null> {
        const proxyRequest: Request = new Request(targetUrl, {
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

        const transformedResponse: Response = injectionRewriter.transform(originResponse);

        return this._createFinalResponse(transformedResponse);
    }

    private async _extractMetadata(originResponse: Response, targetUrl: string): Promise<GalleryMeta> {
        const metadataExtractor: MetadataExtractor = new MetadataExtractor();

        const metadataRewriter: HTMLRewriter = new HTMLRewriter()
            .on('title', metadataExtractor.createTitleHandler())
            .on('meta', metadataExtractor.createMetaHandler())
            .on('link', metadataExtractor.createLinkHandler());

        const clonedResponse: Response = originResponse.clone();
        await metadataRewriter.transform(clonedResponse).text();

        const rawMeta: GalleryMeta = metadataExtractor.getGalleryMeta();

        return {
            title: rawMeta.title || 'Untitled Project',
            iconUrl: UrlResolver.resolve(targetUrl, rawMeta.iconUrl)
        };
    }

    private _resolveUiBundleUrl(): string {
        const url: URL = new URL(this._request.url);
        const isDevelopment: boolean = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

        return isDevelopment
            ? 'http://localhost:5173/dist/global-ui-bundle.js'
            : (url.searchParams.get('ui_bundle') || 'https://cdn.example.com/global-ui-bundle.js');
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
        const validationResult: Response | null = this._validateRequest();

        if (validationResult) {
            return validationResult;
        }

        const targetUrl: string = this._extractTargetUrl();
        const originResponse: Response | null = await this._fetchOrigin(targetUrl);

        if (!originResponse) {
            return this._createErrorResponse('Failed to fetch target URL', 502);
        }

        const contentType: string = originResponse.headers.get('Content-Type') || '';

        if (!contentType.includes('text/html')) {
            return originResponse;
        }

        return await this._transformHtmlResponse(originResponse, targetUrl);
    }
}
