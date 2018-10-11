import * as React from 'react';
import {ServerDataContainer, PrefetchServerData, PostfetchServerData, ServerRenderingStage} from './ServerData';
import {getSsrDataElement} from './client';

export class PrefetchRenderer {
    private readonly loaders = {};

    collect(app: React.ReactNode) {
        return (
            <ServerDataContainer.Provider value={{stage: ServerRenderingStage.Prefetch, loaders: this.loaders}}>
                {app}
            </ServerDataContainer.Provider>
        );
    }

    async loadData() {
        const data = {};

        await Promise.all(Object.keys(this.loaders).map(async key => (data[key] = await this.loaders[key]())));

        return new PostfetchRenderer(data);
    }
}

class PostfetchRenderer {
    constructor(private data: {[key: string]: any}) {}

    complete(app: React.ReactNode) {
        return (
            <ServerDataContainer.Provider value={{stage: ServerRenderingStage.Postfetch, data: this.data}}>
                {app}
            </ServerDataContainer.Provider>
        );
    }

    getReactElement() {
        const jsonData = JSON.stringify(this.data);

        return getSsrDataElement(jsonData);
    }
}
