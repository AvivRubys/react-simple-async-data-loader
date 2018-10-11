import * as React from 'react';

type Loader = () => Promise<any>;
type Loaders = {[key: string]: () => Promise<any>};

export enum ServerRenderingStage {
    Prefetch,
    Postfetch,
}
export interface PrefetchServerData {
    stage: ServerRenderingStage.Prefetch;
    loaders: Loaders;
}
export interface PostfetchServerData {
    stage: ServerRenderingStage.Postfetch;
    data: {[key: string]: any};
}
export type ServerData = PrefetchServerData | PostfetchServerData;
export const ServerDataContainer = React.createContext<ServerData | null>(null);
