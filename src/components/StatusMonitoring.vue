<template>
  <div :class="['sm-main', plcStatusClass]" v-drag @dblclick="openPlcPanel">
    <div class="inner">
      <el-icon class="status-icon">
        <component
          :is="plcStatusClass === 'offline' ? 'CircleClose' : 'CircleCheck'"
        />
      </el-icon>
      <span class="status-text">{{ plcStatusText }}</span>
    </div>
    <el-dialog
      title="PLC变量"
      v-model="plcPanelVisible"
      width="760px"
      class="plc-panel"
      append-to-body
      @open="handlePlcPanelOpen"
      @close="handlePlcPanelClose"
    >
      <el-radio-group
        v-model="activePlcIndex"
        size="small"
        class="plc-panel__tabs"
        @change="handlePlcTabChange"
      >
        <el-radio-button v-for="(config, i) in plcConfigs" :key="i" :value="i"
          >{{ config.name }}PLC</el-radio-button
        >
      </el-radio-group>
      <div class="plc-panel__actions">
        <el-select
          v-model="customWriteAddress"
          size="small"
          class="plc-panel__input"
          filterable
          clearable
          placeholder="变量地址，如 W_DBW0"
        >
          <el-option
            v-for="item in writeAddressOptions"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
        <el-select
          v-model="customWriteType"
          size="small"
          class="plc-panel__select"
          placeholder="值类型"
        >
          <el-option label="布尔" value="bool"></el-option>
          <el-option label="字符串" value="string"></el-option>
        </el-select>
        <el-select
          v-if="customWriteType === 'bool'"
          v-model="customWriteBool"
          size="small"
          class="plc-panel__input"
          placeholder="布尔值"
        >
          <el-option label="true" :value="true"></el-option>
          <el-option label="false" :value="false"></el-option>
        </el-select>
        <el-input
          v-else
          v-model="customWriteValue"
          size="small"
          placeholder="值"
          class="plc-panel__input"
        ></el-input>
        <el-button
          type="primary"
          size="small"
          class="plc-panel__btn"
          :loading="isWriting"
          @click="confirmCustomWrite"
        >
          确认写入
        </el-button>
      </div>
      <div class="plc-panel__content">
        <div class="plc-panel__section">
          <div class="plc-panel__title">读取数据</div>
          <el-input
            v-model="readFilter"
            size="small"
            clearable
            placeholder="模糊检索读取变量"
            class="plc-panel__filter"
          ></el-input>
          <div class="plc-panel__list">
            <div
              class="plc-panel__row"
              v-for="item in filteredReadRows"
              :key="item.key"
            >
              <span class="plc-panel__key">{{ item.key }}</span>
              <span class="plc-panel__value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <div class="plc-panel__section">
          <div class="plc-panel__title">写入数据</div>
          <div class="plc-panel__list">
            <div
              class="plc-panel__row"
              v-for="item in writeRows"
              :key="item.key"
            >
              <span class="plc-panel__key">{{ item.key }}</span>
              <span class="plc-panel__value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Bit 位解析模块：按 S7 大端序解析 DBW 的 bit0~bit15 -->
      <div class="plc-panel__bit">
        <div class="plc-panel__bit-header">
          <span class="plc-panel__bit-title">Bit 解析</span>
          <el-select
            v-model="bitParseAddress"
            size="small"
            class="plc-panel__bit-select"
            filterable
            clearable
            placeholder="DBW块"
          >
            <el-option
              v-for="item in readAddressOptions"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
          <span class="plc-panel__bit-info-item"
            >值:<b>{{ bitParseRawValue }}</b></span
          >
          <span class="plc-panel__bit-info-item"
            >Word:<b>{{ bitParseWordValue }}</b></span
          >
          <span class="plc-panel__bit-info-item plc-panel__bit-bin"
            >BIN:<b>{{ bitParseBinary }}</b></span
          >
        </div>
        <div class="plc-panel__bit-grid">
          <div
            v-for="item in bitParseRows"
            :key="item.logicBit"
            :class="['plc-panel__bit-cell', item.value === 1 ? 'on' : 'off']"
            :title="'逻辑 bit' + item.logicBit + ' / 实际 bit' + item.actualBit"
          >
            <span class="plc-panel__bit-label">{{ item.logicBit }}</span>
            <span class="plc-panel__bit-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  name: 'StatusMonitor',
  directives: {
    drag: {
      // 1. 挂载钩子（Vue 3：bind 改为 mounted）
      mounted: function (el) {
        const oDiv = el;

        // 定义 resize 处理函数（命名它，以便稍后解绑）
        const handleResize = () => {
          const clientWidth = document.documentElement.clientWidth;
          const clientHeight = document.documentElement.clientHeight;
          const maxLeft = clientWidth - oDiv.offsetWidth;
          const maxTop = clientHeight - oDiv.offsetHeight;

          if (oDiv._percentX === undefined) {
            // 简单防溢出
            if (oDiv.offsetLeft > maxLeft) oDiv.style.left = maxLeft + 'px';
            if (oDiv.offsetTop > maxTop) oDiv.style.top = maxTop + 'px';
          } else {
            // 比例跟随
            let newLeft = maxLeft * oDiv._percentX;
            let newTop = maxTop * oDiv._percentY;
            oDiv.style.left = newLeft + 'px';
            oDiv.style.top = newTop + 'px';
          }
        };

        // 将函数挂载到元素上，方便 unbind 调用
        el._resizeHandler = handleResize;
        window.addEventListener('resize', handleResize);

        // --- 拖拽逻辑 ---
        const updatePercent = () => {
          const clientWidth = document.documentElement.clientWidth;
          const clientHeight = document.documentElement.clientHeight;
          const maxLeft = clientWidth - oDiv.offsetWidth;
          const maxTop = clientHeight - oDiv.offsetHeight;
          if (maxLeft > 0) oDiv._percentX = oDiv.offsetLeft / maxLeft;
          if (maxTop > 0) oDiv._percentY = oDiv.offsetTop / maxTop;
        };

        oDiv.onmousedown = (e) => {
          // 只响应左键，右键/中键不触发拖拽
          if (e.button !== 0) return;
          // 先清理可能残留的上一轮拖拽状态（防止多次 mousedown 累积泄漏）
          if (oDiv._currentEndDrag) {
            oDiv._currentEndDrag();
          }

          const disX = e.clientX - oDiv.offsetLeft;
          const disY = e.clientY - oDiv.offsetTop;

          oDiv.style.cursor = 'move';
          oDiv.style.zIndex = '9999';
          oDiv.style.transition = 'none';

          const endDrag = () => {
            document.onmousemove = null;
            document.onmouseup = null;
            window.removeEventListener('mouseup', endDrag);
            window.removeEventListener('blur', endDrag);
            document.removeEventListener('contextmenu', endDrag);
            oDiv._currentEndDrag = null;
            oDiv.style.cursor = 'move';
            oDiv.style.transition = 'border-color 0.3s';
            updatePercent();
          };

          // 存到元素上，unbind 时可清理进行中的拖拽
          oDiv._currentEndDrag = endDrag;

          document.onmousemove = (e) => {
            // 鼠标离开可视区域时自动结束拖拽，防止窗口外松开后拖拽状态未释放
            if (
              e.clientX < 0 ||
              e.clientX > document.documentElement.clientWidth ||
              e.clientY < 0 ||
              e.clientY > document.documentElement.clientHeight
            ) {
              endDrag();
              return;
            }
            let left = e.clientX - disX;
            let top = e.clientY - disY;

            // 缓存 clientWidth/Height 会更快，但为了代码简洁直接读取也无妨（Electron环境通常性能足够）
            const maxLeft =
              document.documentElement.clientWidth - oDiv.offsetWidth;
            const maxTop =
              document.documentElement.clientHeight - oDiv.offsetHeight;

            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left > maxLeft) left = maxLeft;
            if (top > maxTop) top = maxTop;

            oDiv.style.left = left + 'px';
            oDiv.style.top = top + 'px';
          };

          document.onmouseup = endDrag;
          window.addEventListener('mouseup', endDrag);
          // 窗口失焦保底：Alt+Tab / 点击其他窗口时自动停止拖拽
          window.addEventListener('blur', endDrag);
          // 右键保底：拖拽过程中右键点击时停止拖拽
          document.addEventListener('contextmenu', endDrag);
        };
      },
      // 2. 卸载钩子 (防止内存泄漏，Vue 3：unbind 改为 unmounted)
      unmounted: function (el) {
        if (el._resizeHandler) {
          window.removeEventListener('resize', el._resizeHandler);
          delete el._resizeHandler;
        }
        // 清理进行中的拖拽状态
        if (el._currentEndDrag) {
          document.onmousemove = null;
          document.onmouseup = null;
          window.removeEventListener('mouseup', el._currentEndDrag);
          window.removeEventListener('blur', el._currentEndDrag);
          document.removeEventListener('contextmenu', el._currentEndDrag);
          delete el._currentEndDrag;
        }
        delete el._percentX;
        delete el._percentY;
      }
    }
  },
  data() {
    return {
      plcCount: 2, // PLC 数量，与 background.js 的 plcConfigs 对应
      plcConfigs: [{ name: '一楼' }, { name: '二楼' }],
      warningTimeOuts: [],
      plcStatuses: [], // [false, false]
      plcValuesArr: [], // [{}, {}]
      plcVariablesArr: [], // [{}, {}]
      writeAddArrs: [],
      writeStrArrs: [],
      activePlcIndex: 0, // 当前选中的 PLC tab
      plcPanelVisible: false,
      customWriteAddress: '',
      customWriteType: 'string',
      customWriteValue: '',
      customWriteBool: true,
      readFilter: '',
      isWriting: false,
      cancelWriteTimers: [],
      writeDataPollingTimers: [],
      bitParseAddress: ''
    };
  },
  created() {
    // 初始化数组
    for (var i = 0; i < this.plcCount; i++) {
      this.warningTimeOuts.push(null);
      this.plcStatuses.push(false);
      this.plcValuesArr.push({});
      this.plcVariablesArr.push({});
      this.writeAddArrs.push([]);
      this.writeStrArrs.push([]);
      this.cancelWriteTimers.push(null);
      this.writeDataPollingTimers.push(null);
    }
  },
  computed: {
    plcStatusClass() {
      var online = this.plcStatuses.filter(function (s) {
        return s;
      }).length;
      if (online === this.plcCount) return 'online';
      if (online === 0) return 'offline';
      return 'partial';
    },
    plcStatusText() {
      var online = this.plcStatuses.filter(function (s) {
        return s;
      }).length;
      if (online === this.plcCount) return 'PLC 已连接';
      if (online === 0) return 'PLC 断开';
      return 'PLC 部分连接';
    },
    // 当前选中的PLC变量定义
    currentPlcVariables() {
      return this.plcVariablesArr[this.activePlcIndex] || {};
    },
    // 当前选中的PLC读取数据
    currentPlcValues() {
      return this.plcValuesArr[this.activePlcIndex] || {};
    },
    writeAddressOptions() {
      return Object.keys(this.currentPlcVariables).filter(function (key) {
        return key.startsWith('W_');
      });
    },
    readRows() {
      var self = this;
      var keys = Object.keys(this.currentPlcVariables).filter(function (key) {
        return !key.startsWith('W_');
      });
      return keys.map(function (key) {
        return {
          key: key,
          value:
            self.currentPlcValues[key] === undefined
              ? '--'
              : self.currentPlcValues[key]
        };
      });
    },
    filteredReadRows() {
      var keyword = this.readFilter.trim().toLowerCase();
      if (!keyword) return this.readRows;
      return this.readRows.filter(function (item) {
        return String(item.key).toLowerCase().includes(keyword);
      });
    },
    writeRows() {
      var addArr = this.writeAddArrs[this.activePlcIndex] || [];
      var strArr = this.writeStrArrs[this.activePlcIndex] || [];
      return addArr.map(function (key, index) {
        return {
          key: key,
          value: strArr[index] === undefined ? '--' : strArr[index]
        };
      });
    },
    readAddressOptions() {
      return Object.keys(this.currentPlcVariables).filter(function (key) {
        return !key.startsWith('W_');
      });
    },
    bitParseRawValue() {
      if (!this.bitParseAddress) return '--';
      var v = this.currentPlcValues[this.bitParseAddress];
      return v === undefined || v === null ? '--' : v;
    },
    bitParseWordValue() {
      if (!this.bitParseAddress) return '--';
      var v = this.currentPlcValues[this.bitParseAddress];
      if (v === undefined || v === null) return '--';
      return this.convertToWord(Number(v));
    },
    bitParseBinary() {
      if (this.bitParseWordValue === '--') return '--';
      return Number(this.bitParseWordValue).toString(2).padStart(16, '0');
    },
    bitParseRows() {
      var word =
        this.bitParseWordValue === '--' ? 0 : Number(this.bitParseWordValue);
      var hasValue = this.bitParseWordValue !== '--';
      var rows = [];
      for (var logicBit = 0; logicBit < 16; logicBit++) {
        var actualBit = logicBit < 8 ? logicBit + 8 : logicBit - 8;
        var value = hasValue ? (word >> actualBit) & 1 : '-';
        rows.push({ logicBit: logicBit, actualBit: actualBit, value: value });
      }
      return rows;
    }
  },
  mounted: function () {
    // 为每台 PLC 注册 receivedMsg_N 监听，状态更新直接在 handler 内完成
    var self = this;
    this.ipcHandlers = [];
    for (var i = 0; i < this.plcCount; i++) {
      (function (index) {
        var handler = function (event, values) {
          // 更新读取数据
          self.plcValuesArr.splice(index, 1, values || {});
          // 直接更新状态（不依赖 watcher，避免 deep 遍历误触其他 PLC）
          self.plcStatuses.splice(index, 1, true);
          if (self.warningTimeOuts[index]) {
            clearTimeout(self.warningTimeOuts[index]);
          }
          self.warningTimeOuts[index] = setTimeout(function () {
            if (self._isDestroyed) return;
            self.plcStatuses.splice(index, 1, false);
            if (self.$route.path != '/login') {
              self.$message.error(
                (self.plcConfigs[index] || { name: 'PLC' + index }).name +
                  'PLC连接中断'
              );
            }
          }, 3000);
        };
        self.ipcHandlers.push(handler);
        ipcRenderer.on('receivedMsg_' + index, handler);
      })(i);
    }
  },
  beforeUnmount: function () {
    this._isDestroyed = true;
    var self = this;
    // 清理所有 IPC 监听器
    if (this.ipcHandlers) {
      this.ipcHandlers.forEach(function (handler, i) {
        ipcRenderer.removeListener('receivedMsg_' + i, handler);
      });
      this.ipcHandlers = null;
    }
    // 清理所有定时器
    this.warningTimeOuts.forEach(function (t) {
      if (t) clearTimeout(t);
    });
    this.cancelWriteTimers.forEach(function (t) {
      if (t) clearTimeout(t);
    });
    this.stopAllPolling();
  },
  methods: {
    openPlcPanel: function () {
      this.plcPanelVisible = true;
    },
    handlePlcPanelOpen: async function () {
      // 为每台 PLC 加载变量定义和写入数据
      for (var i = 0; i < this.plcCount; i++) {
        if (Object.keys(this.plcVariablesArr[i]).length === 0) {
          await this.loadPlcVariables(i);
        }
        await this.refreshWriteData(i);
        this.startWriteDataPolling(i);
      }
    },
    handlePlcPanelClose: function () {
      this.stopAllPolling();
    },
    handlePlcTabChange: function () {
      this.customWriteAddress = '';
      this.customWriteType = 'string';
      this.customWriteValue = '';
      this.customWriteBool = true;
      this.readFilter = '';
      this.bitParseAddress = '';
    },
    loadPlcVariables: async function (index) {
      try {
        var payload = await ipcRenderer.invoke('getPlcVariables_' + index);
        if (payload) {
          this.plcVariablesArr.splice(index, 1, payload.variables || {});
        }
      } catch (error) {
        console.error('加载PLC' + index + '变量定义失败:', error);
      }
    },
    refreshWriteData: async function (index) {
      try {
        var payload = await ipcRenderer.invoke('getWriteData_' + index);
        if (payload) {
          this.writeAddArrs.splice(index, 1, payload.writeAddArr || []);
          this.writeStrArrs.splice(index, 1, payload.writeStrArr || []);
        }
      } catch (error) {
        console.error('刷新PLC' + index + '写入数据失败:', error);
      }
    },
    startWriteDataPolling: function (index) {
      this.stopWriteDataPolling(index);
      var self = this;
      this.writeDataPollingTimers[index] = setInterval(function () {
        self.refreshWriteData(index);
      }, 1000);
    },
    stopWriteDataPolling: function (index) {
      if (this.writeDataPollingTimers[index]) {
        clearInterval(this.writeDataPollingTimers[index]);
        this.writeDataPollingTimers[index] = null;
      }
    },
    stopAllPolling: function () {
      for (var i = 0; i < this.plcCount; i++) {
        this.stopWriteDataPolling(i);
      }
    },
    getCustomWriteValue: function () {
      if (this.customWriteType === 'bool') {
        return this.customWriteBool;
      }
      return String(this.customWriteValue);
    },
    confirmCustomWrite: async function () {
      var address = this.customWriteAddress.trim();
      if (!address) {
        this.$message.warning('请输入变量地址');
        return;
      }
      this.isWriting = true;
      var value = this.getCustomWriteValue();
      var idx = this.activePlcIndex;
      var currentWriteAddArr = this.writeAddArrs[idx] || [];
      try {
        if (currentWriteAddArr.includes(address)) {
          ipcRenderer.send('writeValuesToPLC_' + idx, address, value);
          await this.refreshWriteData(idx);
          this.$message.success('写入指令已发送');
          this.isWriting = false;
        } else {
          ipcRenderer.send('writeSingleValueToPLC_' + idx, address, value);
          await this.refreshWriteData(idx);
          this.$message.success('写入指令已发送');
          var self = this;
          this.cancelWriteTimers[idx] = setTimeout(function () {
            ipcRenderer.send('cancelWriteToPLC_' + idx, address);
            self.isWriting = false;
            self.cancelWriteTimers[idx] = null;
          }, 2000);
        }
      } catch (error) {
        console.error('写入失败:', error);
        this.$message.error('写入失败');
        this.isWriting = false;
      }
    },
    convertToWord: function (value) {
      if (value < 0) {
        return (value & 0xffff) >>> 0;
      }
      return value;
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分保持不变，因为已经是极简高性能版 */
.sm-main {
  position: absolute;
  right: 25px;
  bottom: 25px;
  height: 40px;
  width: 130px;
  z-index: 4000;
  background-color: #1f2d3d;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  cursor: move;
  user-select: none;
  overflow: hidden;
  transition: border-color 0.3s;

  .inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 10px;
    box-sizing: border-box;
  }

  .status-icon {
    font-size: 16px;
    margin-right: 8px;
  }

  .status-text {
    font-size: 13px;
    color: #e0e0e0;
    font-weight: 500;
  }

  &.online {
    border-left: 4px solid #67c23a;
    .status-icon {
      color: #67c23a;
    }
  }

  &.partial {
    border-left: 4px solid #e6a23c;
    .status-icon {
      color: #e6a23c;
    }
  }

  &.offline {
    border-left: 4px solid #f56c6c;
    .status-icon {
      color: #f56c6c;
    }
    .status-text {
      color: #bbb;
    }
  }
}

.status-divider {
  width: 1px;
  height: 16px;
  background: #4a5568;
  margin: 0 6px;
}

.plc-panel__tabs {
  margin-bottom: 12px;
}

.sm-main:active {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.plc-panel {
  .plc-panel__content {
    padding: 2px;
  }

  .plc-panel__actions {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    align-items: center;
    padding: 10px;
    border-radius: 6px;
    background: #f5f7fa;
    border: 1px solid #ebeef5;
  }

  .plc-panel__input {
    flex: 1;
    min-width: 160px;
  }

  .plc-panel__select {
    width: 100px;
  }

  .plc-panel__btn {
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
  }

  .plc-panel__content {
    display: flex;
    gap: 16px;
    height: 440px;
  }

  .plc-panel__section {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px 12px;
    background: #fff;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }

  .plc-panel__title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
  }

  .plc-panel__filter {
    margin-bottom: 8px;
  }

  .plc-panel__list {
    flex: 1;
    overflow: auto;
    padding-right: 4px;
  }

  .plc-panel__row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px dashed #ebeef5;
    font-size: 12px;
    color: #606266;
  }
  .plc-panel__row:nth-child(odd) {
    background: #fafcff;
  }
  .plc-panel__row:hover {
    background: #f2f6fc;
  }

  .plc-panel__key {
    font-weight: 600;
    color: #303133;
    font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
  }

  .plc-panel__value {
    color: #909399;
    font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
  }

  .plc-panel__bit {
    margin-top: 10px;
    padding: 6px 8px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background: #fff;
  }

  .plc-panel__bit-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    color: #606266;
    font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
    flex-wrap: wrap;
  }

  .plc-panel__bit-title {
    font-weight: 600;
    color: #303133;
    padding-left: 6px;
    border-left: 3px solid #409eff;
    line-height: 1;
  }

  .plc-panel__bit-select {
    width: 110px;
    flex: 0 0 110px;
  }

  .plc-panel__bit-info-item {
    b {
      color: #303133;
      margin-left: 2px;
    }
  }

  .plc-panel__bit-bin {
    letter-spacing: 1px;
  }

  .plc-panel__bit-grid {
    display: grid;
    grid-template-columns: repeat(16, 1fr);
    gap: 3px;
  }

  .plc-panel__bit-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #dcdfe6;
    border-radius: 2px;
    padding: 2px 0;
    text-align: center;
    font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
    background: #f5f7fa;
    line-height: 1.1;

    &.on {
      background: #ecf5ec;
      border-color: #67c23a;
      .plc-panel__bit-value {
        color: #67c23a;
      }
    }

    &.off {
      background: #fef0f0;
      border-color: #f56c6c;
      .plc-panel__bit-value {
        color: #f56c6c;
      }
    }
  }

  .plc-panel__bit-label {
    font-size: 10px;
    color: #909399;
  }

  .plc-panel__bit-value {
    font-size: 14px;
    font-weight: 700;
  }
}
</style>

<style lang="less">
/* append-to-body 的 dialog 必须放在非 scoped 块 */
.plc-panel {
  .el-dialog__body {
    padding: 10px 20px;
  }
}
</style>
