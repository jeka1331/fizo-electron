const express = require("express");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { sequelize, EfficiencyPreference } = require("./server/sequelize"); // Импорт Sequelize и настройки
const reportsRouter = require("./server/routes/reports");
const personsRouter = require("./server/routes/persons");
const zvaniyaRouter = require("./server/routes/zvaniya");
const uprazhnenieTypesRouter = require("./server/routes/uprazhnenieTypes");
const podrazdeleniyaRouter = require("./server/routes/podrazdeleniya");
const categoriesRouter = require("./server/routes/categories");
const efficiencyPreferencesRouter = require("./server/routes/efficiencyPreferences");
const upraznenieRouter = require("./server/routes/uprazhneniya");
const uprazhnenieStandardsRouter = require("./server/routes/uprazhneniyaStandards");
const uprazhnenieResultsRouter = require("./server/routes/uprazhneniyaResults");
const cors = require("cors");
const { fillDefaultsEfficiencyPreferences, fillDefaultsPodrazdeleniya, fillDefaultsPersons, fillDefaultsZvanie, fillDefaultsCategories, fillDefaultsUprazhnenieRealValuesTypes, fillDefaultsUprazhneniya } = require("./server/defaults");
if (require("electron-squirrel-startup")) app.quit();
const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  allowedHeaders: ["Content-Type", "Authorization", "Content-Range", "Range"],
  exposedHeaders: ["Content-Type", "Authorization", "Content-Range", "Range"],
};

const appExpress = express();
appExpress.use(cors(corsOptions));
appExpress.use(express.json());

appExpress.use("/efficiencyPreferences", efficiencyPreferencesRouter);
appExpress.use("/categories", categoriesRouter);
appExpress.use("/reports", reportsRouter);
appExpress.use("/podrazdeleniya", podrazdeleniyaRouter);
appExpress.use("/uprazhnenieRealValuesTypes", uprazhnenieTypesRouter);
appExpress.use("/persons", personsRouter);
appExpress.use("/zvaniya", zvaniyaRouter);
appExpress.use("/uprazhneniya", upraznenieRouter);
appExpress.use("/uprazhnenieStandards", uprazhnenieStandardsRouter);
appExpress.use("/uprazhnenieResults", uprazhnenieResultsRouter);

// appExpress.use(crud('/persons', sequelizeCrud(Person)))

// Устанавливаем middleware и маршруты Express.js здесь
// appExpress.use(express.static(path.join(__dirname, 'public')));

appExpress.get("/", (req, res) => {
  res.send("Hello Express!");
});
let server;

// Синхронизация с базой данных и запуск сервера
sequelize
  .sync()
  .then(
    async () => {
      const efficiencyPreferencesCount = await EfficiencyPreference.count()
      if (efficiencyPreferencesCount === 0) {
        fillDefaultsEfficiencyPreferences()
        fillDefaultsZvanie()
        fillDefaultsPodrazdeleniya()
        fillDefaultsCategories()
        fillDefaultsPersons()
        fillDefaultsUprazhnenieRealValuesTypes()
        fillDefaultsUprazhneniya()

      }
      server = appExpress.listen(3333, () => {
        console.log("Сервер запущен на порту 3333");
      });
    },
    function (err) {
      // catch error here
      console.log(err);
    }
  )
  .catch(() => {
    console.log("Сервер не запущен");
  });

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    show: false,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "client/dist", "index.html"));
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    if (server) {
      server.close();
    }
    ipcMain.removeListener("print-person-report", printPersonReportHandler);
  }
});

// Обработчик закрытия Electron-приложения
app.on("before-quit", () => {
  // Закрываем Express.js сервер при закрытии Electron-приложения
  if (server) {
    server.close();
  }
  ipcMain.removeListener("print-person-report", printPersonReportHandler);
});

// Функция-обработчик для события 'print-person-report'
const printPersonReportHandler = (data) => {
  let win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const encodedHtmlContent = Buffer.from(data).toString("base64");
  win.loadURL(`data:text/html;charset=utf-8;base64,${encodedHtmlContent}`);
  win.webContents.print({
    silent: false,
    printBackground: false,
    pageSize: "A4",
    marginsType: 0,
    landscape: false,
    scaleFactor: 1,
    pagesPerSheet: 1,
    collate: false,
    copies: 1,
    header: "Header",
    footer: {
      height: "1cm",
      margin: {
        top: "1cm",
        bottom: "1cm",
      },
      contents: {
        default: '<div style="text-align:center">{#pageNum}</div>',
      },
    },
  });
};

// Регистрация обработчика события 'print-person-report'
ipcMain.on("print-person-report", printPersonReportHandler);

// Функция-обработчик для события 'print-person-report'
const printAllVedomostHandler = (data) => {
  let win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const encodedHtmlContent = Buffer.from(data).toString("base64");
  win.loadURL(`data:text/html;charset=utf-8;base64,${encodedHtmlContent}`);
  win.webContents.print({
    silent: false,
    printBackground: false,
    pageSize: "A4",
    marginsType: 0,
    landscape: true,
    pagesPerSheet: 1,
    copies: 1,
  });
};

// Регистрация обработчика события 'print-person-report'
ipcMain.on("print-all-vedomost", printAllVedomostHandler);
