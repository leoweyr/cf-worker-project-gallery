export interface MenuItem {
    identifier: string;
    label: string;
    url: string;
}


export interface GalleryMeta {
    title: string;
    iconUrl: string;
    gitUrl: string;
    menuItems: MenuItem[];
}
