import { Component, type ReactNode } from 'react';

import GlobalNav from './components/GlobalNav';
import type { GalleryMeta } from './GalleryMeta';


export interface AppProperties {
    galleryMeta?: GalleryMeta;
}


class App extends Component<AppProperties, object> {
    public render(): ReactNode {
        const { galleryMeta } = this.props;

        return (
            <GlobalNav
                iconUrl={galleryMeta?.iconUrl || ''}
                title={galleryMeta?.title || 'Project Gallery'}
                gitUrl={galleryMeta?.gitUrl || ''}
            />
        );
    }
}


export default App;
