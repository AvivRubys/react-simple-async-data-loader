import * as React from 'react';
import {
    ServerDataContainer,
    PrefetchServerData,
    PostfetchServerData,
    ServerRenderingStage,
    Loader,
} from './ServerData';
import {getSsrDataElement} from './client';

type Loaders = {[key: string]: Loader};

class PrefetchContainer implements PrefetchServerData {
    public readonly stage: ServerRenderingStage.Prefetch = ServerRenderingStage.Prefetch;
    private readonly loaders: Loaders = {};

    prefetch(key: string, loader: Loader) {
        if (key in this.loaders) {
            console.log('Duplicate key warning!', key);
        }

        this.loaders[key] = loader;
    }

    getLoaders(): Loaders {
        return this.loaders;
    }
}

class PostfetchContainer implements PostfetchServerData {
    public readonly stage: ServerRenderingStage.Postfetch = ServerRenderingStage.Postfetch;
    constructor(private readonly data: {[key: string]: any} = {}) {}

    getPrefetchedData<T = any>(key: string): T {
        return this.data[key];
    }

    getJSON() {
        return JSON.stringify(this.data);
    }
}

export class PrefetchRenderer {
    private readonly container = new PrefetchContainer();

    collect(app: React.ReactNode) {
        return <ServerDataContainer.Provider value={this.container}>{app}</ServerDataContainer.Provider>;
    }

    async loadData() {
        const loaders = this.container.getLoaders();
        const data = {};

        await Promise.all(Object.keys(loaders).map(async key => (data[key] = await loaders[key]())));

        return new PostfetchRenderer(data);
    }
}

class PostfetchRenderer {
    private container: PostfetchContainer;

    constructor(data: {[key: string]: any}) {
        this.container = new PostfetchContainer(data);
    }

    complete(app: React.ReactNode) {
        return <ServerDataContainer.Provider value={this.container}>{app}</ServerDataContainer.Provider>;
    }

    getReactElement() {
        return getSsrDataElement(this.container.getJSON());
    }
}
