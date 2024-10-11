const express = require("express");
const request = require("supertest");
const { database_init } = require("../sequelize"); // Импорт Sequelize и настройки
const reportsRouter = require("./reports");
const personsRouter = require("./persons");
const zvaniyaRouter = require("./zvaniya");
const uprazhnenieTypesRouter = require("./uprazhnenieTypes");
const podrazdeleniyaRouter = require("./podrazdeleniya");
const categoriesRouter = require("./categories");
const efficiencyPreferencesRouter = require("./efficiencyPreferences");
const upraznenieRouter = require("./uprazhneniya");
const uprazhnenieStandardsRouter = require("./uprazhneniyaStandards");
const uprazhnenieResultsRouter = require("./uprazhneniyaResults");
const {
  fillDefaultsUprazhnenieStandards,
  fillDefaultsEfficiencyPreferences,
  fillDefaultsPodrazdeleniya,
  fillDefaultsPersons,
  fillDefaultsZvanie,
  fillDefaultsCategories,
  fillDefaultsUprazhnenieRealValuesTypes,
  fillDefaultsUprazhneniya,
} = require("../defaults");

const app = express();
app.use(express.json());

app.use("/efficiencyPreferences", efficiencyPreferencesRouter);
app.use("/categories", categoriesRouter);
app.use("/reports", reportsRouter);
app.use("/podrazdeleniya", podrazdeleniyaRouter);
app.use("/uprazhnenieRealValuesTypes", uprazhnenieTypesRouter);
app.use("/persons", personsRouter);
app.use("/zvaniya", zvaniyaRouter);
app.use("/uprazhneniya", upraznenieRouter);
app.use("/uprazhnenieStandards", uprazhnenieStandardsRouter);
app.use("/uprazhnenieResults", uprazhnenieResultsRouter);


const dbDefinition = database_init("sqlite", "mydatabase.db");


const UprazhnenieResult = dbDefinition.UprazhnenieResult
const UprazhnenieSchedule = dbDefinition.UprazhnenieSchedule
const sequelize = dbDefinition.sequelize
const UprazhnenieStandard = dbDefinition.UprazhnenieStandard
const Person = dbDefinition.Person
const Zvanie = dbDefinition.Zvanie
const Podrazdelenie = dbDefinition.Podrazdelenie
const Category = dbDefinition.Category
const Uprazhnenie = dbDefinition.Uprazhnenie
const UprazhnenieRealValuesType = dbDefinition.UprazhnenieRealValuesType
const EfficiencyPreference = dbDefinition.EfficiencyPreference

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

          }
        })
        .catch((err) => console.log(err));
    },
    function(err) {
      // catch error here
      console.log(err);
    }
  )
  .catch(() => {
    console.log("Сервер не запущен");
  });

describe('GET /uprazhnenieResults/allVedomost', () => {
  it('should respond with a JSON object', async () => {
    const response = await request(app).get('/uprazhnenieResults/allVedomost');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      {
        "allChecked": 2,
        "allGreat": 0,
        "allGood": 1,
        "allSatisfactory": 1,
        "allUnsatisfactory": 0,
        "allGrade": 3,
        "allTableData": {
          "personLenght": 127,
          "allPersonsChecked": 4,
          "totalGrade": 3,
          "resultsData": {
            "officers": {
              "checked": 1,
              "great": 0,
              "good": 1,
              "satisfactory": 0,
              "unsatisfactory": 0,
              "grade": 4
            },
            "contracts": {
              "checked": 0,
              "great": 0,
              "good": 0,
              "satisfactory": 0,
              "unsatisfactory": 0,
              "grade": "-"
            },
            "conscripts": {
              "checked": 1,
              "great": 0,
              "good": 1,
              "satisfactory": 0,
              "unsatisfactory": 0,
              "grade": 4
            },
            "women": {
              "checked": 2,
              "great": 0,
              "good": 1,
              "satisfactory": 1,
              "unsatisfactory": 0,
              "grade": "-"
            }
          }
        },
        "tableData": [
          {
            "id": 1,
            "podrazdelenie": "РОиО",
            "personLenght": 59,
            "allPersonsChecked": 3,
            "totalGrade": 3,
            "resultsData": {
              "officers": {
                "checked": 1,
                "great": 0,
                "good": 1,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": 4
              },
              "contracts": {
                "checked": 0,
                "great": 0,
                "good": 0,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": "-"
              },
              "conscripts": {
                "checked": 0,
                "great": 0,
                "good": 0,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": "-"
              },
              "women": {
                "checked": 2,
                "great": 0,
                "good": 1,
                "satisfactory": 1,
                "unsatisfactory": 0,
                "grade": 3
              }
            }
          },
          {
            "id": 2,
            "podrazdelenie": "ВНИЦ",
            "personLenght": 68,
            "allPersonsChecked": 1,
            "totalGrade": 4,
            "resultsData": {
              "officers": {
                "checked": 0,
                "great": 0,
                "good": 0,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": "-"
              },
              "contracts": {
                "checked": 0,
                "great": 0,
                "good": 0,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": "-"
              },
              "conscripts": {
                "checked": 1,
                "great": 0,
                "good": 1,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": 4
              },
              "women": {
                "checked": 0,
                "great": 0,
                "good": 0,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": "-"
              }
            }
          }
        ]
      }
    );
  });
});
