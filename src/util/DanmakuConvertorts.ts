import { DanmakuComment } from "../index"
import setting from "../setting"

const base_pos: ['rtl', 'top', 'bottom'] = ['rtl', 'top', 'bottom']

const ddplay_pos: { [k: string]: number } = { '1': 0, '4': 1, '5': 2 }


function convertDDPlay(danmaku: any[]): DanmakuComment[] {
    const result: DanmakuComment[] = []
    for (const d of danmaku) {
        const [time, pos, color, _uid] = (d.p as string).split(',')
        result.push({
            text: d.m,
            time: Number(time),
            mode: base_pos[ddplay_pos[pos]],
            style: {
                color: '#' + Number(color).toString(16),
                fontSize: `${setting.style.baseSize}px`,
                textShadow: setting.style.textShadow,
                opacity: setting.style.opacity.toString(),
                lineHeight: `${setting.style.lineHeight}px`
            }
            // 这个函数有问题,在dev状态是好的，但是编译完成后就没办法渲染
            // render: () => {
            //     const v = h(DanmakuComponent, {
            //         data: {
            //             text: d.m,
            //             cid: d.cid,
            //             style: {
            //                 color: '#' + Number(color).toString(16),
            //                 fontSize: `${baseSize}px`,
            //                 textShadow: shadow,
            //                 lineHeight: '125%',
            //                 opacity: '0.5',
            //             }

            //         }
            //     })
            //     const mount = document.createElement('div')
            //     render(v, mount)
            //     return mount
            // }
        })
    }
    return result
}

export { convertDDPlay }