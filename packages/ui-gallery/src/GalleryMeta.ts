import type { MenuItem } from './MenuItem';


export interface GalleryMeta {
    iconUrl: string;
    title: string;
    gitUrl: string;
    menuItems: MenuItem[];
}


declare global {
    interface Window {
        __GALLERY_META__?: GalleryMeta;
    }
}
