<template>
    <div>
        <div v-show="!(visible.search || visible.setting)">
            <el-button class="panel-button" circle :icon="Search" @click="visible.search = true" draggable></el-button>
            <el-button class="panel-button" circle :icon="Setting" @click="visible.setting = true"></el-button>
        </div>
        <el-dialog v-model="visible.setting" title="Any-Danmaku设置" draggable>
            <p>
                //todo
                弹幕来源
                弹幕样式
                弹幕屏蔽
                etc
            </p>
        </el-dialog>
        <el-dialog v-model="visible.search" title="搜索弹幕" append-to-body draggable>
            <el-form-item label="视频容器">
                <el-select v-model="query.video" placeholder="选择一个视频容器" value-key="src">
                    <el-option-group v-for="(doc, i) of avaibleDocument" :key="i" :label="`容器${i}`"
                        v-show="avaibleVideos(doc).length">
                        <el-option v-for="(item, i) of avaibleVideos(doc)" :key="i" :label="`视频容器${i + 1}`"
                            :value="item" @mouseenter="item.classList.add('any-danmaku-video-highlight')"
                            @mouseleave="item.classList.remove('any-danmaku-video-highlight')" />
                    </el-option-group>
                </el-select>
                <el-icon @click="refreshVideoContainer">
                    <RefreshRight />
                </el-icon>
            </el-form-item>
            <el-form-item label="名称">
                <el-input v-model="query.name" placeholder="请输入作品名称" @keydown.enter.native="searchAnime">
                    <template #append>
                        <el-button :icon="Search" @click="searchAnime" />
                    </template>
                </el-input>
            </el-form-item>
            <el-card shadow="never" class="result-card">
                <el-collapse v-show="!query.processText">
                    <el-collapse-item :title="`${item.animeTitle} (${item.typeDescription})`"
                        v-for="(item, index) in searchResult" :key="index">
                        <el-radio-group v-model="query.episodeId">
                            <el-radio :label="j.episodeId" v-for="(j, ji) in item.episodes" :key="ji">{{ j.episodeTitle
                                }}</el-radio>
                        </el-radio-group>
                    </el-collapse-item>
                </el-collapse>
                <p v-show="query.processText">{{ query.processText }}</p>
            </el-card>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="fetchingDanmaku" :loading="loading.fetchingDanmaku">确定</el-button>
                    <el-button @click="visible.search = false">取消</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="visible.selectOrigin" title="选择弹幕来源">
            <el-checkbox-group v-model="query.origin">
                <el-checkbox v-for="(item, i) in avaibleDanmakuOrigin" :label="i" :checked="true">
                    <a :href="(i as string)" target="_blank">{{ i }}</a>
                </el-checkbox>
            </el-checkbox-group>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="onChooseDanmakuOrigin"
                        :loading="loading.fetchingDanmaku">确定</el-button>
                    <el-button>取消</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'
import { Setting, Search } from '@element-plus/icons-vue'
import Danmaku from 'danmaku'
import api from '../api'
import { convertBaha, convertDDPlay } from '../util/DanmakuConvertorts'
import { DanmakuComment } from "../index";

@Component({})
class Base extends Vue {

    public Setting = Setting
    public Search = Search

    public visible = {
        setting: false,
        search: false,
        selectOrigin: false
    }

    public loading = {
        danmakuList: false,
        fetchingDanmaku: false
    }

    public query = {
        name: '',
        video: null as unknown as HTMLMediaElement,
        episodeId: -1,
        origin: [] as string[],
        processText: ''
    }

    public avaibleDocument: Document[] = []

    public searchResult: any[] = []

    public avaibleDanmakuOrigin: { [k: string]: DanmakuComment[] } = {

    }

    public avaibleVideos(doc: Document) {
        return Array.from(doc.getElementsByTagName('video'))
    }
    public refreshVideoContainer() {
        console.log('重构')
        this.avaibleDocument = [document,
            ...Array.from(document.getElementsByTagName('iframe')).map(v => v.contentDocument!).filter(v => v)
        ]
    }

