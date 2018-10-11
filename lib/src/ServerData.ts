import * as React from 'react';

export enum ServerRenderingStage {
    Prefetch,
    Postfetch,
}
export interface PrefetchServerData {
    stage: ServerRenderingStage.Prefetch;
    loaders: {[key: string]: () => Promise<any>};
}
export interface PostfetchServerData {
    stage: ServerRenderingStage.Postfetch;
    data: {[key: string]: any};
}
export type ServerData = PrefetchServerData | PostfetchServerData;
export const ServerDataContainer = React.createContext<ServerData | null>(null);
