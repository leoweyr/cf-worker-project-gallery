import { GalleryMeta } from '../types/GalleryMeta';


export class MetadataExtractor {
    private _galleryMeta: GalleryMeta = {
        title: '',
        iconUrl: ''
    };

    public getGalleryMeta(): GalleryMeta {
        return this._galleryMeta;
    }

    public createTitleHandler(): HTMLRewriterElementContentHandlers {
        return {
            text: (textChunk: Text): void => {

                if (textChunk.text.trim()) {
                    this._galleryMeta.title += textChunk.text;
                }
            }
        };
    }

    public createMetaHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {
                const property: string | null = element.getAttribute('property');
                const content: string | null = element.getAttribute('content');

                if (!content) {
                    return;
                }

                if (property === 'og:title' && !this._galleryMeta.title) {
                    this._galleryMeta.title = content;
                } else if (property === 'og:image' && !this._galleryMeta.iconUrl) {
                    this._galleryMeta.iconUrl = content;
                }
            }
        };
    }

    public createLinkHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {
                const rel: string | null = element.getAttribute('rel');
                const href: string | null = element.getAttribute('href');

                if (href && (rel === 'icon' || rel === 'shortcut icon' || rel === 'apple-touch-icon')) {

                    if (!this._galleryMeta.iconUrl) {
                        this._galleryMeta.iconUrl = href;
                    }
                }
            }
        };
    }
}
