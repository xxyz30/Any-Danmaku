import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn, util } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'any-danmaku',
        match: ['*'],
        grant: ['GM.xmlHttpRequest'],
        author: 'xxyz30',
        version: '0.1',
        connect: ['dandanplay.net'],
        include: ['*'],
        // "run-at": 'document-start'
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js').concat(await util.fn2dataUrl(() => {
            // @ts-ignore
            window.Vue = Vue
          })),
          'element-plus': cdn.jsdelivr('ElementPlus', 'dist/index.full.min.js'),
          danmaku: cdn.jsdelivr('danmaku', 'dist/danmaku.min.js').concat(await util.fn2dataUrl(() => {
            // @ts-ignore
            window.danmaku = Danmaku
          })),
          // 这玩意没被打包到full所以算了
          // 'vue-facing-decorator': cdn.jsdelivr('vueFacingDecorator', '+esm'),
        },
        externalResource: {
          'element-plus/dist/index.css': cdn.jsdelivr(),
        },
      },
    }),
  ],
});
