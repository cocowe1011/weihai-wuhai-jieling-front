<template>
  <div class="smart-workshop">
    <!-- 内容区包装器 -->
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="side-info-panel">
        <!-- PLC状态与订单信息区域 -->
        <div class="plc-info-section">
          <div class="section-header">当前扫码包裹信息</div>
          <div class="scrollable-content">
            <div class="status-overview">
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop granient-text">
                    大包号
                  </div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.packageNo || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">客户来源</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.customerSource || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">来源仓</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.sourceWarehouse || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">渠道</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.channel || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">目的国</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.destinationCountry || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">批次号</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.batchNo || '--' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="operation-panel">
          <div class="section-header">
            <span>操作</span>
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
              class="btn-start"
              @click="toggleButtonState('start')"
              :class="{ pressed: buttonStates.start }"
            >
              <i class="el-icon-switch-button"></i><span>全线启动</span>
            </button>
            <button
              class="btn-stop"
              @click="toggleButtonState('stop')"
              :class="{ pressed: buttonStates.stop }"
            >
              <i class="el-icon-error"></i><span>全线停止</span>
            </button>
            <button
              v-show="false"
              class="btn-reset"
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
            日志记录
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
            <div class="floor-title">生产线监控</div>
            <div class="floor-image-container">
              <div class="floor-map-legend">
                <span class="legend-item">
                  <i class="legend-dot legend-dot--photo"></i>
                  <span class="legend-text">
                    <span class="legend-name">光电</span>
                    <span class="legend-desc">圆形，触发为红色</span>
                  </span>
                </span>
                <span class="legend-item">
                  <i class="legend-dot legend-dot--motor"></i>
                  <span class="legend-text">
                    <span class="legend-name">电机</span>
                    <span class="legend-desc">方形，运行为绿色</span>
                  </span>
                </span>
                <span class="legend-item">
                  <i class="legend-arrow"></i>
                  <span class="legend-text">
                    <span class="legend-name">箭头</span>
                    <span class="legend-desc">输送线物料流向</span>
                  </span>
                </span>
              </div>
              <div class="image-wrapper">
                <img
                  src="@/assets/changzhou-img/image.png"
                  alt="一楼平面图"
                  class="floor-image"
                  @load="updateMarkerPositions"
                />
                <!-- 修改队列标识 -->
                <div
                  v-for="marker in queueMarkers"
                  :key="marker.id"
                  class="queue-marker"
                  :data-x="marker.x"
                  :data-y="marker.y"
                  @click="handleQueueMarkerClick(marker.queueId)"
                >
                  <div class="queue-marker-content">
                    <span class="queue-marker-count">{{
                      queues.find((q) => q.id === marker.queueId)?.trayInfo
                        ?.length || 0
                    }}</span>
                    <span class="queue-marker-name">{{ marker.name }}</span>
                  </div>
                </div>
                <!-- DBW12 光电信号--1 -->
                <!-- 01001 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: photoelectricSignal1.bit0 === '1' }"
                  data-x="600"
                  data-y="190"
                  @click="toggleBitValue(photoelectricSignal1, 'bit0')"
                >
                  <div class="marker-label">01001</div>
                </div>
                <!-- 01002 -->
                <!-- <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit1 === '1' }"
                  data-x="640"
                  data-y="1380"
                  @click="toggleBitValue(photoelectricSignal1, 'bit1')"
                >
                  <div class="marker-label">01002</div>
                </div> -->
                <!-- 01013光电1 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit2 === '1' }"
                  data-x="1200"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal1, 'bit2')"
                >
                  <div class="marker-label">01013-1</div>
                </div>
                <!-- 01004 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal1.bit3 === '1' }"
                  data-x="605"
                  data-y="870"
                  @click="toggleBitValue(photoelectricSignal1, 'bit3')"
                >
                  <div class="marker-label">01004</div>
                </div>
                <!-- 01005 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal1.bit4 === '1' }"
                  data-x="603"
                  data-y="945"
                  @click="toggleBitValue(photoelectricSignal1, 'bit4')"
                >
                  <div class="marker-label">01005</div>
                </div>
                <!-- 01006 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal1.bit5 === '1' }"
                  data-x="600"
                  data-y="1030"
                  @click="toggleBitValue(photoelectricSignal1, 'bit5')"
                >
                  <div class="marker-label">01006</div>
                </div>
                <!-- 01007 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal1.bit6 === '1' }"
                  data-x="595"
                  data-y="1110"
                  @click="toggleBitValue(photoelectricSignal1, 'bit6')"
                >
                  <div class="marker-label">01007</div>
                </div>
                <!-- 01008 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal1.bit7 === '1' }"
                  data-x="590"
                  data-y="1185"
                  @click="toggleBitValue(photoelectricSignal1, 'bit7')"
                >
                  <div class="marker-label">01008</div>
                </div>
                <!-- 01009 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: photoelectricSignal1.bit8 === '1' }"
                  data-x="700"
                  data-y="1253"
                  @click="toggleBitValue(photoelectricSignal1, 'bit8')"
                >
                  <div class="marker-label">01009</div>
                </div>
                <!-- 01010 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal1.bit9 === '1' }"
                  data-x="590"
                  data-y="1330"
                  @click="toggleBitValue(photoelectricSignal1, 'bit9')"
                >
                  <div class="marker-label">01010</div>
                </div>
                <!-- 01011 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit10 === '1' }"
                  data-x="760"
                  data-y="1400"
                  @click="toggleBitValue(photoelectricSignal1, 'bit10')"
                >
                  <div class="marker-label">01011</div>
                </div>
                <!-- 01012 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit11 === '1' }"
                  data-x="860"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal1, 'bit11')"
                >
                  <div class="marker-label">01012</div>
                </div>
                <!-- 01013光电2 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit12 === '1' }"
                  data-x="1350"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal1, 'bit12')"
                >
                  <div class="marker-label">01013-2</div>
                </div>
                <!-- 01014 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit13 === '1' }"
                  data-x="1490"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal1, 'bit13')"
                >
                  <div class="marker-label">01014</div>
                </div>
                <!-- 01015 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit14 === '1' }"
                  data-x="1620"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal1, 'bit14')"
                >
                  <div class="marker-label">01015</div>
                </div>
                <!-- 01016 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal1.bit15 === '1' }"
                  data-x="1820"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal1, 'bit15')"
                >
                  <div class="marker-label">01016</div>
                </div>
                <!-- DBW14 光电信号--2 -->
                <!-- 01017 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal2.bit0 === '1' }"
                  data-x="2010"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal2, 'bit0')"
                >
                  <div class="marker-label">01017</div>
                </div>
                <!-- 01018 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal2.bit1 === '1' }"
                  data-x="2190"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal2, 'bit1')"
                >
                  <div class="marker-label">01018</div>
                </div>
                <!-- 01019 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal2.bit2 === '1' }"
                  data-x="2368"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal2, 'bit2')"
                >
                  <div class="marker-label">01019</div>
                </div>
                <!-- 01020 -->
                <div
                  class="marker"
                  :class="{ scanning: photoelectricSignal2.bit3 === '1' }"
                  data-x="2555"
                  data-y="1402"
                  @click="toggleBitValue(photoelectricSignal2, 'bit3')"
                >
                  <div class="marker-label">01020</div>
                </div>
                <!-- 01021 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit4 === '1' }"
                  data-x="1660"
                  data-y="1120"
                  @click="toggleBitValue(photoelectricSignal2, 'bit4')"
                >
                  <div class="marker-label">01021</div>
                </div>
                <!-- 01022 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit5 === '1' }"
                  data-x="1660"
                  data-y="1530"
                  @click="toggleBitValue(photoelectricSignal2, 'bit5')"
                >
                  <div class="marker-label">01022</div>
                </div>
                <!-- 01023 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit6 === '1' }"
                  data-x="1840"
                  data-y="1120"
                  @click="toggleBitValue(photoelectricSignal2, 'bit6')"
                >
                  <div class="marker-label">01023</div>
                </div>
                <!-- 01024 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit7 === '1' }"
                  data-x="1840"
                  data-y="1530"
                  @click="toggleBitValue(photoelectricSignal2, 'bit7')"
                >
                  <div class="marker-label">01024</div>
                </div>
                <!-- 01025 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit8 === '1' }"
                  data-x="2025"
                  data-y="1120"
                  @click="toggleBitValue(photoelectricSignal2, 'bit8')"
                >
                  <div class="marker-label">01025</div>
                </div>
                <!-- 01026 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit9 === '1' }"
                  data-x="2025"
                  data-y="1530"
                  @click="toggleBitValue(photoelectricSignal2, 'bit9')"
                >
                  <div class="marker-label">01026</div>
                </div>
                <!-- 01027 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit10 === '1' }"
                  data-x="2210"
                  data-y="1120"
                  @click="toggleBitValue(photoelectricSignal2, 'bit10')"
                >
                  <div class="marker-label">01027</div>
                </div>
                <!-- 01028 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit11 === '1' }"
                  data-x="2210"
                  data-y="1530"
                  @click="toggleBitValue(photoelectricSignal2, 'bit11')"
                >
                  <div class="marker-label">01028</div>
                </div>
                <!-- 01029 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit12 === '1' }"
                  data-x="2390"
                  data-y="1120"
                  @click="toggleBitValue(photoelectricSignal2, 'bit12')"
                >
                  <div class="marker-label">01029</div>
                </div>
                <!-- 01030 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit13 === '1' }"
                  data-x="2390"
                  data-y="1530"
                  @click="toggleBitValue(photoelectricSignal2, 'bit13')"
                >
                  <div class="marker-label">01030</div>
                </div>
                <!-- 01031 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit14 === '1' }"
                  data-x="2575"
                  data-y="1120"
                  @click="toggleBitValue(photoelectricSignal2, 'bit14')"
                >
                  <div class="marker-label">01031</div>
                </div>
                <!-- 01032 -->
                <div
                  class="marker label-left"
                  :class="{ scanning: photoelectricSignal2.bit15 === '1' }"
                  data-x="2575"
                  data-y="1530"
                  @click="toggleBitValue(photoelectricSignal2, 'bit15')"
                >
                  <div class="marker-label">01032</div>
                </div>
                <!-- DBW6 电机运行信号 01001-01016 -->
                <!-- 01001 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit0 === '1' }"
                  data-x="400"
                  data-y="245"
                  @click="toggleBitValue(motorRunningWord6, 'bit0')"
                >
                  <div class="marker-label">01001</div>
                </div>
                <!-- 01002 -->
                <div
                  class="motor-marker marker-show-label label-right"
                  :class="{ running: motorRunningWord6.bit1 === '1' }"
                  data-x="650"
                  data-y="260"
                  @click="toggleBitValue(motorRunningWord6, 'bit1')"
                >
                  <div class="marker-label">01002</div>
                </div>
                <!-- 01003 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit2 === '1' }"
                  data-x="665"
                  data-y="445"
                  @click="toggleBitValue(motorRunningWord6, 'bit2')"
                >
                  <div class="marker-label">01003</div>
                </div>
                <!-- 01004 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit3 === '1' }"
                  data-x="660"
                  data-y="660"
                  @click="toggleBitValue(motorRunningWord6, 'bit3')"
                >
                  <div class="marker-label">01004</div>
                </div>
                <!-- 01005 -->
                <div
                  class="motor-marker marker-show-label label-right"
                  :class="{ running: motorRunningWord6.bit4 === '1' }"
                  data-x="650"
                  data-y="900"
                  @click="toggleBitValue(motorRunningWord6, 'bit4')"
                >
                  <div class="marker-label">01005</div>
                </div>
                <!-- 01006 -->
                <div
                  class="motor-marker marker-show-label label-right"
                  :class="{ running: motorRunningWord6.bit5 === '1' }"
                  data-x="648"
                  data-y="980"
                  @click="toggleBitValue(motorRunningWord6, 'bit5')"
                >
                  <div class="marker-label">01006</div>
                </div>
                <!-- 01007 -->
                <div
                  class="motor-marker marker-show-label label-right"
                  :class="{ running: motorRunningWord6.bit6 === '1' }"
                  data-x="646"
                  data-y="1060"
                  @click="toggleBitValue(motorRunningWord6, 'bit6')"
                >
                  <div class="marker-label">01007</div>
                </div>
                <!-- 01008 -->
                <div
                  class="motor-marker marker-show-label label-right"
                  :class="{ running: motorRunningWord6.bit7 === '1' }"
                  data-x="642"
                  data-y="1140"
                  @click="toggleBitValue(motorRunningWord6, 'bit7')"
                >
                  <div class="marker-label">01008</div>
                </div>
                <!-- 01009 -->
                <div
                  class="motor-marker marker-show-label label-right"
                  :class="{ running: motorRunningWord6.bit8 === '1' }"
                  data-x="639"
                  data-y="1210"
                  @click="toggleBitValue(motorRunningWord6, 'bit8')"
                >
                  <div class="marker-label">01009</div>
                </div>
                <!-- 01010 -->
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: motorRunningWord6.bit9 === '1' }"
                  data-x="637"
                  data-y="1270"
                  @click="toggleBitValue(motorRunningWord6, 'bit9')"
                >
                  <div class="marker-label">01010</div>
                </div>
                <!-- 01011 -->
                <div
                  class="motor-marker marker-show-label label-bottom"
                  :class="{ running: motorRunningWord6.bit10 === '1' }"
                  data-x="662"
                  data-y="1330"
                  @click="toggleBitValue(motorRunningWord6, 'bit10')"
                >
                  <div class="marker-label">01011</div>
                </div>
                <!-- 01012 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit11 === '1' }"
                  data-x="760"
                  data-y="1345"
                  @click="toggleBitValue(motorRunningWord6, 'bit11')"
                >
                  <div class="marker-label">01012</div>
                </div>
                <!-- 01013 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit12 === '1' }"
                  data-x="1260"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord6, 'bit12')"
                >
                  <div class="marker-label">01013</div>
                </div>
                <!-- 01014 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit13 === '1' }"
                  data-x="1420"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord6, 'bit13')"
                >
                  <div class="marker-label">01014</div>
                </div>
                <!-- 01015 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit14 === '1' }"
                  data-x="1580"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord6, 'bit14')"
                >
                  <div class="marker-label">01015</div>
                </div>
                <!-- 01016 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord6.bit15 === '1' }"
                  data-x="1820"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord6, 'bit15')"
                >
                  <div class="marker-label">01016</div>
                </div>
                <!-- DBW8 电机运行信号 01017-01030（bit14/15 备用不生成） -->
                <!-- 01017 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit0 === '1' }"
                  data-x="2010"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord8, 'bit0')"
                >
                  <div class="marker-label">01017</div>
                </div>
                <!-- 01018 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit1 === '1' }"
                  data-x="2190"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord8, 'bit1')"
                >
                  <div class="marker-label">01018</div>
                </div>
                <!-- 01019 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit2 === '1' }"
                  data-x="2368"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord8, 'bit2')"
                >
                  <div class="marker-label">01019</div>
                </div>
                <!-- 01020 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit3 === '1' }"
                  data-x="2555"
                  data-y="1335"
                  @click="toggleBitValue(motorRunningWord8, 'bit3')"
                >
                  <div class="marker-label">01020</div>
                </div>
                <!-- 01021 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit4 === '1' }"
                  data-x="1730"
                  data-y="1220"
                  @click="toggleBitValue(motorRunningWord8, 'bit4')"
                >
                  <div class="marker-label">01021</div>
                </div>
                <!-- 01022 -->
                <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord8.bit5 === '1' }"
                  data-x="1730"
                  data-y="1420"
                  @click="toggleBitValue(motorRunningWord8, 'bit5')"
                >
                  <div class="marker-label">01022</div>
                </div>
                <!-- 01023 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit6 === '1' }"
                  data-x="1910"
                  data-y="1220"
                  @click="toggleBitValue(motorRunningWord8, 'bit6')"
                >
                  <div class="marker-label">01023</div>
                </div>
                <!-- 01024 -->
                <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord8.bit7 === '1' }"
                  data-x="1910"
                  data-y="1420"
                  @click="toggleBitValue(motorRunningWord8, 'bit7')"
                >
                  <div class="marker-label">01024</div>
                </div>
                <!-- 01025 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit8 === '1' }"
                  data-x="2100"
                  data-y="1220"
                  @click="toggleBitValue(motorRunningWord8, 'bit8')"
                >
                  <div class="marker-label">01025</div>
                </div>
                <!-- 01026 -->
                <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord8.bit9 === '1' }"
                  data-x="2100"
                  data-y="1420"
                  @click="toggleBitValue(motorRunningWord8, 'bit9')"
                >
                  <div class="marker-label">01026</div>
                </div>
                <!-- 01027 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit10 === '1' }"
                  data-x="2280"
                  data-y="1220"
                  @click="toggleBitValue(motorRunningWord8, 'bit10')"
                >
                  <div class="marker-label">01027</div>
                </div>
                <!-- 01028 -->
                <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord8.bit11 === '1' }"
                  data-x="2280"
                  data-y="1420"
                  @click="toggleBitValue(motorRunningWord8, 'bit11')"
                >
                  <div class="marker-label">01028</div>
                </div>
                <!-- 01029 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit12 === '1' }"
                  data-x="2460"
                  data-y="1220"
                  @click="toggleBitValue(motorRunningWord8, 'bit12')"
                >
                  <div class="marker-label">01029</div>
                </div>
                <!-- 01030 -->
                <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord8.bit13 === '1' }"
                  data-x="2460"
                  data-y="1420"
                  @click="toggleBitValue(motorRunningWord8, 'bit13')"
                >
                  <div class="marker-label">01030</div>
                </div>
                <!-- 01030 -->
                <div
                  class="motor-marker marker-show-label label-top"
                  :class="{ running: motorRunningWord8.bit14 === '1' }"
                  data-x="2650"
                  data-y="1220"
                  @click="toggleBitValue(motorRunningWord8, 'bit14')"
                >
                  <div class="marker-label">01031</div>
                </div>
                <!-- 01031 -->
                <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord8.bit15 === '1' }"
                  data-x="2655"
                  data-y="1420"
                  @click="toggleBitValue(motorRunningWord8, 'bit15')"
                >
                  <div class="marker-label">01032</div>
                </div>
                <!-- DBW10 分拣电机运行信号 -->
                <!-- 分拣1左执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit0 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit0')"
                >
                  <div class="marker-label">分拣1左</div>
                </div> -->
                <!-- 分拣机1右执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit1 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit1')"
                >
                  <div class="marker-label">分拣1右</div>
                </div> -->
                <!-- 分拣机2左执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit2 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit2')"
                >
                  <div class="marker-label">分拣2左</div>
                </div> -->
                <!-- 分拣机2右执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit3 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit3')"
                >
                  <div class="marker-label">分拣2右</div>
                </div> -->
                <!-- 分拣机3左执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit4 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit4')"
                >
                  <div class="marker-label">分拣3左</div>
                </div> -->
                <!-- 分拣机3右执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit5 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit5')"
                >
                  <div class="marker-label">分拣3右</div>
                </div> -->
                <!-- 分拣机4左执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit6 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit6')"
                >
                  <div class="marker-label">分拣4左</div>
                </div> -->
                <!-- 分拣机4右执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit7 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit7')"
                >
                  <div class="marker-label">分拣4右</div>
                </div> -->
                <!-- 分拣机5左执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit8 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit8')"
                >
                  <div class="marker-label">分拣5左</div>
                </div> -->
                <!-- 分拣机5右执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit9 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit9')"
                >
                  <div class="marker-label">分拣5右</div>
                </div> -->
                <!-- 分拣机6左执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit10 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit10')"
                >
                  <div class="marker-label">分拣6左</div>
                </div> -->
                <!-- 分拣机6右执行 -->
                <!-- <div
                  class="motor-marker marker-show-label"
                  :class="{ running: motorRunningWord10.bit11 === '1' }"
                  data-x="1080"
                  data-y="1390"
                  @click="toggleBitValue(motorRunningWord10, 'bit11')"
                >
                  <div class="marker-label">分拣6右</div>
                </div> -->
                <!-- 输送线流动箭头 -->
                <div
                  v-for="(arrow, index) in conveyorArrows"
                  :key="'conveyor-' + index"
                  class="marker-with-flow flow-item"
                  :data-x="arrow.x"
                  :data-y="arrow.y"
                  :style="{
                    width: arrow.width + 'px',
                    transform: `translate(-50%, -50%) scale(0.5) rotateZ(${arrow.rotation}deg)`
                  }"
                >
                  <div
                    v-for="item in arrow.arrowCount"
                    :key="item"
                    class="conveyor-arrow-item"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧队列信息区 -->
    <div
      class="side-info-panel-queue"
      :style="{
        width: isQueueExpanded ? '850px' : 'auto',
        height: isQueueExpanded ? 'calc(100% - 40px)' : 'auto'
      }"
    >
      <!-- 队列信息区域 -->
      <div class="queue-section" :class="{ expanded: isQueueExpanded }">
        <div class="section-header">
          <template v-if="isQueueExpanded">
            <div class="header-left">
              <span><i class="el-icon-s-data"></i> 队列信息</span>
            </div>
            <span
              class="arrow-icon"
              :class="{ 'expanded-arrow': isQueueExpanded }"
              @click="changeQueueExpanded"
              >▼</span
            >
          </template>
          <template v-else>
            <i class="el-icon-s-data" @click="changeQueueExpanded"></i>
          </template>
        </div>
        <div v-if="isQueueExpanded" class="expandable-content-queue">
          <div class="queue-container">
            <!-- 左侧队列列表 -->
            <div class="queue-container-left">
              <div
                v-for="(queue, queuesIndex) in queues"
                :key="'queue-' + queue.id + '-' + queuesIndex"
                class="queue"
                :class="{ active: selectedQueueIndex === queue.id - 1 }"
                @click="showTrays(queue.id - 1)"
                @dragover.prevent
                @drop="handleDrop(queue.id - 1)"
              >
                <span class="queue-name">{{ queue.queueName }}</span>
                <span class="tray-count">{{
                  queue.trayInfo?.length || 0
                }}</span>
              </div>
            </div>

            <!-- 右侧托盘列表 -->
            <div class="queue-container-right">
              <div class="selected-queue-header" v-if="selectedQueue">
                <h3>{{ selectedQueue.queueName }}</h3>
                <div class="queue-header-actions">
                  <span class="tray-total"
                    >包裹数量: {{ selectedQueue.trayInfo?.length || 0 }}</span
                  >
                </div>
              </div>
              <div class="tray-list">
                <template v-if="nowTrays && nowTrays.length > 0">
                  <div
                    v-for="(tray, index) in nowTrays"
                    :key="'tray-' + tray.id + '-' + index"
                    class="tray-item"
                    :class="{
                      dragging: isDragging && draggedTray?.id === tray.id
                    }"
                    draggable="true"
                    @dragstart="
                      handleDragStart($event, tray, selectedQueueIndex)
                    "
                    @dragend="handleDragEnd"
                  >
                    <div class="tray-info">
                      <div class="tray-info-row">
                        <span class="tray-name">{{ tray.name }}</span>
                        <span class="tray-detail">{{
                          tray.channel || '--'
                        }}</span>
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >业务编号：{{ tray.businessNo || '--' }}</span
                        >
                        <span class="tray-detail"
                          >客户来源：{{ tray.customerSource || '--' }}</span
                        >
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >目的国：{{ tray.destinationCountry || '--' }}</span
                        >
                        <span class="tray-detail"
                          >批次号：{{ tray.batchNo || '--' }}</span
                        >
                      </div>
                      <span class="tray-time">{{ tray.time }}</span>
                    </div>
                    <div class="tray-actions">
                      <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-arrow-up"
                        circle
                        :disabled="index === 0"
                        @click.stop="moveTrayUp(index)"
                        class="move-btn"
                      ></el-button>
                      <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-arrow-down"
                        circle
                        :disabled="index === nowTrays.length - 1"
                        @click.stop="moveTrayDown(index)"
                        class="move-btn"
                      ></el-button>
                      <el-button
                        type="danger"
                        size="mini"
                        icon="el-icon-delete"
                        circle
                        @click.stop="deleteTray(tray, index)"
                      ></el-button>
                    </div>
                  </div>
                </template>
                <div v-else class="empty-state">
                  <i class="el-icon-box"></i>
                  <p>暂无托盘信息</p>
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
          <!-- 添加扫码测试部分 -->
          <div class="test-section">
            <span class="test-label">扫码信息测试:</span>
            <div class="qrcode-test-container">
              <div class="qrcode-input-group">
                <div class="qrcode-label">六面扫:</div>
                <el-input
                  v-model="sixScanBarcode"
                  size="small"
                  placeholder="输入扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
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
import HttpUtil from '@/utils/HttpUtil';
import moment from 'moment';
import { ipcRenderer } from 'electron';
import OrderQueryDialog from '@/components/OrderQueryDialog.vue';
import {
  mockPackageByBarcode,
  toOrderInfoPayload,
  toScanDisplayInfo
} from '@/utils/packageMockData';
export default {
  name: 'MainPage',
  components: {
    OrderQueryDialog
  },
  data() {
    return {
      nowScanTrayInfo: {},
      sixScanBarcode: '',
      lastProcessedBarcode: '',
      sixScanProcessing: false,
      showTestPanel: false,
      orderQueryDialogVisible: false,
      buttonStates: {
        start: false,
        stop: false,
        reset: false,
        fault_reset: false,
        clear: false
      },
      activeLogType: 'running',
      runningLogs: [], // 修改为空数组
      alarmLogs: [], // 修改为空数组
      nowTrays: [],
      draggedTray: null,
      dragSourceQueue: null,
      isQueueExpanded: false,
      selectedQueueIndex: 0,
      isDragging: false,
      queues: [
        {
          id: 1,
          queueName: '上货区',
          trayInfo: []
        },
        {
          id: 2,
          queueName: '分拣口1',
          trayInfo: []
        },
        {
          id: 3,
          queueName: '分拣口2',
          trayInfo: []
        },
        {
          id: 4,
          queueName: '分拣口3',
          trayInfo: []
        },
        {
          id: 5,
          queueName: '分拣口4',
          trayInfo: []
        },
        {
          id: 6,
          queueName: '分拣口5',
          trayInfo: []
        },
        {
          id: 7,
          queueName: '分拣口6',
          trayInfo: []
        },
        {
          id: 8,
          queueName: '分拣口7',
          trayInfo: []
        },
        {
          id: 9,
          queueName: '分拣口8',
          trayInfo: []
        },
        {
          id: 10,
          queueName: '分拣口9',
          trayInfo: []
        },
        {
          id: 11,
          queueName: '分拣口10',
          trayInfo: []
        },
        {
          id: 12,
          queueName: '分拣口11',
          trayInfo: []
        },
        {
          id: 13,
          queueName: '分拣口12',
          trayInfo: []
        },
        {
          id: 14,
          queueName: '分拣口13',
          trayInfo: []
        }
      ],
      // 添加队列位置标识数据
      queueMarkers: [
        { id: 1, name: '上货区', queueId: 1, x: 650, y: 780 },
        { id: 2, name: '分拣口1', queueId: 2, x: 1730, y: 1650 },
        { id: 3, name: '分拣口2', queueId: 3, x: 1730, y: 1020 },
        { id: 4, name: '分拣口3', queueId: 4, x: 1910, y: 1650 },
        { id: 5, name: '分拣口4', queueId: 5, x: 1910, y: 1020 },
        { id: 6, name: '分拣口5', queueId: 6, x: 2090, y: 1650 },
        { id: 7, name: '分拣口6', queueId: 7, x: 2090, y: 1020 },
        { id: 8, name: '分拣口7', queueId: 8, x: 2280, y: 1650 },
        { id: 9, name: '分拣口8', queueId: 9, x: 2280, y: 1020 },
        { id: 10, name: '分拣口9', queueId: 10, x: 2470, y: 1650 },
        { id: 11, name: '分拣口10', queueId: 11, x: 2470, y: 1020 },
        { id: 12, name: '分拣口11', queueId: 12, x: 2650, y: 1650 },
        { id: 13, name: '分拣口12', queueId: 13, x: 2650, y: 1020 },
        { id: 14, name: '分拣口13', queueId: 14, x: 2820, y: 1350 }
      ],
      // 输送线流动箭头配置（坐标按平面图调整）
      conveyorArrows: [
        {
          x: 390,
          y: 245,
          width: 200,
          rotation: -2,
          arrowCount: 6
        },
        {
          x: 661,
          y: 510,
          width: 300,
          rotation: 92,
          arrowCount: 8
        },
        {
          x: 642,
          y: 1085,
          width: 300,
          rotation: 92,
          arrowCount: 9
        },
        {
          x: 800,
          y: 1345,
          width: 130,
          rotation: -2,
          arrowCount: 4
        },
        {
          x: 1420,
          y: 1343,
          width: 250,
          rotation: 0,
          arrowCount: 8
        },
        {
          x: 1920,
          y: 1345,
          width: 350,
          rotation: 0,
          arrowCount: 10
        },
        {
          x: 2450,
          y: 1345,
          width: 350,
          rotation: 0,
          arrowCount: 10
        }
      ],
      logId: 1000, // 添加一个日志ID计数器
      // —— 读取点位（与 读取点位.csv / background.js 一致）——
      conveyorHeartbeat: 0, // DBW0 输送线看门狗心跳
      conveyorRunStatus: 0, // DBW2 输送线当前运行状态
      // DBW4 区域报警
      areaAlarm: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0',
        bit15: '0'
      },
      // DBW6 电机运行信号 01001-01016
      motorRunningWord6: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0',
        bit15: '0'
      },
      // DBW8 电机运行信号 01017-01030
      motorRunningWord8: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0',
        bit15: '0'
      },
      // DBW10 分拣机左右执行
      motorRunningWord10: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0'
      },
      // DBW12 光电信号--1
      photoelectricSignal1: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0',
        bit15: '0'
      },
      // DBW14 光电信号--2
      photoelectricSignal2: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0',
        bit15: '0'
      },
      // DBW16 对接WCS信号
      wcsDockWord16: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0',
        bit15: '0'
      },
      // DBW18 分拣口呼叫空托
      wcsDockWord18: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0'
      },
      // DBW20 分拣口进货成功
      wcsFeedbackWord20: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0'
      },
      // 反馈WCS写虚拟ID
      sortPort01TrayId: '',
      sortPort02TrayId: '',
      sortPort03TrayId: '',
      sortPort04TrayId: '',
      sortPort05TrayId: '',
      sortPort06TrayId: '',
      sortPort07TrayId: '',
      sortPort08TrayId: '',
      sortPort09TrayId: '',
      sortPort10TrayId: '',
      sortPort11TrayId: '',
      sortPort12TrayId: '',
      sortPort13TrayId: '',
      spareTrayId: ''
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
    selectedQueue() {
      return this.queues[this.selectedQueueIndex];
    }
  },
  watch: {
    sixScanBarcode(newVal) {
      const barcode = (newVal || '').trim();
      if (!barcode) {
        return;
      }
      if (barcode === this.lastProcessedBarcode) {
        this.addLog(`六面扫条码重复，跳过：${barcode}`);
        return;
      }
      this.addLog(`六面扫识别条码：${barcode}`);
      this.handleSixScanUpload(barcode);
    }
  },
  mounted() {
    this.initializeMarkers();
    this.loadQueueInfoFromDatabase();
    ipcRenderer.on('receivedMsg', (event, values, values2) => {
      const getBit = (word, bitIndex) => ((word >> bitIndex) & 1).toString();

      // 基础状态
      this.conveyorHeartbeat = Number(values.DBW0 ?? 0);
      this.conveyorRunStatus = Number(values.DBW2 ?? 0);

      // DBW4 区域报警
      let word4 = this.convertToWord(values.DBW4 ?? 0);
      this.areaAlarm.bit0 = getBit(word4, 8);
      this.areaAlarm.bit1 = getBit(word4, 9);
      this.areaAlarm.bit2 = getBit(word4, 10);
      this.areaAlarm.bit3 = getBit(word4, 11);
      this.areaAlarm.bit4 = getBit(word4, 12);
      this.areaAlarm.bit5 = getBit(word4, 13);
      this.areaAlarm.bit6 = getBit(word4, 14);
      this.areaAlarm.bit7 = getBit(word4, 15);
      this.areaAlarm.bit8 = getBit(word4, 0);
      this.areaAlarm.bit9 = getBit(word4, 1);
      this.areaAlarm.bit10 = getBit(word4, 2);
      this.areaAlarm.bit11 = getBit(word4, 3);
      this.areaAlarm.bit12 = getBit(word4, 4);
      this.areaAlarm.bit13 = getBit(word4, 5);
      this.areaAlarm.bit14 = getBit(word4, 6);
      this.areaAlarm.bit15 = getBit(word4, 7);

      // DBW6 电机运行信号 01001-01016
      let word6 = this.convertToWord(values.DBW6 ?? 0);
      this.motorRunningWord6.bit0 = getBit(word6, 8);
      this.motorRunningWord6.bit1 = getBit(word6, 9);
      this.motorRunningWord6.bit2 = getBit(word6, 10);
      this.motorRunningWord6.bit3 = getBit(word6, 11);
      this.motorRunningWord6.bit4 = getBit(word6, 12);
      this.motorRunningWord6.bit5 = getBit(word6, 13);
      this.motorRunningWord6.bit6 = getBit(word6, 14);
      this.motorRunningWord6.bit7 = getBit(word6, 15);
      this.motorRunningWord6.bit8 = getBit(word6, 0);
      this.motorRunningWord6.bit9 = getBit(word6, 1);
      this.motorRunningWord6.bit10 = getBit(word6, 2);
      this.motorRunningWord6.bit11 = getBit(word6, 3);
      this.motorRunningWord6.bit12 = getBit(word6, 4);
      this.motorRunningWord6.bit13 = getBit(word6, 5);
      this.motorRunningWord6.bit14 = getBit(word6, 6);
      this.motorRunningWord6.bit15 = getBit(word6, 7);

      // DBW8 电机运行信号 01017-01030
      let word8 = this.convertToWord(values.DBW8 ?? 0);
      this.motorRunningWord8.bit0 = getBit(word8, 8);
      this.motorRunningWord8.bit1 = getBit(word8, 9);
      this.motorRunningWord8.bit2 = getBit(word8, 10);
      this.motorRunningWord8.bit3 = getBit(word8, 11);
      this.motorRunningWord8.bit4 = getBit(word8, 12);
      this.motorRunningWord8.bit5 = getBit(word8, 13);
      this.motorRunningWord8.bit6 = getBit(word8, 14);
      this.motorRunningWord8.bit7 = getBit(word8, 15);
      this.motorRunningWord8.bit8 = getBit(word8, 0);
      this.motorRunningWord8.bit9 = getBit(word8, 1);
      this.motorRunningWord8.bit10 = getBit(word8, 2);
      this.motorRunningWord8.bit11 = getBit(word8, 3);
      this.motorRunningWord8.bit12 = getBit(word8, 4);
      this.motorRunningWord8.bit13 = getBit(word8, 5);
      this.motorRunningWord8.bit14 = getBit(word8, 6);
      this.motorRunningWord8.bit15 = getBit(word8, 7);

      // DBW10 分拣机左右执行
      let word10 = this.convertToWord(values.DBW10 ?? 0);
      this.motorRunningWord10.bit0 = getBit(word10, 8);
      this.motorRunningWord10.bit1 = getBit(word10, 9);
      this.motorRunningWord10.bit2 = getBit(word10, 10);
      this.motorRunningWord10.bit3 = getBit(word10, 11);
      this.motorRunningWord10.bit4 = getBit(word10, 12);
      this.motorRunningWord10.bit5 = getBit(word10, 13);
      this.motorRunningWord10.bit6 = getBit(word10, 14);
      this.motorRunningWord10.bit7 = getBit(word10, 15);
      this.motorRunningWord10.bit8 = getBit(word10, 0);
      this.motorRunningWord10.bit9 = getBit(word10, 1);
      this.motorRunningWord10.bit10 = getBit(word10, 2);
      this.motorRunningWord10.bit11 = getBit(word10, 3);

      // DBW12 光电信号--1
      let word12 = this.convertToWord(values.DBW12 ?? 0);
      this.photoelectricSignal1.bit0 = getBit(word12, 8);
      this.photoelectricSignal1.bit1 = getBit(word12, 9);
      this.photoelectricSignal1.bit2 = getBit(word12, 10);
      this.photoelectricSignal1.bit3 = getBit(word12, 11);
      this.photoelectricSignal1.bit4 = getBit(word12, 12);
      this.photoelectricSignal1.bit5 = getBit(word12, 13);
      this.photoelectricSignal1.bit6 = getBit(word12, 14);
      this.photoelectricSignal1.bit7 = getBit(word12, 15);
      this.photoelectricSignal1.bit8 = getBit(word12, 0);
      this.photoelectricSignal1.bit9 = getBit(word12, 1);
      this.photoelectricSignal1.bit10 = getBit(word12, 2);
      this.photoelectricSignal1.bit11 = getBit(word12, 3);
      this.photoelectricSignal1.bit12 = getBit(word12, 4);
      this.photoelectricSignal1.bit13 = getBit(word12, 5);
      this.photoelectricSignal1.bit14 = getBit(word12, 6);
      this.photoelectricSignal1.bit15 = getBit(word12, 7);

      // DBW14 光电信号--2
      let word14 = this.convertToWord(values.DBW14 ?? 0);
      this.photoelectricSignal2.bit0 = getBit(word14, 8);
      this.photoelectricSignal2.bit1 = getBit(word14, 9);
      this.photoelectricSignal2.bit2 = getBit(word14, 10);
      this.photoelectricSignal2.bit3 = getBit(word14, 11);
      this.photoelectricSignal2.bit4 = getBit(word14, 12);
      this.photoelectricSignal2.bit5 = getBit(word14, 13);
      this.photoelectricSignal2.bit6 = getBit(word14, 14);
      this.photoelectricSignal2.bit7 = getBit(word14, 15);
      this.photoelectricSignal2.bit8 = getBit(word14, 0);
      this.photoelectricSignal2.bit9 = getBit(word14, 1);
      this.photoelectricSignal2.bit10 = getBit(word14, 2);
      this.photoelectricSignal2.bit11 = getBit(word14, 3);
      this.photoelectricSignal2.bit12 = getBit(word14, 4);
      this.photoelectricSignal2.bit13 = getBit(word14, 5);
      this.photoelectricSignal2.bit14 = getBit(word14, 6);
      this.photoelectricSignal2.bit15 = getBit(word14, 7);

      // DBW16 对接WCS信号
      let word16 = this.convertToWord(values.DBW16 ?? 0);
      this.wcsDockWord16.bit0 = getBit(word16, 8);
      this.wcsDockWord16.bit1 = getBit(word16, 9);
      this.wcsDockWord16.bit2 = getBit(word16, 10);
      this.wcsDockWord16.bit3 = getBit(word16, 11);
      this.wcsDockWord16.bit4 = getBit(word16, 12);
      this.wcsDockWord16.bit5 = getBit(word16, 13);
      this.wcsDockWord16.bit6 = getBit(word16, 14);
      this.wcsDockWord16.bit7 = getBit(word16, 15);
      this.wcsDockWord16.bit8 = getBit(word16, 0);
      this.wcsDockWord16.bit9 = getBit(word16, 1);
      this.wcsDockWord16.bit10 = getBit(word16, 2);
      this.wcsDockWord16.bit11 = getBit(word16, 3);
      this.wcsDockWord16.bit12 = getBit(word16, 4);
      this.wcsDockWord16.bit13 = getBit(word16, 5);
      this.wcsDockWord16.bit14 = getBit(word16, 6);
      this.wcsDockWord16.bit15 = getBit(word16, 7);

      // DBW18 分拣口呼叫空托
      let word18 = this.convertToWord(values.DBW18 ?? 0);
      this.wcsDockWord18.bit0 = getBit(word18, 8);
      this.wcsDockWord18.bit1 = getBit(word18, 9);
      this.wcsDockWord18.bit2 = getBit(word18, 10);
      this.wcsDockWord18.bit3 = getBit(word18, 11);
      this.wcsDockWord18.bit4 = getBit(word18, 12);
      this.wcsDockWord18.bit5 = getBit(word18, 13);
      this.wcsDockWord18.bit6 = getBit(word18, 14);
      this.wcsDockWord18.bit7 = getBit(word18, 15);
      this.wcsDockWord18.bit8 = getBit(word18, 0);
      this.wcsDockWord18.bit9 = getBit(word18, 1);
      this.wcsDockWord18.bit10 = getBit(word18, 2);
      this.wcsDockWord18.bit11 = getBit(word18, 3);

      // DBW20 分拣口进货成功
      let word20 = this.convertToWord(values.DBW20 ?? 0);
      this.wcsFeedbackWord20.bit0 = getBit(word20, 8);
      this.wcsFeedbackWord20.bit1 = getBit(word20, 9);
      this.wcsFeedbackWord20.bit2 = getBit(word20, 10);
      this.wcsFeedbackWord20.bit3 = getBit(word20, 11);
      this.wcsFeedbackWord20.bit4 = getBit(word20, 12);
      this.wcsFeedbackWord20.bit5 = getBit(word20, 13);
      this.wcsFeedbackWord20.bit6 = getBit(word20, 14);
      this.wcsFeedbackWord20.bit7 = getBit(word20, 15);
      this.wcsFeedbackWord20.bit8 = getBit(word20, 0);
      this.wcsFeedbackWord20.bit9 = getBit(word20, 1);
      this.wcsFeedbackWord20.bit10 = getBit(word20, 2);
      this.wcsFeedbackWord20.bit11 = getBit(word20, 3);
      this.wcsFeedbackWord20.bit12 = getBit(word20, 4);
      this.wcsFeedbackWord20.bit13 = getBit(word20, 5);
      this.wcsFeedbackWord20.bit14 = getBit(word20, 6);

      // 反馈WCS写虚拟ID
      this.sortPort01TrayId = values.DBB300 ?? '';
      this.sortPort02TrayId = values.DBB330 ?? '';
      this.sortPort03TrayId = values.DBB360 ?? '';
      this.sortPort04TrayId = values.DBB390 ?? '';
      this.sortPort05TrayId = values.DBB420 ?? '';
      this.sortPort06TrayId = values.DBB450 ?? '';
      this.sortPort07TrayId = values.DBB480 ?? '';
      this.sortPort08TrayId = values.DBB520 ?? '';
      this.sortPort09TrayId = values.DBB550 ?? '';
      this.sortPort10TrayId = values.DBB580 ?? '';
      this.sortPort11TrayId = values.DBB610 ?? '';
      this.sortPort12TrayId = values.DBB640 ?? '';
      this.sortPort13TrayId = values.DBB670 ?? '';
      this.spareTrayId = values.DBB700 ?? '';
    });
  },
  methods: {
    async handleSixScanUpload(barcode) {
      if (this.sixScanProcessing) {
        this.addLog('六面扫上货处理中，请稍候');
        return;
      }
      this.sixScanProcessing = true;
      this.addLog(`六面扫开始上货，条码：${barcode}`);
      try {
        const packageInfo = mockPackageByBarcode(barcode);
        this.addLog(
          `已Mock包裹信息，大包号：${packageInfo.packageNo}，客户来源：${
            packageInfo.customerSource || '--'
          }，批次号：${packageInfo.batchNo || '--'}`
        );

        const payload = toOrderInfoPayload(packageInfo);
        const res = await HttpUtil.post('/order_info/save', payload);
        const savedOrder = res && res.data;
        if (!savedOrder || savedOrder.id == null) {
          throw new Error((res && res.message) || '保存订单失败');
        }
        this.addLog(`订单已写入 order_info，ID：${savedOrder.id}`);

        const queueItem = {
          orderInfoId: savedOrder.id,
          packageNo: packageInfo.packageNo,
          trayTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          businessNo: packageInfo.businessNo,
          customerSource: packageInfo.customerSource,
          batchNo: packageInfo.batchNo,
          destinationCountry: packageInfo.destinationCountry,
          channel: packageInfo.channel,
          trayStatus: '1'
        };

        this.queues[0].trayInfo.push(queueItem);
        this.nowScanTrayInfo = toScanDisplayInfo(packageInfo);
        this.lastProcessedBarcode = barcode;

        if (this.selectedQueueIndex === 0) {
          this.showTrays(0);
        }

        this.addLog(
          `六面扫上货成功，大包号：${packageInfo.packageNo}，已加入上货区队列（当前 ${this.queues[0].trayInfo.length} 件）`
        );
        this.$message.success(`大包 ${packageInfo.packageNo} 已上货`);
      } catch (error) {
        console.error('六面扫上货失败:', error);
        this.$message.error(`六面扫上货失败：${error.message || '请重试'}`);
        this.addLog(
          `六面扫上货失败，条码：${barcode}，原因：${error.message || '请重试'}`
        );
      } finally {
        this.sixScanProcessing = false;
      }
    },
    changeQueueExpanded() {
      this.isQueueExpanded = !this.isQueueExpanded;
      // 当展开面板时，刷新当前选中队列的托盘信息
      if (this.isQueueExpanded && this.selectedQueueIndex !== -1) {
        this.showTrays(this.selectedQueueIndex);
      }
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
            ipcRenderer.send('writeValuesToPLC', 'W_DBW2', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'W_DBW2', 0);
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
            ipcRenderer.send('writeValuesToPLC', 'W_DBW4', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'W_DBW4', 0);
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
            ipcRenderer.send('writeSingleValueToPLC', 'W_DBW4', 1);
            setTimeout(() => {
              ipcRenderer.send('writeSingleValueToPLC', 'W_DBW4', 0);
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
            ipcRenderer.send('writeValuesToPLC', 'W_DBW6', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'W_DBW6', 0);
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
            // 把所有的队列，初试状态都清空
            this.queues.forEach((queue) => {
              queue.trayInfo = [];
            });
            this.nowScanTrayInfo = {};
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
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
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
          '.marker, .marker-with-panel, .marker-with-button, .marker-with-flow, .queue-marker, .motor-marker, .preheating-room-marker, .analysis-status-marker'
        );
        const carts = imageWrapper.querySelectorAll('.cart-container');
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

        // 更新小车位置和大小
        carts.forEach((cart) => {
          const x = parseFloat(cart.dataset.x);
          const y = parseFloat(cart.dataset.y);
          const width = parseFloat(cart.dataset.width);
          if (!isNaN(x) && !isNaN(y)) {
            cart.style.left = `${imageOffsetX + x * scaleX}px`;
            cart.style.top = `${imageOffsetY + y * scaleY}px`;
            if (!isNaN(width)) {
              cart.style.width = `${width * scaleX}px`;
            }
          }
        });
      });
    },
    showTrays(index) {
      if (index < 0 || index >= this.queues.length) {
        this.nowTrays = [];
        return;
      }

      this.selectedQueueIndex = index;
      const selectedQueue = this.queues[index];

      if (!selectedQueue) {
        this.nowTrays = [];
        return;
      }

      try {
        // 确保 trayInfo 是数组
        const trayInfo = Array.isArray(selectedQueue.trayInfo)
          ? selectedQueue.trayInfo
          : [];

        this.nowTrays = trayInfo
          .map((tray) => {
            const packageNo = tray.packageNo || tray.trayCode || '';
            return {
              id: packageNo,
              name: packageNo ? `大包 ${packageNo}` : '未知大包',
              time: tray.trayTime || '',
              businessNo: tray.businessNo || tray.orderId || '',
              customerSource: tray.customerSource || tray.productName || '',
              destinationCountry: tray.destinationCountry || tray.unit || '',
              batchNo: tray.batchNo || '',
              channel: tray.channel || ''
            };
          })
          .filter((tray) => tray.id);
      } catch (error) {
        console.error('处理托盘信息时出错:', error);
        this.nowTrays = [];
      }
    },
    handleDragStart(event, tray, queueIndex) {
      if (!tray || queueIndex === undefined) return;

      this.isDragging = true;
      this.draggedTray = tray;
      this.dragSourceQueue = queueIndex;

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tray.id);

      setTimeout(() => {
        event.target.classList.add('dragging');
      }, 0);
    },
    handleDragEnd(event) {
      this.isDragging = false;
      event.target.classList.remove('dragging');
    },
    async handleDrop(targetQueueIndex) {
      if (
        !this.draggedTray ||
        this.dragSourceQueue === null ||
        targetQueueIndex === null
      )
        return;
      if (this.dragSourceQueue === targetQueueIndex) return;

      const sourceQueue = this.queues[this.dragSourceQueue];
      const targetQueue = this.queues[targetQueueIndex];

      if (!sourceQueue || !targetQueue) {
        this.$message.error('队列不存在，无法移动托盘');
        return;
      }

      sourceQueue.trayInfo = Array.isArray(sourceQueue.trayInfo)
        ? sourceQueue.trayInfo
        : [];
      targetQueue.trayInfo = Array.isArray(targetQueue.trayInfo)
        ? targetQueue.trayInfo
        : [];

      try {
        // 确认移动操作
        await this.$confirm(
          `确认将托盘 ${this.draggedTray.id} 从 ${sourceQueue.queueName} 移动到 ${targetQueue.queueName}？`,
          '移动托盘确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        if (!this.draggedTray.id) {
          throw new Error('托盘信息无效');
        }

        const trayIndex = sourceQueue.trayInfo.findIndex(
          (t) => (t.packageNo || t.trayCode) === this.draggedTray.id
        );
        if (trayIndex === -1) {
          throw new Error('找不到要移动的托盘');
        }

        const [movedTray] = sourceQueue.trayInfo.splice(trayIndex, 1);
        targetQueue.trayInfo.push(movedTray);

        // 更新队列数据
        this.updateQueueTrays(sourceQueue.id, sourceQueue.trayInfo);
        this.updateQueueTrays(targetQueue.id, targetQueue.trayInfo);

        const currentQueueIndex = this.selectedQueueIndex;
        if (
          currentQueueIndex === targetQueueIndex ||
          currentQueueIndex === this.dragSourceQueue
        ) {
          this.$nextTick(() => {
            this.showTrays(currentQueueIndex);
          });
        }

        // 添加托盘移动日志
        this.addLog(
          `托盘 ${movedTray.packageNo || movedTray.trayCode} 从 ${
            sourceQueue.queueName
          } 移动到 ${targetQueue.queueName}`
        );

        this.$message({
          type: 'success',
          message: `大包 ${
            movedTray.packageNo || movedTray.trayCode
          } 已成功移动到 ${targetQueue.queueName}`,
          duration: 2000
        });
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return;
        }
        console.error('移动托盘时出错:', error);
        this.$message.error(error.message || '移动托盘失败，请重试');
        this.addLog(`移动大包失败：${error.message || '请重试'}`);
      } finally {
        this.draggedTray = null;
        this.dragSourceQueue = null;
        this.isDragging = false;
      }
    },
    // 添加更新队列托盘的方法
    updateQueueTrays(queueId, trayInfo) {
      // 查找对应ID的队列
      const queueIndex = this.queues.findIndex((queue) => queue.id === queueId);
      if (queueIndex !== -1) {
        // 直接更新前端队列数据
        this.queues[queueIndex].trayInfo = trayInfo;
        // 添加日志
        this.addLog(`队列 ${this.queues[queueIndex].queueName} 数据已更新`);
      } else {
        this.$message.error('找不到队列ID: ' + queueId);
      }
    },
    async deleteTray(tray, index) {
      if (!this.selectedQueue) return;

      try {
        // 确认是否删除
        await this.$confirm(
          '确认要删除该托盘吗？删除后请注意是否需要同步修改PLC队列数据！',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 从队列中移除托盘，直接使用传递的index
        if (index >= 0 && index < this.selectedQueue.trayInfo.length) {
          this.selectedQueue.trayInfo.splice(index, 1);

          // 更新队列数据
          this.updateQueueTrays(
            this.selectedQueue.id,
            this.selectedQueue.trayInfo
          );

          // 刷新显示
          this.showTrays(this.selectedQueueIndex);

          // 添加删除托盘日志
          this.addLog(
            `托盘 ${tray.id} 已从 ${this.selectedQueue.queueName} 删除`
          );

          this.$message.success('托盘删除成功');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除托盘失败，请重试');
        }
      }
    },
    // 上移托盘
    async moveTrayUp(index) {
      if (!this.selectedQueue || index <= 0) return;

      try {
        // 获取当前队列的托盘信息
        const trayInfo = Array.isArray(this.selectedQueue.trayInfo)
          ? this.selectedQueue.trayInfo
          : [];

        const currentTray = trayInfo[index];
        const prevTray = trayInfo[index - 1];

        // 确认上移操作
        await this.$confirm(
          `确认将大包 ${currentTray.id} 上移一位（与 ${prevTray.id} 交换位置）？`,
          '上移托盘确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 交换位置
        trayInfo[index] = prevTray;
        trayInfo[index - 1] = currentTray;

        // 更新队列数据
        this.updateQueueTrays(this.selectedQueue.id, trayInfo);

        // 刷新显示
        this.showTrays(this.selectedQueueIndex);

        // 添加操作日志
        this.addLog(
          `大包 ${currentTray.id} 在 ${this.selectedQueue.queueName} 中上移`
        );

        this.$message.success('托盘上移成功');
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return;
        }
        this.$message.error('托盘上移失败，请重试');
      }
    },
    // 下移托盘
    async moveTrayDown(index) {
      if (!this.selectedQueue || index >= this.nowTrays.length - 1) return;

      try {
        // 获取当前队列的托盘信息
        const trayInfo = Array.isArray(this.selectedQueue.trayInfo)
          ? this.selectedQueue.trayInfo
          : [];

        const currentTray = trayInfo[index];
        const nextTray = trayInfo[index + 1];

        // 确认下移操作
        await this.$confirm(
          `确认将大包 ${currentTray.id} 下移一位（与 ${nextTray.id} 交换位置）？`,
          '下移托盘确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 交换位置
        trayInfo[index] = nextTray;
        trayInfo[index + 1] = currentTray;

        // 更新队列数据
        this.updateQueueTrays(this.selectedQueue.id, trayInfo);

        // 刷新显示
        this.showTrays(this.selectedQueueIndex);

        // 添加操作日志
        this.addLog(
          `大包 ${currentTray.id} 在 ${this.selectedQueue.queueName} 中下移`
        );

        this.$message.success('托盘下移成功');
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return;
        }
        this.$message.error('托盘下移失败，请重试');
      }
    },
    // 点击队列标识
    handleQueueMarkerClick(queueId) {
      // 展开队列面板
      this.isQueueExpanded = true;

      // 找到队列在数组中的索引
      const queueIndex = this.queues.findIndex((q) => q.id === queueId);
      if (queueIndex !== -1) {
        // 选中并显示对应队列
        this.selectedQueueIndex = queueIndex;
        this.showTrays(queueIndex);
      }
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
    toggleBitValue(obj, bit) {
      obj[bit] = obj[bit] === '1' ? '0' : '1';
    },
    convertToWord(value) {
      if (value < 0) {
        return (value & 0xffff) >>> 0; // 负数转换为无符号的16位整数
      } else {
        return value; // 非负数保持不变
      }
    },
    // 从数据库加载队列信息
    loadQueueInfoFromDatabase() {
      HttpUtil.post('/queue_info/queryQueueList', {})
        .then((res) => {
          if (res.data && res.data.length > 0) {
            // 遍历数据库返回的队列信息
            res.data.forEach((queueData) => {
              const queueId = queueData.id;
              const queueIndex = queueId - 1; // 数组索引从0开始，队列ID从1开始

              // 确保队列索引有效
              if (queueIndex >= 0 && queueIndex < this.queues.length) {
                try {
                  // 解析托盘信息JSON字符串
                  const trayInfo = queueData.trayInfo
                    ? JSON.parse(queueData.trayInfo)
                    : [];
                  // 赋值给对应的队列
                  this.queues[queueIndex].trayInfo = Array.isArray(trayInfo)
                    ? trayInfo
                    : [];
                  this.addLog(
                    `已加载队列${queueData.queueName || queueId}的托盘信息，共${
                      this.queues[queueIndex].trayInfo.length
                    }个托盘`
                  );
                } catch (error) {
                  console.error(`解析队列${queueId}的托盘信息失败:`, error);
                  this.queues[queueIndex].trayInfo = [];
                  this.addLog(`队列${queueId}托盘信息解析失败，已重置为空`);
                }
              }
            });
            this.addLog('队列信息加载完成');
          } else {
            this.addLog('数据库中暂无队列信息');
          }
        })
        .catch((err) => {
          console.error('加载队列信息失败:', err);
          this.$message.error('加载队列信息失败: ' + err);
          this.addLog('队列信息加载失败');
        });
    },
    // 切换到报警日志时清除未读状态
    switchToAlarmLog() {
      this.activeLogType = 'alarm';
      // 清除所有报警日志的未读状态
      this.alarmLogs.forEach((log) => {
        log.unread = false;
      });
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateMarkerPositions);
  }
};
</script>
<style lang="less" scoped>
.smart-workshop {
  --mp-surface: #ffffff;
  --mp-surface-muted: #eef2f8;
  --mp-border: #d4deef;
  --mp-border-light: #dce4f2;
  --mp-text: #262626;
  --mp-text-secondary: #8c8c8c;
  --mp-text-muted: #606266;
  --mp-accent: #4385ff;
  --mp-accent-hover: #3e7bfa;
  --mp-accent-deep: #2f54eb;
  --mp-accent-bg: rgba(67, 133, 255, 0.08);
  --mp-accent-bg-hover: rgba(67, 133, 255, 0.14);
  --mp-accent-border: rgba(67, 133, 255, 0.25);
  --mp-module-border: rgba(67, 133, 255, 0.42);
  --mp-module-header-start: #4572ef;
  --mp-module-header-mid: #5594ff;
  --mp-module-header-end: #5ad4f6;
  --mp-module-header-font-size: 17px;
  --mp-module-header-padding: 9px 13px;
  --mp-module-header-height: 38px;
  --mp-shadow: 0 2px 8px rgba(47, 84, 235, 0.08);
  --mp-shadow-lg: 0 4px 14px rgba(47, 84, 235, 0.1);
  width: 100%;
  height: 100%;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  user-select: none;
  color: var(--mp-text);
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
      width: 420px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 5px;
      box-sizing: border-box;
      flex-shrink: 0;
      overflow: hidden;
      .plc-info-section,
      .operation-panel {
        background: var(--mp-surface);
        padding: 0;
        border-radius: 12px;
        box-shadow: var(--mp-shadow);
        border: 1px solid var(--mp-module-border);
        color: var(--mp-text);
        box-sizing: border-box;
        overflow: hidden;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--mp-module-header-font-size);
          color: #fff;
          font-weight: 700;
          margin: 0;
          padding: var(--mp-module-header-padding);
          border-bottom: none;
          background: linear-gradient(
            135deg,
            var(--mp-module-header-start) 0%,
            var(--mp-module-header-mid) 55%,
            var(--mp-module-header-end) 100%
          );
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
          letter-spacing: 0.5px;
          .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .el-button {
            background: rgba(255, 255, 255, 0.16);
            border: 1px solid rgba(255, 255, 255, 0.45);
            color: #fff;
            font-size: 12px;
          }
          .el-button:hover {
            background: rgba(255, 255, 255, 0.28);
            border-color: rgba(255, 255, 255, 0.65);
            color: #fff;
          }
        }
        .scrollable-content {
          overflow-y: auto;
          padding: 10px 12px;
          box-sizing: border-box;
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
              border-radius: 12px;
              background: var(--mp-surface-muted);
              border: 1px solid var(--mp-border);
              box-shadow: none;
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding: 0 12px;
              box-sizing: border-box;
            }

            .data-card-border-borderTop {
              font-weight: 400;
              letter-spacing: 0;
              color: var(--mp-text-secondary);
              text-align: left;
              font-size: 12px;
              line-height: 16px;
              margin-bottom: 4px;
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
              letter-spacing: 0;
              color: var(--mp-text);
              text-align: left;
              font-size: 15px;
              line-height: 20px;
              /* 添加省略号效果 */
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
            }
          }
        }
      }
      .log-section {
        background: var(--mp-surface);
        padding: 0;
        border-radius: 12px;
        box-shadow: var(--mp-shadow);
        border: 1px solid var(--mp-module-border);
        height: 257px;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--mp-module-header-padding);
          color: #fff;
          font-size: var(--mp-module-header-font-size);
          font-weight: 700;
          border-bottom: none;
          background: linear-gradient(
            135deg,
            var(--mp-module-header-start) 0%,
            var(--mp-module-header-mid) 55%,
            var(--mp-module-header-end) 100%
          );
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
          letter-spacing: 0.5px;
          .log-tabs {
            display: flex;
            gap: 4px;
            background: rgba(0, 0, 0, 0.08);
            padding: 3px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.18);
          }
          .log-tab {
            position: relative;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.82);
            cursor: pointer;
            padding: 3px 11px;
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
            color: var(--mp-accent-deep);
            background: #fff;
            font-weight: 600;
          }
          .log-tab:hover:not(.active) {
            color: #fff;
            background: rgba(255, 255, 255, 0.16);
          }
        }
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 6px 8px;
          box-sizing: border-box;
          .log-list {
            padding: 0;
            width: 100%;
            box-sizing: border-box;
            .log-item {
              background: var(--mp-surface-muted);
              border-radius: 4px;
              padding: 10px;
              margin-bottom: 8px;
              cursor: pointer;
              width: 100%;
              box-sizing: border-box;
              border: 1px solid var(--mp-border);
              .log-time {
                font-size: 12px;
                color: var(--mp-text-secondary);
                margin-bottom: 6px;
              }
              .log-item-content {
                color: var(--mp-text);
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
              background: #eef2f8;
              border-color: var(--mp-accent-border);
            }

            .log-item.alarm {
              background: rgba(245, 108, 108, 0.06);
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
              color: var(--mp-text-secondary);
              i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #c0c4cc;
              }
              p {
                font-size: 14px;
                margin: 0 0 16px 0;
              }
              .el-button {
                color: #4385ff;
                font-size: 14px;
                i {
                  font-size: 14px;
                  margin-right: 4px;
                  color: inherit;
                }
              }
              .el-button:hover {
                color: #3e7bfa;
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
          background: rgba(67, 133, 255, 0.12);
          border-radius: 2px;
        }

        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(67, 133, 255, 0.25);
        }
      }
      .operation-panel {
        .operation-buttons {
          display: flex;
          justify-content: flex-start;
          gap: 8px;
          margin-top: 0;
          padding: 10px 12px;
          box-sizing: border-box;
          button {
            width: 70px;
            height: 70px;
            font-size: 0.8em;
            color: #fff;
            background: linear-gradient(135deg, #4385ff, #2f54eb);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(67, 133, 255, 0.25);
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
            background: linear-gradient(135deg, #5a9bff, #4385ff);
            box-shadow: 0 6px 16px rgba(67, 133, 255, 0.35);
          }
          button.pressed {
            transform: scale(0.98);
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.55);
          }
          button.btn-start.pressed {
            background: linear-gradient(135deg, #52c41a, #237804);
          }
          button.btn-start.pressed:hover {
            background: linear-gradient(135deg, #73d13d, #389e0d);
          }
          button.btn-stop.pressed {
            background: linear-gradient(135deg, #ff4d4f, #a8071a);
          }
          button.btn-stop.pressed:hover {
            background: linear-gradient(135deg, #ff7875, #cf1322);
          }
          button.btn-reset.pressed {
            background: linear-gradient(135deg, #faad14, #d48806);
          }
          button.btn-reset.pressed:hover {
            background: linear-gradient(135deg, #ffc53d, #fa8c16);
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
            background: #ffffff;
            padding: 4px 6px 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--mp-border);
            min-height: 0;
            margin: 0;
            height: calc(100% - var(--mp-module-header-height));
            position: relative;
            box-sizing: border-box;

            .floor-map-legend {
              position: absolute;
              bottom: 10px;
              left: 10px;
              z-index: 20;
              display: flex;
              flex-direction: column;
              gap: 6px;
              padding: 8px 10px;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.96) 0%,
                rgba(245, 248, 252, 0.94) 100%
              );
              border: 1px solid var(--mp-border);
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              pointer-events: none;

              .legend-item {
                display: grid;
                grid-template-columns: 18px 1fr;
                align-items: center;
                column-gap: 8px;
              }

              .legend-text {
                display: flex;
                flex-direction: column;
                gap: 1px;
                line-height: 1.2;
                min-width: 0;
              }

              .legend-name {
                font-size: 12px;
                font-weight: 600;
                color: var(--mp-text);
              }

              .legend-desc {
                font-size: 10px;
                color: var(--mp-text-muted, #6b7280);
              }

              .legend-dot {
                justify-self: center;
                display: inline-block;
                width: 10px;
                height: 10px;
                font-style: normal;

                &--photo {
                  border-radius: 50%;
                  background: rgba(128, 128, 128, 0.85);
                }

                &--motor {
                  border-radius: 1px;
                  background: rgba(128, 128, 128, 0.85);
                }
              }

              .legend-arrow {
                justify-self: center;
                position: relative;
                display: inline-block;
                width: 18px;
                height: 10px;
                font-style: normal;

                &::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 8px;
                  height: 6px;
                  background-color: #4385ff;
                }

                &::after {
                  content: '';
                  position: absolute;
                  left: 6px;
                  top: 50%;
                  transform: translateY(-50%) rotate(45deg);
                  width: 0;
                  height: 0;
                  border-right: 8px solid #4385ff;
                  border-bottom: 8px solid transparent;
                }
              }
            }

            .image-wrapper {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: white;
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
                  background: #4385ff;
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

              /* 流水线流动箭头容器定位（置于光电/电机之下，避免遮挡点位） */
              .marker-with-flow {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 1;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
              }

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
                  padding: 12px;
                  width: 170px;
                  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                  opacity: 0;
                  transition: all 0.3s ease;
                  pointer-events: none;
                  .data-panel-header {
                    font-size: 14px;
                    color: #409eff;
                    margin-bottom: 6px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(64, 158, 255, 0.2);
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
          background: var(--mp-surface);
          padding: 0;
          border-radius: 12px;
          box-shadow: var(--mp-shadow);
          border: 1px solid var(--mp-module-border);
          color: var(--mp-text);
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
          .floor-title {
            font-size: var(--mp-module-header-font-size);
            color: #fff;
            font-weight: 700;
            padding: var(--mp-module-header-padding);
            flex-shrink: 0;
            border-bottom: none;
            background: linear-gradient(
              135deg,
              var(--mp-module-header-start) 0%,
              var(--mp-module-header-mid) 55%,
              var(--mp-module-header-end) 100%
            );
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
            letter-spacing: 0.5px;
            i {
              margin-right: 6px;
            }
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
  .side-info-panel-queue {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: 0;
    box-sizing: border-box;
    transition: all 0.3s ease;
    pointer-events: auto;
    /* 基础样式 */
    .queue-section {
      background: rgba(30, 42, 56);
      border-radius: 15px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
      color: #f5f5f5;
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.1);
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: color 0.3s ease;
        font-size: 20px;
        color: #7eb8ff;
        font-weight: 900;
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
      }
      .expandable-content-queue {
        flex: 1;
        min-height: 0;
        display: flex;
        overflow: hidden;
        height: calc(100% - 50px);
        .queue-container {
          flex: 1;
          display: flex;
          background: rgba(30, 42, 56, 0.9);
          border-radius: 12px;
          padding: 15px;
          gap: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          min-height: 0;
          box-sizing: border-box;
          .queue-container-left {
            width: 280px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding-right: 15px;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            height: 100%;
            min-height: 0;
            /* 队列项样式 */
            .queue {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: rgba(48, 65, 85, 0.9);
              border-radius: 8px;
              padding: 12px 15px;
              margin-bottom: 8px;
              cursor: pointer;
              transition: all 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.15);
              .tray-count {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 10px;
                min-width: 24px;
                text-align: center;
              }
            }

            .queue:hover {
              background: rgba(48, 65, 85, 1);
              border-color: rgba(64, 158, 255, 0.45);
              transform: translateX(2px);
            }

            .queue.active {
              background: rgba(64, 158, 255, 0.14);
              border-color: rgba(64, 158, 255, 0.45);
            }
          }
          /* 滚动条样式 */
          .queue-container-left::-webkit-scrollbar,
          .tray-list::-webkit-scrollbar {
            width: 4px;
          }

          .queue-container-left::-webkit-scrollbar-track,
          .tray-list::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
          }

          .queue-container-left::-webkit-scrollbar-thumb,
          .tray-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }

          .queue-container-left::-webkit-scrollbar-thumb:hover,
          .tray-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .queue-container-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0 15px;
            height: 100%;
            min-height: 0;
            .selected-queue-header {
              flex-shrink: 0;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
              h3 {
                margin: 0;
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
              }
              .queue-header-actions {
                display: flex;
                align-items: center;
                gap: 12px;
                .el-button {
                  background: rgba(64, 158, 255, 0.18);
                  border: 1px solid rgba(64, 158, 255, 0.3);
                  color: #7eb8ff;
                }
                .el-button:hover:not(:disabled) {
                  background: rgba(64, 158, 255, 0.28);
                  border-color: rgba(64, 158, 255, 0.45);
                  color: #fff;
                }
                .tray-total {
                  background: rgba(255, 255, 255, 0.1);
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 13px;
                  padding: 4px 12px;
                  border-radius: 15px;
                  cursor: pointer;
                }
              }
            }
            .tray-list {
              flex: 1;
              overflow-y: auto;
              min-height: 0;
              padding-right: 5px;

              /* 托盘项样式 */
              .tray-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(48, 65, 85, 0.9);
                margin: 0 0 8px 0;
                padding: 12px 15px;
                border-radius: 8px;
                cursor: move;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.15);
                position: relative;

                .tray-info {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  width: 100%;
                  .tray-info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    .tray-name {
                      font-weight: 500;
                      color: rgba(255, 255, 255, 0.9);
                      font-size: 14px;
                    }

                    .tray-batch-group {
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      flex-wrap: wrap;
                      justify-content: flex-end;
                    }

                    .tray-batch {
                      font-size: 12px;
                      color: #7eb8ff;
                      background: rgba(64, 158, 255, 0.1);
                      padding: 2px 8px;
                      border-radius: 4px;
                      white-space: nowrap;

                      .sequence-number {
                        color: #ffa500;
                        font-weight: bold;
                        margin-left: 4px;
                      }
                    }

                    .tray-detail {
                      font-size: 11px;
                      color: rgba(255, 255, 255, 0.7);
                      word-break: break-word;
                      line-height: 1.4;
                      flex: 1;
                      text-align: left;
                    }
                  }
                  .tray-time {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                  }
                }
                .tray-actions {
                  display: flex;
                  gap: 4px;
                  position: absolute;
                  right: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  opacity: 0;
                  transition: opacity 0.3s ease;
                }

                .move-btn {
                  width: 24px;
                  height: 24px;
                  padding: 0;
                  border-radius: 50%;

                  &:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                  }

                  &:not(.is-disabled):hover {
                    background-color: #409eff;
                    border-color: #409eff;
                  }
                }

                .el-button {
                  &:not(.move-btn) {
                    width: 24px;
                    height: 24px;
                    padding: 0;
                    border-radius: 50%;
                  }
                }
              }
              .tray-item:hover {
                background: rgba(48, 65, 85, 1);
                border-color: rgba(64, 158, 255, 0.45);
                transform: translateX(2px);
                .tray-actions {
                  opacity: 1;
                }
              }
              .tray-item:last-child {
                margin-bottom: 0;
              }
              .tray-item.dragging {
                opacity: 0.6;
                transform: scale(0.98);
                border: 1px dashed rgba(255, 255, 255, 0.3);
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
                  color: #7eb8ff;
                  font-size: 14px;
                  i {
                    font-size: 14px;
                    margin-right: 4px;
                    color: inherit;
                  }
                }
                .el-button:hover {
                  color: #6aabf5;
                }
              }
            }
          }
        }
      }
    }
    /* 展开状态的样式 */
    .queue-section.expanded {
      padding: 15px;
      width: 850px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    /* 收起状态的样式 */
    .queue-section:not(.expanded) {
      width: 40px;
      height: 40px;
      padding: 0;
      background: none;
      box-shadow: none;
      border: none;
      .section-header {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #4385ff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(67, 133, 255, 0.25);
        transition: all 0.3s ease;
        padding: 0;
        span {
          display: none;
        }
        i {
          color: #fff;
          font-size: 20px;
          animation: rotate 10s linear infinite;
        }
      }
      .section-header:hover {
        transform: scale(1.1);
        background: #3e7bfa;
      }
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

/* 添加新的测试面板样式 */
.test-panel-container {
  position: absolute; /* 修改位置，为测试按钮留出空间 */
  right: 80px; /* 修改位置，为队列按钮留出空间 */
  top: 20px;
  z-index: 1000;
}

.test-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4385ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(67, 133, 255, 0.25);
  transition: all 0.3s ease;
}

.test-toggle-btn:hover {
  transform: scale(1.1);
  background: #3e7bfa;
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
  border: 1px solid rgba(64, 158, 255, 0.25);
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
  background: rgba(64, 158, 255, 0.15);
  border-radius: 15px 15px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7eb8ff;
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
  background: rgba(64, 158, 255, 0.28);
  border-radius: 2px;
}

.test-panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.45);
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
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.test-label {
  display: block;
  color: #7eb8ff;
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
  background: rgba(64, 158, 255, 0.18);
  border: 1px solid rgba(64, 158, 255, 0.35);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.position-btn:hover {
  background: rgba(64, 158, 255, 0.32);
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
  background: rgba(64, 158, 255, 0.14);
  border: 1px solid rgba(64, 158, 255, 0.25);
  color: #7eb8ff;
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
  background-color: #409eff;
  height: 6px;
}

.cart-position-slider :deep(.el-slider__button) {
  border: 2px solid #409eff;
  background-color: #fff;
  width: 20px;
  height: 20px;
}

.cart-position-slider :deep(.el-slider__button:hover) {
  border-color: #409eff;
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.45);
}

