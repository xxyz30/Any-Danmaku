import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Danmaku from 'danmaku';

// 不使用shadowRoot,因为vue会默认把css放到全局,shadowRoot读不到
// 没办法,只能造成污染了
function beforeMount() {
  // 判定是否是同源iframe,是的话就不要挂载了
  if (window.top !== window.self) {
    try {
      //@ts-ignore
      window.top.alert
    } catch (e) {
      mount()
    }
  } else {
    mount()
  }
}

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

function mount() {
  const app = createApp(App).use(ElementPlus)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  app.mount(
    (() => {
      const app = document.createElement('div');
      app.className = 'any-danmaku-app'
      document.body.parentElement!.append(app);
      return app;
    })(),
  );
}
Danmaku.prototype.getDom = function () {
  return this._.stage
}

beforeMount()