import { createRoot } from 'react-dom/client';

import App from './App';
import type { GalleryMeta } from './GalleryMeta';


function initializeGalleryUI(): void {
    const mountPoint: HTMLElement | null = document.getElementById('gallery-root');

    if (!mountPoint) {
        console.error('[Gallery UI] Mount point #gallery-root not found.');
        return;
    }

    const root = createRoot(mountPoint);
    const galleryMeta: GalleryMeta | undefined = window.__GALLERY_META__;

    root.render(<App galleryMeta={galleryMeta} />);
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGalleryUI);
} else {
    initializeGalleryUI();
}