/* 测试添加结束 */

.qrcode-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.qrcode-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qrcode-label {
  width: 80px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.send-label {
  width: 60px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.qrcode-input {
  flex: 1;
}

.qrcode-input :deep(.el-input__inner) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.25);
  color: #fff;
}

.qrcode-input :deep(.el-input__inner:hover),
.qrcode-input :deep(.el-input__inner:focus) {
  border-color: #409eff;
}

.qrcode-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.qrcode-actions .el-button {
  background: rgba(64, 158, 255, 0.14);
  border: 1px solid rgba(64, 158, 255, 0.25);
  color: #7eb8ff;
}

.qrcode-actions .el-button:hover {
  background: rgba(64, 158, 255, 0.28);
  border-color: rgba(64, 158, 255, 0.45);
  color: #fff;
}

/* PLC 变量写入测试分组样式 */
.plc-test-wrapper :deep(.el-collapse) {
  border: none;
  background: transparent;
}

.plc-test-wrapper :deep(.el-collapse-item__header) {
  background: rgba(64, 158, 255, 0.1);
  color: #7eb8ff;
  border: none;
  padding: 0 10px;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 13px;
}

.plc-test-wrapper :deep(.el-collapse-item__header.is-active) {
  background: rgba(64, 158, 255, 0.18);
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
  width: 70px;
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
  border: 1px solid rgba(64, 158, 255, 0.25);
  color: #fff;
}

