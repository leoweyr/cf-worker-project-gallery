import { type GalleryMeta } from '../types/GalleryMeta';


export class BodyInjector {
    private readonly _galleryMeta: GalleryMeta;
    private readonly _uiGalleryBundleUrl: string;
    private readonly _targetUrl: string;

    constructor(galleryMeta: GalleryMeta, uiGalleryBundleUrl: string, targetUrl: string) {
        this._galleryMeta = galleryMeta;
        this._uiGalleryBundleUrl = uiGalleryBundleUrl;
        this._targetUrl = targetUrl;
    }

    private _createGalleryFrameStyle(): string {
        // Lock the outer document to prevent scrolling and ensure the gallery frame fills the viewport.
        return `<style>
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                width: 100vw !important;
                height: 100vh !important;
            }
            
            #gallery-root {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 64px;
                z-index: 2147483647;
            }
            
            #gallery-content-frame {
                position: fixed;
                top: 64px;
                left: 0;
                width: 100vw;
                height: calc(100vh - 64px);
                border: none;
                z-index: 1;
            }
        </style>`;
    }

    private _createKeyboardFocusScript(): string {
        // Keep keyboard focus on the proxied content frame so site shortcuts remain responsive.
        return `<script>(function () {
            const resolveContentFrame = function () {
                return document.getElementById('gallery-content-frame');
            };

            const focusContentFrame = function () {
                const contentFrame = resolveContentFrame();

                if (!(contentFrame instanceof HTMLIFrameElement)) {
                    return;
                }

                contentFrame.focus();

                if (contentFrame.contentWindow) {
                    contentFrame.contentWindow.focus();
                }
            };

            const initializeKeyboardFocus = function () {
                const contentFrame = resolveContentFrame();

                if (!(contentFrame instanceof HTMLIFrameElement)) {
                    requestAnimationFrame(initializeKeyboardFocus);
                    return;
                }

                document.addEventListener('pointerdown', function (event) {
                    const navRoot = document.getElementById('gallery-root');

                    if (navRoot && navRoot.contains(event.target)) {
                        return;
                    }

                    focusContentFrame();
                }, true);

                contentFrame.addEventListener('load', focusContentFrame);
                window.addEventListener('load', focusContentFrame);
                window.addEventListener('focus', focusContentFrame);
                focusContentFrame();
            };

            initializeKeyboardFocus();
        })();</script>`;
    }

    public createIframeShellDocument(): string {
        // Create a minimal HTML document that embeds the original content in an iframe.
        // The iframe loads the original URL with a special query parameter to skip gallery injection.
        // This ensures CSS viewport units in the original content reference the iframe dimensions.
        const escapedMeta: string = JSON.stringify(this._galleryMeta).replace(/</g, '\\u003c');
        const iframeSrc: string = this._targetUrl + (this._targetUrl.includes('?') ? '&' : '?') + '__gallery_raw=1';
        const keyboardFocusScript: string = this._createKeyboardFocusScript();

        return `<!DOCTYPE html>
<html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this._galleryMeta.title}</title>
    <link rel="icon" href="${this._galleryMeta.iconUrl}">
    ${this._createGalleryFrameStyle()}
</head>
<body>
    <script>window.__GALLERY_META__ = ${escapedMeta};</script>
    <div id="gallery-root"></div>
    <iframe id="gallery-content-frame" src="${iframeSrc}" tabindex="0" title="Project Content"></iframe>
    ${keyboardFocusScript}
    <script defer src="${this._uiGalleryBundleUrl}"></script>
</body>
</html>`;
    }

    public createBodyHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (_element: Element): void => {
                // This handler is no longer used when iframe mode is active.
                // Kept for backward compatibility with non-iframe mode.
            }
        };
    }

    public createBodyEndHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (_element: Element): void => {
                // This handler is no longer used when iframe mode is active.
            }
        };
    }
}
