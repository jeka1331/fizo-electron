const express = require("express");
const path = require("path");
var morgan = require('morgan')
const { sequelize, EfficiencyPreference } = require("./server/sequelize"); // Импорт Sequelize и настройки
const reportsRouter = require("./server/routes/reports");
const personsRouter = require("./server/routes/persons");
const zvaniyaRouter = require("./server/routes/zvaniya");
const uprazhnenieTypesRouter = require("./server/routes/uprazhnenieTypes");
const fixedUprRouter = require("./server/routes/fixedUprs");
const passingInMonthRouter = require("./server/routes/passingInMonth");
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

const corsOptions = {
  origin: ["http://192.168.0.117:5173", "http://localhost:5173", "http://tauri.localhost", "https://literate-space-capybara-4wv5jp5vrxj37vw6-5175.app.github.dev", "tauri://localhost"], 
  
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  allowedHeaders: ["Content-Type", "Authorization", "Content-Range", "Range"],
  exposedHeaders: ["Content-Type", "Authorization", "Content-Range", "Range"],
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('combined'))

app.use("/efficiencyPreferences", efficiencyPreferencesRouter);
app.use("/categories", categoriesRouter);
app.use("/reports", reportsRouter);
app.use("/podrazdeleniya", podrazdeleniyaRouter);
app.use("/uprazhnenieRealValuesTypes", uprazhnenieTypesRouter);
app.use("/fixedUpr", fixedUprRouter);
app.use("/passingInMonth", passingInMonthRouter);
app.use("/persons", personsRouter);
app.use("/zvaniya", zvaniyaRouter);
app.use("/uprazhneniya", upraznenieRouter);
app.use("/uprazhnenieStandards", uprazhnenieStandardsRouter);
app.use("/uprazhnenieResults", uprazhnenieResultsRouter);

// app.use(crud('/persons', sequelizeCrud(Person)))

// Устанавливаем middleware и маршруты Express.js здесь
// app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.send("Hello Express!");
});
let server;

// Синхронизация с базой данных и запуск сервера
sequelize
  .sync(
    // {force: true}
  )
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
            server = app.listen(3333, () => {
              console.log("Сервер запущен на порту 3333");
            });
          } else {
            server = app.listen(3333, () => {
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
