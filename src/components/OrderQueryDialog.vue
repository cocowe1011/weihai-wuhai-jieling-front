<template>
  <el-dialog
    title="订单查询"
    :visible.sync="dialogVisible"
    width="98%"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    append-to-body
    class="order-query-dialog"
  >
    <!-- 查询条件 -->
    <div class="query-form">
      <div class="query-item">
        <label>订单编号：</label>
        <el-input
          v-model="queryForm.orderId"
          placeholder="订单编号"
          clearable
          style="width: 180px"
        ></el-input>
      </div>
      <div class="query-item">
        <label>订单名称：</label>
        <el-input
          v-model="queryForm.orderName"
          placeholder="订单名称"
          clearable
          style="width: 180px"
        ></el-input>
      </div>
      <div class="query-item">
        <label>订单状态：</label>
        <el-select
          v-model="queryForm.orderStatus"
          placeholder="全部"
          clearable
          style="width: 140px"
        >
          <el-option label="未开始" :value="0"></el-option>
          <el-option label="执行中" :value="1"></el-option>
          <el-option label="已完成" :value="2"></el-option>
        </el-select>
      </div>
      <div class="query-item query-actions">
        <el-button type="primary" @click="handleSearch" :loading="loading">
          <i class="el-icon-search"></i>查询
        </el-button>
        <el-button @click="handleReset">
          <i class="el-icon-refresh-left"></i>重置
        </el-button>
        <el-button
          type="success"
          @click="handleExportExcel"
          :loading="exportLoading"
          :disabled="pagination.total === 0"
        >
          <i class="el-icon-download"></i>导出Excel
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        element-loading-text="正在查询..."
        style="width: 100%"
        max-height="400px"
      >
        <el-table-column
          prop="orderId"
          label="订单编号"
          width="140"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="orderName"
          label="订单名称"
          min-width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="batchNo"
          label="批号"
          width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="productName"
          label="产品名称"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="processName"
          label="工艺名称"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="orderQuantity"
          label="订单数量"
          width="90"
        ></el-table-column>
        <el-table-column
          prop="loadedQuantity"
          label="已上货"
          width="80"
        ></el-table-column>
        <el-table-column
          prop="destination"
          label="目的地"
          width="80"
        ></el-table-column>
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
        ></el-table-column>
        <el-table-column
          prop="createrName"
          label="创建人"
          width="90"
        ></el-table-column>
        <el-table-column
          prop="executorName"
          label="执行人"
          width="90"
        ></el-table-column>
        <el-table-column
          prop="finisherName"
          label="完成人"
          width="90"
        ></el-table-column>
        <el-table-column
          prop="finishTime"
          label="完成时间"
          width="160"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openEdit(scope.row)">
              修改
            </el-button>
            <el-button
              type="text"
              size="small"
              class="order-invalidate-btn"
              :disabled="isInvalidRow(scope.row)"
              @click="handleInvalidate(scope.row)"
            >
              作废
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      >
      </el-pagination>
    </div>

    <el-dialog
      title="修改订单"
      :visible.sync="editDialogVisible"
      width="520px"
      append-to-body
      :close-on-click-modal="false"
      @closed="resetEditForm"
    >
      <div class="edit-form-body">
        <el-form
          ref="editFormRef"
          :model="editForm"
          label-width="100px"
          size="small"
        >
          <el-form-item label="订单编号">
            <el-input v-model="editForm.orderId" clearable></el-input>
          </el-form-item>
          <el-form-item label="订单名称">
            <el-input v-model="editForm.orderName" clearable></el-input>
          </el-form-item>
          <el-form-item label="批号">
            <el-input v-model="editForm.batchNo" clearable></el-input>
          </el-form-item>
          <el-form-item label="产品名称">
            <el-input v-model="editForm.productName" clearable></el-input>
          </el-form-item>
          <el-form-item label="工艺名称">
            <el-input v-model="editForm.processName" clearable></el-input>
          </el-form-item>
          <el-form-item label="订单数量">
            <el-input-number
              v-model="editForm.orderQuantity"
              :min="0"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select
              v-model="editForm.orderStatus"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option label="未开始" :value="0"></el-option>
              <el-option label="执行中" :value="1"></el-option>
              <el-option label="已完成" :value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="editSaving" @click="submitEdit">
          保 存
        </el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';