.plc-test-wrapper :deep(.el-button--mini) {
  padding: 4px 8px;
  min-width: 32px;
}

/* 添加队列移动相关样式 */
.queue-move-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.queue-select-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.queue-move-label {
  width: 60px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.queue-move-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.upload-area-actions {
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.upload-area-actions .el-button {
  background: rgba(64, 158, 255, 0.14);
  border: 1px solid rgba(64, 158, 255, 0.25);
  color: #7eb8ff;
  width: 100%;
}

.upload-area-actions .el-button:hover:not(:disabled) {
  background: rgba(64, 158, 255, 0.28);
  border-color: rgba(64, 158, 255, 0.45);
  color: #fff;
}

.upload-area-actions .el-button:disabled {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
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
  color: #7eb8ff;
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
  border: 1px solid rgba(64, 158, 255, 0.1);
  margin-bottom: 5px;

  .quantity-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    min-width: 30px;
  }

  .quantity-value {
    font-size: 14px;
    color: #7eb8ff;
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
      background: rgba(64, 158, 255, 0.18);
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
        background: rgba(64, 158, 255, 0.32);
        &:hover {
          background: rgba(64, 158, 255, 0.48);
        }
      }

      &.minus {
        background: rgba(245, 108, 108, 0.3);
        &:hover {
          background: rgba(245, 108, 108, 0.5);
        }
      }
    }
  }
}

