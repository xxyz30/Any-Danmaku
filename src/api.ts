//dd play api
//https://github.com/kaedei/dandanplay-libraryindex
//https://api.dandanplay.net/swagger/ui/index

import { GM } from "$"
import { GM_RESPONSE } from "./index";
const ddPlayApiPrefix = 'https://api.dandanplay.net/api/v2'
const ddPlayApiKey = ''
const ddPlaySecret = ''

//搜索动画
function searchAnime(s: string | number) {
    const url = `${ddPlayApiPrefix}/search/episodes?anime=${s}`
    return doGet(url)
}

//获得ddplay自己的弹幕
function get_danmaku_ddplay(episodeId: string | number) {
    const url = `${ddPlayApiPrefix}/comment/${episodeId}`
    return doGet(url)
}

// 获得其它网站的弹幕
function danmaku_origin(episodeId: string | number, index: number = 0) {
    const url = `${ddPlayApiPrefix}/related/${episodeId}`
    return doGet(url)
}
// 获得当季新番
function shin() {
    const url = `${ddPlayApiPrefix}/bangumi/shin`
    return doGet(url)
}

// 利用ddplay的接口转换弹幕到ddplay的格式
function danmaku_convert(url: string) {
    const req = `${ddPlayApiPrefix}/extcomment?url=${url}`
    return doGet(req)
}
function login(username: string, password: string) {
    const url = `${ddPlayApiPrefix}/login`
    const _hash = `${ddPlayApiKey}${password}666666666${username}${ddPlaySecret}`
}
//补全不导出，只能any了
function doGet(url: string): Promise<GM_RESPONSE<'json'>> {
    return new Promise((res, rej) => {
        GM.xmlHttpRequest({
            method: 'GET',
            url,
            responseType: 'json',
            onload: (data) => {
                console.log(data)
                if (data.status != 200) {
                    rej(data)
                } else {
                    res(data)
                }
            },
            onerror: (data) => rej(data)
        })
    })
}

function doPost(url: string, data: any): Promise<GM_RESPONSE<'json'>> {
    return new Promise((res, rej) => {
        GM.xmlHttpRequest({
            method: 'POST',
            url,
            data,
            responseType: 'json',
            onload: (data) => {
                console.log(data)
                if (data.status != 200) {
                    rej(data)
                } else {
                    res(data)
                }
            },
            onerror: (data) => rej(data)
        })
    })
}

export default { searchAnime, danmaku_origin, get_danmaku_ddplay, danmaku_convert, shin }