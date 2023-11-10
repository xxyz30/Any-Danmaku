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
                    <el-option v-for="(item, i) of avaibleVideos" :key="i" :label="`视频容器${i + 1}`" :value="item"
                        @mouseenter="item.classList.add('any-danmaku-video-highlight')"
                        @mouseleave="item.classList.remove('any-danmaku-video-highlight')" />
                </el-select>
            </el-form-item>
            <el-form-item label="名称">
                <el-input v-model="query.name" placeholder="请输入作品名称" @keydown.enter.native="searchVideo">
                    <template #append>
                        <el-button :icon="Search" @click="searchVideo" />
                    </template>
                </el-input>
            </el-form-item>
            <el-card shadow="never" class="result-card">
                <el-collapse>
                    <el-collapse-item :title="`${item.animeTitle} (${item.typeDescription})`"
                        v-for="(item, index) in searchResult.animes" :key="index">
                        <el-radio-group v-model="query.episodeId">
                            <el-radio :label="j.episodeId" v-for="(j, ji) in item.episodes" :key="ji">{{ j.episodeTitle
                            }}</el-radio>
                        </el-radio-group>
                    </el-collapse-item>
                </el-collapse>
            </el-card>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="fetchingDanmaku" :loading="loading.fetchingDanmaku">确定</el-button>
                    <el-button>取消</el-button>
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
import { danmaku_origin, danmaku_convert, searchAnime, get_danmaku_ddplay } from '../api'
import { convertBaha, convertDDPlay } from '../util/DanmakuConvertorts'
import { DanmakuComment } from "../index";

@Component({})
class Base extends Vue {
    vShow(vShow: any) {
        throw new Error('Method not implemented.')
    }
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
        origin: [] as string[]
    }

    public searchResult: any = {}

    public avaibleDanmakuOrigin: { [k: string]: DanmakuComment[] } = {

    }


    public get avaibleVideos() {
        // return 
        return Array.from(document.getElementsByTagName('video'))
    }

    public searchVideo() {
        this.loading.danmakuList = true
        searchAnime(this.query.name).then(async res => {
            this.searchResult = await res.json()
        }).finally(() => this.loading.danmakuList = false)
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

        const ddPlayDm = await (await get_danmaku_ddplay(this.query.episodeId)).json()

        this.avaibleDanmakuOrigin['弹弹play'] = convertDDPlay(ddPlayDm.comments)

        danmaku_origin(this.query.episodeId).then(async res => {
            const urls = await res.json();
            for (const relateds of urls.relateds) {
                const url = relateds.url
                const c = await danmaku_convert(url)
                if (c.status != 200) {
                    this.$message.error(`无法转换弹幕${url}`)
                    continue
                }
                const danmaku = await c.json()
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
        this.attachVideo2(dm)
        this.visible.selectOrigin = false
    }

    //每段时间获得视频容器的位置来显示弹幕
    //缺点是没法全屏
    public attachVideo(danmaku: DanmakuComment[]) {
        const video = this.query.video
        const overlay = document.createElement('div')
        overlay.className = 'any-danmaku-overlay'
        // video.parentElement!.append(overlay)
        // video.parentElement!.removeChild(video)
        // video.style.zIndex = '0'
        video.classList.add('any-danmaku-video')
        overlay.style.zIndex = '100000000'
        overlay.style.position = 'fixed'
        // overlay.style.pointerEvents = 'none'
        // overlay.style.inset = '0'

        const rect = video.getBoundingClientRect()
        overlay.style.width = `${rect.width}px`
        overlay.style.height = `${rect.height}px`
        overlay.style.top = `${rect.top}px`
        overlay.style.left = `${rect.left}px`
        overlay.style.pointerEvents = 'none'
        document.body.parentElement!.append(overlay)
        const d = new Danmaku({
            container: overlay,
            media: video,
            comments: danmaku
        })
        // d.getDom().style.inset = '0'
        // d.getDom().style.position = 'absolute'
        // let ob = new ResizeObserver(() => {
        // })
        // ob.observe(document.getElementsByTagName('html').item(0)!)

        //还是这个最稳定，不受无法滚动的body的影响。虽然有点弹幕延迟
        setInterval(() => {
            const rect = video.getBoundingClientRect()
            overlay.style.width = `${rect.width}px`
            overlay.style.height = `${rect.height}px`
            overlay.style.top = `${rect.top}px`
            overlay.style.left = `${rect.left}px`
            d.resize()
        }, 20)
    }

    //向视频容器上级添加一个容器来达到显示效果
    //缺点是可能破坏dom
    public attachVideo2(danmaku: DanmakuComment[]) {
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