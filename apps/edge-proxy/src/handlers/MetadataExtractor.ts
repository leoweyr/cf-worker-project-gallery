import { type GalleryMeta } from '../types/GalleryMeta';


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

    public createLinkHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {
                const rel: string | null = element.getAttribute('rel');
                const href: string | null = element.getAttribute('href');

                if (href && rel && rel.toLowerCase() === 'icon') {

                    if (!this._galleryMeta.iconUrl) {
                        this._galleryMeta.iconUrl = href;
                    }
                }
            }
        };
    }
}
