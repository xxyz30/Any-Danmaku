<template>
    <div>
        <el-button class="panel-button" circle :icon="Search" @click="visible.search = true" draggable></el-button>
        <el-button class="panel-button" circle :icon="Setting" @click="visible.panel = true" v-show="!visible.panel"
            draggable></el-button>
        <el-dialog v-model="visible.panel" title="Any-Danmaku设置">
            设置界面
        </el-dialog>
        <el-dialog v-model="visible.search" title="搜索弹幕">

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
        panel: false,
        search: false
    }

    public loading = {
        danmakuList: false,
        fetchingDanmaku: false
    }

    public query = {
        name: '',
        episodeId: -1
    }

    public searchResult: any = {}

    public searchVideo() {
        this.loading.danmakuList = true
        searchAnime(this.query.name).then(async res => {
            this.searchResult = await res.json()
        }).finally(() => this.loading.danmakuList = false)

    }

    public async fetchingDanmaku() {
        if (this.query.episodeId == -1) {
            this.$message.warning('请选择一集！')
            return
        }
        console.log(this.query.episodeId);

        const dm: DanmakuComment[] = []
        this.loading.fetchingDanmaku = true;

        const ddPlayDm = await (await get_danmaku_ddplay(this.query.episodeId)).json()

        dm.push(...convertDDPlay(ddPlayDm.comments))

        danmaku_origin(this.query.episodeId).then(async res => {
            const urls = await res.json();

            //先取第一个
            const url: string = urls.relateds[0].url

            for (const relateds of urls.relateds) {
                const url = relateds.url
                const c = await danmaku_convert(url)
                if (c.status != 200) {
                    this.$message.error(`无法转换弹幕${url}`)
                    continue
                }
                const danmaku = await c.json()
                dm.push(...convertDDPlay(danmaku.comments))
            }
            this.visible.search = false

        }).then(() => {
            this.attachVideo(dm)
        }).finally(() => this.loading.fetchingDanmaku = false)

    }

    public attachVideo(danmaku: DanmakuComment[]) {

        let videos = document.getElementsByTagName('video')

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            // console.log(video)
            const overlay = document.createElement('div')
            // overlay.className = video.className
            video.parentElement!.append(overlay)
            video.parentElement!.removeChild(video)
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

            console.log(d.getDom());
            d.getDom().style.inset = '0'
            d.getDom().style.position = 'absolute'

            setInterval(() => {
                overlay.style.width = video.style.width ?? '100%'
                overlay.style.height = video.style.height ?? '100%'
                d.resize()
            }, 100)

        }
    }

    public openPanel() {
        this.visible.panel = true
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