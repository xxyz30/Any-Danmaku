import Danmaku from "danmaku";

interface DanmakuComment {
    text?: string;
    /**
     * @default rtl
     */
    mode?: 'ltr' | 'rtl' | 'top' | 'bottom';
    /**
     * Specified in seconds. Not required in live mode.
     * @default media?.currentTime
     */
    time?: number;
    style?: Partial<CSSStyleDeclaration> | CanvasRenderingContext2D;

    /**
     * A custom render to draw comment.
     * When it exist, `text` and `style` will be ignored.
     */
    render?(): HTMLElement | HTMLCanvasElement;
}

declare global {
    var DANMAKU: Danmaku
}

declare module 'danmaku' {
    export default interface Danmaku {
        _: {
            duration: number,
            engine: any,
            height: number,
            paused: boolean,
            position: number,
            requestID: number,
            runningList: DanmakuComment[],
            space: any,
            speed: number,
            stage: HTMLElement | HTMLCanvasElement,
            visible: boolean,
            width: number
        };
        getDom(): HTMLElement | HTMLCanvasElement

    }
}

type GmResponseTypeMap = {
    text: string;
    json: any;
    arraybuffer: ArrayBuffer;
    blob: Blob;
    document: Document;
    stream: ReadableStream<Uint8Array>;
};


declare type GM_RESPONSE<TResponseType> = {
    finalUrl: string;
    responseHeaders: string;
    /**
     * 0 = XMLHttpRequest.UNSENT
     *
     * 1 = XMLHttpRequest.OPENED
     *
     * 2 = XMLHttpRequest.HEADERS_RECEIVED
     *
     * 3 = XMLHttpRequest.HEADERS_RECEIVED
     *
     * 4 = XMLHttpRequest.DONE
     */
    readyState: 0 | 1 | 2 | 3 | 4;
    response: GmResponseTypeMap[TResponseType];
    responseText: string;
    responseXML: Document | null;
    status: number;
    statusText: string;
}