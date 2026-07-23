import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  dialog,
  Tray,
  screen
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import nodes7 from 'nodes7';
import HttpUtil from '@/utils/HttpUtil';
import logger from 'electron-log';
import plcPoints from '@/utils/plcPoints';
// 设置日志文件的保存路径
logger.transports.file.file = app.getPath('userData') + '/app.log';

// 初始化日志记录器
logger.transports.file.level = 'info';
logger.transports.console.level = 'info';
// 日期样式
logger.transports.file.format =
  '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
console.log(app.getPath('userData'));
logger.transports.file.file = app.getPath('userData') + '/app.log';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
var appTray = null;
let closeStatus = false;
// PLC 配置 - 加 PLC 只改这里（variables/readItems/writeItems 从 plcPoints.js 引入）
var plcConfigs = [
  {
    name: '一楼',
    host: '192.168.2.10',
    port: 102,
    variables: plcPoints.variables1,
    readItems: plcPoints.readItems1,
    writeItems: plcPoints.writeItems1
  },
  {
    name: '二楼',
    host: '192.168.2.20',
    port: 102,
    variables: plcPoints.variables2,
    readItems: plcPoints.readItems2,
    writeItems: plcPoints.writeItems2
  }
];

// 工厂函数：创建 PLC 实例，每台 PLC 状态独立互不干扰
function createPLCInstance(config) {
  return {
    config: config,
    conn: new nodes7(),
    variables: config.variables,
    readItems: config.readItems,
    writeStrArr: config.writeItems.map(function () {
      return 0;
    }),
    writeAddArr: config.writeItems.slice(),
    // 串行 IO 调度状态：同一连接同一时刻只做一次读或一次写
    ioBusy: false, // 本连接读或写是否在途（串行锁）
    ioPhase: 'read', // 当前相位：'read' | 'write'
    schedulerStarted: false, // 防止重复启动定时器
    heartWriteCount: 1, // 写周期计数：每 2 次写翻转一次心跳
    heartValue: 0 // 心跳值，折叠进写相位下发
  };
}

var plcInstances = plcConfigs.map(createPLCInstance);

// 每拍间隔：读写相位交替 → 读约 400ms/次、写约 400ms/次
const PLC_IO_CYCLE_MS = 200;

// 读取缩放配置文件（D://weihai-wuhai-jieling-front/config/zoom.json，升级不覆盖）
function readZoomConfig() {
  const configDir = 'D://weihai-wuhai-jieling-front/config';
  const configPath = path.join(configDir, 'zoom.json');
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      // 非数字值(如""、null)原样返回，由渲染进程判断是否执行缩放
      return config.zoomFactor;
    }
  } catch (error) {
    logger.error('读取缩放配置失败: ' + error.message);
  }
  // 配置文件不存在时才创建默认文件
  if (!fs.existsSync(configPath)) {
    const defaultConfig = { zoomFactor: null };
    try {
      if (!fs.existsSync(configDir))
        fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        'utf-8'
      );
    } catch (error) {
      logger.error('创建默认缩放配置失败: ' + error.message);
    }
  }
  return null;
}

