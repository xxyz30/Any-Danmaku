<!-- 一条弹幕 -->
<template>
    <div @mouseenter="showPopup = true" @mouseleave="showPopup = false">
        <p :style="{ ...data.style }" class="comment" :class="{ 'comment-hover': showPopup }">{{ data.text }}</p>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'

@Component({
    name: 'DanmakuComponent'
})
export class DanmakuComponent extends Vue {
    @Prop()
    public data!: any

    public showPopup = false
}
export default toNative(DanmakuComponent)
</script>
<style scoped>
.tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
}

.comment {
    border: 2px solid rgba(0, 0, 0, 0)
}

.comment-hover {
    border: 2px solid rgba(45, 171, 189, 0.37);
}

.popup {
    /* visibility: hidden; */
    width: 50px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    transform: translateX(-50%);
    left: 50%;
    top: 35px;
    height: 20px;
    opacity: 0.5;
}

.popup::before {
    content: "";
    position: absolute;
    top: -27%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent black transparent;
    opacity: 0.5;
}

/* 
.tooltip:hover .tooltiptext {
    visibility: visible;
} */
</style>