/* 添加新的测试面板样式 */
.task-test-container {
  margin-top: 10px;

  .task-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

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
    color: #7eb8ff;
    font-size: 16px;

    &:hover {
      color: #fff;
      transform: scale(1.1);
    }
  }
}

/* 流动箭头（scoped 根级；配色与页面 --mp-accent 主题一致） */
.conveyor-arrow-item {
  position: relative;
  display: inline-block;
  width: 45px;
  height: 34px;
}
.conveyor-arrow-item::before {
  content: '';
  display: inline-block;
  position: relative;
  width: 20px;
  height: 16px;
  background-color: #4385ff;
}
.conveyor-arrow-item::after {
  content: '';
  position: relative;
  top: 4px;
  right: 12px;
  display: inline-block;
  width: 0;
  height: 0;
  border-right: 24px solid #4385ff;
  border-bottom: 24px solid transparent;
  transform: rotate(45deg);
}

.flow-item {
  height: 34px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  backface-visibility: hidden;
  .conveyor-arrow-item {
    position: relative;
    animation: carousel 1s linear infinite;
    will-change: transform;
  }
}

@keyframes carousel {
  0% {
    transform: translateX(-45px) translateZ(0);
  }
  100% {
    transform: translateX(0px) translateZ(0);
  }
}
</style>
