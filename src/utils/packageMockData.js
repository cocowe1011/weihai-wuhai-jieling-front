/**
 * 大包 mock 数据（来源：大包列表 CSV 样例行）
 */
const MOCK_PACKAGE_TEMPLATES = [
  {
    packageNo: 'KRRM04321276',
    packageSize: 'large',
    customerSource: 'AE海运',
    packageCreateTime: '2026-05-14 11:32:47',
    sourceWarehouse: '威海心怡优选分拨仓',
    chargeWeight: '27400.000',
    expectedQty: '43',
    actualQty: '43',
    channel: 'L_AE_EXPRESS_SEA_XTW_CJ',
    packageStatus: '已装箱',
    destinationCountry: '韩国',
    departurePort: '',
    destinationPort: '',
    mblNo: '',
    subBillNo: '',
    businessNo: '',
    containerNo: 'LYGU4031358',
    sealNo: '',
    packingTime: '2026-05-14 14:24:03',
    packer: '韩龙盼',
    handoverTime: '2026-05-14 11:33:10',
    handoverPerson: '崔言芹',
    customsPort: '',
    billReceiver: '',
    batchNo: 'D001563-W260514-0018',
    plateNo: 'LFCE621'
  },
  {
    packageNo: 'KRV2VDIR00000041',
    packageSize: 'small',
    customerSource: 'AE海运',
    packageCreateTime: '2026-05-14 17:23:34',
    sourceWarehouse: 'TRAN_STORE_30320880',
    chargeWeight: '400.000',
    expectedQty: '1',
    actualQty: '1',
    channel: 'L_AE_EXPRESS_XTWSEA_ACT_V2V',
    packageStatus: '已装箱',
    destinationCountry: '韩国',
    departurePort: '',
    destinationPort: '',
    mblNo: '',
    subBillNo: '',
    businessNo: '*TEST20260515',
    containerNo: '',
    sealNo: '',
    packingTime: '2026-05-15 11:04:43',
    packer: '蔡荧琳',
    handoverTime: '',
    handoverPerson: '',
    customsPort: '',
    billReceiver: '',
    batchNo: 'D000486-W260514-0004',
    plateNo: ''
  },
  {
    packageNo: 'KRRM04320531',
    packageSize: 'large',
    customerSource: 'AE海运',
    packageCreateTime: '2026-05-14 10:33:37',
    sourceWarehouse: '威海心怡优选分拨仓',
    chargeWeight: '7170.000',
    expectedQty: '1',
    actualQty: '1',
    channel: 'L_AE_EXPRESS_SEA_XTW_CJ',
    packageStatus: '已装箱',
    destinationCountry: '韩国',
    departurePort: '',
    destinationPort: '',
    mblNo: '',
    subBillNo: '',
    businessNo: '',
    containerNo: 'CICU9807371',
    sealNo: '',
    packingTime: '2026-05-14 13:49:26',
    packer: '韩龙盼',
    handoverTime: '2026-05-14 11:02:19',
    handoverPerson: '谭业臣',
    customsPort: '',
    billReceiver: '',
    batchNo: 'D001563-W260514-0013',
    plateNo: 'LFEF086'
  }
];

const DEFAULT_TEMPLATE = MOCK_PACKAGE_TEMPLATES[0];

/**
 * 根据扫码条码 mock 包裹信息
 * @param {string} barcode
 * @returns {object}
 */
export function mockPackageByBarcode(barcode) {
  const code = (barcode || '').trim();
  const matched = MOCK_PACKAGE_TEMPLATES.find(
    (item) => item.packageNo === code
  );
  const base = matched ? { ...matched } : { ...DEFAULT_TEMPLATE };

  if (!matched) {
    base.packageNo = code;
  }

  return { ...base, barcode: code };
}

/**
 * 包裹对象 → order_info 保存 payload
 * @param {object} pkg
 * @returns {object}
 */
export function toOrderInfoPayload(pkg) {
  return {
    invalidFlag: '0',
    trayStatus: '1',
    packageNo: pkg.packageNo,
    customerSource: pkg.customerSource,
    packageCreateTime: pkg.packageCreateTime,
    sourceWarehouse: pkg.sourceWarehouse,
    chargeWeight: pkg.chargeWeight,
    expectedQty: pkg.expectedQty,
    actualQty: pkg.actualQty,
    channel: pkg.channel,
    packageStatus: pkg.packageStatus,
    destinationCountry: pkg.destinationCountry,
    departurePort: pkg.departurePort,
    destinationPort: pkg.destinationPort,
    mblNo: pkg.mblNo,
    subBillNo: pkg.subBillNo,
    businessNo: pkg.businessNo,
    containerNo: pkg.containerNo,
    sealNo: pkg.sealNo,
    packingTime: pkg.packingTime,
    packer: pkg.packer,
    handoverTime: pkg.handoverTime,
    handoverPerson: pkg.handoverPerson,
    customsPort: pkg.customsPort,
    billReceiver: pkg.billReceiver,
    batchNo: pkg.batchNo,
    plateNo: pkg.plateNo
  };
}

/**
 * 包裹对象 → 左侧展示 / nowScanTrayInfo
 * @param {object} pkg
 * @returns {object}
 */
export function toScanDisplayInfo(pkg) {
  return {
    packageNo: pkg.packageNo,
    customerSource: pkg.customerSource,
    sourceWarehouse: pkg.sourceWarehouse,
    channel: pkg.channel,
    destinationCountry: pkg.destinationCountry,
    batchNo: pkg.batchNo
  };
}
