const express = require("express");
const fs = require('fs');
const request = require("supertest");
const {
  database_init,
  UprazhnenieResult,
  UprazhnenieSchedule,
  sequelize,
  UprazhnenieStandard,
  Person,
  Zvanie,
  Podrazdelenie,
  Category,
  Uprazhnenie,
  UprazhnenieRealValuesType,
  EfficiencyPreference,
  dbPath,
} = require("../sequelize"); // Импорт Sequelize и настройки
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

sequelize
  .sync()
  .then(
    () => {
      let efficiencyPreferencesCount;
      EfficiencyPreference.count()
        .then((val) => {
          efficiencyPreferencesCount = val;
          // console.log(efficiencyPreferencesCount);
          if (efficiencyPreferencesCount === 0) {
            fillDefaultsEfficiencyPreferences(EfficiencyPreference);
            fillDefaultsZvanie(Zvanie);
            fillDefaultsPodrazdeleniya(Podrazdelenie);
            fillDefaultsCategories(Category);
            fillDefaultsPersons(Person);
            fillDefaultsUprazhnenieRealValuesTypes(UprazhnenieRealValuesType);
            fillDefaultsUprazhneniya(Uprazhnenie);
            fillDefaultsUprazhnenieStandards(UprazhnenieStandard);

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
    const response = await request(app).get('/uprazhnenieResults/allVedomost').query({
      year: 2024,
      month: 4
    })

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      {
        "data": {
          "allChecked": 0,
          "allGreat": 0,
          "allGood": 0,
          "allSatisfactory": 0,
          "allUnsatisfactory": 0,
          "allGrade": null,
          "allTableData": {
            "personLenght": 0,
            "allPersonsChecked": 0,
            "totalGrade": null,
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
                "checked": 0,
                "great": 0,
                "good": 0,
                "satisfactory": 0,
                "unsatisfactory": 0,
                "grade": "-"
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
          },
          "tableData": []
        }
      }

    );

    fs.unlinkSync(dbPath)
  });
});
