import Danmaku from "danmaku"
import { DanmakuComment } from "."
import setting from "./setting"

//向视频容器上级添加一个容器来达到显示效果
//缺点是可能破坏dom
// 神奇的是樱花动漫移动了视频容器, 视频的src会炸掉,不清楚是什么原因
// 另外不能劫持video的上面一层的节点, 否则因为阻挡了输入可能导致外部的控制条没法操作视频
export function attachVideo(video: HTMLVideoElement, dm: Record<string, DanmakuComment[]>) {
    const overlay = document.createElement('div')
    overlay.className = 'any-danmaku-overlay'
    // overlay.className = video.className
    video.parentElement!.append(overlay)
    video.parentElement!.removeChild(video)
    video.style.zIndex = '0'
    video.classList.add('any-danmaku-video')
    overlay.appendChild(video)
    // overlay.style.zIndex = '100000000'
    overlay.style.position = 'absolute'
    // overlay.style.pointerEvents = 'none'
    overlay.style.inset = '0'
    globalThis.DANMAKU = new Danmaku({
        container: overlay,
        media: video,
        // comments: Object.values(dm).flatMap(v => v)
    })
    DANMAKU.getDom().style.inset = '0'
    DANMAKU.getDom().style.position = 'absolute'
    DANMAKU.getDom().style.pointerEvents = 'none'
    let ob = new ResizeObserver(() => {
        overlay.style.width = video.style.width ?? '100%'
        overlay.style.height = video.style.height ?? '100%'
        DANMAKU.resize()
    })
    ob.observe(video)

    let lastTimeUpdate = 0.0

    video.addEventListener('timeupdate', function (ev) {
        const time = video.currentTime;
        console.log(time)
        // 这里需要过滤过多的弹幕，检测弹幕容器大小
        // 检测上下弹幕数量

        let scrollCount = setting.maxComment;
        let upCount = 5;
        let downCount = 5;
        DANMAKU._.runningList.forEach(v => {
            switch (v.mode) {
                case 'top':
                    upCount--;
                    break;
                case 'bottom':
                    downCount--
                    break;
                case 'ltr':
                case 'rtl':
                    scrollCount--;
                    break;
            }
        })
        const set = new Set()
        // 统计同屏弹幕数量，超过一定值直接不需要了
        // FIXME 只统计数量是不对的，因为若是弹幕过长，则碰撞计算会超过屏幕
        Object.values(dm).flatMap(v => v).forEach(v => {
            if (v.time! < lastTimeUpdate || v.time! > time) {
                return
            }
            // 查重
            if (set.has(v.text)) {
                return
            }
            set.add(v.text)
            // 上下弹幕统计，不要超过5个

            switch (v.mode) {
                case 'top':
                    if (upCount <= 0) {
                        return
                    }
                    upCount--;
                    break;
                case 'bottom':
                    if (downCount <= 0) {
                        return
                    }
                    downCount--;
                    break;
                case 'rtl':
                case 'ltr':
                    scrollCount--;
            }
            DANMAKU.emit(v)
            console.log(v.text)
        })
        // console.log(resultDM, DANMAKU._.runningList.length)
        lastTimeUpdate = time
    })
}