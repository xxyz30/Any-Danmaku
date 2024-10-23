// 拦截设置video.src
// Object.defineProperty()

const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');

const createdVideos: string[] = []

const oldSrc = {
    getter: descriptor!.get,
    setter: descriptor!.set
}


Object.defineProperty(HTMLMediaElement.prototype, 'src', {
    get: function () {
        return oldSrc.getter?.call(this)
    },
    set: function (v) {
        if (v && this instanceof HTMLVideoElement && !createdVideos.includes(v)) {
            createdVideos.push(v)
            console.log('视频设置', v)
            // const el: HTMLDivElement = document.getElementById('ANY_DANMAKU_VIDEO') as any

            // oldSrc.setter?.call(video, v)
            // video.style.width = '100%'
            // video.style.height = '100%'
            // const style = el?.style
            // style.height = '100px'
            // style.width = '200px'
            // el?.append(video)
            // const dp = new DPlayer({
            //     container: el,
            //     video: {
            //         url: v
            //     }
            // })
            // const pe = globalThis._DPlayer.video.parentElement
            // this.removeAttribute('style')
            // globalThis._DPlayer.video.remove()
            // globalThis._DPlayer.video = this
            // pe?.appendChild(this)
            // this.parentElement?.removeChild(this)

            // 浏览器无法设置两个video容器的src为同一个地址，会直接报错
            // 需要获取网页原本video事件，然后将自己的video容器的所有事件全部劫持
            // globalThis._DPlayer.video.src = v;
            
        }

        oldSrc.setter?.call(this, v)

    }
})