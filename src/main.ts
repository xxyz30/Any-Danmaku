import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Danmaku from 'danmaku';

createApp(App).use(ElementPlus).mount(
  (() => {
    const app = document.createElement('div');
    document.body.parentElement!.append(app);
    return app;
  })(),
);

Danmaku.prototype.getDom = function () {
  return this._.stage
}