import * as React from 'react';

import {ServerDataContainer, ServerRenderingStage, ServerData} from './ServerData';
import {loadSsrData} from './client';

enum LoadingStage {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
}
type DataLoaderResult<Data> =
    | {state: LoadingStage.Success; result: Data}
    | {state: LoadingStage.Failure; error: Error}
    | {state: LoadingStage.Pending};

interface AsyncLoaderProps<Data> {
    dataKey: string;
    loader: () => Promise<Data>;
    children: (result: DataLoaderResult<Data>) => React.ReactNode;
}

interface DataLoaderProps<Data> extends AsyncLoaderProps<Data> {
    serverData: ServerData | null;
}

type DataLoaderState<Data> = DataLoaderResult<Data>;

class DataLoader<Data = any> extends React.Component<DataLoaderProps<Data>, DataLoaderState<Data>> {
    constructor(props: DataLoaderProps<Data>) {
        super(props);

        this.state = this.getInitialState();
    }

    getInitialState(): DataLoaderState<Data> {
        const {serverData, dataKey, loader} = this.props;

        if (serverData) {
            if (serverData.stage === ServerRenderingStage.Prefetch) {
                serverData.loaders[dataKey] = loader;

                return {state: LoadingStage.Pending};
            } else {
                return {result: serverData.data[dataKey] as Data, state: LoadingStage.Success};
            }
        } else {
            const data = loadSsrData(dataKey) as Data;

            if (data) {
                return {state: LoadingStage.Success, result: data};
            } else {
                loader().then(
                    result => this.setState({result, state: LoadingStage.Success}),
                    error => this.setState({state: LoadingStage.Failure, error})
                );

                return {state: LoadingStage.Pending};
            }
        }
    }

    render(): React.ReactNode {
        return this.props.children(this.state);
    }
}

export const AsyncLoader = (props: AsyncLoaderProps<any>) => (
    <ServerDataContainer.Consumer>
        {serverData => (
            <DataLoader {...props} serverData={serverData}>
                {props.children}
            </DataLoader>
        )}
    </ServerDataContainer.Consumer>
);
