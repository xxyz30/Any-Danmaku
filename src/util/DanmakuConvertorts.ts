import { DanmakuComment } from "../index"

const base_pos: ['rtl', 'top', 'bottom'] = ['rtl', 'top', 'bottom']

const ddplay_pos: { [k: string]: number } = { '1': 0, '4': 1, '5': 2 }

const shadow = '#000 1px 0 1px,#000 0 1px 1px,#000 0 -1px 1px,#000 -1px 0 1px'
const baseSize = 25

function convertBaha(danmaku: any[]): DanmakuComment[] {
    const result: DanmakuComment[] = []
    for (const d of danmaku) {
        result.push({
            text: d.text,
            time: d.time / 10,
            mode: base_pos[d.position],
            style: {
                color: d.color,
                fontSize: `${baseSize + d.size ?? 1}px`,
                textShadow: shadow
            }
        })
    }

    return result
}

function convertDDPlay(danmaku: any[]): DanmakuComment[] {
    const result: DanmakuComment[] = []
    for (const d of danmaku) {
        const [time, pos, color, uid] = (d.p as string).split(',')
        result.push({
            text: d.m,
            time: Number(time),
            mode: base_pos[ddplay_pos[pos]],
            style: {
                color: '#' + Number(color).toString(16),
                fontSize: `${baseSize}px`,
                textShadow: '#000 1px 0 1px,#000 0 1px 1px,#000 0 -1px 1px,#000 -1px 0 1px'
            }
        })
    }
    return result
}

export { convertBaha, convertDDPlay }