export interface GalleryMeta {
    iconUrl: string;
    title: string;
    gitUrl: string;
}


declare global {
    interface Window {
        __GALLERY_META__?: GalleryMeta;
    }
}
