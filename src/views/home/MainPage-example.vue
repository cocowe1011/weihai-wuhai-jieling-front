<template>
  <div class="smart-workshop">
    <!-- 内容区包装器 -->
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="side-info-panel">
        <!-- 操作区 -->
        <div class="operation-panel">
          <div class="section-header">
            <span>操作区</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="showOrderQueryDialog"
            >
              查询历史订单
            </el-button>
          </div>
          <div class="operation-buttons">
            <button
              @click="toggleButtonState('start')"
              :class="{ pressed: buttonStates.start }"
            >
              <i class="el-icon-switch-button"></i><span>全线启动</span>
            </button>
            <button
              @click="toggleButtonState('stop')"
              :class="{ pressed: buttonStates.stop }"
            >
              <i class="el-icon-error"></i><span>全线停止</span>
            </button>
            <button
              v-show="false"
              @click="toggleButtonState('reset')"
              :class="{ pressed: buttonStates.reset }"
            >
              <i class="el-icon-video-pause"></i><span>全线暂停</span>
            </button>
            <button @click="toggleButtonState('fault_reset')">
              <i class="el-icon-refresh"></i><span>故障复位</span>
            </button>
            <button @click="toggleButtonState('clear')">
              <i class="el-icon-delete"></i><span>全线清空</span>
            </button>
          </div>
        </div>

        <!-- 日志区域 -->
        <div class="log-section">
          <div class="section-header">
            日志区
            <div class="log-tabs">
              <div
                class="log-tab"
                :class="{ active: activeLogType === 'running' }"
                @click="activeLogType = 'running'"
              >
                运行日志
              </div>
              <div
                class="log-tab"
                :class="{ active: activeLogType === 'alarm' }"
                @click="switchToAlarmLog"
              >
                报警日志
                <div v-if="unreadAlarms > 0" class="alarm-badge">
                  {{ unreadAlarms }}
                </div>
              </div>
            </div>
          </div>
          <div class="scrollable-content">
            <div class="log-list">
              <template v-if="currentLogs.length > 0">
                <div
                  v-for="log in currentLogs"
                  :key="log.id"
                  :class="[
                    'log-item',
                    { alarm: log.type === 'alarm', unread: log.unread }
                  ]"
                >
                  <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                  <div class="log-item-content">{{ log.message }}</div>
                </div>
              </template>
              <div v-else class="empty-state">
                <i class="el-icon-chat-line-square"></i>
                <p>
                  {{
                    activeLogType === 'running'
                      ? '暂无运行日志'
                      : '暂无报警日志'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧内容区域 -->
      <div class="main-content">
        <div class="floor-container">
          <!-- 左侧区域 -->
          <div class="floor-left">
            <div class="floor-title">作业区域</div>
            <div class="floor-image-container">
              <div class="image-wrapper">
                <img
                  src="@/assets/changzhou-img/image.png"
                  alt="一楼平面图"
                  class="floor-image"
                  @load="updateMarkerPositions"
                />
                <div class="marker-with-panel" data-x="900" data-y="653">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">A1</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            a1LineProduct.productName,
                            a1LineProduct.spec,
                            a1LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          a1UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="766">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">A2</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            a2LineProduct.productName,
                            a2LineProduct.spec,
                            a2LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          a2UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="920">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">B1</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            b1LineProduct.productName,
                            b1LineProduct.spec,
                            b1LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          b1UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="1034">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">B2</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            b2LineProduct.productName,
                            b2LineProduct.spec,
                            b2LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          b2UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="1182">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">C1</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            c1LineProduct.productName,
                            c1LineProduct.spec,
                            c1LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          c1UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="1297">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">C2</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            c2LineProduct.productName,
                            c2LineProduct.spec,
                            c2LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          c2UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="1451">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">D1</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            d1LineProduct.productName,
                            d1LineProduct.spec,
                            d1LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          d1UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="1564">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">D2</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            d2LineProduct.productName,
                            d2LineProduct.spec,
                            d2LineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          d2UploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="215">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">E</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            eLineProduct.productName,
                            eLineProduct.spec,
                            eLineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          eUploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="900" data-y="465">
                  <div
                    class="data-panel production-line-panel line-single-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-content line-row-content">
                      <span class="line-left-tag">F</span>
                      <div class="line-row-seg section-product">
                        <span class="data-panel-label">产品：</span>
                        <span class="line-info-val">{{
                          [
                            fLineProduct.productName,
                            fLineProduct.spec,
                            fLineProduct.batchId
                          ]
                            .filter(Boolean)
                            .join(' ') || '--'
                        }}</span>
                      </div>
                      <span class="line-row-sep">|</span>
                      <div class="line-row-seg section-tray">
                        <span class="data-panel-label">托盘号：</span>
                        <span class="highlight-value">{{
                          fUploadTrayCode || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 产品信息面板 -->
                <div class="marker-with-panel" data-x="-20" data-y="653">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ a1ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="766">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ a2ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="920">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ b1ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="1034">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ b2ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="1182">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ c1ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="1297">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ c2ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="1451">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ d1ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="1564">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ d2ProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="215">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ eProductInfo }}</span>
                    </div>
                  </div>
                </div>
                <div class="marker-with-panel" data-x="-20" data-y="465">
                  <div
                    class="data-panel product-info-card"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="product-info-card-body">
                      <span class="data-panel-label">产品：</span>
                      <span class="product-info-val">{{ fProductInfo }}</span>
                    </div>
                  </div>
                </div>

                <!-- 称重信息面板 -->
                <div class="marker-with-panel" data-x="2050" data-y="1260">
                  <div
                    class="data-panel weigh-panel"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-header">称重信息</div>
                    <div class="data-panel-content weigh-panel-body">
                      <div class="weigh-ball-wrap">
                        <div class="weigh-ball">
                          <span class="weigh-ball-val">{{
                            weighTrayWeight || 0
                          }}</span>
                          <span class="weigh-ball-unit">kg</span>
                        </div>
                      </div>
                      <div class="weigh-info-row">
                        <span class="data-panel-label">UDI码：</span>
                        <span class="highlight-value">{{
                          weighUdiBarcode || '--'
                        }}</span>
                      </div>
                      <div class="weigh-info-row">
                        <span class="data-panel-label">称重条码：</span>
                        <span class="highlight-value">{{
                          weighTrayCode || '--'
                        }}</span>
                      </div>
                      <div class="weigh-info-row">
                        <span class="data-panel-label">托盘数量：</span>
                        <span class="highlight-value">{{
                          weighTrayQuantity || '--'
                        }}</span>
                      </div>
                      <div class="weigh-info-row">
                        <span class="data-panel-label">产品信息：</span>
                        <span class="line-info-val">{{
                          weighLineProductInfo || '--'
                        }}</span>
                      </div>
                      <div class="weigh-re-read-row">
                        <el-button
                          size="mini"
                          class="re-read-order-btn"
                          :loading="reReadWeighOrderLoading"
                          :disabled="!weighUdiBarcode"
                          @click="reReadWeighOrder"
                          >重新读取订单</el-button
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 下货信息面板 -->
                <div class="marker-with-panel" data-x="1990" data-y="500">
                  <div
                    class="data-panel unload-panel"
                    :class="['position-right', { 'always-show': true }]"
                  >
                    <div class="data-panel-header">下货信息</div>
                    <div class="data-panel-content unload-panel-body">
                      <div class="unload-info-row">
                        <span class="data-panel-label">1#下货条码：</span>
                        <span class="highlight-value">{{
                          unloadPositionTrayCode || '--'
                        }}</span>
                      </div>
                      <div class="unload-product-row">
                        <span class="data-panel-label">产品信息：</span>
                        <span class="line-info-val">{{
                          unloadLineProductInfo || '--'
                        }}</span>
                      </div>
                      <div
                        class="unload-info-row"
                        style="
                          margin-top: 8px;
                          border-top: 1px dashed rgba(255, 255, 255, 0.2);
                          padding-top: 8px;
                        "
                      >
                        <span class="data-panel-label">2#下货条码：</span>
                        <span class="highlight-value">{{
                          unloadPosition2TrayCode || '--'
                        }}</span>
                      </div>
                      <div class="unload-product-row">
                        <span class="data-panel-label">产品信息：</span>
                        <span class="line-info-val">{{
                          unload2LineProductInfo || '--'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 进料反馈 DBW4：各线进货中状态（allowFeedBack bit0–bit9） -->
                <div class="analysis-status-marker" data-x="570" data-y="650">
                  <el-tag
                    v-show="allowFeedBack.bit0 === '1'"
                    type="success"
                    size="small"
                  >
                    A1 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="760">
                  <el-tag
                    v-show="allowFeedBack.bit1 === '1'"
                    type="success"
                    size="small"
                  >
                    A2 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="915">
                  <el-tag
                    v-show="allowFeedBack.bit2 === '1'"
                    type="success"
                    size="small"
                  >
                    B1 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="1025">
                  <el-tag
                    v-show="allowFeedBack.bit3 === '1'"
                    type="success"
                    size="small"
                  >
                    B2 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="1180">
                  <el-tag
                    v-show="allowFeedBack.bit4 === '1'"
                    type="success"
                    size="small"
                  >
                    C1 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="1290">
                  <el-tag
                    v-show="allowFeedBack.bit5 === '1'"
                    type="success"
                    size="small"
                  >
                    C2 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="1450">
                  <el-tag
                    v-show="allowFeedBack.bit6 === '1'"
                    type="success"
                    size="small"
                  >
                    D1 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="1560">
                  <el-tag
                    v-show="allowFeedBack.bit7 === '1'"
                    type="success"
                    size="small"
                  >
                    D2 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="220">
                  <el-tag
                    v-show="allowFeedBack.bit8 === '1'"
                    type="success"
                    size="small"
                  >
                    E 进货中
                  </el-tag>
                </div>
                <div class="analysis-status-marker" data-x="570" data-y="465">
                  <el-tag
                    v-show="allowFeedBack.bit9 === '1'"
                    type="success"
                    size="small"
                  >
                    F 进货中
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试面板 -->
    <div class="test-panel-container">
      <!-- 测试按钮 -->
      <div class="test-toggle-btn" @click="showTestPanel = !showTestPanel">
        <i class="el-icon-setting"></i>
      </div>
      <!-- 测试面板 -->
      <div class="test-panel" :class="{ collapsed: !showTestPanel }">
        <div class="test-panel-header">
          <span>测试面板</span>
          <i class="el-icon-close" @click.stop="showTestPanel = false"></i>
        </div>
        <div class="test-panel-content">
          <!-- 进料反馈 DBW4（本地模拟，与 allowFeedBack 一致） -->
          <div class="test-section">
            <span class="test-label">进料反馈 DBW4（进货中）:</span>
            <div class="plc-test-wrapper">
              <div class="feedbit-grid">
                <div class="feedbit-item">
                  <span class="feedbit-name">A1</span>
                  <el-switch
                    :value="allowFeedBack.bit0 === '1'"
                    @change="setTestAllowFeedBit(0, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">A2</span>
                  <el-switch
                    :value="allowFeedBack.bit1 === '1'"
                    @change="setTestAllowFeedBit(1, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">B1</span>
                  <el-switch
                    :value="allowFeedBack.bit2 === '1'"
                    @change="setTestAllowFeedBit(2, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">B2</span>
                  <el-switch
                    :value="allowFeedBack.bit3 === '1'"
                    @change="setTestAllowFeedBit(3, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">C1</span>
                  <el-switch
                    :value="allowFeedBack.bit4 === '1'"
                    @change="setTestAllowFeedBit(4, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">C2</span>
                  <el-switch
                    :value="allowFeedBack.bit5 === '1'"
                    @change="setTestAllowFeedBit(5, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">D1</span>
                  <el-switch
                    :value="allowFeedBack.bit6 === '1'"
                    @change="setTestAllowFeedBit(6, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">D2</span>
                  <el-switch
                    :value="allowFeedBack.bit7 === '1'"
                    @change="setTestAllowFeedBit(7, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">E</span>
                  <el-switch
                    :value="allowFeedBack.bit8 === '1'"
                    @change="setTestAllowFeedBit(8, $event)"
                  ></el-switch>
                </div>
                <div class="feedbit-item">
                  <span class="feedbit-name">F</span>
                  <el-switch
                    :value="allowFeedBack.bit9 === '1'"
                    @change="setTestAllowFeedBit(9, $event)"
                  ></el-switch>
                </div>
              </div>
            </div>
          </div>

          <!-- 称重 / 下货位（直接写入界面状态，模拟 PLC 读值） -->
          <div class="test-section">
            <span class="test-label">称重 / 下货位（测试）:</span>
            <div class="plc-test-wrapper">
              <div class="compact-grid">
                <div class="compact-input-group">
                  <div class="compact-label">称重托盘码:</div>
                  <el-input
                    v-model="weighTrayCode"
                    size="mini"
                    class="qrcode-input"
                    placeholder="DBD64"
                  ></el-input>
                </div>
                <div class="compact-input-group">
                  <div class="compact-label">1#下货托盘码:</div>
                  <el-input
                    v-model="unloadPositionTrayCode"
                    size="mini"
                    class="qrcode-input"
                    placeholder="DBD68"
                  ></el-input>
                </div>
                <div class="compact-input-group">
                  <div class="compact-label">2#下货托盘码:</div>
                  <el-input
                    v-model="unloadPosition2TrayCode"
                    size="mini"
                    class="qrcode-input"
                    placeholder="DBD112"
                  ></el-input>
                </div>
                <div class="compact-input-group">
                  <div class="compact-label">重量:</div>
                  <el-input
                    v-model.number="weighTrayWeight"
                    size="mini"
                    class="qrcode-input source-input"
                    type="number"
                    placeholder="DBW62"
                  ></el-input>
                </div>
                <div class="compact-input-group">
                  <div class="compact-label">托盘数量:</div>
                  <el-input
                    v-model.number="weighTrayQuantity"
                    size="mini"
                    class="qrcode-input source-input"
                    type="number"
                    placeholder="DBW58"
                  ></el-input>
                </div>
                <div class="compact-input-group">
                  <div class="compact-label">称重UDI码:</div>
                  <el-input
                    v-model="weighUdiBarcode"
                    size="mini"
                    class="qrcode-input"
                    placeholder="CBB200"
                  ></el-input>
                  <el-button
                    size="mini"
                    type="primary"
                    style="margin-left: 4px; flex-shrink: 0"
                    @click="handleTestUdiClean"
                  >
                    处理
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 上货位托盘码（直接写入界面状态，模拟 PLC 读值） -->
          <div class="test-section">
            <span class="test-label">上货位托盘码（测试）:</span>
            <div class="plc-test-wrapper">
              <el-collapse v-model="activePlcSimGroups" accordion>
                <el-collapse-item title="A / B 线" name="1">
                  <div class="compact-grid">
                    <div class="compact-input-group">
                      <div class="compact-label">A1:</div>
                      <el-input
                        v-model="a1UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD72"
                      ></el-input>
                    </div>
                    <div class="compact-input-group">
                      <div class="compact-label">A2:</div>
                      <el-input
                        v-model="a2UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD76"
                      ></el-input>
                    </div>
                    <div class="compact-input-group">
                      <div class="compact-label">B1:</div>
                      <el-input
                        v-model="b1UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD80"
                      ></el-input>
                    </div>
                    <div class="compact-input-group">
                      <div class="compact-label">B2:</div>
                      <el-input
                        v-model="b2UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD84"
                      ></el-input>
                    </div>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="C / D 线" name="2">
                  <div class="compact-grid">
                    <div class="compact-input-group">
                      <div class="compact-label">C1:</div>
                      <el-input
                        v-model="c1UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD88"
                      ></el-input>
                    </div>
                    <div class="compact-input-group">
                      <div class="compact-label">C2:</div>
                      <el-input
                        v-model="c2UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD92"
                      ></el-input>
                    </div>
                    <div class="compact-input-group">
                      <div class="compact-label">D1:</div>
                      <el-input
                        v-model="d1UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD96"
                      ></el-input>
                    </div>
                    <div class="compact-input-group">
                      <div class="compact-label">D2:</div>
                      <el-input
                        v-model="d2UploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD100"
                      ></el-input>
                    </div>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="E / F 线" name="3">
                  <div class="compact-grid">
                    <div class="compact-input-group">
                      <div class="compact-label">E:</div>
                      <el-input
                        v-model="eUploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD104"
                      ></el-input>
                    </div>
                    <div class="compact-input-group">
                      <div class="compact-label">F:</div>
                      <el-input
                        v-model="fUploadTrayCode"
                        size="mini"
                        class="qrcode-input"
                        placeholder="DBD108"
                      ></el-input>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 订单查询对话框 -->
    <OrderQueryDialog :visible.sync="orderQueryDialogVisible" />
  </div>
</template>

<script>
import moment from 'moment';
import { ipcRenderer } from 'electron';
import HttpUtil from '@/utils/HttpUtil';
import HttpUtilerp from '@/utils/HttpUtilerp';
import OrderQueryDialog from '@/components/OrderQueryDialog.vue';
export default {
  name: 'MainPage',
  components: {
    OrderQueryDialog
  },
  data() {
    return {
      showTestPanel: false,
      activePlcSimGroups: '1',
      orderQueryDialogVisible: false,
      buttonStates: {
        start: false,
        stop: false,
        reset: false,
        fault_reset: false,
        clear: false
      },
      logId: 1000, // 添加一个日志ID计数器
      activeLogType: 'running',
      runningLogs: [], // 修改为空数组
      alarmLogs: [], // 修改为空数组
      // 读取点位.csv - 基础状态
      conveyorHeartbeat: 0, // DBW0
      conveyorRunStatus: 0, // DBW2
      allowFeedBack: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0'
      }, // DBW4
      // 称重
      weighTrayWeight: 0, // DBW62
      weighTrayQuantity: 0, // DBW58 称重位对应托盘的数量绑定信息
      weighTrayCode: 0, // DBD64 (Dint类型)
      weighUdiBarcode: '', // DB101.DBB200-299 称重位置UDI条码
      currentWeighRecordId: null, // 当前称重记录ID
      weighLineProductInfo: '', // 称重条码对应的产品信息拼接
      reReadWeighOrderLoading: false, // 重新读取订单按钮loading状态
      unloadPositionTrayCode: 0, // DBD68 (Dint类型) 下货位置1托盘号
      unloadLineProductInfo: '', // 下货条码对应的产品信息拼接（1#下货口）
      unloadPosition2TrayCode: 0, // DBD112 (Dint类型) 下货位置2托盘号
      unload2LineProductInfo: '', // 下货条码2对应的产品信息拼接（2#下货口）
      // 上货位托盘码 (Dint类型)
      a1UploadTrayCode: 0, // DBD72
      a2UploadTrayCode: 0, // DBD76
      b1UploadTrayCode: 0, // DBD80
      b2UploadTrayCode: 0, // DBD84
      c1UploadTrayCode: 0, // DBD88
      c2UploadTrayCode: 0, // DBD92
      d1UploadTrayCode: 0, // DBD96
      d2UploadTrayCode: 0, // DBD100
      eUploadTrayCode: 0, // DBD104
      fUploadTrayCode: 0, // DBD108
      // 各码垛位产品信息（A1~D2、E、F），从金蝶ERP查询获取
      a1LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      a2LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      b1LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      b2LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      c1LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      c2LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      d1LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      d2LineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      eLineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      fLineProduct: {
        productName: '',
        spec: '',
        batchId: '',
        fentryId: '',
        productCode: '',
        orderId: ''
      },
      // 数据准备就绪标志位
      isDataReady: false
    };
  },
  computed: {
    currentLogs() {
      return this.activeLogType === 'running'
        ? this.runningLogs
        : this.alarmLogs;
    },
    unreadAlarms() {
      return this.alarmLogs.filter((log) => log.unread).length;
    },
    a1ProductInfo() {
      return (
        [
          this.a1LineProduct.productName,
          this.a1LineProduct.spec,
          this.a1LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    a2ProductInfo() {
      return (
        [
          this.a2LineProduct.productName,
          this.a2LineProduct.spec,
          this.a2LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    b1ProductInfo() {
      return (
        [
          this.b1LineProduct.productName,
          this.b1LineProduct.spec,
          this.b1LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    b2ProductInfo() {
      return (
        [
          this.b2LineProduct.productName,
          this.b2LineProduct.spec,
          this.b2LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    c1ProductInfo() {
      return (
        [
          this.c1LineProduct.productName,
          this.c1LineProduct.spec,
          this.c1LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    c2ProductInfo() {
      return (
        [
          this.c2LineProduct.productName,
          this.c2LineProduct.spec,
          this.c2LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    d1ProductInfo() {
      return (
        [
          this.d1LineProduct.productName,
          this.d1LineProduct.spec,
          this.d1LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    d2ProductInfo() {
      return (
        [
          this.d2LineProduct.productName,
          this.d2LineProduct.spec,
          this.d2LineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    eProductInfo() {
      return (
        [
          this.eLineProduct.productName,
          this.eLineProduct.spec,
          this.eLineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    },
    fProductInfo() {
      return (
        [
          this.fLineProduct.productName,
          this.fLineProduct.spec,
          this.fLineProduct.batchId
        ]
          .filter(Boolean)
          .join(' ') || '--'
      );
    }
  },
  mounted() {
    this.initializeMarkers();
    ipcRenderer.on('receivedMsg', (event, values, values2) => {
      // 使用位运算优化赋值
      const getBit = (word, bitIndex) => ((word >> bitIndex) & 1).toString();

      // 输送线状态
      this.conveyorHeartbeat = Number(values.DBW0 ?? 0);
      this.conveyorRunStatus = Number(values.DBW2 ?? 0);

      // 进料反馈（对应进货线体编号）DBW4
      let word4 = this.convertToWord(values.DBW4 ?? 0);
      this.allowFeedBack.bit0 = getBit(word4, 0);
      this.allowFeedBack.bit1 = getBit(word4, 1);
      this.allowFeedBack.bit2 = getBit(word4, 2);
      this.allowFeedBack.bit3 = getBit(word4, 3);
      this.allowFeedBack.bit4 = getBit(word4, 4);
      this.allowFeedBack.bit5 = getBit(word4, 5);
      this.allowFeedBack.bit6 = getBit(word4, 6);
      this.allowFeedBack.bit7 = getBit(word4, 7);
      this.allowFeedBack.bit8 = getBit(word4, 8);
      this.allowFeedBack.bit9 = getBit(word4, 9);

      // 称重信息
      this.weighTrayWeight = Number(values.DBW62 ?? 0);
      this.weighTrayQuantity = Number(values.DBW58 ?? 0);
      this.weighTrayCode = Number(values.DBD64 ?? 0);
      this.weighUdiBarcode = values.CBB200 ? String(values.CBB200).trim() : '';
      this.unloadPositionTrayCode = Number(values.DBD68 ?? 0);
      this.unloadPosition2TrayCode = Number(values.DBD112 ?? 0);

      // 上货位托盘码 (Dint类型)
      this.a1UploadTrayCode = Number(values.DBD72 ?? 0);
      this.a2UploadTrayCode = Number(values.DBD76 ?? 0);
      this.b1UploadTrayCode = Number(values.DBD80 ?? 0);
      this.b2UploadTrayCode = Number(values.DBD84 ?? 0);
      this.c1UploadTrayCode = Number(values.DBD88 ?? 0);
      this.c2UploadTrayCode = Number(values.DBD92 ?? 0);
      this.d1UploadTrayCode = Number(values.DBD96 ?? 0);
      this.d2UploadTrayCode = Number(values.DBD100 ?? 0);
      this.eUploadTrayCode = Number(values.DBD104 ?? 0);
      this.fUploadTrayCode = Number(values.DBD108 ?? 0);
    });
    // 给PLC数据加载时间
    setTimeout(() => {
      this.addLog('isDataReady数据加载完成');
      this.isDataReady = true;
    }, 3000);
  },
  watch: {
    // 改为监听托盘条码变化，延迟1秒后调用UDI读码逻辑
    weighTrayCode(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (!newVal || newVal === oldVal) return;
      const trayCode = this.normalizePlcTrayCode(newVal);
      if (!trayCode) {
        this.weighLineProductInfo = '';
        return;
      }
      setTimeout(
        () => this.handleWeighUdiBarcodeChange(this.weighUdiBarcode),
        1000
      );
    },
    // 暂时毙掉：不再以UDI码变化为准
    // weighUdiBarcode(newVal, oldVal) {
    //   if (!this.isDataReady) return;
    //   if (!newVal || newVal === oldVal) return;
    //   setTimeout(() => this.handleWeighUdiBarcodeChange(newVal, oldVal), 1000);
    // },
    unloadPositionTrayCode(newVal) {
      if (!this.isDataReady) return;
      const trayCode = this.normalizePlcTrayCode(newVal);
      if (!trayCode) {
        this.unloadLineProductInfo = '';
        return;
      }
      this.syncOrderUnloadedByTrayCode(trayCode, 1);
    },
    unloadPosition2TrayCode(newVal) {
      if (!this.isDataReady) return;
      const trayCode = this.normalizePlcTrayCode(newVal);
      if (!trayCode) {
        this.unload2LineProductInfo = '';
        return;
      }
      this.syncOrderUnloadedByTrayCode(trayCode, 2);
    }
  },
  methods: {
    setTestAllowFeedBit(bitIndex, on) {
      const key = `bit${bitIndex}`;
      this.allowFeedBack[key] = on ? '1' : '0';
      this.addLog(
        `测试面板：进料反馈 ${key}（DB101.DBW4）设为 ${
          on ? '进货中' : '非进货中'
        }`
      );
    },
    convertToWord(value) {
      if (value < 0) {
        return (value & 0xffff) >>> 0; // 负数转换为无符号的16位整数
      } else {
        return value; // 非负数保持不变
      }
    },
    normalizePlcTrayCode(code) {
      if (!code) return '';
      return String(code);
    },
    handleTestUdiClean() {
      const raw = this.weighUdiBarcode;
      if (!raw) {
        this.addLog('测试面板：UDI码为空，无法处理');
        return;
      }
      const cleanUdi = raw
        .replace(/^F<'?/, '') // 去掉开头的 F< 或 F<'
        .replace(/[^0-9A-Za-z]/g, '') // 只保留字母和数字
        .trim();
      this.addLog(
        `测试面板：UDI码处理结果\n原始值：${raw}\n处理后：${cleanUdi}`
      );
    },
    async reReadWeighOrder() {
      if (this.reReadWeighOrderLoading) return;
      const udi = this.weighUdiBarcode;
      if (!udi) {
        this.$message.warning('当前无称重UDI码，无法重新读取');
        return;
      }
      this.reReadWeighOrderLoading = true;
      try {
        await this.handleWeighUdiBarcodeChange(udi);
        this.$message.success('重新读取订单完成');
      } catch (e) {
        this.$message.error('重新读取订单失败');
      } finally {
        this.reReadWeighOrderLoading = false;
      }
    },
    async checkPendingWeighedTray(trayCode) {
      const label = '称重位托盘码';
      try {
        const res = await HttpUtil.post('/order_info/selectByList', {
          trayCode,
          trayStatus: '3',
          invalidFlag: '0'
        });
        const list = res.data || [];
        if (list.length === 0) return;

        // 按时间倒序排序
        list.sort((a, b) => new Date(b.insertTime) - new Date(a.insertTime));

        const summary = list
          .slice(0, 3)
          .map(
            (r) =>
              `ID:${r.id} UDI:${r.udiCode || '-'} 时间:${r.insertTime || '-'}`
          )
          .join('；');

        this.addLog(
          `${label} 托盘 ${trayCode} 存在 ${
            list.length
          } 条已称重未下线记录，请在历史订单中核对处理。${summary}${
            list.length > 3 ? '…' : ''
          }`,
          'alarm'
        );
      } catch (err) {
        this.addLog(
          `${label} 检查未下线托盘异常：${err.message || err}`,
          'alarm'
        );
      }
    },
    async handleWeighUdiBarcodeChange(newVal) {
      const label = '称重位UDI条码';

      // 称重前检查是否有未下线的历史记录
      const trayCode = this.normalizePlcTrayCode(this.weighTrayCode);
      if (trayCode) {
        await this.checkPendingWeighedTray(trayCode);
      }

      // 清理前缀和特殊字符：去掉F<、引号、星号等
      let cleanUdi = newVal
        .replace(/^F<'?/, '') // 去掉开头的 F< 或 F<'
        .replace(/[^0-9A-Za-z]/g, '') // 只保留字母和数字
        .trim();
      try {
        // 调用UDI查询接口
        const res = await HttpUtilerp.post('/udi/getUdi', {
          udi2: cleanUdi
        });

        if (
          !res ||
          res.code !== 200 ||
          !res.success ||
          !res.data ||
          res.data.length === 0
        ) {
          this.addLog(
            `${label} UDI查询失败：${res?.msg || '无数据返回'}`,
            'alarm'
          );
          // 发送PLC提取失败信号
          ipcRenderer.send('writeSingleValueToPLC', 'W_DBW1022', 2);
          this.addLog(`${label} 已发送UDI提取失败信号(W_DBW1022)`);
          // 2s后取消写入信号
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'W_DBW1022');
            this.addLog(`${label} 已取消UDI提取失败信号(W_DBW1022)`);
          }, 2000);
          return;
        }

        const udiData = res.data[0];
        const productionLineCode = udiData.productionLineCodeWMS || '';

        // 保存到数据库
        const saveRes = await HttpUtil.post('/order_info/save', {
          udiCode: udiData.udi || newVal,
          trayCode: this.weighTrayCode || '',
          source: productionLineCode,
          trayStatus: '3',
          invalidFlag: '0',
          productName: udiData.productName || '',
          spec: udiData.specMode || '',
          batchId: udiData.produceBatchNo || '',
          batchNum: this.weighTrayQuantity || 0,
          weight: this.weighTrayWeight || 0,
          productCode: udiData.productCode || '',
          orderId: udiData.orderNo || '',
          fseqId: udiData.erpId,
          fentryId: udiData.erpSeq
        });

        if (saveRes && saveRes.data) {
          this.currentWeighRecordId = saveRes.data.id;

          // 立即更新称重面板的产品信息
          this.weighLineProductInfo = [
            udiData.productName,
            udiData.specMode,
            udiData.produceBatchNo
          ]
            .filter(Boolean)
            .join(' ');

          this.addLog(
            `${label} UDI扫码成功 | 托盘号: ${
              this.weighTrayCode || '-'
            } | UDI: ${cleanUdi} | 重量: ${this.weighTrayWeight || 0} | 数量: ${
              this.weighTrayQuantity || 0
            } | 生产线: ${productionLineCode} | 产品: ${
              udiData.productName || ''
            } ${udiData.specMode || ''} | 批号: ${
              udiData.produceBatchNo || ''
            } | 分录ID: ${udiData.erpId ?? '-'} | 分录行号: ${
              udiData.erpSeq ?? '-'
            } | 订单号: ${udiData.orderNo || ''}`
          );

          // 发送PLC提取成功信号
          ipcRenderer.send('writeSingleValueToPLC', 'W_DBW1022', 1);
          // 发送称重绑定成功信号
          ipcRenderer.send('writeSingleValueToPLC', 'W_DBW1012', 1);
          this.addLog(
            `${label} 已发送UDI提取成功信号(W_DBW1022)，已发送称重绑定成功信号(W_DBW1012)`
          );

          // 2s后取消写入信号
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'W_DBW1022');
            ipcRenderer.send('cancelWriteToPLC', 'W_DBW1012');
            this.addLog(
              `${label} 已取消UDI提取成功信号(W_DBW1022)，已取消称重绑定成功信号(W_DBW1012)`
            );
          }, 2000);

          // 根据productionLineCode更新对应线体产品信息
          if (productionLineCode) {
            const lineKeyMap = {
              A1: 'a1LineProduct',
              A2: 'a2LineProduct',
              B1: 'b1LineProduct',
              B2: 'b2LineProduct',
              C1: 'c1LineProduct',
              C2: 'c2LineProduct',
              D1: 'd1LineProduct',
              D2: 'd2LineProduct',
              E: 'eLineProduct',
              F: 'fLineProduct'
            };
            const lineKey = lineKeyMap[productionLineCode];
            if (lineKey) {
              this.$set(this, lineKey, {
                productName: udiData.productName || '',
                spec: udiData.specMode || '',
                batchId: udiData.productBatchNo || '',
                fentryId: '',
                productCode: udiData.productCode || '',
                orderId: ''
              });
              this.addLog(
                `${label} 已更新 ${productionLineCode} 生产线产品信息`
              );
            }
          }
        } else {
          this.addLog(
            `${label} 保存订单失败：${saveRes?.msg || '接口返回数据异常'}`,
            'alarm'
          );
        }
      } catch (err) {
        this.addLog(`${label} UDI扫码异常：${err.message || err}`, 'alarm');
        // 发送PLC提取失败信号
        ipcRenderer.send('writeSingleValueToPLC', 'W_DBW1022', 2);
        this.addLog(`${label} 已发送UDI提取失败信号(W_DBW1022)`);
        // 2s后取消写入信号
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'W_DBW1022');
          this.addLog(`${label} 已取消UDI提取失败信号(W_DBW1022)`);
        }, 2000);
      }
    },
    async syncOrderWeighedByTrayCode(trayCode) {
      const label = '称重位托盘码';
      try {
        // 先更新当前称重记录的托盘号
        if (this.currentWeighRecordId) {
          await HttpUtil.post('/order_info/update', {
            id: this.currentWeighRecordId,
            trayCode: trayCode
          });
          this.addLog(`${label} 已更新当前记录托盘号为 ${trayCode}`);
          this.currentWeighRecordId = null;
        }
        // 查询已扫码(trayStatus='1')的记录
        const res = await HttpUtil.post('/order_info/selectByList', {
          trayCode,
          trayStatus: '1'
        });
        const list = res.data || [];
        if (list.length === 0) {
          this.weighLineProductInfo = '';
          this.addLog(
            `${label} ${trayCode}：无已扫码(trayStatus=1)记录，跳过称重同步`,
            'alarm'
          );
          return;
        }
        const record = list[0];
        this.weighLineProductInfo = [
          record.productName,
          record.spec,
          record.batchId
        ]
          .filter(Boolean)
          .join(' ');
        const weightStr = String(this.weighTrayWeight ?? '');
        const updateRes = await HttpUtil.post('/order_info/update', {
          id: record.id,
          trayStatus: '3',
          weight: weightStr
        });
        if (updateRes && updateRes.data === 1) {
          this.addLog(
            `${label} ${trayCode}：已更新为已称重，重量 ${weightStr}，发送DB101.DBW1012称重绑定成功信号！`
          );
          // 发送称重绑定成功信号
          ipcRenderer.send('writeSingleValueToPLC', 'W_DBW1012', 1);
          this.addLog(`${label} ${trayCode}：已发送称重绑定成功信号`);

          // 延迟后取消写入信号（避免持续写入）
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'W_DBW1012');
            this.addLog(`${label} ${trayCode}：已取消称重绑定成功信号`);
          }, 2000);
        } else {
          this.addLog(
            `${label} ${trayCode}：称重同步失败：${
              updateRes.msg || '接口返回数据异常'
            }`,
            'alarm'
          );
        }
      } catch (err) {
        this.addLog(
          `${label} ${trayCode}：称重同步异常：${err.message || err}`,
          'alarm'
        );
      }
    },
    async syncOrderUnloadedByTrayCode(trayCode, unloadPort = 1) {
      const label = `${unloadPort}#下货口托盘码`;
      const productInfoKey =
        unloadPort === 1 ? 'unloadLineProductInfo' : 'unload2LineProductInfo';
      try {
        const res = await HttpUtil.post('/order_info/selectByList', {
          trayCode,
          trayStatus: '3',
          invalidFlag: '0'
        });
        let list = res.data || [];
        if (list.length === 0) {
          this[productInfoKey] = '';
          this.addLog(
            `${label} ${trayCode}：无已称重(trayStatus=3)记录，跳过下货同步`,
            'alarm'
          );
          return;
        }

        // 优先使用当前称重记录ID，如果没有匹配的，则按时间倒序取最新一条
        let record = null;
        if (this.currentWeighRecordId) {
          record = list.find((r) => r.id === this.currentWeighRecordId);
        }

        if (!record) {
          list.sort((a, b) => new Date(b.insertTime) - new Date(a.insertTime));
          record = list[0];
        }

        // 下货成功后，如果使用的是 currentWeighRecordId，则清空
        if (this.currentWeighRecordId === record.id) {
          this.currentWeighRecordId = null;
        }

        this[productInfoKey] = [record.productName, record.spec, record.batchId]
          .filter(Boolean)
          .join(' ');
        const finishTime = moment().format('YYYY-MM-DD HH:mm:ss');
        // 获取货物来源（线体号）
        const source = record.source || '';
        const updateRes = await HttpUtil.post('/order_info/update', {
          id: record.id,
          trayStatus: '4',
          finishTime,
          unloadPort: String(unloadPort)
        });
        if (updateRes && updateRes.data === 1) {
          this.addLog(
            `${label} ${trayCode}：已更新为已下货 | 托盘号: ${trayCode} | UDI: ${
              record.udiCode || '-'
            } | 重量: ${record.weight ?? '-'} | 数量: ${
              record.batchNum ?? '-'
            } | 产品: ${record.productName || ''} ${
              record.spec || ''
            } | 批号: ${record.batchId || ''} | 分录ID: ${
              record.fseqId ?? '-'
            } | 分录行号: ${record.fentryId ?? '-'} | 订单号: ${
              record.orderId || ''
            } | 来源: ${source} | 完成时间: ${finishTime}`
          );

          // 1. 先写入下线线体号到PLC
          const lineAddr = unloadPort === 1 ? 'W_CBB1016' : 'W_CBB1018';
          const successAddr = unloadPort === 1 ? 'W_DBW1014' : 'W_DBW1020';

          if (source) {
            // 写入线体号（CHAR类型，补齐2字节）
            const lineValue = source.padEnd(2, ' ');
            ipcRenderer.send('writeSingleValueToPLC', lineAddr, lineValue);
            this.addLog(
              `${label} ${trayCode}：已写入${unloadPort}#下线线体号 ${source} -> ${lineAddr}`
            );
          }

          // 2. 写入下货成功信号
          ipcRenderer.send('writeSingleValueToPLC', successAddr, 1);
          this.addLog(
            `${label} ${trayCode}：已发送${unloadPort}#下货成功信号 ${successAddr}`
          );

          // 3. 2秒后同时清除线体号和下货成功信号
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', lineAddr);
            ipcRenderer.send('cancelWriteToPLC', successAddr);
            this.addLog(
              `${label} ${trayCode}：已清除${unloadPort}#下线线体号和下货成功信号`
            );
          }, 2000);
        } else {
          this.addLog(
            `${label} ${trayCode}：下货同步失败：${
              updateRes.msg || '接口返回数据异常'
            }`,
            'alarm'
          );
        }
      } catch (err) {
        this.addLog(
          `${label} ${trayCode}：下货同步异常：${err.message || err}`,
          'alarm'
        );
      }
    },
    initializeMarkers() {
      this.$nextTick(() => {
        this.updateMarkerPositions();
        window.addEventListener('resize', this.updateMarkerPositions);
      });
    },
    updateMarkerPositions() {
      const images = document.querySelectorAll('.floor-image');
      images.forEach((image) => {
        const imageWrapper = image.parentElement;
        if (!imageWrapper) return;

        const markers = imageWrapper.querySelectorAll(
          '.marker, .marker-with-panel, .marker-with-button, .queue-marker, .motor-marker, .preheating-room-marker, .analysis-status-marker'
        );
        const wrapperRect = imageWrapper.getBoundingClientRect();

        // 计算图片的实际显示区域
        const displayedWidth = image.width;
        const displayedHeight = image.height;
        const scaleX = displayedWidth / image.naturalWidth;
        const scaleY = displayedHeight / image.naturalHeight;

        // 计算图片在容器中的偏移量
        const imageOffsetX = (wrapperRect.width - displayedWidth) / 2;
        const imageOffsetY = (wrapperRect.height - displayedHeight) / 2;

        markers.forEach((marker) => {
          const x = parseFloat(marker.dataset.x);
          const y = parseFloat(marker.dataset.y);
          if (!isNaN(x) && !isNaN(y)) {
            marker.style.left = `${imageOffsetX + x * scaleX}px`;
            marker.style.top = `${imageOffsetY + y * scaleY}px`;
          }
        });
      });
    },
    // 切换到报警日志时清除未读状态
    switchToAlarmLog() {
      this.activeLogType = 'alarm';
      // 清除所有报警日志的未读状态
      this.alarmLogs.forEach((log) => {
        log.unread = false;
      });
    },
    // 添加新的日志方法
    addLog(message, type = 'running') {
      const log = {
        id: this.logId++,
        type,
        message,
        timestamp: new Date().getTime(),
        unread: type === 'alarm'
      };

      if (type === 'running') {
        this.runningLogs.unshift(log);
        // 保持日志数量在合理范围内
        if (this.runningLogs.length > 100) {
          this.runningLogs.pop();
        }
      } else {
        this.alarmLogs.unshift(log);
        if (this.alarmLogs.length > 100) {
          this.alarmLogs.pop();
        }
      }
      // 同时写入本地文件
      const logTypeText = type === 'running' ? '运行日志' : '报警日志';
      const logMessage = `[${logTypeText}] ${message}`;
      ipcRenderer.send('writeLogToLocal', logMessage);
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    // 显示订单查询对话框
    showOrderQueryDialog() {
      this.orderQueryDialogVisible = true;
    },
    toggleButtonState(button) {
      if (button === 'start') {
        this.$confirm('确定要全线启动吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            ipcRenderer.send('writeValuesToPLC', 'DBW502', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW502', 0);
            }, 2000);
            this.buttonStates[button] = !this.buttonStates[button];
            this.$message.success('全线启动成功');
            this.addLog('全线启动成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'stop') {
        this.$confirm('确定要全线停止吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            ipcRenderer.send('writeValuesToPLC', 'DBW504', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW504', 0);
            }, 2000);
            this.buttonStates[button] = !this.buttonStates[button];
            this.$message.success('全线停止成功');
            this.addLog('全线停止成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'reset') {
        this.$confirm('确定要全线暂停吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            this.buttonStates[button] = !this.buttonStates[button];
            ipcRenderer.send('writeValuesToPLC', 'DBW506', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW506', 0);
            }, 2000);
            this.$message.success('全线暂停成功');
            this.addLog('全线暂停成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'fault_reset') {
        this.$confirm('确定要故障复位吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            ipcRenderer.send('writeValuesToPLC', 'DBW508', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW508', 0);
            }, 2000);
            this.$message.success('故障复位成功');
            this.addLog('故障复位成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'clear') {
        this.$confirm('确定要全线清空吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.runningLogs = []; // 修改为空数组
            this.alarmLogs = []; // 修改为空数组
            this.nowTrays = [];
            this.$message.success('全线清空成功');
            this.addLog('全线清空成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateMarkerPositions);
  }
};
</script>
<style lang="less" scoped>
.smart-workshop {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #83b3de, #ffffff);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
  user-select: none;
  .header {
    position: relative;
    width: 100%;
    height: 80px;
    overflow: hidden;
    flex-shrink: 0;
    .header-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-content {
      position: relative;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      z-index: 1;
      .title {
        font-size: 32px;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        letter-spacing: 2px;
      }

      .current-time {
        font-size: 24px;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      }
    }
  }
  .content-wrapper {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
    .side-info-panel {
      width: 380px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 5px;
      box-sizing: border-box;
      flex-shrink: 0;
      overflow: hidden;
      .plc-info-section,
      .operation-panel {
        background: #052438;
        padding: 10px;
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        color: #f5f5f5;
        box-sizing: border-box;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 22px;
          color: #0ac5a8;
          font-weight: 900;
          margin-bottom: 5px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .el-button {
            background: rgba(10, 197, 168, 0.2);
            border: 1px solid rgba(10, 197, 168, 0.3);
            color: #0ac5a8;
            font-size: 12px;
          }
          .el-button:hover {
            background: rgba(10, 197, 168, 0.3);
            border-color: rgba(10, 197, 168, 0.5);
            color: #fff;
          }
        }
        .scrollable-content {
          overflow-y: auto;
        }
      }
      .plc-info-section {
        .scrollable-content {
          .status-overview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            .data-card {
              box-sizing: border-box;
              height: 65px;
              width: 185px;
            }

            .data-card-border {
              width: 100%;
              height: 100%;
              border-radius: 20px;
              background: linear-gradient(135deg, #2b3d51, #3c4c63);
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
            }

            .data-card-border-borderTop {
              font-weight: 400;
              letter-spacing: 0px;
              color: rgba(189, 189, 189, 1);
              text-align: left;
              vertical-align: top;
              font-size: 13px;
              line-height: 34px;
              padding-left: 12px;
            }
            .granient-text {
              background-image: linear-gradient(
                to right,
                rgba(72, 146, 254, 1),
                rgba(71, 207, 245, 1)
              );
              background-clip: text;
              -webkit-background-clip: text;
              color: transparent;
            }

            .data-card-border-borderDown {
              font-weight: 700;
              letter-spacing: 0px;
              color: rgba(255, 255, 255, 1);
              text-align: left;
              vertical-align: top;
              font-size: 24px;
              line-height: 21px;
              padding-left: 12px;
              /* 添加省略号效果 */
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
              display: block;
            }
          }
        }
      }
      .log-section {
        background: #052438;
        padding: 10px;
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        height: 257px;
        display: flex;
        flex-direction: column;
        flex: 1;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0px 0px 8px 0px;
          color: #0ac5a8;
          font-size: 22px;
          font-weight: 900;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          .log-tabs {
            display: flex;
            gap: 5px;
          }
          .log-tab {
            position: relative;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 5px 15px;
            border-radius: 4px;
            transition: all 0.3s ease;
            .alarm-badge {
              position: absolute;
              top: -8px;
              right: -8px;
              background: #f56c6c;
              color: #fff;
              font-size: 12px;
              padding: 2px 6px;
              border-radius: 10px;
              min-width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
          .log-tab.active {
            color: #fff;
            background: rgba(10, 197, 168, 0.2);
          }
          .log-tab:hover:not(.active) {
            color: #0ac5a8;
          }
        }
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 10px 0;
          .log-list {
            padding: 0 10px;
            width: 100%;
            box-sizing: border-box;
            .log-item {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 4px;
              padding: 10px;
              margin-bottom: 8px;
              cursor: pointer;
              width: 100%;
              box-sizing: border-box;
              .log-time {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.4);
                margin-bottom: 6px;
              }
              .log-item-content {
                color: rgba(255, 255, 255, 0.9);
                font-size: 13px;
                line-height: 1.6;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: normal;
                hyphens: auto;
                display: block;
                width: 100%;
                padding-right: 10px;
              }
            }
            .log-item:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            .log-item.alarm {
              background: rgba(245, 108, 108, 0.05);
            }

            .log-item.alarm.unread {
              background: rgba(245, 108, 108, 0.1);
              border-left: 2px solid #f56c6c;
            }
            /* 添加空状态样式 */
            .empty-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px 0;
              color: rgba(255, 255, 255, 0.6);
              i {
                font-size: 48px;
                margin-bottom: 16px;
                color: rgba(255, 255, 255, 0.3);
              }
              p {
                font-size: 14px;
                margin: 0 0 16px 0;
              }
              .el-button {
                color: #0ac5a8;
                font-size: 14px;
                i {
                  font-size: 14px;
                  margin-right: 4px;
                  color: inherit;
                }
              }
              .el-button:hover {
                color: #0db196;
              }
            }
          }
        }
        .scrollable-content::-webkit-scrollbar {
          width: 4px;
        }

        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollable-content::-webkit-scrollbar-thumb {
          background: rgba(10, 197, 168, 0.2);
          border-radius: 2px;
        }

        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(10, 197, 168, 0.4);
        }
      }
      .operation-panel {
        .operation-buttons {
          display: flex;
          justify-content: flex-start;
          gap: 8px;
          margin-top: 5px;
          padding: 5px;
          button {
            width: 70px;
            height: 70px;
            font-size: 0.8em;
            color: #fff;
            background: linear-gradient(135deg, #0ac5a8, #0f6b58);
            border: none;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 8px;
            gap: 5px;
            i {
              font-size: 1.8em;
            }
            span {
              font-size: 12px;
              margin-top: 4px;
            }
          }
          button:hover {
            background: linear-gradient(135deg, #4caf50, #0f6b58);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          }
          button.pressed {
            background: linear-gradient(135deg, #4caf50, #2e8b57);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            transform: scale(0.95);
          }
        }
      }
    }
    .main-content {
      flex: 1;
      display: flex;
      padding: 5px 5px 5px 0px;
      box-sizing: border-box;
      overflow: hidden;
      height: 100%;
      .floor-container {
        display: flex;
        gap: 10px;
        height: 100%;
        width: 100%;
        min-height: 0;

        .floor-left {
          .floor-image-container {
            flex: 1;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            min-height: 0;
            height: calc(100% - 50px);
            position: relative;
            .image-wrapper {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              .floor-image {
                display: block;
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
              }
              /* --- 光电点位样式 --- */
              .marker {
                position: absolute;
                width: 12px;
                height: 12px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: auto;
                .marker-label {
                  position: absolute;
                  white-space: nowrap;
                  background: #0ac5a8;
                  color: #fff;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  /* 默认定位在下方 */
                  top: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  opacity: 0;
                  transition: opacity 0.3s;
                  pointer-events: none; /* 添加此行 */
                }
              }
              .marker::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(128, 128, 128, 0.8); /* 默认灰色核心 */
              }
              /* 扫描状态 (红色) */
              .marker.scanning::before {
                background: rgba(255, 0, 0, 0.8); /* 红色核心 */
              }

              /* 默认隐藏标签，hover时显示 */
              .marker:hover .marker-label {
                opacity: 1;
                box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); /* 灰色辉光 */
              }
              /* 始终显示标签的点位 */
              .marker-show-label .marker-label {
                opacity: 1;
              }
              /* 控制标签位置的样式 */
              .marker.label-top .marker-label {
                top: auto; /* 重置默认 top */
                bottom: calc(100% + 5px); /* 定位到上方 */
                left: 50%;
                transform: translateX(-50%);
              }
              .marker.label-left .marker-label {
                top: 50%; /* 垂直居中 */
                left: auto; /* 重置默认 left */
                right: calc(100% + 5px); /* 定位到左方 */
                transform: translateY(-50%); /* 垂直居中 */
              }
              .marker.label-right .marker-label {
                top: 50%; /* 垂直居中 */
                left: calc(100% + 5px); /* 定位到右方 */
                transform: translateY(-50%); /* 垂直居中 */
              }
              /* --- 光电点位样式结束 --- */

              /* --- 新增电机点位样式 --- */
              .motor-marker {
                position: absolute;
                width: 12px;
                height: 12px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: auto;
                .marker-label {
                  position: absolute;
                  white-space: nowrap;
                  background: rgba(0, 0, 0, 0.8);
                  color: #fff;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  /* 默认定位在下方 */
                  top: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  opacity: 0; /* 默认隐藏 */
                  transition: opacity 0.3s;
                }
              }

              .motor-marker::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(128, 128, 128, 0.8); /* 默认灰色方块 */
                /* 无 border-radius，保持方形 */
              }

              .motor-marker.running::before {
                background: #00ff3f; /* 运行状态绿色方块 */
              }

              /* 始终显示电机标签 */
              .motor-marker.marker-show-label .marker-label {
                opacity: 1;
              }
              /* 悬停显示电机标签 */
              .motor-marker:hover .marker-label {
                opacity: 1;
              }

              /* 控制电机标签位置的样式 (复制并适配) */
              .motor-marker.label-top .marker-label {
                top: auto;
                bottom: calc(100% + 5px);
                left: 50%;
                transform: translateX(-50%);
              }
              .motor-marker.label-left .marker-label {
                top: 50%;
                left: auto;
                right: calc(100% + 5px);
                transform: translateY(-50%);
              }
              .motor-marker.label-right .marker-label {
                top: 50%;
                left: calc(100% + 5px);
                transform: translateY(-50%);
              }
              /* --- 电机点位样式结束 --- */

              /* 带数据面板的标识点样式 */
              .marker-with-panel {
                position: absolute;
                width: 16px;
                height: 16px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                .data-panel {
                  position: absolute;
                  background: linear-gradient(135deg, #0e1a27, #3c4c63);
                  border: 1px solid rgba(64, 158, 255, 0.3);
                  border-radius: 8px;
                  padding: 8px 10px;
                  width: 170px;
                  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                  opacity: 0;
                  transition: all 0.3s ease;
                  pointer-events: none;
                  .data-panel-header {
                    font-size: 13px;
                    font-weight: 600;
                    color: #409eff;
                    margin-bottom: 4px;
                    padding-bottom: 4px;
                    border-bottom: 1px solid rgba(64, 158, 255, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .queue-title-link {
                      text-decoration: underline;
                      cursor: pointer;
                    }

                    .queue-title-link:hover {
                      color: #7fc6ff;
                    }

                    .queue-title-count {
                      color: #67c23a;
                      font-weight: 600;
                    }

                    .queue-title-sep {
                      color: rgba(255, 255, 255, 0.6);
                      margin: 0 2px;
                    }
                  }
                  .data-panel-content {
                    font-size: 12px;
                    .data-panel-row {
                      display: flex;
                      justify-content: space-between;
                      color: rgba(255, 255, 255, 0.9);
                      .data-panel-label {
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 12px;
                      }
                    }
                    /* 新增：复选框组样式 */
                    .checkbox-group {
                      display: flex;
                      justify-content: space-between; /* 或 space-between */
                      align-items: center;
                      padding-top: 5px; /* 增加一点顶部间距 */
                    }

                    .checkbox-group .el-checkbox {
                      margin-right: 10px; /* 增加复选框之间的间距 */
                    }

                    /* 调整复选框标签颜色 */
                    .checkbox-group :deep(.el-checkbox__label) {
                      color: rgba(255, 255, 255, 0.8); /* 调整标签颜色 */
                      font-size: 12px; /* 调整标签字体大小 */
                    }

                    /* 执行控制区域的特殊样式 */
                    .exec-controls {
                      display: flex;
                      align-items: center;
                      gap: 3px;
                    }

                    /* 调整选中状态下的颜色 */
                    .checkbox-group
                      :deep(
                        .el-checkbox__input.is-checked + .el-checkbox__label
                      ) {
                      color: #0ac5a8; /* 选中时标签颜色 */
                    }

                    .checkbox-group
                      :deep(
                        .el-checkbox__input.is-checked .el-checkbox__inner
                      ) {
                      background-color: #0ac5a8; /* 选中时背景色 */
                      border-color: #0ac5a8; /* 选中时边框色 */
                    }
                  }
                }

                /* 管理员密码对话框样式 */
                .admin-password-content {
                  padding: 20px 0;
                }

                .admin-password-content .el-form-item {
                  margin-bottom: 20px;
                }

                .admin-password-content .el-input {
                  width: 100%;
                }

                .dialog-footer {
                  text-align: right;
                  padding-top: 20px;
                }
                /* 面板位置样式 */
                .data-panel.position-right {
                  left: calc(100% + 15px);
                  top: 50%;
                  transform: translateY(-50%);
                }
                .data-panel.position-left {
                  right: calc(100% + 15px);
                  top: 50%;
                  transform: translateY(-50%);
                }
                .data-panel.position-top {
                  bottom: calc(100% + 15px);
                  left: 50%;
                  transform: translateX(-50%);
                }
                .data-panel.position-bottom {
                  top: calc(100% + 15px);
                  left: 50%;
                  transform: translateX(-50%);
                }
                /* 始终显示的面板 */
                .data-panel.always-show {
                  opacity: 1;
                  pointer-events: auto; /* 重新启用指针事件 */
                }
                /* 竖向布局样式 */
                .data-panel.vertical-layout {
                  width: 110px;
                  padding: 8px;
                  .data-panel-row {
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                  }
                  .data-panel-label {
                    margin-bottom: 2px;
                  }
                }
                .data-panel.production-line-panel {
                  width: 300px;
                  pointer-events: auto;
                  border-radius: 5px;
                  background: linear-gradient(
                    135deg,
                    rgba(255, 250, 243, 0.68),
                    rgba(248, 238, 225, 0.62)
                  );
                  border: 1px solid rgba(200, 155, 80, 0.35);
                  box-shadow: 0 2px 8px rgba(120, 80, 20, 0.1);

                  .data-panel-label {
                    font-size: 11px;
                    color: #5c4020;
                    white-space: nowrap;
                  }

                  .highlight-value {
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 13px;
                    font-weight: 600;
                    color: #2a1a08;
                  }

                  .highlight-value.stacked-qty {
                    color: #2a8c3a;
                  }
                }
                .data-panel.production-line-panel.line-single-card {
                  width: fit-content;
                  padding: 4px 0px;

                  .line-row-content {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                  }

                  .line-row-seg {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    flex: 0 0 auto;
                    overflow: hidden;

                    .line-info-val,
                    .highlight-value {
                      max-width: 100%;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      font-size: 12px;
                      color: #2a1a08;
                    }
                  }

                  .line-row-sep {
                    color: rgba(140, 100, 40, 0.55);
                    font-size: 13px;
                    line-height: 1;
                    flex-shrink: 0;
                  }

                  .highlight-value.stacked-qty {
                    color: #2a8c3a;
                  }

                  .line-left-tag {
                    width: 34px;
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    color: #a84e00;
                    border-right: 1px solid rgba(168, 78, 0, 0.4);
                    margin-right: 2px;
                    padding-right: 2px;
                  }

                  .line-row-content > .line-row-seg:nth-of-type(1) {
                    width: 130px;
                  }

                  .line-row-content > .line-row-seg:nth-of-type(2) {
                    width: 110px;
                  }

                  .line-row-content > .line-row-seg:nth-of-type(3) {
                    width: 70px;
                  }

                  /* 产品信息和托盘号字体缩小并允许换行，超过两行显示省略号 */
                  .line-row-seg.section-product,
                  .line-row-seg.section-tray {
                    overflow: hidden;

                    .line-info-val,
                    .highlight-value {
                      font-size: 9px;
                      line-height: 1.2;
                      white-space: normal;
                      word-break: break-all;
                      display: -webkit-box;
                      -webkit-box-orient: vertical;
                      -webkit-line-clamp: 2;
                      text-overflow: ellipsis;
                    }
                  }
                }
                /* 产品信息卡片样式（浅蓝色配色） */
                .data-panel.product-info-card {
                  width: fit-content;
                  min-width: 180px;
                  pointer-events: auto;
                  border-radius: 8px;
                  background: linear-gradient(135deg, #f0f8ff, #e1f0ff);
                  border: 1px solid rgba(66, 133, 244, 0.35);
                  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);
                  padding: 4px 10px;

                  .product-info-card-body {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .data-panel-label {
                      font-size: 11px;
                      color: #6b7280;
                      white-space: nowrap;
                    }

                    .product-info-val {
                      font-size: 11px;
                      color: #374151;
                      line-height: 1.2;
                      white-space: normal;
                      word-break: break-all;
                      display: -webkit-box;
                      -webkit-box-orient: vertical;
                      -webkit-line-clamp: 2;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    }
                  }
                }
                /* 称重面板样式 */
                .data-panel.weigh-panel {
                  width: 200px;
                  pointer-events: auto;
                  border-radius: 8px;
                  background: linear-gradient(135deg, #f0f8ff, #e1f0ff);
                  border: 1px solid rgba(66, 133, 244, 0.35);
                  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);

                  .data-panel-header {
                    color: #2563eb;
                    border-bottom-color: rgba(66, 133, 244, 0.2);
                  }

                  .weigh-panel-body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                  }

                  .weigh-ball-wrap {
                    display: flex;
                    justify-content: center;
                    padding: 4px 0;
                  }

                  .weigh-ball {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: radial-gradient(
                      circle at 38% 38%,
                      #93c5fd,
                      #3b82f6,
                      #1d4ed8
                    );
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
                    border: 2px solid rgba(147, 197, 253, 0.6);
                  }

                  .weigh-ball-val {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.1;
                  }

                  .weigh-ball-unit {
                    font-size: 9px;
                    color: rgba(255, 255, 255, 0.75);
                    margin-top: 1px;
                  }

                  .weigh-info-row {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    width: 100%;

                    .data-panel-label {
                      font-size: 11px;
                      color: #6b7280;
                      white-space: nowrap;
                    }

                    .highlight-value {
                      font-size: 12px;
                      font-weight: 600;
                      color: #1e40af;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      flex: 1;
                    }

                    .line-info-val {
                      font-size: 11px;
                      color: #374151;
                      line-height: 1.2;
                      white-space: normal;
                      word-break: break-all;
                      display: -webkit-box;
                      -webkit-box-orient: vertical;
                      -webkit-line-clamp: 2;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    }
                  }
                  .weigh-re-read-row {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    padding-top: 4px;

                    .re-read-order-btn {
                      background: #0ac5a8;
                      color: #fff;
                      border: none;
                      border-radius: 4px;
                      padding: 6px 0;
                      font-size: 12px;
                      width: 100%;
                    }
                    .re-read-order-btn:hover:not(:disabled) {
                      opacity: 0.85;
                    }
                    .re-read-order-btn:disabled {
                      opacity: 0.5;
                      cursor: not-allowed;
                    }
                  }
                }

                /* 下货面板样式 */
                .data-panel.unload-panel {
                  width: 240px;
                  pointer-events: auto;
                  border-radius: 8px;
                  background: linear-gradient(135deg, #f0f8ff, #e1f0ff);
                  border: 1px solid rgba(66, 133, 244, 0.35);
                  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);

                  .data-panel-header {
                    color: #2563eb;
                    border-bottom-color: rgba(66, 133, 244, 0.2);
                  }

                  .unload-panel-body {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                  }

                  .unload-info-row,
                  .unload-product-row {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .data-panel-label {
                      font-size: 11px;
                      color: #6b7280;
                      white-space: nowrap;
                    }

                    .highlight-value {
                      font-size: 12px;
                      font-weight: 600;
                      color: #1e40af;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      flex: 1;
                    }

                    .line-info-val {
                      font-size: 11px;
                      color: #374151;
                      line-height: 1.2;
                      white-space: normal;
                      word-break: break-all;
                      display: -webkit-box;
                      -webkit-box-orient: vertical;
                      -webkit-line-clamp: 2;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    }
                  }
                }
              }
              /* 悬停时显示面板 */
              .marker-with-panel:hover .data-panel:not(.always-show) {
                opacity: 1;
              }

              /* 带按钮的标识点样式 */
              .marker-with-button {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 5;
                cursor: pointer;
              }
              .marker-with-button .warehouse-btn {
                background: linear-gradient(135deg, #0e1a27, #3c4c63);
                color: white;
                font-weight: bold;
                border: none;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                border-radius: 4px;
                padding: 10px 15px;
                transition: all 0.3s ease;
              }
              .marker-with-button .warehouse-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
              }

              /* 刷新产品信息按钮样式 */
              .marker-with-button .refresh-product-btn {
                background: linear-gradient(135deg, #0ac5a8, #078a74);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 13px;
                cursor: pointer;
              }
              .marker-with-button .refresh-product-btn:hover:not(:disabled) {
                opacity: 0.85;
              }
              .marker-with-button .refresh-product-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              /* 预热房选择样式 */
              .preheating-room-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 10;
                background: linear-gradient(135deg, #005aff 0%, #000000 100%);
                border-radius: 5px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                width: 80px;
                .preheating-room-content {
                  display: flex;
                  flex-direction: column;
                  width: 100%;
                  .preheating-room-header {
                    width: 100%;
                    text-align: center;
                    padding: 4px 0;
                    font-size: 11px;
                    color: white;
                    background-color: rgba(0, 0, 0, 0.2);
                    font-weight: bold;
                  }
                  .preheating-room-body {
                    padding: 6px 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                  }
                }
              }
              .preheating-room-marker :deep(.el-select) {
                width: 100%;
              }
              .preheating-room-marker :deep(.el-input__inner) {
                background-color: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.2);
                color: #fff;
                height: 24px;
                line-height: 24px;
                font-size: 11px;
                border-radius: 3px;
                padding: 0 8px;
              }

              /* 解析状态标签样式 */
              .analysis-status-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 15;
              }

              /* 自定义状态标签样式，让绿色更突出 */
              .analysis-status-marker :deep(.el-tag) {
                background-color: #00cc44;
                border: 1px solid #00aa33;
                color: #ffffff;
              }
            }
          }
        }
        .floor-left {
          flex: 1;
          background: #07293e;
          padding: 10px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
          color: #f5f5f5;
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
          .floor-title {
            font-size: 22px;
            color: #0ac5a8;
            font-weight: 900;
            padding-bottom: 10px;
            flex-shrink: 0;
          }
          .floor-image-container {
            .image-wrapper {
              .queue-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 10;
                background: rgba(10, 30, 50, 0.85);
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid rgba(64, 158, 255, 0.5);
                transition: all 0.3s ease;
                min-width: 40px;
                text-align: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                color: #ffffff;
                .queue-marker-content {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  color: #fff;
                  font-size: 12px;
                  .queue-marker-name {
                    color: #fff;
                  }

                  .queue-marker-count {
                    font-size: 14px;
                    font-weight: bold;
                    color: #409eff;
                  }
                }
              }
              .queue-marker:hover {
                background: rgba(24, 61, 97, 0.9);
                border-color: rgba(64, 158, 255, 0.6);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
              }

              /* 特殊队列标记样式 - 上货1、上货2、缓存区1、缓存区2 */
              .special-queue {
                background: rgba(0, 123, 191, 0.9) !important;
                border: 1px solid rgba(0, 123, 191, 0.7) !important;
              }

              .special-queue .queue-marker-count {
                color: #ffffff !important;
              }

              .special-queue .queue-marker-name {
                color: #ffffff !important;
              }

              .special-queue:hover {
                background: rgba(0, 123, 191, 0.95) !important;
                border-color: rgba(40, 167, 235, 0.8) !important;
              }

              /* 添加小车样式 */
              .cart-container {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              }

              .cart-image {
                width: 100%;
                height: auto;
                object-fit: contain;
              }
            }
          }
        }
      }
    }
  }
}

/* 添加新的测试面板样式 */
.test-panel-container {
  position: absolute; /* 修改位置，为测试按钮留出空间 */
  right: 20px; /* 修改位置，为队列按钮留出空间 */
  top: 20px;
  z-index: 1000;
}

.test-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0ac5a8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.test-toggle-btn:hover {
  transform: scale(1.1);
  background: #0db196;
}

.test-toggle-btn i {
  color: #fff;
  font-size: 20px;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.test-panel {
  position: absolute;
  right: 50px;
  top: 0;
  width: 300px;
  max-height: 80vh; /* 限制最大高度为视窗高度的80% */
  background: rgba(30, 42, 56, 0.98);
  border: 1px solid rgba(10, 197, 168, 0.3);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  transform-origin: top right;
  opacity: 1;
  transform: scale(1);
  display: flex;
  flex-direction: column;
}

.test-panel.collapsed {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}

.test-panel-header {
  padding: 15px;
  background: rgba(10, 197, 168, 0.3);
  border-radius: 15px 15px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0ac5a8;
  font-weight: bold;
  pointer-events: auto;
  flex-shrink: 0;
}

.test-panel-content {
  padding: 15px;
  overflow-y: auto;
  pointer-events: auto;
  flex: 1;
}

/* 添加滚动条样式 */
.test-panel-content::-webkit-scrollbar {
  width: 4px;
}

.test-panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.test-panel-content::-webkit-scrollbar-thumb {
  background: rgba(10, 197, 168, 0.3);
  border-radius: 2px;
}

.test-panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 197, 168, 0.5);
}

.test-panel-header i {
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-panel-header i:hover {
  color: #ff4d4f;
}

.test-section {
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.4);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(10, 197, 168, 0.1);
}

.test-label {
  display: block;
  color: #0ac5a8;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.position-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  pointer-events: auto;
}

.position-btn {
  padding: 6px 12px;
  background: rgba(10, 197, 168, 0.3);
  border: 1px solid rgba(10, 197, 168, 0.5);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.position-btn:hover {
  background: rgba(10, 197, 168, 0.5);
}

.position-btn:active {
  transform: scale(0.95);
}

/* 小车位置滑块样式 */
.cart-position-test-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.cart-position-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-position-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-value {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  min-width: 50px;
  text-align: center;
}

.cart-position-slider-container {
  padding: 5px 0;
}

.cart-position-slider {
  width: 100%;
}

.cart-position-slider :deep(.el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.1);
  height: 6px;
}

.cart-position-slider :deep(.el-slider__bar) {
  background-color: #0ac5a8;
  height: 6px;
}

.cart-position-slider :deep(.el-slider__button) {
  border: 2px solid #0ac5a8;
  background-color: #fff;
  width: 20px;
  height: 20px;
}

.cart-position-slider :deep(.el-slider__button:hover) {
  border-color: #0ac5a8;
  box-shadow: 0 0 5px rgba(10, 197, 168, 0.5);
}

/* PLC 模拟 / 数量测试（与 example.vue 测试面板风格一致） */
.plc-test-wrapper :deep(.el-collapse) {
  border: none;
  background: transparent;
}

.plc-test-wrapper :deep(.el-collapse-item__header) {
  background: rgba(10, 197, 168, 0.1);
  color: #0ac5a8;
  border: none;
  padding: 0 10px;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 13px;
}

.plc-test-wrapper :deep(.el-collapse-item__header.is-active) {
  background: rgba(10, 197, 168, 0.2);
}

.plc-test-wrapper :deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;
}

.plc-test-wrapper :deep(.el-collapse-item__content) {
  padding: 8px 4px;
  color: #fff;
}

.compact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.compact-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.compact-label {
  width: 36px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  text-align: right;
}

.plc-test-wrapper :deep(.el-input--mini .el-input__inner) {
  height: 24px;
  line-height: 24px;
  padding: 0 5px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #fff;
}

.feedbit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 6px;
  padding: 6px 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.feedbit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: rgba(30, 42, 56, 0.8);
  border-radius: 4px;
  border: 1px solid rgba(10, 197, 168, 0.1);
}

.feedbit-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: bold;
}

.quantity-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.quantity-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quantity-title {
  font-size: 14px;
  color: #0ac5a8;
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.quantity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 42, 56, 0.8);
  border-radius: 4px;
  padding: 8px;
  border: 1px solid rgba(10, 197, 168, 0.1);
  margin-bottom: 5px;

  .quantity-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    min-width: 52px;
    flex-shrink: 0;
  }

  .quantity-value {
    font-size: 14px;
    color: #0ac5a8;
    font-weight: bold;
    min-width: 30px;
    text-align: center;
  }

  .quantity-buttons {
    display: flex;
    gap: 5px;

    .quantity-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      background: rgba(10, 197, 168, 0.3);
      border: none;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }

      &.plus {
        background: rgba(10, 197, 168, 0.5);
        &:hover {
          background: rgba(10, 197, 168, 0.7);
        }
      }

      &.minus {
        background: rgba(245, 108, 108, 0.3);
        &:hover {
          background: rgba(245, 108, 108, 0.5);
        }
      }

      &.clear-signal {
        width: auto;
        min-width: 40px;
        padding: 0 4px;
        font-size: 11px;
        background: rgba(230, 162, 60, 0.35);
        &:hover {
          background: rgba(230, 162, 60, 0.55);
        }
      }
    }
  }

  .source-input {
    flex: 1;
    max-width: 72px;
    margin-left: 6px;
  }

  .source-input :deep(.el-input__inner) {
    height: 24px;
    line-height: 24px;
    padding: 0 5px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(10, 197, 168, 0.3);
    color: #fff;
  }
}

/* 测试添加结束 */

/* 托盘检索弹窗样式 */
.tray-search-form {
  .search-result {
    margin-top: 20px;
  }

  .no-result {
    margin-top: 20px;

    .no-result-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 20px;
      background: rgba(30, 42, 56, 0.8);
      border-radius: 8px;
      border: 1px solid rgba(255, 193, 7, 0.3);

      i {
        font-size: 48px;
        color: #ffc107;
        margin-bottom: 15px;
      }

      p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin: 0;
        text-align: center;
      }
    }
  }
}

/* 队列信息标题操作按钮样式 */
.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;

  .arrow-icon {
    cursor: pointer;
    transition: all 0.3s ease;
    color: #0ac5a8;
    font-size: 16px;

    &:hover {
      color: #fff;
      transform: scale(1.1);
    }
  }
}
</style>