import * as XLSX from 'xlsx';
import fs from 'fs';
import HttpUtil from '@/utils/HttpUtil';

const remote = require('electron').remote;

const emptyQueryForm = () => ({
  orderId: '',
  orderName: '',
  orderStatus: ''
});

const emptyEditForm = () => ({
  id: null,
  orderId: '',
  orderName: '',
  batchNo: '',
  productName: '',
  processName: '',
  orderQuantity: 0,
  orderStatus: 0
});

export default {
  name: 'OrderQueryDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      exportLoading: false,
      queryForm: emptyQueryForm(),
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0
      },
      editDialogVisible: false,
      editForm: emptyEditForm(),
      editBeforeSnapshot: null,
      editSaving: false
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.handleSearch();
      }
    }
  },
  methods: {
    isInvalidRow(row) {
      return String(row.invalidFlag) === '1';
    },
    getStatusText(status) {
      const map = {
        0: '未开始',
        1: '执行中',
        2: '已完成'
      };
      return map[String(status)] || status || '—';
    },
    getStatusTagType(status) {
      const typeMap = {
        0: 'info',
        1: 'warning',
        2: 'success'
      };
      return typeMap[String(status)] || 'info';
    },
    openEdit(row) {
      this.editForm = {
        id: row.id,
        orderId: row.orderId || '',
        orderName: row.orderName || '',
        batchNo: row.batchNo || '',
        productName: row.productName || '',
        processName: row.processName || '',
        orderQuantity: row.orderQuantity != null ? row.orderQuantity : 0,
        orderStatus: row.orderStatus != null ? row.orderStatus : 0
      };
      this.editBeforeSnapshot = { ...this.editForm };
      this.editDialogVisible = true;
    },
    resetEditForm() {
      this.editForm = emptyEditForm();
      this.editBeforeSnapshot = null;
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.clearValidate();
      }
    },
    emitLocalOrderLog(line) {
      try {
        ipcRenderer.send('writeLogToLocal', line);
      } catch (e) {
        console.error('写入本地订单日志失败:', e);
      }
    },
    async submitEdit() {
      if (this.editForm.id == null) return;
      this.editSaving = true;
      try {
        const payload = {
          id: this.editForm.id,
          orderId: this.editForm.orderId,
          orderName: this.editForm.orderName,
          batchNo: this.editForm.batchNo,
          productName: this.editForm.productName,
          processName: this.editForm.processName,
          orderQuantity: this.editForm.orderQuantity,
          orderStatus: this.editForm.orderStatus
        };
        const res = await HttpUtil.post('/order_info/update', payload);
        if (res && res.data === 1) {
          this.emitLocalOrderLog(
            `[订单修改] 原来:${JSON.stringify(
              this.editBeforeSnapshot || {}
            )} | 现在:${JSON.stringify(payload)}`
          );
          this.$message.success('保存成功');
          this.editDialogVisible = false;
          this.handleSearch();
        } else {
          this.$message.error(res.msg || '保存失败');
        }
      } catch (e) {
        console.error(e);
        this.$message.error('保存失败，请重试');
      } finally {
        this.editSaving = false;
      }
    },
    handleInvalidate(row) {
      if (this.isInvalidRow(row)) return;
      this.$confirm('确认将该订单标记为作废？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async () => {
          try {
            const res = await HttpUtil.post('/order_info/update', {
              id: row.id,
              invalidFlag: 1
            });
            if (res && res.data === 1) {
              this.$message.success('已作废');
              this.handleSearch();
            } else {
              this.$message.error(res.msg || '作废失败');
            }
          } catch (e) {
            console.error(e);
            this.$message.error('作废失败，请重试');
          }
        })
        .catch(() => {});
    },
    buildSearchParams(overrides = {}) {
      const params = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        ...this.queryForm,
        ...overrides
      };

      Object.keys(params).forEach((key) => {
        if (
          params[key] === '' ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      return params;
    },

    mapRowToExport(row) {
      return {
        订单编号: row.orderId || '',
        订单名称: row.orderName || '',
        批号: row.batchNo || '',
        产品名称: row.productName || '',
        工艺名称: row.processName || '',
        订单数量: row.orderQuantity != null ? row.orderQuantity : '',
        已上货: row.loadedQuantity != null ? row.loadedQuantity : '',
        目的地: row.destination || '',
        解析时间: row.analysisTime != null ? row.analysisTime + 'h' : '',
        状态: this.getStatusText(row.orderStatus),
        创建时间: row.createTime || '',
        创建人: row.createrName || '',
        执行人: row.executorName || '',
        完成人: row.finisherName || '',
        完成时间: row.finishTime || ''
      };
    },

    async handleExportExcel() {
      if (this.pagination.total === 0) {
        this.$message.warning('暂无数据可导出');
        return;
      }

      this.exportLoading = true;
      try {
        const params = this.buildSearchParams({
          pageNum: 1,
          pageSize: this.pagination.total
        });
        const res = await HttpUtil.post(
          '/order_info/queryHistoryOrderList',
          params
        );
        const list = (res && res.data && res.data.list) || [];
        if (!list.length) {
          this.$message.warning('暂无数据可导出');
          return;
        }

        const ws = XLSX.utils.json_to_sheet(
          list.map((row) => this.mapRowToExport(row))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '订单查询');

        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad(
          now.getMonth() + 1
        )}-${pad(now.getDate())}_${pad(now.getHours())}${pad(
          now.getMinutes()
        )}${pad(now.getSeconds())}`;
        const { canceled, filePath } = await remote.dialog.showSaveDialog({
          title: '导出Excel',
          defaultPath: `订单查询_${timestamp}.xlsx`,
          filters: [{ name: 'Excel文件', extensions: ['xlsx'] }]
        });
        if (canceled || !filePath) return;

        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        fs.writeFileSync(filePath, buffer);
        this.$message.success('导出成功');
      } catch (error) {
        console.error('导出Excel失败:', error);
        this.$message.error('导出失败，请重试');
      } finally {
        this.exportLoading = false;
      }
    },

    async handleSearch() {
      this.loading = true;
      try {
        const params = this.buildSearchParams();

        const res = await HttpUtil.post(
          '/order_info/queryHistoryOrderList',
          params
        );
        const page = res && res.data;
        if (page) {
          this.tableData = page.list || [];
          this.pagination.total = page.total != null ? page.total : 0;
        } else {
          this.tableData = [];
          this.pagination.total = 0;
        }
      } catch (error) {
        console.error('查询订单失败:', error);
        this.$message.error('查询订单失败，请重试');
        this.tableData = [];
        this.pagination.total = 0;
      } finally {
        this.loading = false;
      }
    },

    handleReset() {
      this.queryForm = emptyQueryForm();
      this.pagination.pageNum = 1;
      this.handleSearch();
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.pageNum = 1;
      this.handleSearch();
    },

    handleCurrentChange(val) {
      this.pagination.pageNum = val;
      this.handleSearch();
    }
  }
};
</script>

<style lang="less" scoped>
.order-query-dialog {
  .query-form {
    padding: 10px 0;
    margin-bottom: 10px;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    overflow-x: auto;

    .query-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      label {
        font-size: 14px;
        color: #606266;
        white-space: nowrap;
      }

      .el-button + .el-button {
        margin-left: 10px;
      }
    }

    .query-actions {
      white-space: nowrap;
    }
  }

  .table-container {
    margin-bottom: 15px;
  }

  .pagination-container {
    text-align: right;
    padding: 15px 0;
    border-top: 1px solid #ebeef5;
  }

  .order-invalidate-btn {
    color: #f56c6c;
    &:hover:not(.is-disabled) {
      color: #f78989;
    }
    &.is-disabled {
      color: #c0c4cc;
    }
  }
}

.edit-form-body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
