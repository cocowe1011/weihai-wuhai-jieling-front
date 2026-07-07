<template>
  <div class="smart-workshop">
    <!-- 内容区包装器 -->
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="side-info-panel">
        <!-- PLC状态与订单信息区域 -->
        <div class="plc-info-section">
          <div class="section-header">当前扫码信息</div>
          <div class="scrollable-content">
            <div class="status-overview">
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop granient-text">
                    虚拟id
                  </div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.virtualId || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">目的地</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.destination || '--' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单信息列表区域 -->
        <div class="order-list-section">
          <div class="section-header">
            <div class="section-title">
              订单信息列表
              <div class="title-actions">
                <div
                  class="refresh-btn"
                  @click="refreshOrders"
                  :class="{ 'is-loading': isRefreshing }"
                >
                  <i class="el-icon-refresh"></i>
                </div>
                <div
                  class="add-order-btn"
                  @click="showAddOrderDialog"
                  title="新建订单"
                >
                  <i class="el-icon-plus"></i>
                </div>
              </div>
            </div>
            <div class="order-actions">
              <el-button
                type="primary"
                size="small"
                @click="showHistoryOrders"
                icon="el-icon-time"
              >
                历史订单
              </el-button>
            </div>
          </div>
          <div class="scrollable-content">
            <div class="order-list" v-if="ordersList.length > 0">
              <div
                v-for="order in ordersList"
                :key="order.id"
                class="order-item"
                :class="
                  order.orderStatus === 0
                    ? 'pending'
                    : order.orderStatus === 1
                    ? 'running'
                    : 'complete'
                "
              >
                <div class="order-header">
                  <div class="order-header-left">
                    <span class="order-id">{{ order.orderId }}</span>
                    <span
                      class="order-status"
                      :class="{ running: order.orderStatus === 1 }"
                    >
                      <i
                        v-if="order.orderStatus === 1"
                        class="el-icon-loading"
                      ></i>
                      {{ getStatusText(order.orderStatus) }}
                    </span>
                  </div>
                  <div class="order-header-actions">
                    <button
                      v-if="order.orderStatus === 0"
                      class="order-action-btn order-action-btn--execute"
                      :class="{ loading: order.isLoading }"
                      @click="showExecuteOrderDialog(order)"
                      :disabled="order.isLoading"
                    >
                      <i v-if="order.isLoading" class="el-icon-loading"></i>
                      <span>执行</span>
                    </button>
                    <button
                      v-if="order.orderStatus === 0"
                      class="order-action-btn order-action-btn--edit"
                      @click="showEditOrderDialog(order)"
                      :disabled="order.isLoading || order.isDeleting"
                    >
                      <i class="el-icon-edit"></i>
                      <span>修改</span>
                    </button>
                    <button
                      v-if="order.orderStatus === 0"
                      class="order-action-btn order-action-btn--delete"
                      :class="{ loading: order.isDeleting }"
                      @click="deleteOrder(order)"
                      :disabled="order.isDeleting"
                    >
                      <i v-if="order.isDeleting" class="el-icon-loading"></i>
                      <i v-else class="el-icon-delete"></i>
                      <span>删除</span>
                    </button>
                    <button
                      v-if="order.orderStatus === 1"
                      class="order-action-btn order-action-btn--complete"
                      :class="{ loading: order.isLoading }"
                      @click="finishOrder(order)"
                      :disabled="order.isLoading"
                    >
                      <i v-if="order.isLoading" class="el-icon-loading"></i>
                      <span>完成</span>
                    </button>
                    <button
                      v-if="order.orderStatus === 1"
                      class="order-action-btn order-action-btn--cancel"
                      :class="{ loading: order.isLoading }"
                      @click="cancelOrder(order)"
                      :disabled="order.isLoading"
                    >
                      <i v-if="order.isLoading" class="el-icon-loading"></i>
                      <span>取消</span>
                    </button>
                  </div>
                </div>
                <div class="order-info">
                  <div class="info-row">
                    <span class="info-label">名称</span>
                    <span class="info-value">{{ order.orderName }}</span>
                    <span class="info-label">产品</span>
                    <span class="info-value">{{ order.productName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">批号</span>
                    <span class="info-value">{{ order.batchNo }}</span>
                    <span class="info-label">数量</span>
                    <span class="info-value">{{ order.orderQuantity }}</span>
                    <span class="info-label">已上货</span>
                    <span class="info-value">{{
                      order.loadedQuantity || 0
                    }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">时间</span>
                    <span class="info-value">{{ order.createTime }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="el-icon-document"></i>
              <p>暂无订单信息</p>
              <el-button
                type="text"
                @click="refreshOrders"
                class="refresh-link"
              >
                <i class="el-icon-refresh"></i>
                点击刷新
              </el-button>
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
                <!-- <span class="legend-item">
                  <i class="legend-arrow"></i>
                  <span class="legend-text">
                    <span class="legend-name">箭头</span>
                    <span class="legend-desc">输送线物料流向</span>
                  </span>
                </span> -->
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
                  class="queue-marker queue-marker--narrow"
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
                <!-- 小车元素 -->
                <div
                  v-for="cart in carts"
                  :key="cart.name"
                  class="cart-container"
                  :data-cart-id="cart.id"
                  :data-x="cart.x"
                  :data-y="cart.y"
                  :data-width="cart.width"
                >
                  <img :src="cart.image" :alt="cart.name" class="cart-image" />
                </div>
                <!-- 预热房到灭菌柜执行 -->
                <div
                  class="preheating-room-marker"
                  data-x="1000"
                  data-y="1550"
                  style="width: 160px"
                >
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">预热房到灭菌柜选择</div>
                    <div class="preheating-room-body">
                      <div style="display: flex; align-items: center">
                        <el-select
                          v-model="preheatToSterilizeFrom"
                          placeholder="预热"
                          size="mini"
                        >
                          <el-option
                            v-for="i in 12"
                            :key="i"
                            :label="String(i)"
                            :value="String(i)"
                          />
                        </el-select>
                        <span
                          style="font-size: 12px; color: #fff; margin-left: 5px"
                          >到：</span
                        >
                        <el-select
                          v-model="preheatToSterilizeTo"
                          placeholder="灭菌"
                          size="mini"
                        >
                          <el-option
                            v-for="i in 15"
                            :key="i"
                            :label="String(i + 18)"
                            :value="String(i + 18)"
                          />
                        </el-select>
                      </div>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="executePreheatToSterilize"
                        :loading="preheatToSterilizeLoading"
                        style="width: 100%"
                        >执行</el-button
                      >
                    </div>
                  </div>
                </div>
                <!-- 灭菌柜到解析房执行 -->
                <div
                  class="preheating-room-marker"
                  data-x="1650"
                  data-y="110"
                  style="width: 160px"
                >
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">灭菌柜到解析房选择</div>
                    <div class="preheating-room-body">
                      <div style="display: flex; align-items: center">
                        <el-select
                          v-model="sterToAnalysisFrom"
                          placeholder="灭菌"
                          size="mini"
                        >
                          <el-option
                            v-for="i in 15"
                            :key="'ster-out-' + (i + 18)"
                            :label="String(i + 18)"
                            :value="String(i + 18)"
                          />
                        </el-select>
                        <span
                          style="font-size: 12px; color: #fff; margin-left: 5px"
                          >到：</span
                        >
                        <el-select
                          v-model="sterToAnalysisTo"
                          placeholder="解析"
                          size="mini"
                          clearable
                        >
                          <el-option label="自动" value="" />
                          <el-option
                            v-for="i in 19"
                            :key="'analysis-' + i"
                            :label="String(i)"
                            :value="String(i)"
                          />
                        </el-select>
                      </div>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="executeSterToAnalysis"
                        :loading="sterToAnalysisLoading"
                        style="width: 100%"
                        >执行</el-button
                      >
                      <el-button
                        v-if="sterToAnalysisExecuting"
                        type="danger"
                        size="mini"
                        @click="cancelSterToAnalysis"
                        style="width: 100%; margin-left: 0px"
                        >取消</el-button
                      >
                      <div
                        style="display: flex; align-items: center"
                        v-if="sterToAnalysisExecuting"
                      >
                        <span
                          style="
                            font-size: 12px;
                            color: #fff;
                            color: greenyellow;
                          "
                          >执行中：{{ sterToAnalysisTrayCode || '--' }}</span
                        >
                      </div>
                      <div
                        style="font-size: 12px; color: #9fe3d3"
                        v-if="sterToAnalysisExecuting"
                      >
                        解析房：<b>{{ sterToAnalysisResolvedTo || '自动' }}</b>
                        已发送：<b>{{ sterToAnalysisSentCount }}</b>
                      </div>
                    </div>
                  </div>
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
                  <el-button
                    type="primary"
                    size="small"
                    @click="showAddTrayDialog"
                    :disabled="!selectedQueue"
                    icon="el-icon-plus"
                  >
                    添加托盘
                  </el-button>
                  <span class="tray-total"
                    >托盘数量: {{ selectedQueue.trayInfo?.length || 0 }}</span
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
                        <div class="tray-batch-group">
                          <span class="tray-batch">
                            <span>
                              {{
                                tray.isTerile === 1 ? '消毒' : '不消毒'
                              }}</span
                            >
                          </span>
                        </div>
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >订单ID：{{ tray.orderId || '--' }}</span
                        >
                        <span class="tray-detail"
                          >物料编码：{{ tray.productCode || '--' }}</span
                        >
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >产品名称：{{ tray.productName || '--' }}</span
                        >
                        <span class="tray-detail"
                          >规格：{{ tray.unit || '--' }}</span
                        >
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >批次：{{ tray.batchNo || '--' }}</span
                        >
                        <span class="tray-detail"
                          >备注：{{ tray.remark || '--' }}</span
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
          <div class="test-section">
            <span class="test-label">小车位置测试:</span>
            <div class="cart-position-test-container">
              <div
                v-for="cartId in 5"
                :key="'cart-slider-' + cartId"
                class="cart-position-group"
              >
                <div class="cart-position-label">
                  <span
                    >小车{{ cartId }} ({{
                      cartPlcRanges['cart' + cartId].min
                    }}-{{ cartPlcRanges['cart' + cartId].max }}):</span
                  >
                  <span class="cart-value">{{
                    cartPositionValues['cart' + cartId]
                  }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues['cart' + cartId]"
                    :min="cartPlcRanges['cart' + cartId].min"
                    :max="cartPlcRanges['cart' + cartId].max"
                    :step="1"
                    class="cart-position-slider"
                  ></el-slider>
                </div>
              </div>
            </div>
          </div>
          <!-- 上货请求信号手动触发 -->
          <div class="test-section">
            <span class="test-label">上货请求信号测试:</span>
            <div class="task-test-container">
              <div class="task-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="manualTriggerUploadRequest"
                >
                  模拟上货信号 ({{ floor1UploadTrayRequest.bit0 }})
                </el-button>
              </div>
            </div>
          </div>
          <!-- 灭菌柜完成数量模拟 -->
          <div class="test-section">
            <span class="test-label">灭菌柜数量测试(完成):</span>
            <div class="steril-quantity-test-grid">
              <div
                v-for="cabinetNo in 15"
                :key="'steril-qty-' + (cabinetNo + 18)"
                class="steril-quantity-item"
              >
                <span class="steril-quantity-label">{{ cabinetNo + 18 }}</span>
                <span class="steril-quantity-value">{{
                  getSterilizationCompleteQuantity(cabinetNo + 18)
                }}</span>
                <div class="steril-quantity-buttons">
                  <button
                    class="quantity-btn plus"
                    @click="
                      updateSterilizationCompleteQuantity(cabinetNo + 18, 1)
                    "
                  >
                    +
                  </button>
                  <button
                    class="quantity-btn minus"
                    @click="
                      updateSterilizationCompleteQuantity(cabinetNo + 18, -1)
                    "
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建订单弹窗 -->
    <el-dialog
      title="新建订单"
      :visible.sync="addOrderDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <el-form
        ref="newOrderForm"
        :model="newOrderForm"
        :rules="orderFormRules"
        label-width="120px"
        size="small"
      >
        <el-form-item label="订单编号" prop="orderId">
          <el-input
            v-model="newOrderForm.orderId"
            placeholder="请输入订单编号"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="订单名称" prop="orderName">
          <el-input
            v-model="newOrderForm.orderName"
            placeholder="请输入订单名称"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="批号" prop="batchNo">
          <el-input
            v-model="newOrderForm.batchNo"
            placeholder="请输入批号"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input
            v-model="newOrderForm.productName"
            placeholder="请输入产品名称"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="工艺名称" prop="processName">
          <el-input
            v-model="newOrderForm.processName"
            placeholder="请输入工艺名称"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="订单数量" prop="orderQuantity">
          <el-input-number
            v-model="newOrderForm.orderQuantity"
            :min="1"
            placeholder="请输入订单数量"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddOrder">取消</el-button>
        <el-button
          type="primary"
          @click="submitAddOrder"
          :loading="isSubmittingOrder"
        >
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 执行订单弹窗 -->
    <el-dialog
      title="设置订单-执行"
      :visible.sync="executeOrderDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form
        ref="executeOrderForm"
        :model="executeOrderForm"
        :rules="executeOrderRules"
        label-width="130px"
        size="small"
      >
        <el-form-item label="订单编号">
          <el-input v-model="executeOrderForm.orderId" readonly size="small" />
        </el-form-item>
        <el-form-item label="订单名称">
          <el-input
            v-model="executeOrderForm.orderName"
            readonly
            size="small"
          />
        </el-form-item>
        <el-form-item label="灭菌柜目的地" prop="destination">
          <el-select
            v-model="executeOrderForm.destination"
            placeholder="请选择灭菌柜目的地"
            style="width: 100%"
          >
            <el-option
              v-for="i in 15"
              :key="i"
              :label="String(i + 18)"
              :value="String(i + 18)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="解析时间" prop="analysisTime">
          <el-input-number
            v-model="executeOrderForm.analysisTime"
            :min="1"
            :max="720"
            placeholder="请输入解析时间"
            style="width: calc(100% - 42px)"
          />
          <span style="margin-left: 8px; color: #909399">小时</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="executeOrderDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitExecuteOrder"
          :loading="isExecutingOrder"
        >
          确认执行
        </el-button>
      </div>
    </el-dialog>

    <!-- 历史订单弹窗 -->
    <el-dialog
      title="历史订单"
      :visible.sync="historyDialogVisible"
      width="80%"
      append-to-body
      :before-close="handleHistoryDialogClose"
    >
      <div>
        <div
          style="
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          "
        >
          订单编号：
          <el-input
            v-model="historyFilter.orderId"
            placeholder="订单编号"
            clearable
            style="width: 180px"
          />
          订单名称：
          <el-input
            v-model="historyFilter.orderName"
            placeholder="订单名称"
            clearable
            style="width: 180px"
          />
          订单状态：
          <el-select
            v-model="historyFilter.orderStatus"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="未开始" :value="0" />
            <el-option label="执行中" :value="1" />
            <el-option label="已完成" :value="2" />
          </el-select>
          <el-button type="primary" @click="searchHistoryOrders"
            >查询</el-button
          >
          <el-button @click="resetHistoryFilters">重置</el-button>
        </div>
        <el-table
          :data="historyOrders"
          style="width: 100%"
          border
          stripe
          max-height="400"
        >
          <el-table-column prop="orderId" label="订单编号" width="140" />
          <el-table-column
            prop="orderName"
            label="订单名称"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="batchNo"
            label="批号"
            width="120"
            show-overflow-tooltip
          />
          <el-table-column
            prop="productName"
            label="产品名称"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column
            prop="processName"
            label="工艺名称"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column prop="orderQuantity" label="订单数量" width="90" />
          <el-table-column prop="loadedQuantity" label="已上货" width="80" />
          <el-table-column prop="destination" label="目的地" width="80" />
          <el-table-column prop="analysisTime" label="解析时间" width="90">
            <template slot-scope="scope">
              {{
                scope.row.analysisTime != null
                  ? scope.row.analysisTime + 'h'
                  : '--'
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="orderStatus"
            label="状态"
            width="90"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                :type="getStatusTagType(scope.row.orderStatus)"
                size="small"
              >
                {{ getStatusText(scope.row.orderStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="160"
            show-overflow-tooltip
          />
          <el-table-column prop="createrName" label="创建人" width="90" />
          <el-table-column prop="executorName" label="执行人" width="90" />
          <el-table-column prop="finisherName" label="完成人" width="90" />
          <el-table-column
            prop="finishTime"
            label="完成时间"
            width="160"
            show-overflow-tooltip
          />
        </el-table>
        <div
          class="pagination-container"
          style="margin-top: 20px; text-align: right"
        >
          <el-pagination
            @size-change="handleHistorySizeChange"
            @current-change="handleHistoryCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalHistoryOrders"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 修改订单弹窗 -->
    <el-dialog
      title="修改订单"
      :visible.sync="editOrderDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <el-form
        ref="editOrderForm"
        :model="editOrderForm"
        :rules="editOrderRules"
        label-width="120px"
        size="small"
      >
        <el-form-item label="订单编号" prop="orderId">
          <el-input
            v-model="editOrderForm.orderId"
            placeholder="请输入订单编号"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="订单名称" prop="orderName">
          <el-input
            v-model="editOrderForm.orderName"
            placeholder="请输入订单名称"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="批号" prop="batchNo">
          <el-input
            v-model="editOrderForm.batchNo"
            placeholder="请输入批号"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input
            v-model="editOrderForm.productName"
            placeholder="请输入产品名称"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="工艺名称" prop="processName">
          <el-input
            v-model="editOrderForm.processName"
            placeholder="请输入工艺名称"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="订单数量" prop="orderQuantity">
          <el-input-number
            v-model="editOrderForm.orderQuantity"
            :min="1"
            placeholder="请输入订单数量"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEditOrder">取消</el-button>
        <el-button
          type="primary"
          @click="submitEditOrder"
          :loading="isEditingOrder"
        >
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 订单查询对话框 -->
    <OrderQueryDialog :visible.sync="orderQueryDialogVisible" />
  </div>
</template>

<script>
import HttpUtil from '@/utils/HttpUtil';
import moment from 'moment';
import { ipcRenderer } from 'electron';
import OrderQueryDialog from '@/components/OrderQueryDialog.vue';
const remote = require('electron').remote;
export default {
  name: 'MainPage',
  components: {
    OrderQueryDialog
  },
  data() {
    return {
      nowScanTrayInfo: {},
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
        { id: 1, queueName: '上货区', trayInfo: [] },
        { id: 2, queueName: '灭菌19', trayInfo: [] },
        { id: 3, queueName: '灭菌20', trayInfo: [] },
        { id: 4, queueName: '灭菌21', trayInfo: [] },
        { id: 5, queueName: '灭菌22', trayInfo: [] },
        { id: 6, queueName: '灭菌23', trayInfo: [] },
        { id: 7, queueName: '灭菌24', trayInfo: [] },
        { id: 8, queueName: '灭菌25', trayInfo: [] },
        { id: 9, queueName: '灭菌26', trayInfo: [] },
        { id: 10, queueName: '灭菌27', trayInfo: [] },
        { id: 11, queueName: '灭菌28', trayInfo: [] },
        { id: 12, queueName: '灭菌29', trayInfo: [] },
        { id: 13, queueName: '灭菌30', trayInfo: [] },
        { id: 14, queueName: '灭菌31', trayInfo: [] },
        { id: 15, queueName: '灭菌32', trayInfo: [] },
        { id: 16, queueName: '灭菌33', trayInfo: [] },
        { id: 17, queueName: '输送线', trayInfo: [] },
        { id: 18, queueName: '解析1', trayInfo: [] },
        { id: 19, queueName: '解析2', trayInfo: [] },
        { id: 20, queueName: '解析3', trayInfo: [] },
        { id: 21, queueName: '解析4', trayInfo: [] },
        { id: 22, queueName: '解析5', trayInfo: [] },
        { id: 23, queueName: '解析6', trayInfo: [] },
        { id: 24, queueName: '解析7', trayInfo: [] },
        { id: 25, queueName: '解析8', trayInfo: [] },
        { id: 26, queueName: '解析9', trayInfo: [] },
        { id: 27, queueName: '解析10', trayInfo: [] },
        { id: 28, queueName: '解析11', trayInfo: [] },
        { id: 29, queueName: '解析12', trayInfo: [] },
        { id: 30, queueName: '解析13', trayInfo: [] },
        { id: 31, queueName: '解析14', trayInfo: [] },
        { id: 32, queueName: '解析15', trayInfo: [] },
        { id: 33, queueName: '解析16', trayInfo: [] },
        { id: 34, queueName: '解析17', trayInfo: [] },
        { id: 35, queueName: '解析18', trayInfo: [] },
        { id: 36, queueName: '解析19', trayInfo: [] }
      ],
      // 添加队列位置标识数据
      queueMarkers: [
        { id: 1, name: '上货', queueId: 1, x: 1050, y: 1190 },
        { id: 2, name: '灭菌19', queueId: 2, x: 1295, y: 755 },
        { id: 3, name: '灭菌20', queueId: 3, x: 1185, y: 755 },
        { id: 4, name: '灭菌21', queueId: 4, x: 1085, y: 755 },
        { id: 5, name: '灭菌22', queueId: 5, x: 982, y: 755 },
        { id: 6, name: '灭菌23', queueId: 6, x: 875, y: 755 },
        { id: 7, name: '灭菌24', queueId: 7, x: 780, y: 755 },
        { id: 8, name: '灭菌25', queueId: 8, x: 608, y: 755 },
        { id: 9, name: '灭菌26', queueId: 9, x: 500, y: 755 },
        { id: 10, name: '灭菌27', queueId: 10, x: 405, y: 755 },
        { id: 11, name: '灭菌28', queueId: 11, x: 298, y: 755 },
        { id: 12, name: '灭菌29', queueId: 12, x: 195, y: 755 },
        { id: 13, name: '灭菌30', queueId: 13, x: 95, y: 755 },
        { id: 14, name: '灭菌31', queueId: 14, x: 105, y: 1600 },
        { id: 15, name: '灭菌32', queueId: 15, x: 252, y: 1600 },
        { id: 16, name: '灭菌33', queueId: 16, x: 385, y: 1600 },
        { id: 17, name: '输送线', queueId: 17, x: 2415, y: 550 },
        { id: 18, name: '解析1', queueId: 18, x: 1475, y: 1430 },
        { id: 19, name: '解析2', queueId: 19, x: 1540, y: 1430 },
        { id: 20, name: '解析3', queueId: 20, x: 1615, y: 1430 },
        { id: 21, name: '解析4', queueId: 21, x: 1680, y: 1430 },
        { id: 22, name: '解析5', queueId: 22, x: 1745, y: 1430 },
        { id: 23, name: '解析6', queueId: 23, x: 1810, y: 1430 },
        { id: 24, name: '解析7', queueId: 24, x: 1885, y: 1430 },
        { id: 25, name: '解析8', queueId: 25, x: 1950, y: 1430 },
        { id: 26, name: '解析9', queueId: 26, x: 2015, y: 1430 },
        { id: 27, name: '解析10', queueId: 27, x: 2080, y: 1430 },
        { id: 28, name: '解析11', queueId: 28, x: 2150, y: 1430 },
        { id: 29, name: '解析12', queueId: 29, x: 2215, y: 1430 },
        { id: 30, name: '解析13', queueId: 30, x: 2280, y: 1430 },
        { id: 31, name: '解析14', queueId: 31, x: 2345, y: 1430 },
        { id: 32, name: '解析15', queueId: 32, x: 2510, y: 1050 },
        { id: 33, name: '解析16', queueId: 33, x: 2588, y: 1050 },
        { id: 34, name: '解析17', queueId: 34, x: 2670, y: 1050 },
        { id: 35, name: '解析18', queueId: 35, x: 2747, y: 1050 },
        { id: 36, name: '解析19', queueId: 36, x: 2830, y: 1050 }
      ],
      logId: 1000, // 添加一个日志ID计数器
      isDataReady: false,
      // ========== 一楼 PLC 读取点位（一楼-读取点位.csv）==========
      floor1ConveyorHeartbeat: 0, // DBW0 输送线看门狗心跳（高电平1秒持续，低电平1秒持续，一直循环）
      floor1ConveyorRunStatus: 0, // DBW2 输送线当前运行状态（01自动运行，02手动模式、03故障模式）
      floor1AreaAlarm: {
        // DBW4 区域报警
        bit0: '0', // 上货区域报警
        bit1: '0', // 灭菌前区域报警
        bit2: '0' // 灭菌后区域报警
      },
      floor1AreaEstop: {
        // DBW6 区域急停
        bit0: '0', // 一楼控制柜急停
        bit1: '0', // 上货口操作台急停
        bit2: '0', // 灭菌前分站急停
        bit3: '0', // 灭菌前小车1急停
        bit4: '0', // 灭菌前小车2急停
        bit5: '0' // 灭菌后小车急停
      },
      floor1MotorRunning1: {
        // DBW8 电机运行信号--1
        bit0: '0', // 1001电机运行（上货口输送电机）
        bit1: '0', // 1002电机运行（上货口过渡电机）
        bit2: '0', // 1003电机运行（上货口升降电机）
        bit3: '0', // 1008电机正转运行（灭菌柜进货）
        bit4: '0', // 1008电机反转运行（灭菌柜出货）
        bit5: '0', // 1009电机正转运行（灭菌柜进货）
        bit6: '0', // 1009电机反转运行（灭菌柜出货）
        bit7: '0', // 1010电机正转运行（灭菌柜进货）
        bit8: '0', // 1010电机反转运行（灭菌柜出货）
        bit9: '0', // 1011电机正转运行（灭菌柜进货）
        bit10: '0', // 1011电机反转运行（灭菌柜出货）
        bit11: '0', // 1012电机正转运行（灭菌柜进货）
        bit12: '0', // 1012电机反转运行（灭菌柜出货）
        bit13: '0', // 1013电机正转运行（灭菌柜进货）
        bit14: '0', // 1013电机反转运行（灭菌柜出货）
        bit15: '0' // 1014电机运行
      },
      floor1MotorRunning2: {
        // DBW10 电机运行信号--2
        bit0: '0' // 1015电机运行
      },
      floor1SensorSignal: {
        // DBW12 传感器信号
        bit0: '0', // 光电1001
        bit1: '0', // 光电1008-1
        bit2: '0', // 光电1008-2
        bit3: '0', // 光电1010-1
        bit4: '0', // 光电1010-2
        bit5: '0', // 光电1012-1
        bit6: '0', // 光电1012-2
        bit7: '0', // 光电1014
        bit8: '0' // 光电1015
      },
      floor1CartBeforeSteril1Pos: 0, // DBW14 灭菌前小车1位置信息（0-3000）
      floor1CartBeforeSteril2Pos: 0, // DBW16 灭菌前小车2位置信息（0-3000）
      floor1CartAfterSterilPos: 0, // DBW18 灭菌后小车位置信息（0-3000/6000）
      floor1CartBeforeSteril3Pos: 0, // DBW20 灭菌前小车3位置信息（二期小车备用，0-3000）
      floor1UploadTrayRequest: {
        // DBW22 上货请求托盘指定ID和目的地
        bit0: '0' // 1001（上货口）处请求写ID和目的地
      },
      floor1SterilOutTrayRequest: {
        // DBW24 灭菌出货请求托盘指定ID和目的地
        bit0: '0', // 19号（灭菌柜出货）处请求写ID和目的地
        bit1: '0', // 20号（灭菌柜出货）处请求写ID和目的地
        bit2: '0', // 21号（灭菌柜出货）处请求写ID和目的地
        bit3: '0', // 22号（灭菌柜出货）处请求写ID和目的地
        bit4: '0', // 23号（灭菌柜出货）处请求写ID和目的地
        bit5: '0', // 24号（灭菌柜出货）处请求写ID和目的地
        bit6: '0', // 25(备用)
        bit7: '0', // 26(备用)
        bit8: '0', // 27(备用)
        bit9: '0', // 28(备用)
        bit10: '0', // 29(备用)
        bit11: '0', // 30(备用)
        bit12: '0', // 31号（灭菌柜出货）处请求写ID和目的地
        bit13: '0', // 32号（灭菌柜出货）处请求写ID和目的地
        bit14: '0', // 33号（灭菌柜出货）处请求写ID和目的地
        bit15: '0' // M1015电机处请求写ID和目的地
      },
      floor1MotorVirtualId1001: 0, // DBW26 1001电机占位虚拟ID
      floor1MotorVirtualId1004: 0, // DBW28 1004电机占位虚拟ID
      floor1MotorVirtualId1006A: 0, // DBW30 1006A电机占位虚拟ID
      floor1MotorVirtualId1006B: 0, // DBW32 1006B电机占位虚拟ID
      floor1MotorVirtualId1008: 0, // DBW34 1008电机占位虚拟ID
      floor1MotorVirtualId1010: 0, // DBW36 1010电机占位虚拟ID
      floor1MotorVirtualId1012: 0, // DBW38 1012电机占位虚拟ID
      floor1MotorVirtualId1014: 0, // DBW40 1014电机占位虚拟ID
      floor1MotorVirtualId1016: 0, // DBW42 1016电机占位虚拟ID
      floor1MotorVirtualIdspare1: 0, // DBW44 电机占位虚拟ID备用
      floor1MotorVirtualIdspare2: 0, // DBW46 电机占位虚拟ID备用
      floor1MotorDestination1001: 0, // DBW48 1001电机货物目的地
      floor1MotorDestination1004: 0, // DBW50 1004电机货物目的地
      floor1MotorDestination1006A: 0, // DBW52 1006A电机货物目的地
      floor1MotorDestination1006B: 0, // DBW54 1006B电机货物目的地
      floor1MotorDestination1008: 0, // DBW56 1008电机货物目的地
      floor1MotorDestination1010: 0, // DBW58 1010电机货物目的地
      floor1MotorDestination1012: 0, // DBW60 1012电机货物目的地
      floor1MotorDestination1014: 0, // DBW62 1014电机货物目的地
      floor1MotorDestination1016: 0, // DBW64 1016电机货物目的地
      floor1MotorDestinationspare1: 0, // DBW66 电机货物目的地备用
      floor1MotorDestinationspare2: 0, // DBW68 电机货物目的地备用
      floor1Sterilization19Incomplete: 0, // DBW70 灭菌柜19内实际数量--未完成
      floor1Sterilization20Incomplete: 0, // DBW72 灭菌柜20内实际数量--未完成
      floor1Sterilization21Incomplete: 0, // DBW74 灭菌柜21内实际数量--未完成
      floor1Sterilization22Incomplete: 0, // DBW76 灭菌柜22内实际数量--未完成
      floor1Sterilization23Incomplete: 0, // DBW78 灭菌柜23内实际数量--未完成
      floor1Sterilization24Incomplete: 0, // DBW80 灭菌柜24内实际数量--未完成
      floor1Sterilization25Incomplete: 0, // DBW82 灭菌柜25内实际数量--未完成
      floor1Sterilization26Incomplete: 0, // DBW84 灭菌柜26内实际数量--未完成
      floor1Sterilization27Incomplete: 0, // DBW86 灭菌柜27内实际数量--未完成
      floor1Sterilization28Incomplete: 0, // DBW88 灭菌柜28内实际数量--未完成
      floor1Sterilization29Incomplete: 0, // DBW90 灭菌柜29内实际数量--未完成
      floor1Sterilization30Incomplete: 0, // DBW92 灭菌柜30内实际数量--未完成
      floor1Sterilization19Complete: 0, // DBW94 灭菌柜19内实际数量--完成
      floor1Sterilization20Complete: 0, // DBW96 灭菌柜20内实际数量--完成
      floor1Sterilization21Complete: 0, // DBW98 灭菌柜21内实际数量--完成
      floor1Sterilization22Complete: 0, // DBW100 灭菌柜22内实际数量--完成
      floor1Sterilization23Complete: 0, // DBW102 灭菌柜23内实际数量--完成
      floor1Sterilization24Complete: 0, // DBW104 灭菌柜24内实际数量--完成
      floor1Sterilization25Complete: 0, // DBW106 灭菌柜25内实际数量--完成
      floor1Sterilization26Complete: 0, // DBW108 灭菌柜26内实际数量--完成
      floor1Sterilization27Complete: 0, // DBW110 灭菌柜27内实际数量--完成
      floor1Sterilization28Complete: 0, // DBW112 灭菌柜28内实际数量--完成
      floor1Sterilization29Complete: 0, // DBW114 灭菌柜29内实际数量--完成
      floor1Sterilization30Complete: 0, // DBW116 灭菌柜30内实际数量--完成
      floor1Sterilization31Complete: 0, // DBW118 灭菌柜31内实际数量--完成
      floor1Sterilization32Complete: 0, // DBW120 灭菌柜32内实际数量--完成
      floor1Sterilization33Complete: 0, // DBW122 灭菌柜33内实际数量--完成
      floor1FaultInfo1001: 0, // DBW124 1001故障信息
      floor1FaultInfo1002: 0, // DBW126 1002故障信息
      floor1FaultInfo1003: 0, // DBW128 1003故障信息
      floor1FaultInfo1004: 0, // DBW130 1004故障信息
      floor1FaultInfo1005: 0, // DBW132 1005故障信息
      floor1FaultInfo1006: 0, // DBW134 1006故障信息
      floor1FaultInfo1007: 0, // DBW136 1007故障信息
      floor1FaultInfo1008: 0, // DBW138 1008故障信息
      floor1FaultInfo1009: 0, // DBW140 1009故障信息
      floor1FaultInfo1010: 0, // DBW142 1010故障信息
      floor1FaultInfo1011: 0, // DBW144 1011故障信息
      floor1FaultInfo1012: 0, // DBW146 1012故障信息
      floor1FaultInfo1013: 0, // DBW148 1013故障信息
      floor1FaultInfo1014: 0, // DBW150 1014故障信息
      floor1FaultInfo1015: 0, // DBW152 1015故障信息
      floor1FaultInfo1016: 0, // DBW154 1016故障信息
      floor1FaultInfo1017: 0, // DBW156 1017故障信息
      floor1FaultInfospare1: 0, // DBW158 故障信息备用
      floor1FaultInfospare2: 0, // DBW160 故障信息备用
      // ========== 二楼 PLC 读取点位（二楼-读取点位.csv）==========
      floor2ConveyorHeartbeat: 0, // DBW0 输送线看门狗心跳（高电平1秒持续，低电平1秒持续，一直循环）
      floor2ConveyorRunStatus: 0, // DBW2 输送线当前运行状态（01自动运行，02手动模式、03故障模式）
      floor2AreaAlarm: {
        // DBW4 区域报警
        bit0: '0', // 提升机一楼输送线报警
        bit1: '0', // 提升机报警
        bit2: '0', // 提升机二楼输送线报警
        bit3: '0', // 解析前区域报警
        bit4: '0', // 解析房内报警
        bit5: '0' // 解析出货报警
      },
      floor2AreaEstop: {
        // DBW6 区域急停
        bit0: '0', // 提升机一楼操作台急停
        bit1: '0', // 提升机控制柜急停
        bit2: '0', // 解析前分站急停
        bit3: '0', // 解析出货分站急停
        bit4: '0', // 解析进货小车急停
        bit5: '0' // 解析出货小车急停
      },
      floor2MotorRunning1: {
        // DBW8 电机运行信号--1
        bit0: '0', // 1018电机运行
        bit1: '0', // 1019电机运行
        bit2: '0', // 2001电机正转（提升机上升）
        bit3: '0', // 2001电机反转（提升机下降）
        bit4: '0', // 2002电机正转（提升机轿厢进货）
        bit5: '0', // 2002电机反转（提升机轿厢出货）
        bit6: '0', // 2003电机运行
        bit7: '0', // 2004电机运行（转盘输送电机）
        bit8: '0', // 2005电机运行（转盘旋转电机）
        bit9: '0', // 2006电机运行
        bit10: '0', // 2007电机运行（转盘输送电机）
        bit11: '0', // 2008电机运行（转盘旋转电机）
        bit12: '0', // 2009电机运行
        bit13: '0', // 2010电机运行（转盘输送电机）
        bit14: '0', // 2011电机运行（转盘旋转电机）
        bit15: '0' // 2012电机运行
      },
      floor2MotorRunning2: {
        // DBW10 电机运行信号--2
        bit0: '0', // 2013电机运行
        bit1: '0', // 2014电机运行（转盘输送电机）
        bit2: '0', // 2015电机运行（转盘旋转电机）
        bit3: '0', // 2016电机运行
        bit4: '0', // 2017电机运行
        bit5: '0', // 2018电机运行
        bit6: '0', // 2019电机运行
        bit7: '0', // 2020电机运行（转盘输送电机）
        bit8: '0', // 2021电机运行（转盘旋转电机）
        bit9: '0', // 2022电机运行
        bit10: '0', // 2025电机运行
        bit11: '0', // 2026电机运行
        bit12: '0', // 2027电机运行
        bit13: '0', // 2028电机运行
        bit14: '0', // 2029电机运行
        bit15: '0' // 2030电机运行
      },
      floor2MotorRunning3: {
        // DBW12 电机运行信号--3
        bit0: '0', // 2031电机运行
        bit1: '0', // 2032电机运行
        bit2: '0', // 2033电机运行
        bit3: '0', // 2034电机运行
        bit4: '0', // 2035电机运行
        bit5: '0', // 2036电机运行
        bit6: '0', // 2037电机运行
        bit7: '0', // 2038电机运行
        bit8: '0', // 2041电机运行（出货口过渡电机）
        bit9: '0', // 2042电机运行（出货口输送电机）
        bit10: '0' // 2043电机运行（出货口升降电机）
      },
      floor2SensorSignal1: {
        // DBW14 传感器信号--1
        bit0: '0', // 光电1018
        bit1: '0', // 光电1019
        bit2: '0', // 提升机一楼到位（轿厢位置信号）
        bit3: '0', // 提升机二楼到位（轿厢位置信号）
        bit4: '0', // 光电2002
        bit5: '0', // 光电2003
        bit6: '0', // 光电2004
        bit7: '0', // 行程2005-1（转盘1进货位）
        bit8: '0', // 行程2005-2（转盘1出货位）
        bit9: '0', // 光电2006
        bit10: '0', // 光电2007
        bit11: '0', // 行程2008-1（转盘2进货位）
        bit12: '0', // 行程2008-2（转盘2出货位）
        bit13: '0', // 光电2009
        bit14: '0', // 光电2010
        bit15: '0' // 行程2011-1（转盘3进货位）
      },
      floor2SensorSignal2: {
        // DBW16 传感器信号--2
        bit0: '0', // 行程2011-2（转盘3出货位）
        bit1: '0', // 光电2012
        bit2: '0', // 光电2013
        bit3: '0', // 光电2014
        bit4: '0', // 行程2015-1（转盘4进货位）
        bit5: '0', // 行程2015-2（转盘4出货位）
        bit6: '0', // 光电2016
        bit7: '0', // 光电2017
        bit8: '0', // 光电2018
        bit9: '0', // 光电2019
        bit10: '0', // 光电2020
        bit11: '0', // 行程2021-1（转盘5进货位）
        bit12: '0', // 行程2021-2（转盘5出货位）
        bit13: '0', // 光电2025-1
        bit14: '0', // 光电2025-2
        bit15: '0' // 光电2026-1
      },
      floor2SensorSignal3: {
        // DBW18 传感器信号--3
        bit0: '0', // 光电2026-2
        bit1: '0', // 光电2027-1
        bit2: '0', // 光电2027-2
        bit3: '0', // 光电2028-1
        bit4: '0', // 光电2028-2
        bit5: '0', // 光电2029-1
        bit6: '0', // 光电2029-2
        bit7: '0', // 光电2030-1
        bit8: '0', // 光电2030-2
        bit9: '0', // 光电2031-1
        bit10: '0', // 光电2031-2
        bit11: '0', // 光电2032-1
        bit12: '0', // 光电2032-2
        bit13: '0', // 光电2033-1
        bit14: '0', // 光电2033-2
        bit15: '0' // 光电2034-1
      },
      floor2SensorSignal4: {
        // DBW20 传感器信号--4
        bit0: '0', // 光电2034-2
        bit1: '0', // 光电2035-1
        bit2: '0', // 光电2035-2
        bit3: '0', // 光电2036-1
        bit4: '0', // 光电2036-2
        bit5: '0', // 光电2037-1
        bit6: '0', // 光电2037-2
        bit7: '0', // 光电2038-1
        bit8: '0', // 光电2038-2
        bit9: '0' // 光电2042
      },
      floor2CartAnalysisInPos: 0, // DBW22 解析进货小车位置信息（0-3000）
      floor2CartAnalysisOutPos: 0, // DBW24 解析出货小车位置信息（0-3000）
      floor2CartSpare1Pos: 0, // DBW26 小车位置信息（二期小车备用1，0-3000）
      floor2CartSpare2Pos: 0, // DBW28 小车位置信息（二期小车备用2，0-3000）
      floor2AnalysisOutTrayRequest: {
        // DBW30 解析房出货请求托盘指定ID和目的地
        bit0: '0', // 1（解析出货）处请求写ID和目的地
        bit1: '0', // 2
        bit2: '0', // 3
        bit3: '0', // 4
        bit4: '0', // 5
        bit5: '0', // 6
        bit6: '0', // 7
        bit7: '0', // 8
        bit8: '0', // 9
        bit9: '0', // 10
        bit10: '0', // 11
        bit11: '0', // 12
        bit12: '0', // 13
        bit13: '0' // 14
      },
      floor2MotorVirtualId1018A: 0, // DBW32 1018A电机占位虚拟ID
      floor2MotorVirtualId1018B: 0, // DBW34 1018B电机占位虚拟ID（备用）
      floor2MotorVirtualId1019: 0, // DBW36 1019电机占位虚拟ID
      floor2MotorVirtualId2002: 0, // DBW38 2002电机占位虚拟ID
      floor2MotorVirtualId2003: 0, // DBW40 2003电机占位虚拟ID
      floor2MotorVirtualId2004: 0, // DBW42 2004电机占位虚拟ID
      floor2MotorVirtualId2006: 0, // DBW44 2006电机占位虚拟ID
      floor2MotorVirtualId2007: 0, // DBW46 2007电机占位虚拟ID
      floor2MotorVirtualId2009: 0, // DBW48 2009电机占位虚拟ID
      floor2MotorVirtualId2010: 0, // DBW50 2010电机占位虚拟ID
      floor2MotorVirtualId2012: 0, // DBW52 2012电机占位虚拟ID
      floor2MotorVirtualId2013: 0, // DBW54 2013电机占位虚拟ID
      floor2MotorVirtualId2014: 0, // DBW56 2014电机占位虚拟ID
      floor2MotorVirtualId2016: 0, // DBW58 2016电机占位虚拟ID
      floor2MotorVirtualId2017: 0, // DBW60 2017电机占位虚拟ID
      floor2MotorVirtualId2018: 0, // DBW62 2018电机占位虚拟ID
      floor2MotorVirtualId2019: 0, // DBW64 2019电机占位虚拟ID
      floor2MotorVirtualId2020: 0, // DBW66 2020电机占位虚拟ID
      floor2MotorVirtualId2023: 0, // DBW68 2023电机占位虚拟ID
      floor2MotorVirtualId2039: 0, // DBW70 2039电机占位虚拟ID
      floor2MotorVirtualId2042: 0, // DBW72 2042电机占位虚拟ID
      floor2MotorDestination1018A: 0, // DBW74 1018A电机货物目的地
      floor2MotorDestination1018B: 0, // DBW76 1018B电机货物目的地
      floor2MotorDestination1019: 0, // DBW78 1019电机货物目的地
      floor2MotorDestination2002: 0, // DBW80 2002电机货物目的地
      floor2MotorDestination2003: 0, // DBW82 2003电机货物目的地
      floor2MotorDestination2004: 0, // DBW84 2004电机货物目的地
      floor2MotorDestination2006: 0, // DBW86 2006电机货物目的地
      floor2MotorDestination2007: 0, // DBW88 2007电机货物目的地
      floor2MotorDestination2009: 0, // DBW90 2009电机货物目的地
      floor2MotorDestination2010: 0, // DBW92 2010电机货物目的地
      floor2MotorDestination2012: 0, // DBW94 2012电机货物目的地
      floor2MotorDestination2013: 0, // DBW96 2013电机货物目的地
      floor2MotorDestination2014: 0, // DBW98 2014电机货物目的地
      floor2MotorDestination2016: 0, // DBW100 2016电机货物目的地
      floor2MotorDestination2017: 0, // DBW102 2017电机货物目的地
      floor2MotorDestination2018: 0, // DBW104 2018电机货物目的地
      floor2MotorDestination2019: 0, // DBW106 2019电机货物目的地
      floor2MotorDestination2020: 0, // DBW108 2020电机货物目的地
      floor2MotorDestination2023: 0, // DBW110 2023电机货物目的地
      floor2MotorDestination2039: 0, // DBW112 2039电机货物目的地
      floor2MotorDestination2042: 0, // DBW114 2042电机货物目的地
      floor2AnalysisRoom1Qty: 0, // DBW116 解析1（2025电机）内实际数量
      floor2AnalysisRoom2Qty: 0, // DBW118 解析2（2026电机）内实际数量
      floor2AnalysisRoom3Qty: 0, // DBW120 解析3（2027电机）内实际数量
      floor2AnalysisRoom4Qty: 0, // DBW122 解析4（2028电机）内实际数量
      floor2AnalysisRoom5Qty: 0, // DBW124 解析5（2029电机）内实际数量
      floor2AnalysisRoom6Qty: 0, // DBW126 解析6（2030电机）内实际数量
      floor2AnalysisRoom7Qty: 0, // DBW128 解析7（2031电机）内实际数量
      floor2AnalysisRoom8Qty: 0, // DBW130 解析8（2032电机）内实际数量
      floor2AnalysisRoom9Qty: 0, // DBW132 解析9（2033电机）内实际数量
      floor2AnalysisRoom10Qty: 0, // DBW134 解析10（2034电机）内实际数量
      floor2AnalysisRoom11Qty: 0, // DBW136 解析11（2035电机）内实际数量
      floor2AnalysisRoom12Qty: 0, // DBW138 解析12（2036电机）内实际数量
      floor2AnalysisRoom13Qty: 0, // DBW140 解析13（2037电机）内实际数量
      floor2AnalysisRoom14Qty: 0, // DBW142 解析14（2038电机）内实际数量
      floor2AnalysisRoom15Qty: 0, // DBW144 二期解析备用
      floor2AnalysisRoom16Qty: 0, // DBW146 二期解析备用
      floor2AnalysisRoom17Qty: 0, // DBW148 二期解析备用
      floor2SpareDBW150: 0, // DBW150 备用
      floor2SpareDBW152: 0, // DBW152 备用
      floor2SpareDBW154: 0, // DBW154 备用
      floor2SpareDBW156: 0, // DBW156 备用
      floor2SpareDBW158: 0, // DBW158 备用
      floor2FaultInfo1018: 0, // DBW160 1018故障信息
      floor2FaultInfo1019: 0, // DBW162 1019故障信息
      floor2FaultInfo2001: 0, // DBW164 2001故障信息
      floor2FaultInfo2002: 0, // DBW166 2002故障信息
      floor2FaultInfo2003: 0, // DBW168 2003故障信息
      floor2FaultInfo2004: 0, // DBW170 2004故障信息
      floor2FaultInfo2005: 0, // DBW172 2005故障信息
      floor2FaultInfo2006: 0, // DBW174 2006故障信息
      floor2FaultInfo2007: 0, // DBW176 2007故障信息
      floor2FaultInfo2008: 0, // DBW178 2008故障信息
      floor2FaultInfo2009: 0, // DBW180 2009故障信息
      floor2FaultInfo2010: 0, // DBW182 2010故障信息
      floor2FaultInfo2011: 0, // DBW184 2011故障信息
      floor2FaultInfo2012: 0, // DBW186 2012故障信息
      floor2FaultInfo2013: 0, // DBW188 2013故障信息
      floor2FaultInfo2014: 0, // DBW190 2014故障信息
      floor2FaultInfo2015: 0, // DBW192 2015故障信息
      floor2FaultInfo2016: 0, // DBW194 2016故障信息
      floor2FaultInfo2017: 0, // DBW196 2017故障信息
      floor2FaultInfo2018: 0, // DBW198 2018故障信息
      floor2FaultInfo2019: 0, // DBW200 2019故障信息
      floor2FaultInfo2020: 0, // DBW202 2020故障信息
      floor2FaultInfo2021: 0, // DBW204 2021故障信息
      floor2FaultInfo2022: 0, // DBW206 2022故障信息
      floor2FaultInfo2023: 0, // DBW208 2023故障信息
      floor2FaultInfo2024: 0, // DBW210 2024故障信息
      floor2FaultInfo2025: 0, // DBW212 2025故障信息
      floor2FaultInfo2026: 0, // DBW214 2026故障信息
      floor2FaultInfo2027: 0, // DBW216 2027故障信息
      floor2FaultInfo2028: 0, // DBW218 2028故障信息
      floor2FaultInfo2029: 0, // DBW220 2029故障信息
      floor2FaultInfo2030: 0, // DBW222 2030故障信息
      floor2FaultInfo2031: 0, // DBW224 2031故障信息
      floor2FaultInfo2032: 0, // DBW226 2032故障信息
      floor2FaultInfo2033: 0, // DBW228 2033故障信息
      floor2FaultInfo2034: 0, // DBW230 2034故障信息
      floor2FaultInfo2035: 0, // DBW232 2035故障信息
      floor2FaultInfo2036: 0, // DBW234 2036故障信息
      floor2FaultInfo2037: 0, // DBW236 2037故障信息
      floor2FaultInfo2038: 0, // DBW238 2038故障信息
      floor2FaultInfo2039: 0, // DBW240 2039故障信息
      floor2FaultInfo2040: 0, // DBW242 2040故障信息
      floor2FaultInfo2041: 0, // DBW244 2041故障信息
      floor2FaultInfo2042: 0, // DBW246 2042故障信息
      floor2FaultInfo2043: 0, // DBW248 2043故障信息
      carts: [
        {
          id: 1,
          name: '小车1',
          x: 112,
          y: 1175,
          width: 100,
          image: require('@/assets/changzhou-img/cart1.png')
        },
        {
          id: 2,
          name: '小车2',
          x: 535,
          y: 1090,
          width: 90,
          image: require('@/assets/changzhou-img/cart2.png')
        },
        {
          id: 3,
          name: '小车3',
          x: 535,
          y: 465,
          width: 95,
          image: require('@/assets/changzhou-img/cart3.png')
        },
        {
          id: 4,
          name: '小车4',
          x: 1493,
          y: 1065,
          width: 90,
          image: require('@/assets/changzhou-img/cart4.png')
        },
        {
          id: 5,
          name: '小车5',
          x: 1493,
          y: 1800,
          width: 80,
          image: require('@/assets/changzhou-img/cart5.png')
        }
      ],
      // 小车位置数值-读取PLC（一楼 cart1~3：DBW14/16/18，二楼 cart4~5：DBW22/24）
      cartPositionValues: {
        cart1: 0,
        cart2: 0,
        cart3: 0,
        cart4: 0,
        cart5: 0
      },
      // 小车 x 轴行走范围（地图坐标，可按实际轨道调整）
      cartXRanges: {
        cart1: { min: 112, max: 900 },
        cart2: { min: 535, max: 1300 },
        cart3: { min: 535, max: 1295 },
        cart4: { min: 1493, max: 2317 },
        cart5: { min: 1493, max: 2317 }
      },
      // 小车 PLC 数值范围配置
      cartPlcRanges: {
        cart1: { min: 0, max: 3000 },
        cart2: { min: 0, max: 3000 },
        cart3: { min: 0, max: 3000 },
        cart4: { min: 0, max: 3000 },
        cart5: { min: 0, max: 3000 }
      },
      // ========== 订单管理相关 ==========
      ordersList: [],
      isRefreshing: false,
      isSubmittingOrder: false,
      isExecutingOrder: false,
      // 新建订单弹窗
      addOrderDialogVisible: false,
      newOrderForm: {
        orderId: '',
        orderName: '',
        batchNo: '',
        productName: '',
        processName: '',
        orderQuantity: null
      },
      orderFormRules: {
        orderId: [
          { required: true, message: '请输入订单编号', trigger: 'blur' }
        ],
        orderName: [
          { required: true, message: '请输入订单名称', trigger: 'blur' }
        ],
        batchNo: [{ required: true, message: '请输入批号', trigger: 'blur' }],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        orderQuantity: [
          { required: true, message: '请输入订单数量', trigger: 'blur' }
        ]
      },
      // 修改订单弹窗
      editOrderDialogVisible: false,
      editOrderForm: {
        id: null,
        orderId: '',
        orderName: '',
        batchNo: '',
        productName: '',
        processName: '',
        orderQuantity: null
      },
      editOrderRules: {
        orderId: [
          { required: true, message: '请输入订单编号', trigger: 'blur' }
        ],
        orderName: [
          { required: true, message: '请输入订单名称', trigger: 'blur' }
        ],
        batchNo: [{ required: true, message: '请输入批号', trigger: 'blur' }],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        orderQuantity: [
          { required: true, message: '请输入订单数量', trigger: 'blur' }
        ]
      },
      isEditingOrder: false,
      // 执行订单弹窗
      executeOrderDialogVisible: false,
      executeOrderForm: {
        id: null,
        orderId: '',
        orderName: '',
        destination: '',
        analysisTime: null
      },
      executeOrderRules: {
        destination: [
          { required: true, message: '请选择灭菌柜目的地', trigger: 'change' }
        ],
        analysisTime: [
          { required: true, message: '请输入解析时间', trigger: 'blur' }
        ]
      },
      // 历史订单弹窗
      historyDialogVisible: false,
      historyOrders: [],
      historyFilter: { orderId: '', orderName: '', orderStatus: '' },
      currentPage: 1,
      pageSize: 10,
      totalHistoryOrders: 0,
      // ========== 上货请求信号处理 ==========
      currentVirtualId: 10000, // 当前虚拟ID（范围10000-29999）
      lastUploadRequestBit: '0', // 上次上货请求信号值（用于上升沿检测）
      isHandlingUploadRequest: false, // 是否正在处理上货请求（防重复）
      // ========== 预热房到灭菌柜执行 ==========
      preheatToSterilizeFrom: '', // 预热房编号（1~12）
      preheatToSterilizeTo: '', // 灭菌柜编号（19~33）
      preheatToSterilizeLoading: false,
      // ========== 灭菌柜到解析房执行 ==========
      sterToAnalysisFrom: '', // 出货灭菌柜编号（19~33）
      sterToAnalysisTo: '', // 解析房编号（1~19），空=自动
      sterToAnalysisLoading: false,
      sterToAnalysisExecuting: false,
      sterToAnalysisResolvedTo: '', // 本次执行实际使用的解析房编号
      sterToAnalysisSentCount: 0, // 本次已移入输送线计数
      sterToAnalysisTrayCode: '', // 当前处理托盘展示
      isHandlingSterilOutRequest: false
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
  mounted() {
    this.initializeMarkers();
    this.loadQueueInfoFromDatabase();
    // 数据加载完成后创建监听（跳过 id 为 1-5 的队列）
    this._queueWatchers = []; // 保存 watcher 取消函数
    this._queueInitDone = false; // 初始化标记，跳过首次赋值触发的watch
    this.$nextTick(() => {
      this.queues.forEach((queue, index) => {
        const unwatch = this.$watch(`queues.${index}`, {
          handler(newVal, oldVal) {
            if (!this._queueInitDone) return;
            this.updateQueueInfo(queue.id);
          },
          deep: true
        });
        this._queueWatchers.push(unwatch);
      });
    });
    this.refreshOrders();
    ipcRenderer.on('receivedMsg_0', (event, values, values2) => {
      const getBit = (word, bitIndex) => ((word >> bitIndex) & 1).toString();

      // 一楼基础状态
      this.floor1ConveyorHeartbeat = Number(values.DBW0 ?? 0);
      this.floor1ConveyorRunStatus = Number(values.DBW2 ?? 0);

      // 一楼区域报警 DBW4
      let word4 = this.convertToWord(values.DBW4 ?? 0);
      this.floor1AreaAlarm.bit0 = getBit(word4, 8);
      this.floor1AreaAlarm.bit1 = getBit(word4, 9);
      this.floor1AreaAlarm.bit2 = getBit(word4, 10);

      // 一楼区域急停 DBW6
      let word6 = this.convertToWord(values.DBW6 ?? 0);
      this.floor1AreaEstop.bit0 = getBit(word6, 8);
      this.floor1AreaEstop.bit1 = getBit(word6, 9);
      this.floor1AreaEstop.bit2 = getBit(word6, 10);
      this.floor1AreaEstop.bit3 = getBit(word6, 11);
      this.floor1AreaEstop.bit4 = getBit(word6, 12);
      this.floor1AreaEstop.bit5 = getBit(word6, 13);

      // 一楼电机运行信号--1 DBW8
      let word8 = this.convertToWord(values.DBW8 ?? 0);
      this.floor1MotorRunning1.bit0 = getBit(word8, 8);
      this.floor1MotorRunning1.bit1 = getBit(word8, 9);
      this.floor1MotorRunning1.bit2 = getBit(word8, 10);
      this.floor1MotorRunning1.bit3 = getBit(word8, 11);
      this.floor1MotorRunning1.bit4 = getBit(word8, 12);
      this.floor1MotorRunning1.bit5 = getBit(word8, 13);
      this.floor1MotorRunning1.bit6 = getBit(word8, 14);
      this.floor1MotorRunning1.bit7 = getBit(word8, 15);
      this.floor1MotorRunning1.bit8 = getBit(word8, 0);
      this.floor1MotorRunning1.bit9 = getBit(word8, 1);
      this.floor1MotorRunning1.bit10 = getBit(word8, 2);
      this.floor1MotorRunning1.bit11 = getBit(word8, 3);
      this.floor1MotorRunning1.bit12 = getBit(word8, 4);
      this.floor1MotorRunning1.bit13 = getBit(word8, 5);
      this.floor1MotorRunning1.bit14 = getBit(word8, 6);
      this.floor1MotorRunning1.bit15 = getBit(word8, 7);

      // 一楼电机运行信号--2 DBW10
      let word10 = this.convertToWord(values.DBW10 ?? 0);
      this.floor1MotorRunning2.bit0 = getBit(word10, 8);

      // 一楼传感器信号 DBW12
      let word12 = this.convertToWord(values.DBW12 ?? 0);
      this.floor1SensorSignal.bit0 = getBit(word12, 8);
      this.floor1SensorSignal.bit1 = getBit(word12, 9);
      this.floor1SensorSignal.bit2 = getBit(word12, 10);
      this.floor1SensorSignal.bit3 = getBit(word12, 11);
      this.floor1SensorSignal.bit4 = getBit(word12, 12);
      this.floor1SensorSignal.bit5 = getBit(word12, 13);
      this.floor1SensorSignal.bit6 = getBit(word12, 14);
      this.floor1SensorSignal.bit7 = getBit(word12, 15);
      this.floor1SensorSignal.bit8 = getBit(word12, 0);

      // 一楼小车位置
      this.floor1CartBeforeSteril1Pos = Number(values.DBW14 ?? 0);
      this.floor1CartBeforeSteril2Pos = Number(values.DBW16 ?? 0);
      this.floor1CartAfterSterilPos = Number(values.DBW18 ?? 0);
      this.floor1CartBeforeSteril3Pos = Number(values.DBW20 ?? 0);
      this.cartPositionValues.cart1 = Number(values.DBW14 ?? 0);
      this.cartPositionValues.cart2 = Number(values.DBW16 ?? 0);
      this.cartPositionValues.cart3 = Number(values.DBW18 ?? 0);

      // 一楼上货请求托盘指定ID和目的地 DBW22
      let word22 = this.convertToWord(values.DBW22 ?? 0);
      this.floor1UploadTrayRequest.bit0 = getBit(word22, 8);

      // 一楼灭菌出货请求托盘指定ID和目的地 DBW24
      let word24 = this.convertToWord(values.DBW24 ?? 0);
      this.floor1SterilOutTrayRequest.bit0 = getBit(word24, 8);
      this.floor1SterilOutTrayRequest.bit1 = getBit(word24, 9);
      this.floor1SterilOutTrayRequest.bit2 = getBit(word24, 10);
      this.floor1SterilOutTrayRequest.bit3 = getBit(word24, 11);
      this.floor1SterilOutTrayRequest.bit4 = getBit(word24, 12);
      this.floor1SterilOutTrayRequest.bit5 = getBit(word24, 13);
      this.floor1SterilOutTrayRequest.bit6 = getBit(word24, 14);
      this.floor1SterilOutTrayRequest.bit7 = getBit(word24, 15);
      this.floor1SterilOutTrayRequest.bit8 = getBit(word24, 0);
      this.floor1SterilOutTrayRequest.bit9 = getBit(word24, 1);
      this.floor1SterilOutTrayRequest.bit10 = getBit(word24, 2);
      this.floor1SterilOutTrayRequest.bit11 = getBit(word24, 3);
      this.floor1SterilOutTrayRequest.bit12 = getBit(word24, 4);
      this.floor1SterilOutTrayRequest.bit13 = getBit(word24, 5);
      this.floor1SterilOutTrayRequest.bit14 = getBit(word24, 6);
      this.floor1SterilOutTrayRequest.bit15 = getBit(word24, 7);

      // 一楼电机占位虚拟ID
      this.floor1MotorVirtualId1001 = Number(values.DBW26 ?? 0);
      this.floor1MotorVirtualId1004 = Number(values.DBW28 ?? 0);
      this.floor1MotorVirtualId1006A = Number(values.DBW30 ?? 0);
      this.floor1MotorVirtualId1006B = Number(values.DBW32 ?? 0);
      this.floor1MotorVirtualId1008 = Number(values.DBW34 ?? 0);
      this.floor1MotorVirtualId1010 = Number(values.DBW36 ?? 0);
      this.floor1MotorVirtualId1012 = Number(values.DBW38 ?? 0);
      this.floor1MotorVirtualId1014 = Number(values.DBW40 ?? 0);
      this.floor1MotorVirtualId1016 = Number(values.DBW42 ?? 0);
      this.floor1MotorVirtualIdspare1 = Number(values.DBW44 ?? 0);
      this.floor1MotorVirtualIdspare2 = Number(values.DBW46 ?? 0);

      // 一楼电机货物目的地
      this.floor1MotorDestination1001 = Number(values.DBW48 ?? 0);
      this.floor1MotorDestination1004 = Number(values.DBW50 ?? 0);
      this.floor1MotorDestination1006A = Number(values.DBW52 ?? 0);
      this.floor1MotorDestination1006B = Number(values.DBW54 ?? 0);
      this.floor1MotorDestination1008 = Number(values.DBW56 ?? 0);
      this.floor1MotorDestination1010 = Number(values.DBW58 ?? 0);
      this.floor1MotorDestination1012 = Number(values.DBW60 ?? 0);
      this.floor1MotorDestination1014 = Number(values.DBW62 ?? 0);
      this.floor1MotorDestination1016 = Number(values.DBW64 ?? 0);
      this.floor1MotorDestinationspare1 = Number(values.DBW66 ?? 0);
      this.floor1MotorDestinationspare2 = Number(values.DBW68 ?? 0);

      // 一楼灭菌柜内未完成实际数量
      this.floor1Sterilization19Incomplete = Number(values.DBW70 ?? 0);
      this.floor1Sterilization20Incomplete = Number(values.DBW72 ?? 0);
      this.floor1Sterilization21Incomplete = Number(values.DBW74 ?? 0);
      this.floor1Sterilization22Incomplete = Number(values.DBW76 ?? 0);
      this.floor1Sterilization23Incomplete = Number(values.DBW78 ?? 0);
      this.floor1Sterilization24Incomplete = Number(values.DBW80 ?? 0);
      this.floor1Sterilization25Incomplete = Number(values.DBW82 ?? 0);
      this.floor1Sterilization26Incomplete = Number(values.DBW84 ?? 0);
      this.floor1Sterilization27Incomplete = Number(values.DBW86 ?? 0);
      this.floor1Sterilization28Incomplete = Number(values.DBW88 ?? 0);
      this.floor1Sterilization29Incomplete = Number(values.DBW90 ?? 0);
      this.floor1Sterilization30Incomplete = Number(values.DBW92 ?? 0);

      // 一楼灭菌柜内完成实际数量
      this.floor1Sterilization19Complete = Number(values.DBW94 ?? 0);
      this.floor1Sterilization20Complete = Number(values.DBW96 ?? 0);
      this.floor1Sterilization21Complete = Number(values.DBW98 ?? 0);
      this.floor1Sterilization22Complete = Number(values.DBW100 ?? 0);
      this.floor1Sterilization23Complete = Number(values.DBW102 ?? 0);
      this.floor1Sterilization24Complete = Number(values.DBW104 ?? 0);
      this.floor1Sterilization25Complete = Number(values.DBW106 ?? 0);
      this.floor1Sterilization26Complete = Number(values.DBW108 ?? 0);
      this.floor1Sterilization27Complete = Number(values.DBW110 ?? 0);
      this.floor1Sterilization28Complete = Number(values.DBW112 ?? 0);
      this.floor1Sterilization29Complete = Number(values.DBW114 ?? 0);
      this.floor1Sterilization30Complete = Number(values.DBW116 ?? 0);
      this.floor1Sterilization31Complete = Number(values.DBW118 ?? 0);
      this.floor1Sterilization32Complete = Number(values.DBW120 ?? 0);
      this.floor1Sterilization33Complete = Number(values.DBW122 ?? 0);

      // 一楼故障信息
      this.floor1FaultInfo1001 = Number(values.DBW124 ?? 0);
      this.floor1FaultInfo1002 = Number(values.DBW126 ?? 0);
      this.floor1FaultInfo1003 = Number(values.DBW128 ?? 0);
      this.floor1FaultInfo1004 = Number(values.DBW130 ?? 0);
      this.floor1FaultInfo1005 = Number(values.DBW132 ?? 0);
      this.floor1FaultInfo1006 = Number(values.DBW134 ?? 0);
      this.floor1FaultInfo1007 = Number(values.DBW136 ?? 0);
      this.floor1FaultInfo1008 = Number(values.DBW138 ?? 0);
      this.floor1FaultInfo1009 = Number(values.DBW140 ?? 0);
      this.floor1FaultInfo1010 = Number(values.DBW142 ?? 0);
      this.floor1FaultInfo1011 = Number(values.DBW144 ?? 0);
      this.floor1FaultInfo1012 = Number(values.DBW146 ?? 0);
      this.floor1FaultInfo1013 = Number(values.DBW148 ?? 0);
      this.floor1FaultInfo1014 = Number(values.DBW150 ?? 0);
      this.floor1FaultInfo1015 = Number(values.DBW152 ?? 0);
      this.floor1FaultInfo1016 = Number(values.DBW154 ?? 0);
      this.floor1FaultInfo1017 = Number(values.DBW156 ?? 0);
      this.floor1FaultInfospare1 = Number(values.DBW158 ?? 0);
      this.floor1FaultInfospare2 = Number(values.DBW160 ?? 0);

      if (!this.isDataReady) {
        this.isDataReady = true;
      }
    });
    ipcRenderer.on('receivedMsg_1', (event, values, values2) => {
      const getBit = (word, bitIndex) => ((word >> bitIndex) & 1).toString();

      // 二楼基础状态
      this.floor2ConveyorHeartbeat = Number(values.DBW0 ?? 0);
      this.floor2ConveyorRunStatus = Number(values.DBW2 ?? 0);

      let word4 = this.convertToWord(values.DBW4 ?? 0);
      this.floor2AreaAlarm.bit0 = getBit(word4, 8);
      this.floor2AreaAlarm.bit1 = getBit(word4, 9);
      this.floor2AreaAlarm.bit2 = getBit(word4, 10);
      this.floor2AreaAlarm.bit3 = getBit(word4, 11);
      this.floor2AreaAlarm.bit4 = getBit(word4, 12);
      this.floor2AreaAlarm.bit5 = getBit(word4, 13);

      let word6 = this.convertToWord(values.DBW6 ?? 0);
      this.floor2AreaEstop.bit0 = getBit(word6, 8);
      this.floor2AreaEstop.bit1 = getBit(word6, 9);
      this.floor2AreaEstop.bit2 = getBit(word6, 10);
      this.floor2AreaEstop.bit3 = getBit(word6, 11);
      this.floor2AreaEstop.bit4 = getBit(word6, 12);
      this.floor2AreaEstop.bit5 = getBit(word6, 13);

      let word8 = this.convertToWord(values.DBW8 ?? 0);
      this.floor2MotorRunning1.bit0 = getBit(word8, 8);
      this.floor2MotorRunning1.bit1 = getBit(word8, 9);
      this.floor2MotorRunning1.bit2 = getBit(word8, 10);
      this.floor2MotorRunning1.bit3 = getBit(word8, 11);
      this.floor2MotorRunning1.bit4 = getBit(word8, 12);
      this.floor2MotorRunning1.bit5 = getBit(word8, 13);
      this.floor2MotorRunning1.bit6 = getBit(word8, 14);
      this.floor2MotorRunning1.bit7 = getBit(word8, 15);
      this.floor2MotorRunning1.bit8 = getBit(word8, 0);
      this.floor2MotorRunning1.bit9 = getBit(word8, 1);
      this.floor2MotorRunning1.bit10 = getBit(word8, 2);
      this.floor2MotorRunning1.bit11 = getBit(word8, 3);
      this.floor2MotorRunning1.bit12 = getBit(word8, 4);
      this.floor2MotorRunning1.bit13 = getBit(word8, 5);
      this.floor2MotorRunning1.bit14 = getBit(word8, 6);
      this.floor2MotorRunning1.bit15 = getBit(word8, 7);

      let word10 = this.convertToWord(values.DBW10 ?? 0);
      this.floor2MotorRunning2.bit0 = getBit(word10, 8);
      this.floor2MotorRunning2.bit1 = getBit(word10, 9);
      this.floor2MotorRunning2.bit2 = getBit(word10, 10);
      this.floor2MotorRunning2.bit3 = getBit(word10, 11);
      this.floor2MotorRunning2.bit4 = getBit(word10, 12);
      this.floor2MotorRunning2.bit5 = getBit(word10, 13);
      this.floor2MotorRunning2.bit6 = getBit(word10, 14);
      this.floor2MotorRunning2.bit7 = getBit(word10, 15);
      this.floor2MotorRunning2.bit8 = getBit(word10, 0);
      this.floor2MotorRunning2.bit9 = getBit(word10, 1);
      this.floor2MotorRunning2.bit10 = getBit(word10, 2);
      this.floor2MotorRunning2.bit11 = getBit(word10, 3);
      this.floor2MotorRunning2.bit12 = getBit(word10, 4);
      this.floor2MotorRunning2.bit13 = getBit(word10, 5);
      this.floor2MotorRunning2.bit14 = getBit(word10, 6);
      this.floor2MotorRunning2.bit15 = getBit(word10, 7);

      let word12 = this.convertToWord(values.DBW12 ?? 0);
      this.floor2MotorRunning3.bit0 = getBit(word12, 8);
      this.floor2MotorRunning3.bit1 = getBit(word12, 9);
      this.floor2MotorRunning3.bit2 = getBit(word12, 10);
      this.floor2MotorRunning3.bit3 = getBit(word12, 11);
      this.floor2MotorRunning3.bit4 = getBit(word12, 12);
      this.floor2MotorRunning3.bit5 = getBit(word12, 13);
      this.floor2MotorRunning3.bit6 = getBit(word12, 14);
      this.floor2MotorRunning3.bit7 = getBit(word12, 15);
      this.floor2MotorRunning3.bit8 = getBit(word12, 0);
      this.floor2MotorRunning3.bit9 = getBit(word12, 1);
      this.floor2MotorRunning3.bit10 = getBit(word12, 2);

      let word14 = this.convertToWord(values.DBW14 ?? 0);
      this.floor2SensorSignal1.bit0 = getBit(word14, 8);
      this.floor2SensorSignal1.bit1 = getBit(word14, 9);
      this.floor2SensorSignal1.bit2 = getBit(word14, 10);
      this.floor2SensorSignal1.bit3 = getBit(word14, 11);
      this.floor2SensorSignal1.bit4 = getBit(word14, 12);
      this.floor2SensorSignal1.bit5 = getBit(word14, 13);
      this.floor2SensorSignal1.bit6 = getBit(word14, 14);
      this.floor2SensorSignal1.bit7 = getBit(word14, 15);
      this.floor2SensorSignal1.bit8 = getBit(word14, 0);
      this.floor2SensorSignal1.bit9 = getBit(word14, 1);
      this.floor2SensorSignal1.bit10 = getBit(word14, 2);
      this.floor2SensorSignal1.bit11 = getBit(word14, 3);
      this.floor2SensorSignal1.bit12 = getBit(word14, 4);
      this.floor2SensorSignal1.bit13 = getBit(word14, 5);
      this.floor2SensorSignal1.bit14 = getBit(word14, 6);
      this.floor2SensorSignal1.bit15 = getBit(word14, 7);

      let word16 = this.convertToWord(values.DBW16 ?? 0);
      this.floor2SensorSignal2.bit0 = getBit(word16, 8);
      this.floor2SensorSignal2.bit1 = getBit(word16, 9);
      this.floor2SensorSignal2.bit2 = getBit(word16, 10);
      this.floor2SensorSignal2.bit3 = getBit(word16, 11);
      this.floor2SensorSignal2.bit4 = getBit(word16, 12);
      this.floor2SensorSignal2.bit5 = getBit(word16, 13);
      this.floor2SensorSignal2.bit6 = getBit(word16, 14);
      this.floor2SensorSignal2.bit7 = getBit(word16, 15);
      this.floor2SensorSignal2.bit8 = getBit(word16, 0);
      this.floor2SensorSignal2.bit9 = getBit(word16, 1);
      this.floor2SensorSignal2.bit10 = getBit(word16, 2);
      this.floor2SensorSignal2.bit11 = getBit(word16, 3);
      this.floor2SensorSignal2.bit12 = getBit(word16, 4);
      this.floor2SensorSignal2.bit13 = getBit(word16, 5);
      this.floor2SensorSignal2.bit14 = getBit(word16, 6);
      this.floor2SensorSignal2.bit15 = getBit(word16, 7);

      let word18 = this.convertToWord(values.DBW18 ?? 0);
      this.floor2SensorSignal3.bit0 = getBit(word18, 8);
      this.floor2SensorSignal3.bit1 = getBit(word18, 9);
      this.floor2SensorSignal3.bit2 = getBit(word18, 10);
      this.floor2SensorSignal3.bit3 = getBit(word18, 11);
      this.floor2SensorSignal3.bit4 = getBit(word18, 12);
      this.floor2SensorSignal3.bit5 = getBit(word18, 13);
      this.floor2SensorSignal3.bit6 = getBit(word18, 14);
      this.floor2SensorSignal3.bit7 = getBit(word18, 15);
      this.floor2SensorSignal3.bit8 = getBit(word18, 0);
      this.floor2SensorSignal3.bit9 = getBit(word18, 1);
      this.floor2SensorSignal3.bit10 = getBit(word18, 2);
      this.floor2SensorSignal3.bit11 = getBit(word18, 3);
      this.floor2SensorSignal3.bit12 = getBit(word18, 4);
      this.floor2SensorSignal3.bit13 = getBit(word18, 5);
      this.floor2SensorSignal3.bit14 = getBit(word18, 6);
      this.floor2SensorSignal3.bit15 = getBit(word18, 7);

      let word20 = this.convertToWord(values.DBW20 ?? 0);
      this.floor2SensorSignal4.bit0 = getBit(word20, 8);
      this.floor2SensorSignal4.bit1 = getBit(word20, 9);
      this.floor2SensorSignal4.bit2 = getBit(word20, 10);
      this.floor2SensorSignal4.bit3 = getBit(word20, 11);
      this.floor2SensorSignal4.bit4 = getBit(word20, 12);
      this.floor2SensorSignal4.bit5 = getBit(word20, 13);
      this.floor2SensorSignal4.bit6 = getBit(word20, 14);
      this.floor2SensorSignal4.bit7 = getBit(word20, 15);
      this.floor2SensorSignal4.bit8 = getBit(word20, 0);
      this.floor2SensorSignal4.bit9 = getBit(word20, 1);

      // 二楼小车位置
      this.floor2CartAnalysisInPos = Number(values.DBW22 ?? 0);
      this.floor2CartAnalysisOutPos = Number(values.DBW24 ?? 0);
      this.floor2CartSpare1Pos = Number(values.DBW26 ?? 0);
      this.floor2CartSpare2Pos = Number(values.DBW28 ?? 0);
      this.cartPositionValues.cart4 = Number(values.DBW22 ?? 0);
      this.cartPositionValues.cart5 = Number(values.DBW24 ?? 0);

      let word30 = this.convertToWord(values.DBW30 ?? 0);
      this.floor2AnalysisOutTrayRequest.bit0 = getBit(word30, 8);
      this.floor2AnalysisOutTrayRequest.bit1 = getBit(word30, 9);
      this.floor2AnalysisOutTrayRequest.bit2 = getBit(word30, 10);
      this.floor2AnalysisOutTrayRequest.bit3 = getBit(word30, 11);
      this.floor2AnalysisOutTrayRequest.bit4 = getBit(word30, 12);
      this.floor2AnalysisOutTrayRequest.bit5 = getBit(word30, 13);
      this.floor2AnalysisOutTrayRequest.bit6 = getBit(word30, 14);
      this.floor2AnalysisOutTrayRequest.bit7 = getBit(word30, 15);
      this.floor2AnalysisOutTrayRequest.bit8 = getBit(word30, 0);
      this.floor2AnalysisOutTrayRequest.bit9 = getBit(word30, 1);
      this.floor2AnalysisOutTrayRequest.bit10 = getBit(word30, 2);
      this.floor2AnalysisOutTrayRequest.bit11 = getBit(word30, 3);
      this.floor2AnalysisOutTrayRequest.bit12 = getBit(word30, 4);
      this.floor2AnalysisOutTrayRequest.bit13 = getBit(word30, 5);

      // 二楼电机占位虚拟ID
      this.floor2MotorVirtualId1018A = Number(values.DBW32 ?? 0);
      this.floor2MotorVirtualId1018B = Number(values.DBW34 ?? 0);
      this.floor2MotorVirtualId1019 = Number(values.DBW36 ?? 0);
      this.floor2MotorVirtualId2002 = Number(values.DBW38 ?? 0);
      this.floor2MotorVirtualId2003 = Number(values.DBW40 ?? 0);
      this.floor2MotorVirtualId2004 = Number(values.DBW42 ?? 0);
      this.floor2MotorVirtualId2006 = Number(values.DBW44 ?? 0);
      this.floor2MotorVirtualId2007 = Number(values.DBW46 ?? 0);
      this.floor2MotorVirtualId2009 = Number(values.DBW48 ?? 0);
      this.floor2MotorVirtualId2010 = Number(values.DBW50 ?? 0);
      this.floor2MotorVirtualId2012 = Number(values.DBW52 ?? 0);
      this.floor2MotorVirtualId2013 = Number(values.DBW54 ?? 0);
      this.floor2MotorVirtualId2014 = Number(values.DBW56 ?? 0);
      this.floor2MotorVirtualId2016 = Number(values.DBW58 ?? 0);
      this.floor2MotorVirtualId2017 = Number(values.DBW60 ?? 0);
      this.floor2MotorVirtualId2018 = Number(values.DBW62 ?? 0);
      this.floor2MotorVirtualId2019 = Number(values.DBW64 ?? 0);
      this.floor2MotorVirtualId2020 = Number(values.DBW66 ?? 0);
      this.floor2MotorVirtualId2023 = Number(values.DBW68 ?? 0);
      this.floor2MotorVirtualId2039 = Number(values.DBW70 ?? 0);
      this.floor2MotorVirtualId2042 = Number(values.DBW72 ?? 0);

      // 二楼电机货物目的地
      this.floor2MotorDestination1018A = Number(values.DBW74 ?? 0);
      this.floor2MotorDestination1018B = Number(values.DBW76 ?? 0);
      this.floor2MotorDestination1019 = Number(values.DBW78 ?? 0);
      this.floor2MotorDestination2002 = Number(values.DBW80 ?? 0);
      this.floor2MotorDestination2003 = Number(values.DBW82 ?? 0);
      this.floor2MotorDestination2004 = Number(values.DBW84 ?? 0);
      this.floor2MotorDestination2006 = Number(values.DBW86 ?? 0);
      this.floor2MotorDestination2007 = Number(values.DBW88 ?? 0);
      this.floor2MotorDestination2009 = Number(values.DBW90 ?? 0);
      this.floor2MotorDestination2010 = Number(values.DBW92 ?? 0);
      this.floor2MotorDestination2012 = Number(values.DBW94 ?? 0);
      this.floor2MotorDestination2013 = Number(values.DBW96 ?? 0);
      this.floor2MotorDestination2014 = Number(values.DBW98 ?? 0);
      this.floor2MotorDestination2016 = Number(values.DBW100 ?? 0);
      this.floor2MotorDestination2017 = Number(values.DBW102 ?? 0);
      this.floor2MotorDestination2018 = Number(values.DBW104 ?? 0);
      this.floor2MotorDestination2019 = Number(values.DBW106 ?? 0);
      this.floor2MotorDestination2020 = Number(values.DBW108 ?? 0);
      this.floor2MotorDestination2023 = Number(values.DBW110 ?? 0);
      this.floor2MotorDestination2039 = Number(values.DBW112 ?? 0);
      this.floor2MotorDestination2042 = Number(values.DBW114 ?? 0);

      // 二楼解析房内实际数量
      this.floor2AnalysisRoom1Qty = Number(values.DBW116 ?? 0);
      this.floor2AnalysisRoom2Qty = Number(values.DBW118 ?? 0);
      this.floor2AnalysisRoom3Qty = Number(values.DBW120 ?? 0);
      this.floor2AnalysisRoom4Qty = Number(values.DBW122 ?? 0);
      this.floor2AnalysisRoom5Qty = Number(values.DBW124 ?? 0);
      this.floor2AnalysisRoom6Qty = Number(values.DBW126 ?? 0);
      this.floor2AnalysisRoom7Qty = Number(values.DBW128 ?? 0);
      this.floor2AnalysisRoom8Qty = Number(values.DBW130 ?? 0);
      this.floor2AnalysisRoom9Qty = Number(values.DBW132 ?? 0);
      this.floor2AnalysisRoom10Qty = Number(values.DBW134 ?? 0);
      this.floor2AnalysisRoom11Qty = Number(values.DBW136 ?? 0);
      this.floor2AnalysisRoom12Qty = Number(values.DBW138 ?? 0);
      this.floor2AnalysisRoom13Qty = Number(values.DBW140 ?? 0);
      this.floor2AnalysisRoom14Qty = Number(values.DBW142 ?? 0);
      this.floor2AnalysisRoom15Qty = Number(values.DBW144 ?? 0);
      this.floor2AnalysisRoom16Qty = Number(values.DBW146 ?? 0);
      this.floor2AnalysisRoom17Qty = Number(values.DBW148 ?? 0);

      // 二楼备用
      this.floor2SpareDBW150 = Number(values.DBW150 ?? 0);
      this.floor2SpareDBW152 = Number(values.DBW152 ?? 0);
      this.floor2SpareDBW154 = Number(values.DBW154 ?? 0);
      this.floor2SpareDBW156 = Number(values.DBW156 ?? 0);
      this.floor2SpareDBW158 = Number(values.DBW158 ?? 0);

      // 二楼故障信息
      this.floor2FaultInfo1018 = Number(values.DBW160 ?? 0);
      this.floor2FaultInfo1019 = Number(values.DBW162 ?? 0);
      this.floor2FaultInfo2001 = Number(values.DBW164 ?? 0);
      this.floor2FaultInfo2002 = Number(values.DBW166 ?? 0);
      this.floor2FaultInfo2003 = Number(values.DBW168 ?? 0);
      this.floor2FaultInfo2004 = Number(values.DBW170 ?? 0);
      this.floor2FaultInfo2005 = Number(values.DBW172 ?? 0);
      this.floor2FaultInfo2006 = Number(values.DBW174 ?? 0);
      this.floor2FaultInfo2007 = Number(values.DBW176 ?? 0);
      this.floor2FaultInfo2008 = Number(values.DBW178 ?? 0);
      this.floor2FaultInfo2009 = Number(values.DBW180 ?? 0);
      this.floor2FaultInfo2010 = Number(values.DBW182 ?? 0);
      this.floor2FaultInfo2011 = Number(values.DBW184 ?? 0);
      this.floor2FaultInfo2012 = Number(values.DBW186 ?? 0);
      this.floor2FaultInfo2013 = Number(values.DBW188 ?? 0);
      this.floor2FaultInfo2014 = Number(values.DBW190 ?? 0);
      this.floor2FaultInfo2015 = Number(values.DBW192 ?? 0);
      this.floor2FaultInfo2016 = Number(values.DBW194 ?? 0);
      this.floor2FaultInfo2017 = Number(values.DBW196 ?? 0);
      this.floor2FaultInfo2018 = Number(values.DBW198 ?? 0);
      this.floor2FaultInfo2019 = Number(values.DBW200 ?? 0);
      this.floor2FaultInfo2020 = Number(values.DBW202 ?? 0);
      this.floor2FaultInfo2021 = Number(values.DBW204 ?? 0);
      this.floor2FaultInfo2022 = Number(values.DBW206 ?? 0);
      this.floor2FaultInfo2023 = Number(values.DBW208 ?? 0);
      this.floor2FaultInfo2024 = Number(values.DBW210 ?? 0);
      this.floor2FaultInfo2025 = Number(values.DBW212 ?? 0);
      this.floor2FaultInfo2026 = Number(values.DBW214 ?? 0);
      this.floor2FaultInfo2027 = Number(values.DBW216 ?? 0);
      this.floor2FaultInfo2028 = Number(values.DBW218 ?? 0);
      this.floor2FaultInfo2029 = Number(values.DBW220 ?? 0);
      this.floor2FaultInfo2030 = Number(values.DBW222 ?? 0);
      this.floor2FaultInfo2031 = Number(values.DBW224 ?? 0);
      this.floor2FaultInfo2032 = Number(values.DBW226 ?? 0);
      this.floor2FaultInfo2033 = Number(values.DBW228 ?? 0);
      this.floor2FaultInfo2034 = Number(values.DBW230 ?? 0);
      this.floor2FaultInfo2035 = Number(values.DBW232 ?? 0);
      this.floor2FaultInfo2036 = Number(values.DBW234 ?? 0);
      this.floor2FaultInfo2037 = Number(values.DBW236 ?? 0);
      this.floor2FaultInfo2038 = Number(values.DBW238 ?? 0);
      this.floor2FaultInfo2039 = Number(values.DBW240 ?? 0);
      this.floor2FaultInfo2040 = Number(values.DBW242 ?? 0);
      this.floor2FaultInfo2041 = Number(values.DBW244 ?? 0);
      this.floor2FaultInfo2042 = Number(values.DBW246 ?? 0);
      this.floor2FaultInfo2043 = Number(values.DBW248 ?? 0);
    });
  },
  watch: {
    'cartPositionValues.cart1'(newVal) {
      this.updateCartPositionByValue(1, newVal);
    },
    'cartPositionValues.cart2'(newVal) {
      this.updateCartPositionByValue(2, newVal);
    },
    'cartPositionValues.cart3'(newVal) {
      this.updateCartPositionByValue(3, newVal);
    },
    'cartPositionValues.cart4'(newVal) {
      this.updateCartPositionByValue(4, newVal);
    },
    'cartPositionValues.cart5'(newVal) {
      this.updateCartPositionByValue(5, newVal);
    },
    // 监听上货请求信号 DB1000.DBW22.BIT0 的上升沿
    'floor1UploadTrayRequest.bit0'(newVal, oldVal) {
      // 上升沿检测：从0变为1
      if (newVal === '1' && oldVal === '0') {
        this.handleUploadTrayRequest();
      }
    },
    // 监听灭菌出货请求 DB1000.DBW24 bit0~14 上升沿
    'floor1SterilOutTrayRequest.bit0'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(19);
      }
    },
    'floor1SterilOutTrayRequest.bit1'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(20);
      }
    },
    'floor1SterilOutTrayRequest.bit2'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(21);
      }
    },
    'floor1SterilOutTrayRequest.bit3'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(22);
      }
    },
    'floor1SterilOutTrayRequest.bit4'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(23);
      }
    },
    'floor1SterilOutTrayRequest.bit5'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(24);
      }
    },
    'floor1SterilOutTrayRequest.bit6'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(25);
      }
    },
    'floor1SterilOutTrayRequest.bit7'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(26);
      }
    },
    'floor1SterilOutTrayRequest.bit8'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(27);
      }
    },
    'floor1SterilOutTrayRequest.bit9'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(28);
      }
    },
    'floor1SterilOutTrayRequest.bit10'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(29);
      }
    },
    'floor1SterilOutTrayRequest.bit11'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(30);
      }
    },
    'floor1SterilOutTrayRequest.bit12'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(31);
      }
    },
    'floor1SterilOutTrayRequest.bit13'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(32);
      }
    },
    'floor1SterilOutTrayRequest.bit14'(newVal, oldVal) {
      if (newVal === '1' && oldVal === '0') {
        this.handleSterilOutTrayRequest(33);
      }
    },
    // 监听灭菌柜内完成实际数量 DBW94-DBW122
    floor1Sterilization19Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(19, newVal, oldVal);
    },
    floor1Sterilization20Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(20, newVal, oldVal);
    },
    floor1Sterilization21Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(21, newVal, oldVal);
    },
    floor1Sterilization22Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(22, newVal, oldVal);
    },
    floor1Sterilization23Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(23, newVal, oldVal);
    },
    floor1Sterilization24Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(24, newVal, oldVal);
    },
    floor1Sterilization25Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(25, newVal, oldVal);
    },
    floor1Sterilization26Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(26, newVal, oldVal);
    },
    floor1Sterilization27Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(27, newVal, oldVal);
    },
    floor1Sterilization28Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(28, newVal, oldVal);
    },
    floor1Sterilization29Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(29, newVal, oldVal);
    },
    floor1Sterilization30Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(30, newVal, oldVal);
    },
    floor1Sterilization31Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(31, newVal, oldVal);
    },
    floor1Sterilization32Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(32, newVal, oldVal);
    },
    floor1Sterilization33Complete(newVal, oldVal) {
      this.handleSterilizationCabinetQuantityChange(33, newVal, oldVal);
    }
  },
  methods: {
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
    // ========== 订单管理相关方法 ==========
    // 刷新订单列表
    async refreshOrders() {
      if (this.isRefreshing) return;
      this.isRefreshing = true;
      await HttpUtil.post('/order_info/queryOrderList', {})
        .then((res) => {
          this.ordersList = res.data || [];
        })
        .catch((err) => {
          this.$message.error('刷新订单列表失败：' + err);
        })
        .finally(() => {
          this.isRefreshing = false;
        });
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: '未开始',
        1: '执行中',
        2: '已完成'
      };
      return statusMap[status] || status;
    },
    // 获取状态标签类型
    getStatusTagType(status) {
      const typeMap = {
        0: 'info',
        1: 'warning',
        2: 'success'
      };
      return typeMap[status] || 'info';
    },
    // 订单状态变更后刷新列表
    async handleOrderStatusChange(order, newStatus) {
      if (newStatus === 1) {
        this.$message.success(`订单 ${order.orderId} 已开始执行`);
      } else if (newStatus === 2) {
        this.$message.success(`订单 ${order.orderId} 已完成`);
      }
      await this.refreshOrders();
    },
    // 显示修改订单弹窗
    showEditOrderDialog(order) {
      this.editOrderForm = {
        id: order.id,
        orderId: order.orderId,
        orderName: order.orderName,
        batchNo: order.batchNo,
        productName: order.productName,
        processName: order.processName || '',
        orderQuantity: order.orderQuantity
      };
      this.editOrderDialogVisible = true;
    },
    // 提交修改订单
    async submitEditOrder() {
      try {
        await this.$refs.editOrderForm.validate();
        this.isEditingOrder = true;
        const param = {
          id: this.editOrderForm.id,
          orderId: this.editOrderForm.orderId,
          orderName: this.editOrderForm.orderName,
          batchNo: this.editOrderForm.batchNo,
          productName: this.editOrderForm.productName,
          processName: this.editOrderForm.processName || '',
          orderQuantity: this.editOrderForm.orderQuantity
        };
        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.$message.success('订单修改成功');
              this.addLog(
                `订单 ${param.orderId} 修改成功，产品：${param.productName}，数量：${param.orderQuantity}`
              );
              this.editOrderDialogVisible = false;
              this.refreshOrders();
            } else {
              this.$message.error('修改订单失败：' + (res.message || '请重试'));
            }
          })
          .catch((err) => {
            this.$message.error('修改订单失败：' + err);
          })
          .finally(() => {
            this.isEditingOrder = false;
          });
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('表单验证失败，请检查输入');
        }
        this.isEditingOrder = false;
      }
    },
    // 取消修改订单
    cancelEditOrder() {
      this.editOrderDialogVisible = false;
      this.$refs.editOrderForm && this.$refs.editOrderForm.resetFields();
    },
    // 显示新建订单弹窗
    showAddOrderDialog() {
      this.addOrderDialogVisible = true;
      this.newOrderForm = {
        orderId: '',
        orderName: '',
        batchNo: '',
        productName: '',
        processName: '',
        orderQuantity: null
      };
    },
    // 提交新建订单
    async submitAddOrder() {
      try {
        await this.$refs.newOrderForm.validate();
        this.isSubmittingOrder = true;
        // 获取当前登录用户信息
        let userInfo = { userName: '', userCode: '' };
        try {
          userInfo = remote.getGlobal('sharedObject').userInfo || userInfo;
        } catch (e) {
          // 非 Electron 环境时忽略
        }
        const orderData = {
          orderId: this.newOrderForm.orderId,
          orderName: this.newOrderForm.orderName,
          batchNo: this.newOrderForm.batchNo,
          productName: this.newOrderForm.productName,
          processName: this.newOrderForm.processName || '',
          orderQuantity: this.newOrderForm.orderQuantity,
          orderStatus: 0,
          invalidFlag: 0,
          loadedQuantity: 0,
          createrName: userInfo.userName || '',
          createrCode: userInfo.userCode || ''
        };
        await HttpUtil.post('/order_info/save', orderData)
          .then((res) => {
            if (res.code === '200' || res.data >= 1) {
              this.$message.success('订单创建成功');
              this.addLog(
                `新建订单 ${orderData.orderId} 创建成功，产品：${orderData.productName}，数量：${orderData.orderQuantity}`
              );
              this.addOrderDialogVisible = false;
              this.refreshOrders();
            } else {
              this.$message.error('创建订单失败：' + (res.message || '请重试'));
            }
          })
          .catch((err) => {
            this.$message.error('创建订单失败：' + err);
          })
          .finally(() => {
            this.isSubmittingOrder = false;
          });
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('表单验证失败，请检查输入');
        }
        this.isSubmittingOrder = false;
      }
    },
    // 取消新建订单
    cancelAddOrder() {
      this.addOrderDialogVisible = false;
      this.$refs.newOrderForm && this.$refs.newOrderForm.resetFields();
    },
    // 显示执行订单弹窗
    showExecuteOrderDialog(order) {
      // 检查是否有正在执行的订单
      const runningOrder = this.ordersList.find((o) => o.orderStatus === 1);
      if (runningOrder) {
        this.$message.warning('当前已有订单正在执行，请先完成或取消当前订单');
        return;
      }
      this.executeOrderForm = {
        id: order.id,
        orderId: order.orderId,
        orderName: order.orderName,
        destination: '',
        analysisTime: null
      };
      this.executeOrderDialogVisible = true;
    },
    // 提交执行订单
    async submitExecuteOrder() {
      try {
        await this.$refs.executeOrderForm.validate();
        this.isExecutingOrder = true;
        // 获取当前登录用户信息
        let userInfo = { userName: '', userCode: '' };
        try {
          userInfo = remote.getGlobal('sharedObject').userInfo || userInfo;
        } catch (e) {
          // 非 Electron 环境时忽略
        }
        const param = {
          id: this.executeOrderForm.id,
          destination: this.executeOrderForm.destination,
          analysisTime: this.executeOrderForm.analysisTime,
          executorName: userInfo.userName || '',
          executorCode: userInfo.userCode || ''
        };
        await HttpUtil.post('/order_info/executeOrder', param)
          .then((res) => {
            if (res.code === '200' || res.data >= 1) {
              this.$message.success('订单已开始执行');
              this.addLog(
                `订单 ${this.executeOrderForm.orderId} 开始执行，目的地：${this.executeOrderForm.destination}，解析时间：${this.executeOrderForm.analysisTime}小时`
              );
              this.executeOrderDialogVisible = false;
              this.refreshOrders();
            } else {
              this.$message.error('执行订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('执行订单失败：' + err);
          })
          .finally(() => {
            this.isExecutingOrder = false;
          });
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('表单验证失败，请检查输入');
        }
        this.isExecutingOrder = false;
      }
    },
    // 完成订单
    async finishOrder(order) {
      try {
        await this.$confirm('确认完成该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        this.$set(order, 'isLoading', true);
        let userInfo = { userName: '', userCode: '' };
        try {
          userInfo = remote.getGlobal('sharedObject').userInfo || userInfo;
        } catch (e) {
          // 非 Electron 环境时忽略
        }
        const param = {
          id: order.id,
          orderStatus: 2,
          finisherName: userInfo.userName || '',
          finisherCode: userInfo.userCode || '',
          finishTime: new Date()
        };
        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.handleOrderStatusChange(order, 2);
              this.addLog(
                `订单 ${order.orderId} 已完成，产品：${order.productName}`
              );
            } else {
              this.$message.error('完成订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('完成订单失败，请重试');
          })
          .finally(() => {
            order.isLoading = false;
          });
      } catch (err) {
        // 用户取消操作
      }
    },
    // 取消订单（从执行中恢复为未开始）
    async cancelOrder(order) {
      try {
        await this.$confirm('确认要取消该订单的执行状态吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        this.$set(order, 'isLoading', true);
        const param = {
          id: order.id,
          orderStatus: 0
        };
        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.handleOrderStatusChange(order, 0);
              this.$message.success('订单状态已更新为未开始');
            } else {
              this.$message.error('取消订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('取消订单失败，请重试');
          })
          .finally(() => {
            order.isLoading = false;
          });
      } catch (err) {
        // 用户取消操作
      }
    },
    // 删除订单（作废）
    async deleteOrder(order) {
      try {
        await this.$confirm('确认要删除该订单吗？删除后无法恢复。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        this.$set(order, 'isDeleting', true);
        const param = {
          id: order.id,
          invalidFlag: 1
        };
        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.$message.success('订单删除成功');
              this.addLog(`订单 ${order.orderId} 已删除`);
              this.refreshOrders();
            } else {
              this.$message.error('删除订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('删除订单失败，请重试');
          })
          .finally(() => {
            this.$set(order, 'isDeleting', false);
          });
      } catch (err) {
        // 用户取消操作
      }
    },
    // 显示历史订单弹窗
    async showHistoryOrders() {
      this.historyDialogVisible = true;
      await this.loadHistoryOrders();
    },
    // ========== 上货请求信号处理 ==========
    // 处理上货请求信号（DB1000.DBW22.BIT0 上升沿触发）
    async handleUploadTrayRequest() {
      if (this.isHandlingUploadRequest) {
        this.addLog('上货请求处理中，忽略重复信号');
        return;
      }
      this.isHandlingUploadRequest = true;
      try {
        // 1. 查找当前执行中的订单
        const runningOrder = this.ordersList.find((o) => o.orderStatus === 1);
        if (!runningOrder) {
          this.addLog('上货请求失败：当前没有执行中的订单', 'alarm');
          this.$message.warning('当前没有执行中的订单，无法上货');
          return;
        }

        // 2. 检查订单是否已完成数量
        if (runningOrder.loadedQuantity >= runningOrder.orderQuantity) {
          this.addLog(
            `上货请求失败：订单 ${runningOrder.orderId} 已上货数量(${runningOrder.loadedQuantity})已达到订单数量(${runningOrder.orderQuantity})`,
            'alarm'
          );
          this.$message.warning('该订单已上货完成，无需继续上货');
          return;
        }

        // 3. 生成虚拟ID（范围10000-29999，递增）
        const virtualId = this.generateVirtualId();
        if (!virtualId) {
          this.addLog('上货请求失败：虚拟ID已用尽(10000-29999)', 'alarm');
          this.$message.error('虚拟ID已用尽，请联系管理员');
          return;
        }

        // 4. 获取目的地（从订单执行信息中获取，无目的地则不允许上货）
        if (!runningOrder.destination) {
          this.addLog('上货请求失败：订单没有设置目的地，不允许上货', 'alarm');
          this.$message.warning(
            '当前执行订单没有目的地，请先执行订单设置目的地'
          );
          return;
        }
        const destination = Number(runningOrder.destination);

        // 5. 向 PLC 写入虚拟ID和目的地（写2S后取消）
        ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW10', virtualId);
        ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW14', destination);
        this.addLog(`已向上货口写入虚拟ID=${virtualId}，目的地=${destination}`);

        // 2秒后取消写入
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW10');
          ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW14');
        }, 2000);

        // 6. 生成托盘信息并加入上货区队列
        const now = new Date();
        const timeStr = moment(now).format('YYYY-MM-DD HH:mm:ss');
        const trayInfo = {
          trayCode: String(virtualId),
          virtualId: virtualId,
          trayTime: timeStr,
          isTerile: 0,
          sendTo: String(destination),
          state: 'loaded',
          sequenceNumber: String(this.queues[0].trayInfo.length + 1),
          orderId: runningOrder.orderId || '',
          orderDbId: runningOrder.id,
          productCode: runningOrder.productCode || '',
          productName: runningOrder.productName || '',
          unit: runningOrder.unit || '',
          batchNo: runningOrder.batchNo || '',
          processName: runningOrder.processName || '',
          destination: String(destination),
          remark: `订单${runningOrder.orderId}自动上货`
        };

        // 将托盘加入上货区队列（queues[0]）
        this.queues[0].trayInfo.push(trayInfo);

        // 更新扫码信息显示
        this.nowScanTrayInfo = {
          virtualId: virtualId,
          destination: destination
        };

        // 7. 更新订单已上货数量（loadedQuantity + 1）
        const newLoadedQty = (runningOrder.loadedQuantity || 0) + 1;
        const updateParam = {
          id: runningOrder.id,
          loadedQuantity: newLoadedQty
        };
        await HttpUtil.post('/order_info/update', updateParam)
          .then((res) => {
            if (res.code === '200') {
              this.refreshOrders();
            } else {
              this.addLog(
                `订单 ${runningOrder.orderId} 已上货数量更新失败`,
                'alarm'
              );
            }
          })
          .catch((err) => {
            this.addLog(
              `订单 ${runningOrder.orderId} 已上货数量更新异常: ${err}`,
              'alarm'
            );
          });

        this.addLog(
          `上货请求处理完成：虚拟ID=${virtualId}，订单=${runningOrder.orderId}，目的地=${destination}，已上货${newLoadedQty}/${runningOrder.orderQuantity}`
        );
      } catch (error) {
        console.error('处理上货请求时出错:', error);
        this.addLog('处理上货请求时发生异常: ' + error.message, 'alarm');
        this.$message.error('处理上货请求失败: ' + error.message);
      } finally {
        this.isHandlingUploadRequest = false;
      }
    },
    // 生成虚拟ID（范围10000-29999，基于本批次已写入的虚拟ID递增）
    generateVirtualId() {
      // 从上货区队列中找出当前批次最大的虚拟ID
      let maxVirtualId = 0;
      this.queues.forEach((queue) => {
        (queue.trayInfo || []).forEach((tray) => {
          const vid = Number(tray.virtualId || 0);
          if (vid >= 10000 && vid <= 29999 && vid > maxVirtualId) {
            maxVirtualId = vid;
          }
        });
      });

      // 如果队列中没有虚拟ID，则从currentVirtualId开始
      let nextId;
      if (maxVirtualId > 0) {
        nextId = maxVirtualId + 1;
      } else {
        nextId = this.currentVirtualId;
      }

      // 检查是否超出范围
      if (nextId > 29999) {
        return null;
      }

      this.currentVirtualId = nextId;
      return nextId;
    },
    // 手动触发上货请求信号（测试用）
    manualTriggerUploadRequest() {
      this.floor1UploadTrayRequest.bit0 = '1';
      setTimeout(() => {
        this.floor1UploadTrayRequest.bit0 = '0';
      }, 1000);
    },
    getSterilizationCompleteQuantity(cabinetNo) {
      return this[`floor1Sterilization${cabinetNo}Complete`] || 0;
    },
    updateSterilizationCompleteQuantity(cabinetNo, change) {
      this.isDataReady = true;
      const key = `floor1Sterilization${cabinetNo}Complete`;
      this[key] = Math.max(0, parseInt(this[key] || 0) + change);
    },
    writePlcPulse(tag, value) {
      ipcRenderer.send('writeSingleValueToPLC_0', tag, value);
      setTimeout(() => {
        ipcRenderer.send('cancelWriteToPLC_0', tag);
      }, 2000);
    },
    getSterilQueueIndex(cabinetNo) {
      return cabinetNo - 18;
    },
    getAnalysisQueueIndex(roomNo) {
      return roomNo + 17;
    },
    getAnalysisRoomCount(roomNo) {
      const queueIndex = this.getAnalysisQueueIndex(roomNo);
      const queue = this.queues[queueIndex];
      return queue && Array.isArray(queue.trayInfo) ? queue.trayInfo.length : 0;
    },
    pickAvailableAnalysisRoom() {
      for (let i = 1; i <= 19; i++) {
        if (this.getAnalysisRoomCount(i) < 15) {
          return i;
        }
      }
      return null;
    },
    resolveAnalysisDestination() {
      if (this.sterToAnalysisTo) {
        this.sterToAnalysisResolvedTo = String(this.sterToAnalysisTo);
        return Number(this.sterToAnalysisTo);
      }
      const room = this.pickAvailableAnalysisRoom();
      if (room === null) {
        return null;
      }
      this.sterToAnalysisResolvedTo = String(room);
      return room;
    },
    writeSterilOutTrayToPlc(cabinetNo, virtualId, destination) {
      if (cabinetNo >= 31 && cabinetNo <= 33) {
        this.writePlcPulse('W_DBW24', virtualId);
        this.writePlcPulse('W_DBW26', destination);
      } else if (cabinetNo >= 19 && cabinetNo <= 30) {
        this.writePlcPulse('W_DBW28', virtualId);
        this.writePlcPulse('W_DBW30', destination);
      }
    },
    handleSterilizationCabinetQuantityChange(cabinetNo, newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        this.handleSterilizationCabinetQuantityIncrease(
          cabinetNo,
          newVal,
          oldVal
        );
      } else if (newVal < oldVal) {
        this.handleSterilizationCabinetQuantityDecrease(
          cabinetNo,
          newVal,
          oldVal
        );
      }
    },
    handleSterilizationCabinetQuantityIncrease(cabinetNo, newVal, oldVal) {
      const increaseCount = newVal - oldVal;
      const destStr = String(cabinetNo);
      const sourceQueue = this.queues[0];
      const targetQueue = this.queues[cabinetNo - 18];
      if (!sourceQueue || !targetQueue) {
        this.addLog(`灭菌柜${cabinetNo}数量增加，找不到对应队列`, 'alarm');
        return;
      }

      let movedCount = 0;
      for (let i = 0; i < increaseCount; i++) {
        const trayIndex = sourceQueue.trayInfo.findIndex(
          (tray) =>
            String(tray.sendTo) === destStr ||
            String(tray.destination) === destStr
        );

        if (trayIndex === -1) {
          break;
        }

        const tray = sourceQueue.trayInfo[trayIndex];
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        this.$set(tray, 'sterilizationRoom', destStr);
        this.$set(tray, 'inSterilizationRoomTime', currentTime);
        targetQueue.trayInfo.push(tray);
        sourceQueue.trayInfo.splice(trayIndex, 1);
        movedCount++;
        this.addLog(
          `托盘 ${tray.trayCode} 从上货区进入灭菌柜${cabinetNo}，时间：${currentTime}`
        );
      }

      if (movedCount > 0) {
        this.addLog(`从上货区移动${movedCount}个托盘到灭菌柜${cabinetNo}队列`);
      }

      if (movedCount < increaseCount) {
        this.addLog(
          `灭菌柜${cabinetNo}数量增加${increaseCount}，上货区目的地为${cabinetNo}的托盘不足，仅移动${movedCount}个托盘`
        );
      }
    },
    handleSterilizationCabinetQuantityDecrease(cabinetNo, newVal, oldVal) {
      const decreaseCount = oldVal - newVal;
      if (!this.sterToAnalysisExecuting) {
        this.addLog(
          `灭菌柜${cabinetNo}完成数量减少${decreaseCount}（${oldVal}→${newVal}），灭菌到解析未执行，跳过队列移动`
        );
        return;
      }
      if (cabinetNo !== Number(this.sterToAnalysisFrom)) return;

      const sourceQueue = this.queues[this.getSterilQueueIndex(cabinetNo)];
      const conveyorQueue = this.queues[16];
      if (!sourceQueue || !conveyorQueue) {
        this.addLog(`灭菌柜${cabinetNo}数量减少，找不到对应队列`, 'alarm');
        return;
      }

      for (let i = 0; i < sourceQueue.trayInfo.length; i++) {
        const tray = sourceQueue.trayInfo[i];
        if (!tray.analysisDestination) {
          const dest = this.resolveAnalysisDestination();
          if (dest === null) {
            this.addLog('解析房均已满，无法分配目的地，已取消执行', 'alarm');
            this.cancelSterToAnalysis();
            return;
          }
          this.$set(tray, 'analysisDestination', String(dest));
        }
      }

      let movedCount = 0;
      for (let i = 0; i < decreaseCount; i++) {
        const trayIndex = sourceQueue.trayInfo.findIndex(
          (tray) => tray.analysisDestination
        );
        if (trayIndex === -1) {
          break;
        }

        const tray = sourceQueue.trayInfo[trayIndex];
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        this.$set(tray, 'outSterilizationRoomTime', currentTime);
        conveyorQueue.trayInfo.push(tray);
        sourceQueue.trayInfo.splice(trayIndex, 1);
        movedCount++;
        this.sterToAnalysisSentCount++;
        this.addLog(
          `托盘 ${
            tray.trayCode || tray.id
          } 离开灭菌柜${cabinetNo}进入输送线，解析房目的地=${
            tray.analysisDestination
          }，时间：${currentTime}`
        );
      }

      if (movedCount < decreaseCount) {
        this.addLog(
          `灭菌柜${cabinetNo}数量减少${decreaseCount}，已设解析房目的地的托盘不足，仅移动${movedCount}个托盘`,
          'alarm'
        );
      }

      const resolvedTo = Number(this.sterToAnalysisResolvedTo);
      if (
        resolvedTo &&
        this.getAnalysisRoomCount(resolvedTo) + this.sterToAnalysisSentCount >=
          15
      ) {
        this.cancelSterToAnalysis();
        this.addLog(
          `灭菌柜到解析房执行完成，解析房${resolvedTo}容量已满（15），已自动停止执行`
        );
        return;
      }

      if (newVal === 0) {
        this.cancelSterToAnalysis();
        this.addLog(`灭菌柜${cabinetNo}数量已减至0，已自动停止执行`);
      }
    },
    handleSterilOutTrayRequest(cabinetNo) {
      if (!this.sterToAnalysisExecuting) return;
      if (cabinetNo !== Number(this.sterToAnalysisFrom)) return;
      if (this.isHandlingSterilOutRequest) return;

      const sourceQueue = this.queues[this.getSterilQueueIndex(cabinetNo)];
      if (!sourceQueue) return;

      const trayIndex = sourceQueue.trayInfo.findIndex(
        (tray) => !tray.analysisDestination
      );
      if (trayIndex === -1) {
        this.addLog(
          `灭菌柜${cabinetNo}出货请求：无待分配解析房目的地的托盘`,
          'alarm'
        );
        return;
      }

      this.isHandlingSterilOutRequest = true;
      try {
        const dest = this.resolveAnalysisDestination();
        if (dest === null) {
          this.addLog('解析房均已满，无法分配目的地，已取消执行', 'alarm');
          this.cancelSterToAnalysis();
          return;
        }

        const tray = sourceQueue.trayInfo[trayIndex];
        this.$set(tray, 'analysisDestination', String(dest));

        const virtualId = Number(tray.virtualId || 0);
        if (!virtualId) {
          this.addLog(
            `托盘 ${tray.trayCode || tray.id} 缺少虚拟ID，无法写入PLC`,
            'alarm'
          );
          return;
        }

        this.writeSterilOutTrayToPlc(cabinetNo, virtualId, dest);
        this.sterToAnalysisTrayCode = tray.trayCode || tray.id || '';
        this.addLog(
          `灭菌柜${cabinetNo}出货请求：托盘 ${this.sterToAnalysisTrayCode} 解析房目的地=${dest}，虚拟ID=${virtualId}`
        );
      } finally {
        this.isHandlingSterilOutRequest = false;
      }
    },
    // 关闭历史订单弹窗
    handleHistoryDialogClose(done) {
      this.historyOrders = [];
      this.currentPage = 1;
      done();
    },
    // 加载历史订单
    async loadHistoryOrders() {
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        orderId: this.historyFilter.orderId || '',
        orderName: this.historyFilter.orderName || '',
        orderStatus:
          this.historyFilter.orderStatus !== ''
            ? this.historyFilter.orderStatus
            : null,
        executorName: ''
      };
      try {
        const res = await HttpUtil.post(
          '/order_info/queryHistoryOrderList',
          params
        );
        if (res.code === '200') {
          this.historyOrders = res.data.list || [];
          this.totalHistoryOrders = res.data.total || 0;
        } else {
          this.$message.error('获取历史订单失败');
        }
      } catch (error) {
        this.$message.error('获取历史订单失败');
      }
    },
    // 搜索历史订单
    searchHistoryOrders() {
      this.currentPage = 1;
      this.loadHistoryOrders();
    },
    // 重置筛选条件
    resetHistoryFilters() {
      this.historyFilter = { orderId: '', orderName: '', orderStatus: '' };
      this.currentPage = 1;
      this.loadHistoryOrders();
    },
    // 分页大小变更
    handleHistorySizeChange(val) {
      this.pageSize = val;
      this.loadHistoryOrders();
    },
    // 当前页变更
    handleHistoryCurrentChange(val) {
      this.currentPage = val;
      this.loadHistoryOrders();
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
            // 全线启动：写入 DB1001.DBW2（WCS-全线启动），见 写入PLC点位.csv
            ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW2', 1);
            setTimeout(() => {
              ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW2');
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
            // 全线停止：写入 DB1001.DBW4（WCS-全线停止），见 写入PLC点位.csv
            ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW4', 1);
            setTimeout(() => {
              ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW4');
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
            // 全线暂停：写入点位以 写入PLC点位.csv 为准，暂用 W_DBW6；可按实际协议调整
            ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW6', 1);
            setTimeout(() => {
              ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW6');
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
            // 故障复位：写入 DB1001.DBW8（WCS-故障复位），见 写入PLC点位.csv
            ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW8', 1);
            setTimeout(() => {
              ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW8');
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
        // 监听容器尺寸变化（窗口缩放、侧边栏收缩/展开均会触发）
        const container = this.$el.querySelector('.floor-image-container');
        if (container && typeof ResizeObserver !== 'undefined') {
          this._resizeObserver = new ResizeObserver(() => {
            if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
            this._resizeRaf = requestAnimationFrame(() => {
              this._resizeRaf = null;
              this.updateMarkerPositions();
            });
          });
          this._resizeObserver.observe(container);
        }
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
          .map((tray) => ({
            id: tray.trayCode || '',
            name: tray.trayCode ? `托盘 ${tray.trayCode}` : '未知托盘',
            time: tray.trayTime || '',
            isTerile: tray.isTerile,
            sendTo: tray.sendTo || '', // 添加sendTo属性
            state: tray.state || '', // 添加state属性
            sequenceNumber: tray.sequenceNumber || '', // 添加sequenceNumber属性
            orderId: tray.orderId || '', // 添加订单ID
            productCode: tray.productCode || '', // 添加物料编码
            productName: tray.productName || '', // 添加产品名称
            unit: tray.unit || '', // 添加规格
            batchNo: tray.batchNo || '', // 添加批次
            remark: tray.remark || '' // 添加备注
          }))
          .filter((tray) => tray.id); // 过滤掉没有 id 的托盘
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
          (t) => t.trayCode === this.draggedTray.id
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
          `托盘 ${movedTray.trayCode} 从 ${sourceQueue.queueName} 移动到 ${targetQueue.queueName}`
        );

        this.$message({
          type: 'success',
          message: `托盘 ${movedTray.trayCode} 已成功移动到 ${targetQueue.queueName}`,
          duration: 2000
        });
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return;
        }
        console.error('移动托盘时出错:', error);
        this.$message.error(error.message || '移动托盘失败，请重试');
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
          `确认将托盘 ${currentTray.trayCode} 上移一位（与 ${prevTray.trayCode} 交换位置）？`,
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
          `托盘 ${currentTray.trayCode} 在 ${this.selectedQueue.queueName} 中上移`
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
          `确认将托盘 ${currentTray.trayCode} 下移一位（与 ${nextTray.trayCode} 交换位置）？`,
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
          `托盘 ${currentTray.trayCode} 在 ${this.selectedQueue.queueName} 中下移`
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
    // 更新数据库队列信息（仅同步trayInfo，AGV状态字段由syncAgvStatusToBackend单独控制）
    // 更新数据库队列信息
    updateQueueInfo(id) {
      const param = {
        id: id,
        trayInfo: JSON.stringify(this.queues[id - 1].trayInfo)
      };
      HttpUtil.post('/queue_info/update', param).catch((err) => {
        this.$message.error(err);
      });
    },
    updateCartPositionByValue(cartId, value) {
      const cart = this.carts.find((c) => c.id === cartId);
      if (!cart) return;
      const xRange = this.cartXRanges[`cart${cartId}`];
      const plcRange = this.cartPlcRanges[`cart${cartId}`];
      if (!xRange || !plcRange) return;
      if (value < plcRange.min) value = plcRange.min;
      if (value > plcRange.max) value = plcRange.max;
      const ratio = (value - plcRange.min) / (plcRange.max - plcRange.min);
      cart.x = Math.round(xRange.min + (xRange.max - xRange.min) * ratio);
      this.$nextTick(() => {
        this.updateCartPositionOnly(cartId);
      });
    },
    updateCartPositionOnly(cartId) {
      const images = document.querySelectorAll('.floor-image');
      images.forEach((image) => {
        const imageWrapper = image.parentElement;
        if (!imageWrapper) return;

        const cart = imageWrapper.querySelector(
          `.cart-container[data-cart-id="${cartId}"]`
        );
        if (!cart) return;

        const cartData = this.carts.find((c) => c.id === cartId);
        if (!cartData) return;

        const wrapperRect = imageWrapper.getBoundingClientRect();
        const displayedWidth = image.width;
        const displayedHeight = image.height;
        const scaleX = displayedWidth / image.naturalWidth;
        const scaleY = displayedHeight / image.naturalHeight;
        const imageOffsetX = (wrapperRect.width - displayedWidth) / 2;
        const imageOffsetY = (wrapperRect.height - displayedHeight) / 2;

        const x = cartData.x;
        const y = cartData.y;
        const width = cartData.width;
        if (!isNaN(x) && !isNaN(y)) {
          cart.style.left = `${imageOffsetX + x * scaleX}px`;
          cart.style.top = `${imageOffsetY + y * scaleY}px`;
          if (!isNaN(width)) {
            cart.style.width = `${width * scaleX}px`;
          }
        }
      });
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
        })
        .finally(() => {
          this._queueInitDone = true;
        });
    },
    // ========== 预热房到灭菌柜执行 ==========
    executePreheatToSterilize() {
      if (!this.preheatToSterilizeFrom || !this.preheatToSterilizeTo) {
        this.$message.warning('请先选择预热房和灭菌柜');
        return;
      }
      this.$confirm(
        `确认执行预热房${this.preheatToSterilizeFrom}到灭菌柜${this.preheatToSterilizeTo}进货命令？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.preheatToSterilizeLoading = true;
          const preheatNo = Number(this.preheatToSterilizeFrom);
          const sterilizeNo = Number(this.preheatToSterilizeTo);
          // WCS执行进货预热柜编号 DB1001.DBW16
          ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW16', preheatNo);
          // WCS执行进货灭菌柜进货执行命令 DB1001.DBW18
          ipcRenderer.send('writeSingleValueToPLC_0', 'W_DBW18', sterilizeNo);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW16');
            ipcRenderer.send('cancelWriteToPLC_0', 'W_DBW18');
          }, 2000);
          this.addLog(
            `执行预热房${this.preheatToSterilizeFrom}到灭菌柜${this.preheatToSterilizeTo}进货命令（DBW16=${this.preheatToSterilizeFrom}, DBW18=${this.preheatToSterilizeTo}）`
          );
          this.$message.success(
            `已发送预热房${this.preheatToSterilizeFrom}到灭菌柜${this.preheatToSterilizeTo}执行命令`
          );
          setTimeout(() => {
            this.preheatToSterilizeLoading = false;
          }, 2000);
        })
        .catch(() => {
          // 用户取消操作
        });
    },
    // ========== 灭菌柜到解析房执行 ==========
    executeSterToAnalysis() {
      if (!this.sterToAnalysisFrom) {
        this.$message.warning('请先选择出货灭菌柜');
        return;
      }
      if (
        this.preheatToSterilizeTo &&
        this.preheatToSterilizeTo === this.sterToAnalysisFrom
      ) {
        this.$message.warning(
          `灭菌柜${this.sterToAnalysisFrom}已被选择为预热到灭菌的目的地，不能同时执行出货`
        );
        return;
      }

      const cabinetNo = Number(this.sterToAnalysisFrom);
      const sourceQueue = this.queues[this.getSterilQueueIndex(cabinetNo)];
      const systemQueueCount = sourceQueue?.trayInfo?.length || 0;
      const plcCount = this.getSterilizationCompleteQuantity(cabinetNo);

      if (systemQueueCount <= 0 || plcCount <= 0) {
        this.$message.warning(
          `灭菌柜${cabinetNo}中没有可用的托盘，请检查起始地数量`
        );
        return;
      }

      let analysisRoomNo;
      if (this.sterToAnalysisTo) {
        analysisRoomNo = Number(this.sterToAnalysisTo);
        this.sterToAnalysisResolvedTo = String(analysisRoomNo);
      } else {
        analysisRoomNo = this.resolveAnalysisDestination();
        if (analysisRoomNo === null) {
          this.$message.warning('所有解析房均已满，无法执行');
          return;
        }
      }

      if (this.getAnalysisRoomCount(analysisRoomNo) >= 15) {
        this.$message.warning(`解析房${analysisRoomNo}已满，无法执行`);
        return;
      }

      this.$confirm(
        `确认执行灭菌柜${cabinetNo}到解析房${analysisRoomNo}出货命令？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.sterToAnalysisLoading = true;
          this.writePlcPulse('W_DBW20', cabinetNo);
          this.writePlcPulse('W_DBW22', analysisRoomNo);
          this.sterToAnalysisExecuting = true;
          this.sterToAnalysisSentCount = 0;
          this.sterToAnalysisTrayCode =
            sourceQueue.trayInfo[0]?.trayCode ||
            sourceQueue.trayInfo[0]?.id ||
            '';
          this.addLog(
            `执行灭菌柜${cabinetNo}到解析房${analysisRoomNo}出货命令（DBW20=${cabinetNo}, DBW22=${analysisRoomNo}）`
          );
          this.$message.success(
            `已发送灭菌柜${cabinetNo}到解析房${analysisRoomNo}执行命令`
          );
        })
        .catch(() => {
          // 用户取消操作
        });
    },
    cancelSterToAnalysis() {
      this.sterToAnalysisLoading = false;
      this.sterToAnalysisExecuting = false;
      this.sterToAnalysisSentCount = 0;
      this.sterToAnalysisResolvedTo = '';
      this.sterToAnalysisTrayCode = '';
      this.addLog('灭菌柜到解析房选择已取消，切换为不执行状态');
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
    if (this._resizeRaf) {
      cancelAnimationFrame(this._resizeRaf);
      this._resizeRaf = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    // 取消队列监听器
    if (this._queueWatchers && this._queueWatchers.length > 0) {
      this._queueWatchers.forEach((unwatch) => {
        if (typeof unwatch === 'function') {
          unwatch();
        }
      });
      this._queueWatchers = [];
    }
  }
};
</script>

<style lang="less" scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
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
      .operation-panel,
      .order-list-section {
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
      /* 订单列表区域专用样式 */
      .order-list-section {
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          .title-actions {
            display: flex;
            gap: 4px;
            margin-left: auto;
            .refresh-btn,
            .add-order-btn {
              width: 26px;
              height: 26px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              background: rgba(255, 255, 255, 0.2);
              color: #fff;
              transition: background 0.2s;
              i {
                font-size: 14px;
              }
              &:hover {
                background: rgba(255, 255, 255, 0.35);
              }
              &.is-loading i {
                animation: spin 1s linear infinite;
              }
            }
            .add-order-btn {
              background: rgba(103, 194, 58, 0.4);
              &:hover {
                background: rgba(103, 194, 58, 0.6);
              }
            }
          }
        }
        .order-actions {
          margin-left: auto;
        }
        .scrollable-content {
          height: 220px;
          overflow-y: auto;
          padding: 6px 8px;
          display: flex;
          flex-direction: column;
        }
        .order-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .order-item {
          position: relative;
          background: #ffffff;
          border: 1px solid var(--mp-border-light);
          border-radius: 10px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          &.pending {
            border-left: 3px solid #b8c9e6;
            background: #ffffff;
          }
          &.running {
            border-left: 3px solid var(--mp-accent);
            background: #eaf2ff;
            border-color: #c4d8f5;
          }
          &.complete {
            border-left: 3px solid #85a5d6;
            background: #f3f7fc;
          }
          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            padding-bottom: 3px;
            border-bottom: 1px dashed var(--mp-border-light);
            .order-header-left {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;
              overflow: hidden;
              .order-id {
                font-weight: 700;
                font-size: 13px;
                color: var(--mp-accent-deep);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                background: var(--mp-accent-bg);
                padding: 1px 8px;
                border-radius: 4px;
              }
              .order-status {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: var(--mp-text-secondary);
                white-space: nowrap;
                &::before {
                  content: '';
                  display: inline-block;
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: #c0c4cc;
                  flex-shrink: 0;
                }
                &.running {
                  color: var(--mp-accent-deep);
                  font-weight: 600;
                  &::before {
                    background: var(--mp-accent);
                    box-shadow: 0 0 0 3px rgba(67, 133, 255, 0.2);
                  }
                }
              }
            }
            .order-header-actions {
              display: flex;
              align-items: center;
              gap: 6px;
              flex-shrink: 0;
            }
          }
          .order-info {
            .info-row {
              display: flex;
              flex-wrap: wrap;
              gap: 2px 12px;
              margin-bottom: 1px;
              font-size: 12px;
              line-height: 16px;
              .info-label {
                color: var(--mp-text-secondary);
                white-space: nowrap;
              }
              .info-value {
                color: var(--mp-text);
                font-weight: 500;
              }
            }
          }
        }
        .order-action-btn {
          padding: 4px 12px;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          height: 26px;
          line-height: 1;
          &:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          &.loading {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          &--execute {
            background: linear-gradient(135deg, #4385ff, #2f54eb);
          }
          &--complete {
            background: linear-gradient(135deg, #67c23a, #529b2e);
          }
          &--edit {
            background: linear-gradient(135deg, #e6a23c, #cf8e22);
          }
          &--delete {
            background: linear-gradient(135deg, #f56c6c, #dd4a4a);
          }
          &--cancel {
            background: linear-gradient(135deg, #909399, #737680);
          }
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 0;
          color: var(--mp-text-secondary);
          flex: 1;
          i {
            font-size: 36px;
            margin-bottom: 12px;
            color: #c0c4cc;
          }
          p {
            font-size: 14px;
            margin: 0 0 12px 0;
          }
          .refresh-link {
            padding: 0;
            font-size: 14px;
            color: var(--mp-accent);
            i {
              font-size: 14px;
              margin-right: 4px;
              color: inherit;
              margin-bottom: 0;
            }
            &:hover {
              color: var(--mp-accent-hover);
            }
          }
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
              top: 10px;
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
                    .status-dot {
                      display: inline-block;
                      width: 6px;
                      height: 6px;
                      border-radius: 50%;
                      margin-right: 4px;
                    }
                    .data-panel-row {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      color: rgba(255, 255, 255, 0.9);
                      .data-panel-label {
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 12px;
                        white-space: nowrap;
                        flex-shrink: 0;
                        margin-right: 6px;
                        display: inline-flex;
                        align-items: center;
                      }
                      .barcode-value {
                        flex: 1;
                        min-width: 0;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
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

                    /* 扫码分组网格布局 */
                    .scan-groups-grid {
                      display: flex;
                      flex-direction: column;
                      gap: 12px;
                    }

                    .scan-group-row {
                      display: grid;
                      grid-template-columns: repeat(7, 1fr);
                      gap: 6px;
                    }

                    .scan-group {
                      background: rgba(64, 158, 255, 0.08);
                      border: 1px solid rgba(64, 158, 255, 0.2);
                      border-left: 3px solid #409eff;
                      border-radius: 6px;
                      padding: 6px 8px;
                    }

                    .scan-group.with-watermark {
                      position: relative;
                      overflow: hidden;
                    }

                    .sort-port-card {
                      background: rgba(120, 150, 200, 0.08);
                      border-color: rgba(120, 150, 200, 0.2);
                      border-left-color: #7896c8;

                      .group-watermark {
                        color: rgba(120, 150, 200, 0.35);
                      }

                      .port-send-btn {
                        background: rgba(120, 150, 200, 0.1);
                        border-color: rgba(120, 150, 200, 0.3);
                        color: #8aa8d0;

                        &:hover {
                          background: rgba(120, 150, 200, 0.2);
                          border-color: rgba(120, 150, 200, 0.5);
                          color: #a8c0e0;
                        }
                      }
                    }

                    .group-watermark {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      font-size: 22px;
                      font-weight: 900;
                      color: rgba(64, 158, 255, 0.4);
                      pointer-events: none;
                      user-select: none;
                      z-index: 0;
                      letter-spacing: -1px;
                    }

                    .group-items {
                      display: flex;
                      flex-direction: column;
                      gap: 2px;
                      position: relative;
                      z-index: 1;
                    }

                    .scan-item {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 1px 0;
                    }

                    .scan-label {
                      font-size: 11px;
                      color: rgba(255, 255, 255, 0.7);
                    }

                    .scan-value {
                      font-size: 11px;
                      color: rgba(255, 255, 255, 0.95);
                      font-weight: 500;
                      text-align: right;
                      flex: 1;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      max-width: 80px;
                    }

                    .panel-divider {
                      height: 1px;
                      background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(64, 158, 255, 0.4) 20%,
                        rgba(64, 158, 255, 0.4) 80%,
                        transparent 100%
                      );
                      margin: 0;
                    }

                    .port-send-btn {
                      background: rgba(64, 158, 255, 0.15);
                      border: 1px solid rgba(64, 158, 255, 0.4);
                      color: rgba(64, 158, 255, 0.9);
                      border-radius: 3px;
                      padding: 2px 6px;
                      font-size: 14px;
                      cursor: pointer;
                      transition: all 0.2s;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      line-height: 1;
                    }

                    .port-send-btn:hover {
                      background: rgba(64, 158, 255, 0.3);
                      border-color: rgba(64, 158, 255, 0.6);
                      color: #409eff;
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
              .queue-marker--narrow {
                padding: 8px 2px;
                min-width: auto;
                .queue-marker-content {
                  .queue-marker-name {
                    width: 2em;
                    line-height: 1.3;
                    word-break: break-all;
                    text-align: center;
                  }
                  .queue-marker-count {
                    line-height: 1.2;
                    margin-bottom: 2px;
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

              .queue-marker--locked {
                border-color: rgba(245, 108, 108, 0.7) !important;
                background: rgba(60, 20, 20, 0.85) !important;
              }

              .queue-marker-lock-overlay {
                position: absolute;
                top: -6px;
                right: -6px;
                width: 16px;
                height: 16px;
                background: #f56c6c;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #fff;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                cursor: pointer;
                z-index: 10;
              }

              .queue-marker-lock-overlay:hover {
                background: #e6413e;
                transform: scale(1.2);
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
  padding: 10px;
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
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px;
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.test-label {
  display: block;
  color: #7eb8ff;
  margin-bottom: 4px;
  font-size: 13px;
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
  gap: 5px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.qrcode-test-container .el-button {
  padding: 4px 8px;
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
}

.qrcode-btn-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.qrcode-btn-grid .el-button {
  width: 100%;
}

.qrcode-input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.qrcode-input-grid .qrcode-input-group {
  gap: 2px;
}

.qrcode-input-grid .qrcode-label {
  width: 32px;
  font-size: 11px;
}

.qrcode-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qrcode-label {
  width: 40px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
  flex-shrink: 0;
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
  height: 24px;
  line-height: 24px;
  padding: 0 6px;
  font-size: 11px;
}

.qrcode-input :deep(.el-input__inner::placeholder) {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
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

.steril-quantity-test-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.steril-quantity-item {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 3px;
  box-sizing: border-box;
  width: calc((100% - 8px) / 3);
  background: rgba(30, 42, 56, 0.85);
  border-radius: 3px;
  border: 1px solid rgba(64, 158, 255, 0.12);
}

.steril-quantity-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  min-width: 18px;
  flex-shrink: 0;
}

.steril-quantity-value {
  font-size: 12px;
  color: #7eb8ff;
  font-weight: bold;
  min-width: 14px;
  text-align: center;
  flex: 1;
}

.steril-quantity-buttons {
  display: flex;
  gap: 2px;
  flex-shrink: 0;

  .quantity-btn {
    width: 18px;
    height: 18px;
    font-size: 12px;
    line-height: 1;
    padding: 0;
  }
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
