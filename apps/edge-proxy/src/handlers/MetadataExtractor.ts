import { type GalleryMeta } from '../types/GalleryMeta';


export class MetadataExtractor {
    private _galleryMeta: {
        title: string;
        iconUrl: string;
        gitUrl: string;
        menuItems: Array<{
            identifier: string;
            label: string;
            url: string;
        }>;
    } = {
        title: '',
        iconUrl: '',
        gitUrl: '',
        menuItems: []
    };

    public getGalleryMeta(): GalleryMeta {
        return this._galleryMeta as GalleryMeta;
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

    public createMetaHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {
                const name: string | null = element.getAttribute('name');
                const content: string | null = element.getAttribute('content');

                if (!name || !content) {
                    return;
                }

                const lowerName: string = name.toLowerCase();

                if (lowerName === 'git') {
                    this._galleryMeta.gitUrl = content;
                    return;
                }

                // Handle menu-* metadata (e.g., menu-spec, menu-docs).
                if (lowerName.startsWith('menu-')) {
                    const identifier: string = lowerName.substring(5);  // Extract identifier after "menu-".

                    if (identifier) {
                        const parts: string[] = content.split(',').map((part: string): string => part.trim());

                        if (parts.length >= 2) {
                            const menuItem: {
                                identifier: string;
                                label: string;
                                url: string;
                            } = {
                                identifier: identifier,
                                label: parts[0],
                                url: parts[1]
                            };

                            this._galleryMeta.menuItems.push(menuItem);
                        }
                    }
                }
            }
        };
    }
}
