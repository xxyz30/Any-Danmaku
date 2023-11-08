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

declare module 'danmaku' {
    export default interface Danmaku {
        public _: {
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
        public getDom(): HTMLElement | HTMLCanvasElement

    }
}