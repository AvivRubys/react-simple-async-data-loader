import * as React from 'react';

import {ServerDataContainer, ServerRenderingStage, ServerData} from './ServerData';
import {loadSsrData} from './client';

interface DataLoaderConfig<Props, Data> {
    key: string;
    loader: (props: Props) => Promise<Data>;
    propName: string;
}

export const hoc = <Props extends {} = {}, Data extends {} = {}>(config: DataLoaderConfig<Props, Data>) => (
    WrappedComponent?: React.ComponentType<Props>
) => {
    if (!WrappedComponent) {
        throw new TypeError('A component must be passed into asyncDataLoader');
    }

    interface DataLoaderProps {
        ownProps: Props;
        serverData: ServerData | null;
    }
    class DataLoader extends React.Component<DataLoaderProps, {didLoad: boolean; data?: Data}> {
        constructor(props: DataLoaderProps) {
            super(props);

            this.state = {didLoad: false, data: undefined, ...this.getInitialState()};
        }

        getInitialState() {
            const {serverData, ownProps} = this.props;

            if (serverData) {
                if (serverData.stage === ServerRenderingStage.Prefetch) {
                    serverData.loaders[config.key] = config.loader.bind(null, this.props.ownProps);
                } else {
                    return {data: serverData.data[config.key] as Data, didLoad: true};
                }
            } else {
                const data = loadSsrData(config.key) as Data;

                if (data) {
                    return {data, didLoad: true};
                } else {
                    config.loader(this.props.ownProps).then(res => this.setState({data: res, didLoad: true}));
                }
            }

            return null;
        }

        render(): React.ReactNode {
            if (!this.state.didLoad) {
                return <span>LOADING INITIAL DATA</span>;
            } else {
                return React.cloneElement(this.props.children! as any, {[config.propName]: this.state.data});
            }
        }
    }

    return (props: Props) => (
        <ServerDataContainer.Consumer>
            {serverData => (
                <DataLoader ownProps={props} serverData={serverData}>
                    <WrappedComponent {...props} />
                </DataLoader>
            )}
        </ServerDataContainer.Consumer>
    );
};
