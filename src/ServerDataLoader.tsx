import * as React from 'react';
import {ServerDataContainer, PrefetchServerData, PostfetchServerData, ServerRenderingStage} from './ServerData';
import {getSsrDataElement} from './client';

export class ServerDataLoader {
    private readonly prefetch: PrefetchServerData = {stage: ServerRenderingStage.Prefetch, loaders: {}};
    private readonly postfetch: PostfetchServerData = {stage: ServerRenderingStage.Postfetch, data: {}};

    collect(app: React.ReactNode) {
        return <ServerDataContainer.Provider value={this.prefetch}>{app}</ServerDataContainer.Provider>;
    }

    async loadData() {
        await Promise.all(
            Object.keys(this.prefetch.loaders).map(
                async key => (this.postfetch.data[key] = await this.prefetch.loaders[key]())
            )
        );
    }

    complete(app: React.ReactNode) {
        return <ServerDataContainer.Provider value={this.postfetch}>{app}</ServerDataContainer.Provider>;
    }

    getReactElement() {
        const jsonData = JSON.stringify(this.postfetch.data);

        return getSsrDataElement(jsonData);
    }
}
