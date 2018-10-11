import * as React from 'react';

const WINDOW_SSR_KEY = '_DATA_LOADER_SSR_DATA';

declare global {
    interface Window {
        [WINDOW_SSR_KEY]?: {[key: string]: any};
    }
}

export const loadSsrData = (key: string) => window && window[WINDOW_SSR_KEY] && window[WINDOW_SSR_KEY]![key];

export const getSsrDataElement = (data: string) => (
    <script dangerouslySetInnerHTML={{__html: `window.${WINDOW_SSR_KEY} = ${data};`}} />
);
