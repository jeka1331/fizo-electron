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
const {
  fillDefaultsUprazhnenieStandards,
  fillDefaultsEfficiencyPreferences,
  fillDefaultsPodrazdeleniya,
  fillDefaultsPersons,
  fillDefaultsZvanie,
  fillDefaultsCategories,
  fillDefaultsUprazhnenieRealValuesTypes,
  fillDefaultsUprazhneniya,
} = require("./server/defaults");
if (require("electron-squirrel-startup")) app.quit();
const corsOptions = {
  origin: ["http://192.168.0.117:5173", "http://localhost:5173"],

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
    () => {
      let efficiencyPreferencesCount;
      EfficiencyPreference.count()
        .then((val) => {
          efficiencyPreferencesCount = val;
          console.log(efficiencyPreferencesCount);
          if (efficiencyPreferencesCount === 0) {
            fillDefaultsEfficiencyPreferences();
            fillDefaultsZvanie();
            fillDefaultsPodrazdeleniya();
            fillDefaultsCategories();
            fillDefaultsPersons();
            fillDefaultsUprazhnenieRealValuesTypes();
            fillDefaultsUprazhneniya(), fillDefaultsUprazhnenieStandards();
            server = appExpress.listen(3333, () => {
              console.log("Сервер запущен на порту 3333");
            });
          } else {
            server = appExpress.listen(3333, () => {
              console.log("Сервер запущен на порту 3333");
            });
          }
        })
        .catch((err) => console.log(err));
    },
    function (err) {
      // catch error here
      console.log(err);
    }
  )
  .catch(() => {
    console.log("Сервер не запущен");
  });

// Функция-обработчик для события 'print-person-report'
