import { type GalleryMeta } from '../types/GalleryMeta';


export class BodyInjector {
    private readonly _galleryMeta: GalleryMeta;
    private readonly _uiBundleUrl: string;
    private _hasInjectedMeta: boolean = false;

    public constructor(galleryMeta: GalleryMeta, uiBundleUrl: string) {
        this._galleryMeta = galleryMeta;
        this._uiBundleUrl = uiBundleUrl;
    }

    public createBodyHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {

                if (!this._hasInjectedMeta) {
                    const metaScript: string = `<script>window.__GALLERY_META__ = ${JSON.stringify(this._galleryMeta)};</script>`;
                    const mountPoint: string = '<div id="gallery-root"></div>';
                    const uiScript: string = `<script defer src="${this._uiBundleUrl}"></script>`;
                    const bodyLockScript: string = '<script>document.body.style.margin="0";document.body.style.overflow="hidden";</script>';
                    const wrapperOpen: string = '<div id="gallery-original-content" style="position: fixed; top: 64px; left: 0; right: 0; bottom: 0; overflow-y: auto; box-sizing: border-box;">';

                    element.prepend(metaScript + mountPoint + uiScript + bodyLockScript + wrapperOpen, { html: true });
                    this._hasInjectedMeta = true;
                }
            }
        };
    }

    public createBodyEndHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {
                element.append('</div>', { html: true });
            }
        };
    }
}