    public mounted() {
        this.refreshVideoContainer()
    }

    public searchAnime() {
        this.loading.danmakuList = true
        this.query.processText = '查询中……'
        if (this.query.name) {
            api.searchAnime(this.query.name).then(res => {
                this.searchResult = res.response.animes
                if (Object.keys(this.searchResult).length == 0) {
                    this.query.processText = '未查询到结果'
                } else {
                    this.query.processText = ''
                }
            }).catch(r => {
                this.query.processText = `查询失败:状态码${r.status} ${r.statusText},内容${r.responseText}请检查您的网络配置(DDPlay可能会检测代理)`
            }).finally(() => this.loading.danmakuList = false)
        } else {
            api.shin().then(res => {
                this.searchResult = res.response.bangumiList
                if (Object.keys(this.searchResult).length == 0) {
                    this.query.processText = '未查询到近期新番'
                } else {
                    this.query.processText = ''
                }
            }).catch(r => {
                this.query.processText = `查询失败:状态码${r.status} ${r.statusText},内容${r.responseText}请检查您的网络配置(DDPlay可能会检测代理)`
            }).finally(() => this.loading.danmakuList = false)
        }
    }

    public async fetchingDanmaku() {
        console.log(this.query);
        if (this.query.episodeId == -1) {
            this.$message.warning('请选择一集！')
            return
        }
        if (this.query.video == null) {
            this.$message.warning('请选择一个容器！')
            return
        }

        console.log(this.query.episodeId);

        this.avaibleDanmakuOrigin = {}
        this.loading.fetchingDanmaku = true;

        const ddPlayDm = (await api.get_danmaku_ddplay(this.query.episodeId)).response

        this.avaibleDanmakuOrigin['弹弹play'] = convertDDPlay(ddPlayDm.comments)

        api.danmaku_origin(this.query.episodeId).then(async res => {
            const urls = res.response
            for (const relateds of urls.relateds) {
                const url = relateds.url
                const c = await api.danmaku_convert(url)
                if (c.status != 200) {
                    this.$message.error(`无法转换弹幕${url}`)
                    continue
                }
                const danmaku = c.response
                this.avaibleDanmakuOrigin[url] = convertDDPlay(danmaku.comments)
            }
            this.visible.search = false
            this.visible.selectOrigin = true
        }).finally(() => this.loading.fetchingDanmaku = false)
    }

    public onChooseDanmakuOrigin() {
        if (this.query.origin.length == 0) {
            this.$message.warning('请选择至少一个弹幕来源！')
            return
        }
        const dm: DanmakuComment[] = []
        for (const i of this.query.origin) {
            dm.push(...this.avaibleDanmakuOrigin[i])
        }
        this.attachVideo(dm)
        this.visible.selectOrigin = false
    }

    //向视频容器上级添加一个容器来达到显示效果
    //缺点是可能破坏dom
    // 神奇的是樱花动漫移动了视频容器, 视频的src会炸掉,不清楚是什么原因
    // 另外不能劫持video的上面一层的节点, 否则因为阻挡了输入可能导致外部的控制条没法操作视频
    public attachVideo(danmaku: DanmakuComment[]) {
        const video = this.query.video
        // console.log(video)
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

        // console.log(overlay);

        const d = new Danmaku({
            container: overlay,
            media: video,
            comments: danmaku
        })
        d.getDom().style.inset = '0'
        d.getDom().style.position = 'absolute'
        d.getDom().style.pointerEvents = 'unset'
        let ob = new ResizeObserver(() => {
            overlay.style.width = video.style.width ?? '100%'
            overlay.style.height = video.style.height ?? '100%'
            d.resize()
        })
        ob.observe(video)
    }

    public openPanel() {
        this.visible.setting = true
    }
}
export default toNative(Base)
</script>

<style scoped>
.result-card {
    height: 300px;
    overflow: scroll;
}
</style>