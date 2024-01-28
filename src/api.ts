//dd play api
//https://github.com/kaedei/dandanplay-libraryindex
//https://api.dandanplay.net/swagger/ui/index

import {GM} from "$"
import {GM_RESPONSE} from "./index";

//搜索动画
function searchAnime(s: string | number) {
    const url = `https://api.dandanplay.net/api/v2/search/episodes?anime=${s}`
    return doGet(url)
}

//获得ddplay自己的弹幕
function get_danmaku_ddplay(episodeId: string | number) {
    const url = `https://api.dandanplay.net/api/v2/comment/${episodeId}`
    return doGet(url)
}

// 获得其它网站的弹幕
function danmaku_origin(episodeId: string | number, index: number = 0) {
    const url = `https://api.dandanplay.net/api/v2/related/${episodeId}`
    return doGet(url)
}

// 利用ddplay的接口转换弹幕到ddplay的格式
function danmaku_convert(url: string) {
    const req = `https://api.dandanplay.net/api/v2/extcomment?url=${url}`
    return doGet(req)
}
//补全不导出，只能any了
function doGet(url: string): Promise<GM_RESPONSE<'json'>> {
    return new Promise((res, rej) => {
        GM.xmlHttpRequest({
            method: 'GET',
            url,
            responseType: 'json',
            onload: (data) => res(data),
            onerror: (data) => rej(data)
        })
    })
}


// 通过sn码找巴哈的弹幕
// function get_danmaku_baha(sn: string | number) {
//     // const url = 'https://tw.dandanplay.net/ajax/danmuGet.php'
//     const url = 'http://localhost:1000/ajax/danmuGet.php'
//     const form = new FormData()
//     form.set('sn', String(sn))
//     return fetch(url, {
//         method: 'post',
//         body: form
//     })
// }

export {searchAnime, danmaku_origin, get_danmaku_ddplay, danmaku_convert}