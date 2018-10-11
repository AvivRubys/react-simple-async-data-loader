import * as React from 'react';

export type Loader = () => Promise<any>;

export enum ServerRenderingStage {
    Prefetch,
    Postfetch,
}
export interface PrefetchServerData {
    stage: ServerRenderingStage.Prefetch;
    prefetch(key: string, loader: Loader): void;
}

export interface PostfetchServerData {
    stage: ServerRenderingStage.Postfetch;
    getPrefetchedData<T = any>(key: string): T;
}
export type ServerData = PrefetchServerData | PostfetchServerData;
export const ServerDataContainer = React.createContext<ServerData | null>(null);
