<template>
  <el-dialog
    title="订单查询"
    :visible.sync="dialogVisible"
    width="95%"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    append-to-body
    class="order-query-dialog"
  >
    <!-- 查询条件（与 OrderInfo PO / 分页 DTO 字段对应） -->
    <div class="query-form">
      <div class="query-item">
        <label>生产日期：</label>
        <el-date-picker
          v-model="queryForm.productionDate"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          clearable
          style="width: 160px"
        >
        </el-date-picker>
      </div>
      <div class="query-item">
        <label>批次ID：</label>
        <el-input
          v-model="queryForm.batchId"
          placeholder="批次ID"
          style="width: 200px"
          clearable
        ></el-input>
      </div>
      <div class="query-item">
        <label>物料编码：</label>
        <el-input
          v-model="queryForm.productCode"
          placeholder="物料编码"
          style="width: 200px"
          clearable
        ></el-input>
      </div>
      <div class="query-item">
        <label>生产订单号：</label>
        <el-input
          v-model="queryForm.orderId"
          placeholder="生产订单号"
          style="width: 200px"
          clearable
        ></el-input>
      </div>
      <div class="query-item">
        <el-button type="primary" @click="handleSearch" :loading="loading">
          <i class="el-icon-search"></i>查询
        </el-button>
        <el-button @click="handleReset">
          <i class="el-icon-refresh-left"></i>重置
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
          prop="insertTime"
          label="生产日期"
          width="170"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="batchId"
          label="批次订单ID"
          min-width="140"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="productName"
          label="产品名称"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="trayCode"
          label="托盘号"
          width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="trayStatus"
          label="托盘状态"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getTrayStatusType(scope.row.trayStatus)"
              size="small"
            >
              {{ getTrayStatusText(scope.row.trayStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="spec"
          label="规格"
          width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="finishTime"
          label="订单完成时间"
          width="170"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="weight"
          label="称重重量"
          width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="batchNum"
          label="组批数量"
          width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="source"
          label="来源"
          width="90"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="productCode"
          label="物料编码"
          width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="orderId"
          label="生产订单号"
          width="160"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="fseqId"
          label="分录行号"
          width="90"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="fentryId"
          label="分录ID"
          width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="unloadPort"
          label="下货口"
          width="80"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.unloadPort ? scope.row.unloadPort + '#' : '—'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="udiCode"
          label="UDI条码"
          min-width="160"
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
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="100px"
        size="small"
      >
        <el-form-item label="托盘号">
          <el-input v-model="editForm.trayCode" clearable></el-input>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="editForm.productName" clearable></el-input>
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="editForm.spec" clearable></el-input>
        </el-form-item>
        <el-form-item label="批次订单ID">
          <el-input v-model="editForm.batchId" clearable></el-input>
        </el-form-item>
        <el-form-item label="托盘状态">
          <el-select
            v-model="editForm.trayStatus"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="已称重" value="3"></el-option>
            <el-option label="已下货" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="称重重量">
          <el-input v-model="editForm.weight" clearable></el-input>
        </el-form-item>
        <el-form-item label="组批数量">
          <el-input v-model="editForm.batchNum" clearable></el-input>
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="editForm.source" clearable></el-input>
        </el-form-item>
        <el-form-item label="物料编码">
          <el-input v-model="editForm.productCode" clearable></el-input>
        </el-form-item>
        <el-form-item label="生产订单号">
          <el-input v-model="editForm.orderId" clearable></el-input>
        </el-form-item>
        <el-form-item label="分录行号">
          <el-input v-model="editForm.fseqId" clearable></el-input>
        </el-form-item>
        <el-form-item label="分录ID">
          <el-input v-model="editForm.fentryId" clearable></el-input>
        </el-form-item>
        <el-form-item label="下货口">
          <el-select
            v-model="editForm.unloadPort"
            placeholder="请选择"
            style="width: 100%"
            clearable
          >
            <el-option label="1#下货口" value="1"></el-option>
            <el-option label="2#下货口" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="UDI条码">
          <el-input v-model="editForm.udiCode" clearable></el-input>
        </el-form-item>
      </el-form>
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
import HttpUtil from '@/utils/HttpUtil';

const emptyQueryForm = () => ({
  productionDate: '',
  batchId: '',
  productCode: '',
  orderId: ''
});

const emptyEditForm = () => ({
  id: null,
  trayCode: '',
  productName: '',
  spec: '',
  batchId: '',
  trayStatus: '',
  weight: '',
  batchNum: '',
  source: '',
  productCode: '',
  orderId: '',
  fseqId: '',
  fentryId: '',
  unloadPort: '',
  udiCode: ''
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
    openEdit(row) {
      this.editForm = {
        id: row.id,
        trayCode: row.trayCode || '',
        productName: row.productName || '',
        spec: row.spec || '',
        batchId: row.batchId || '',
        trayStatus:
          row.trayStatus != null && row.trayStatus !== ''
            ? String(row.trayStatus)
            : '',
        weight: row.weight != null ? String(row.weight) : '',
        batchNum: row.batchNum != null ? String(row.batchNum) : '',
        source: row.source || '',
        productCode: row.productCode || '',
        orderId: row.orderId || '',
        fseqId: row.fseqId || '',
        fentryId: row.fentryId || '',
        unloadPort:
          row.unloadPort != null && row.unloadPort !== ''
            ? String(row.unloadPort)
            : '',
        udiCode: row.udiCode || ''
      };
      this.editBeforeSnapshot = {
        trayCode: row.trayCode || '',
        productName: row.productName || '',
        spec: row.spec || '',
        batchId: row.batchId || '',
        trayStatus:
          row.trayStatus != null && row.trayStatus !== ''
            ? String(row.trayStatus)
            : '',
        weight: row.weight != null ? String(row.weight) : '',
        batchNum: row.batchNum != null ? String(row.batchNum) : '',
        source: row.source || '',
        productCode: row.productCode || '',
        orderId: row.orderId || '',
        fseqId: row.fseqId || '',
        fentryId: row.fentryId || '',
        unloadPort:
          row.unloadPort != null && row.unloadPort !== ''
            ? String(row.unloadPort)
            : '',
        udiCode: row.udiCode || ''
      };
      this.editDialogVisible = true;
    },
    resetEditForm() {
      this.editForm = emptyEditForm();
      this.editBeforeSnapshot = null;
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.clearValidate();
      }
    },
    formatOrderEditLocalLog(before, afterPayload) {
      const keys = [
        'trayCode',
        'productName',
        'spec',
        'batchId',
        'trayStatus',
        'weight',
        'batchNum',
        'source',
        'productCode',
        'orderId',
        'fseqId',
        'fentryId',
        'unloadPort',
        'udiCode'
      ];
      const norm = (v) => (v == null || v === '' ? '' : String(v));
      const parts = [];
      keys.forEach((k) => {
        const bv = before ? norm(before[k]) : '';
        const av = norm(afterPayload[k]);
        if (bv !== av) {
          parts.push(`${k}:${bv || '(空)'}→${av || '(空)'}`);
        }
      });
      const changeText = parts.length > 0 ? parts.join('; ') : '(无字段变更)';
      return `[订单修改] id=${afterPayload.id} ${changeText}`;
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
          trayCode: this.editForm.trayCode,
          productName: this.editForm.productName,
          spec: this.editForm.spec,
          batchId: this.editForm.batchId,
          trayStatus: this.editForm.trayStatus,
          weight: this.editForm.weight,
          batchNum: this.editForm.batchNum,
          source: this.editForm.source,
          productCode: this.editForm.productCode,
          orderId: this.editForm.orderId,
          fseqId: this.editForm.fseqId,
          fentryId: this.editForm.fentryId,
          unloadPort: this.editForm.unloadPort,
          udiCode: this.editForm.udiCode
        };
        const res = await HttpUtil.post('/order_info/update', payload);
        if (res && res.data === 1) {
          this.emitLocalOrderLog(
            this.formatOrderEditLocalLog(this.editBeforeSnapshot, payload)
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
              invalidFlag: '1'
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
    async handleSearch() {
      this.loading = true;
      try {
        const params = {
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
          ...this.queryForm
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

        params.invalidFlag = '0';

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
    },

    /** 托盘状态：1执行中 2已组批 3已称重 4已下货 */
    getTrayStatusText(status) {
      const map = {
        1: '执行中',
        2: '已组批',
        3: '已称重',
        4: '已下货'
      };
      return map[String(status)] || status || '—';
    },

    getTrayStatusType(status) {
      const s = String(status);
      const typeMap = {
        1: 'warning',
        2: 'primary',
        3: 'success',
        4: 'info'
      };
      return typeMap[s] || 'info';
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
    gap: 20px;
    flex-wrap: wrap;

    .query-item {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-size: 14px;
        color: #606266;
        white-space: nowrap;
      }

      .el-button + .el-button {
        margin-left: 10px;
      }
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
</style>
