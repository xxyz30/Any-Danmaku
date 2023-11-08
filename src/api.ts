function searchAnime(s: string | number) {
    const url = `https://api.dandanplay.net/api/v2/search/episodes?anime=${s}`
    return fetch(url)
}
//获得ddplay自己的弹幕
function get_danmaku_ddplay(episodeId: string | number) {
    const url = `https://api.dandanplay.net/api/v2/comment/${episodeId}`
    return fetch(url)
}

function danmaku_origin(episodeId: string | number, index: number = 0) {
    const url = `https://api.dandanplay.net/api/v2/related/${episodeId}`
    return fetch(url)
}

// 通过sn码找巴哈的弹幕
function get_danmaku_baha(sn: string | number) {
    // const url = 'https://tw.dandanplay.net/ajax/danmuGet.php'
    const url = 'http://localhost:1000/ajax/danmuGet.php'
    const form = new FormData()
    form.set('sn', String(sn))
    return fetch(url, {
        method: 'post',
        body: form
    })
}

export { searchAnime, danmaku_origin, get_danmaku_baha, get_danmaku_ddplay }