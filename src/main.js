import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui'; //全局引入element
import 'element-ui/lib/theme-chalk/index.css'; //全局引入element的样式
import axios from 'axios';
import VueCookies from 'vue-cookies';
import './assets/iconfont.css';
Vue.use(VueCookies);

Vue.config.productionTip = false;
Vue.use(ElementUI); //全局注入element
Vue.prototype.$axios = axios;
axios.defaults.timeout = 20000;

// 缩放：zoomFactor为数字型才执行缩放（如0.6），非数字型(如"")不缩放
const { webFrame, remote } = require('electron');
const zoomFactor = remote.getGlobal('sharedObject').zoomFactor;

if (typeof zoomFactor === 'number') {
  webFrame.setZoomFactor(zoomFactor);
  let rafId = null;
  let checkStart = 0;
  window.addEventListener('resize', () => {
    webFrame.setZoomFactor(zoomFactor);
    checkStart = Date.now();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function check() {
      if (Date.now() - checkStart > 5000) {
        rafId = null;
        return;
      }
      if (Math.abs(webFrame.getZoomFactor() - zoomFactor) > 0.01) {
        webFrame.setZoomFactor(zoomFactor);
      }
      rafId = requestAnimationFrame(check);
    });
  });
}

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