// 记录日志的辅助函数
function logToFile(message) {
  const timestamp = new Date().toLocaleString();
  const logPath =
    'D://weihai-wuhai-jieling-front/log/' +
    new Date().toLocaleDateString().replaceAll('/', '-') +
    'runlog.txt';
  fs.appendFile(logPath, `[${timestamp}] ${message}\n`, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
}

// 日志缓冲相关变量
let logBuffer = [];
let logBufferTimer = null;
const LOG_BUFFER_SIZE = 10; // 缓冲区大小
const LOG_FLUSH_INTERVAL = 5000; // 5秒刷新一次

// 优化的日志写入函数
function writeLogToLocalOptimized(logData) {
  // 添加时间戳
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] ${logData}\n`;

  // 添加到缓冲区
  logBuffer.push(logEntry);

  // 如果缓冲区满了，立即刷新
  if (logBuffer.length >= LOG_BUFFER_SIZE) {
    flushLogBuffer();
  } else if (!logBufferTimer) {
    // 设置定时器，定期刷新缓冲区
    logBufferTimer = setTimeout(() => {
      flushLogBuffer();
    }, LOG_FLUSH_INTERVAL);
  }
}

// 刷新日志缓冲区
function flushLogBuffer() {
  if (logBuffer.length === 0) return;

  const logPath =
    'D://weihai-wuhai-jieling-front/log/' +
    (new Date().toLocaleDateString() + '.txt').replaceAll('/', '-');

  // 确保日志目录存在
  const logDir = 'D://weihai-wuhai-jieling-front/log';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // 检查日志文件大小，如果超过10MB则进行轮转
  try {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 10) {
        // 创建备份文件
        const backupPath = logPath.replace('.txt', `_${Date.now()}.txt`);
        fs.renameSync(logPath, backupPath);
        console.log(`日志文件过大，已轮转到: ${backupPath}`);
      }
    }
  } catch (error) {
    console.error('检查日志文件大小时出错:', error);
  }

  // 批量写入日志
  const logContent = logBuffer.join('');
  fs.appendFile(logPath, logContent, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // 清空缓冲区
  logBuffer = [];

  // 清除定时器
  if (logBufferTimer) {
    clearTimeout(logBufferTimer);
    logBufferTimer = null;
  }
}
// electron 开启热更新
try {
  require('electron-reloader')(module, {});
} catch (_) {
  // 忽略热更新错误
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出时确保所有日志都被写入
app.on('before-quit', () => {
  flushLogBuffer();
});

// 单实例锁，防止应用被多开 - 必须在app.ready之前检查
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // 直接退出，不创建任何窗口，避免白色背景框
  console.log('检测到已有程序运行，直接退出');
  // 使用 process.exit 确保立即退出，避免任何延迟
  process.exit(0);
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

global.sharedObject = {
  userInfo: {},
  zoomFactor: null
};
let mainWindow = null;
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    frame: false,
    show: false, // 先不显示窗口，等页面加载完成后再显示，避免白屏
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    icon: './build/icons/icon.ico'
  });

  // 缩放：readZoomConfig原样返回配置值，渲染进程判断typeof==='number'才执行
  const zoomFactor = readZoomConfig();
  global.sharedObject.zoomFactor = zoomFactor;

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
    mainWindow.show();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
    // 页面加载完成后立即显示窗口，让用户先看到登录界面
    mainWindow.webContents.on('did-finish-load', () => {
      if (mainWindow && !mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    // mainWindow.webContents.openDevTools();
  }
  ipcMain.on('logStatus', (event, arg) => {
    console.log(arg);
    if (arg === 'login') {
      mainWindow.setResizable(true);
      mainWindow.setBounds({
        x: 0,
        y: 0,
        width: screen.getPrimaryDisplay().workAreaSize.width,
        height: screen.getPrimaryDisplay().workAreaSize.height
      });
    } else {
      // 太几把坑了，windows系统setSize center方法失效 必须先mainWindow.unmaximize()
      mainWindow.unmaximize();
      mainWindow.setSize(1100, 600);
      mainWindow.center();
      global.sharedObject.userInfo = {};
      // mainWindow.setResizable(false)
    }
  });
  // 定义自定义事件
  ipcMain.on('close-window', function () {
    mainWindow.close();
  });
  // 定义自定义事件
  ipcMain.on('min-window', (event, arg) => {
    mainWindow.minimize();
  });
  // 循环注册所有 PLC 的 IPC 处理器，加 PLC 无需手写新通道
  plcInstances.forEach(function (inst, index) {
    // 获取PLC变量定义（只在组件挂载时调用一次，因为启动后不会变）
    ipcMain.handle('getPlcVariables_' + index, function () {
      return { variables: inst.variables };
    });
    // 获取写入数据（轮询调用，因为经常变化）
    ipcMain.handle('getWriteData_' + index, function () {
      return {
        writeAddArr: inst.writeAddArr,
        writeStrArr: inst.writeStrArr
      };
    });
    // writeValuesToPLC
    ipcMain.on('writeValuesToPLC_' + index, function (event, arg1, arg2) {
      writeValuesToPLC(index, arg1, arg2);
    });
    // writeSingleValueToPLC - 单独给PLC某个变量写值，通过批量写入数组实现
    ipcMain.on('writeSingleValueToPLC_' + index, function (event, arg1, arg2) {
      writeSingleValueToPLC(index, arg1, arg2);
    });
    // cancelWriteToPLC - 取消PLC某个变量的写入
    ipcMain.on('cancelWriteToPLC_' + index, function (event, arg1) {
      cancelWriteToPLC(index, arg1);
    });
  });
  // 定义自定义事件
  ipcMain.on('max-window', (event, arg) => {
    if (arg === 'max-window') {
      return mainWindow.maximize();
    }
    mainWindow.unmaximize();
    mainWindow.setBounds({
      x: 10,
      y: 10,
      width: screen.getPrimaryDisplay().workAreaSize.width - 20,
      height: screen.getPrimaryDisplay().workAreaSize.height - 20
    });
  });
  // 启动plc conPLC - 循环连接所有配置的 PLC
  ipcMain.on('conPLC', function () {
    if (process.env.NODE_ENV === 'production') {
      plcInstances.forEach(function (_, index) {
        conPLC(index);
      });
    }
  });
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('mainWin-max', 'max-window');
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('mainWin-max', 'unmax-window');
  });
  mainWindow.on('close', (e) => {
    closeStatus = true;
    e.preventDefault(); //先阻止一下默认行为，不然直接关了，提示框只会闪一下
    dialog
      .showMessageBox({
        type: 'warning',
        title: '提醒！',
        message: '确认关闭程序吗？',
        buttons: ['关闭程序', '放入托盘', '取消'], //选择按钮，点击确认则下面的idx为0，取消为1
        cancelId: 2 //这个的值是如果直接把提示框×掉返回的值，这里设置成和"取消"按钮一样的值，下面的idx也会是1
      })
      .then((idx) => {
        if (idx.response == 2) {
          e.preventDefault();
        } else if (idx.response == 0) {
          mainWindow = null;
          app.exit();
        } else {
          mainWindow.setSkipTaskbar(true);
          mainWindow.hide();
        }
      });
  });
  if (process.env.NODE_ENV === 'development') {
    let revert = false;
    setInterval(function () {
      if (mainWindow) {
        plcInstances.forEach(function (inst, index) {
          var val = revert ? 0 : 1;
          mainWindow.webContents.send(
            'receivedMsg_' + index,
            { DBW0: val },
            inst.writeStrArr.toString()
          );
        });
        revert = !revert;
      }
    }, 500);
  }
  setAppTray();

  if (process.env.NODE_ENV === 'production') {
    try {
      const javaPath = path.join(
        __static,
        './jre',
        'jre1.8.0_251',
        'bin',
        'java'
      );
      const jarPath = path.join(
        __static,
        './jarlib',
        'wcs-wuhan-jieling-middle.jar'
      );

      // 优化的Java启动参数 - 针对启动速度优化
      const javaOpts = [
        // 内存设置 - 减小初始内存以加快启动，保留足够最大内存
        '-Xmx4096m', // 最大堆内存
        '-Xms256m', // 初始堆内存 256MB（大幅降低启动时的内存分配时间）
        '-XX:MaxMetaspaceSize=256m', // 最大元空间大小
        '-XX:MetaspaceSize=128m', // 初始元空间大小

        // GC设置
        '-XX:+UseG1GC', // 使用G1垃圾收集器
        '-XX:MaxGCPauseMillis=200', // 最大GC停顿时间
        '-XX:+HeapDumpOnOutOfMemoryError', // 内存溢出时导出堆转储
        '-XX:HeapDumpPath=D://weihai-wuhai-jieling-front/dump', // 堆转储文件路径

        // 启动速度优化 - 减少JIT编译开销
        '-XX:+TieredCompilation', // 分层编译
        '-XX:TieredStopAtLevel=1', // 只使用C1编译器，大幅提升启动速度

        // 性能优化
        '-XX:+DisableExplicitGC', // 禁止显式GC调用
        '-XX:+UseStringDeduplication', // 开启字符串去重

        // 错误处理
        '-XX:+ExitOnOutOfMemoryError', // 发生OOM时退出
        '-XX:ErrorFile=D://weihai-wuhai-jieling-front/log/hs_err_%p.log', // JVM错误日志
        // 编码
        '-Dfile.encoding=UTF-8',
        // 应用参数
        '-jar',
        jarPath
      ];
      // 确保日志目录存在
      const logDir = 'D://weihai-wuhai-jieling-front/log';
      const dumpDir = 'D://weihai-wuhai-jieling-front/dump';
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      if (!fs.existsSync(dumpDir)) {
        fs.mkdirSync(dumpDir, { recursive: true });
      }

      logToFile(`启动Java进程，使用参数: ${javaOpts.join(' ')}`);
      const process = spawn(javaPath, javaOpts);

      process.on('error', (err) => {
        logToFile(`Java程序启动错误: ${err.message}`);
      });

      process.on('exit', (code, signal) => {
        logToFile(`Java程序退出，退出码: ${code}, 信号: ${signal}`);
      });
    } catch (error) {
      logToFile(`Java程序启动异常: ${error.message}`);
    }
  }

  // 开发者工具
  globalShortcut.register('CommandOrControl+L', () => {
    mainWindow.webContents.openDevTools();
  });
  globalShortcut.register('CommandOrControl+F11', () => {
    mainWindow.isFullScreen()
      ? mainWindow.setFullScreen(false)
      : mainWindow.setFullScreen(true);
  });
  // 定义自定义事件
  ipcMain.on('full_screen', function () {
    mainWindow.isFullScreen()
      ? mainWindow.setFullScreen(false)
      : mainWindow.setFullScreen(true);
  });
  // 定义自定义事件 - 优化后的日志写入
  ipcMain.on('writeLogToLocal', (event, arg) => {
    writeLogToLocalOptimized(arg);
  });
});

// 连接 PLC（参数化：index 对应 plcConfigs 中的序号）
function conPLC(index) {
  var inst = plcInstances[index];
  logger.info('开始连接' + inst.config.name + 'PLC');
  inst.conn.initiateConnection(
    {
      port: inst.config.port,
      host: inst.config.host,
      rack: 0,
      slot: 1,
      debug: false
    },
    function (err) {
      if (typeof err !== 'undefined') {
        logger.info(
          '连接' + inst.config.name + 'PLC失败' + JSON.stringify(err)
        );
        // We have an error. Maybe the PLC is not reachable.
        conPLC(index);
        return false;
      }
      inst.conn.setTranslationCB(function (tag) {
        return inst.variables[tag];
      }); // This sets the "translation" to allow us to work with object names
      logger.info('连接' + inst.config.name + 'PLC成功');
      // —— 读取点位（每台 PLC 独立的 readItems）——
      inst.readItems.forEach(function (item) {
        inst.conn.addItems(item);
      });
      // 单连接串行读写，避免 read/write 并发导致整批 BAD 255
      startPlcIoScheduler(index);
    }
  );
}

// 启动串行 IO 调度器（参数化：index 对应 plcConfigs 中的序号）
function startPlcIoScheduler(index) {
  var inst = plcInstances[index];
  if (inst.schedulerStarted) return;
  inst.schedulerStarted = true;
  setInterval(function () {
    tickPlcIo(index);
  }, PLC_IO_CYCLE_MS);
}

// 写前更新心跳缓冲，随本拍 writeItems 一并下发
function refreshHeartBuffer(index) {
  var inst = plcInstances[index];
  if (inst.heartWriteCount > 2) {
    inst.heartWriteCount = 1;
    inst.heartValue = 1 - inst.heartValue;
  }
  inst.heartWriteCount++;
  writeValuesToPLC(index, 'W_DBW0', inst.heartValue);
}

// 单拍调度：同一时刻只允许一次读或一次写
function tickPlcIo(index) {
  var inst = plcInstances[index];
  if (inst.ioBusy) return;

  if (inst.ioPhase === 'read') {
    inst.ioBusy = true;
    inst.conn.readAllItems(function (anythingBad, values) {
      try {
        if (anythingBad) {
          console.log(
            'SOMETHING WENT WRONG READING VALUES (PLC' + index + ')!!!!'
          );
        }
        mainWindow.webContents.send(
          'receivedMsg_' + index,
          values,
          inst.writeStrArr.toString()
        );
      } finally {
        inst.ioBusy = false;
        inst.ioPhase = 'write';
      }
    });
    return;
  }

  if (inst.writeAddArr.length === 0) {
    inst.ioPhase = 'read';
    return;
  }

  refreshHeartBuffer(index);
  inst.ioBusy = true;
  var addrs = inst.writeAddArr.slice();
  var vals = inst.writeStrArr.slice();
  inst.conn.writeItems(addrs, vals, function (anythingBad) {
    try {
      if (anythingBad) {
        console.log(
          'SOMETHING WENT WRONG WRITING VALUES (PLC' + index + ')!!!!'
        );
      }
    } finally {
      inst.ioBusy = false;
      inst.ioPhase = 'read';
    }
  });
}

// —— 以下为参数化的 PLC 写入函数（index 对应 plcConfigs 中的序号）——

// 给PLC写值
function writeValuesToPLC(index, add, values) {
  var inst = plcInstances[index];
  var i = inst.writeAddArr.indexOf(add);
  if (i !== -1) {
    inst.writeStrArr[i] = values;
  } else {
    console.warn(
      'Address ' + add + ' not found in writeAddArr (PLC' + index + ').'
    );
  }
}

// 单独给PLC某个变量写值，通过操作批量写入数组实现，避免写入冲突
function writeSingleValueToPLC(index, add, values) {
  var inst = plcInstances[index];
  if (!inst.variables[add]) {
    console.warn(
      'Address ' + add + ' not found in variables (PLC' + index + ').'
    );
    return;
  }

  // 查找地址在批量写入数组中的索引
  var i = inst.writeAddArr.indexOf(add);

  if (i !== -1) {
    // 地址已存在，直接更新值（这个操作是原子的）
    inst.writeStrArr[i] = values;
    console.log('更新PLC' + index + '地址 ' + add + ' 的值为：' + values);
  } else {
    // 地址不存在，使用原子性操作添加到批量写入数组
    var newAddArr = inst.writeAddArr.concat([add]);
    var newStrArr = inst.writeStrArr.concat([values]);

    // 原子性替换数组内容
    inst.writeAddArr.length = 0;
    inst.writeStrArr.length = 0;
    inst.writeAddArr.push.apply(inst.writeAddArr, newAddArr);
    inst.writeStrArr.push.apply(inst.writeStrArr, newStrArr);

    console.log(
      '添加PLC' + index + '地址 ' + add + ' 到批量写入数组，值：' + values
    );
  }
}

// 取消PLC某个变量的写入，从批量写入数组中移除
function cancelWriteToPLC(index, add) {
  var inst = plcInstances[index];
  var originalLength = inst.writeAddArr.length;
  var newAddArr = [];
  var newStrArr = [];

  for (var i = 0; i < inst.writeAddArr.length; i++) {
    if (inst.writeAddArr[i] !== add) {
      newAddArr.push(inst.writeAddArr[i]);
      newStrArr.push(inst.writeStrArr[i]);
    }
  }

  // 检查是否找到并移除了地址
  if (newAddArr.length === originalLength) {
    console.warn(
      'Address ' +
        add +
        ' not found in writeAddArr (PLC' +
        index +
        '), cannot cancel.'
    );
    return false;
  }

  // 原子性替换数组内容
  inst.writeAddArr.length = 0;
  inst.writeStrArr.length = 0;
  inst.writeAddArr.push.apply(inst.writeAddArr, newAddArr);
  inst.writeStrArr.push.apply(inst.writeStrArr, newStrArr);

  console.log('已从批量写入数组中移除PLC' + index + '地址：' + add);

  // 验证数组长度一致性
  if (inst.writeAddArr.length !== inst.writeStrArr.length) {
    console.error(
      '数组长度不一致！地址数组长度：' +
        inst.writeAddArr.length +
        '，值数组长度：' +
        inst.writeStrArr.length
    );
  }

  return true;
}

const setAppTray = () => {
  // 系统托盘右键菜单
  var trayMenuTemplate = [
    {
      label: '退出',
      click: function () {
        app.quit();
      }
    }
  ];

  // 系统托盘图标目录
  appTray = new Tray(path.join(__static, './icon.ico'));

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('WCS系统');

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  appTray.on('click', function () {
    //主窗口显示隐藏切换
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
    } else {
      mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    }
  });
};
