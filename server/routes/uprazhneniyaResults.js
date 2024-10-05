const express = require("express");
const router = express.Router();
const {
  UprazhnenieResult,
  Person,
  Category,
  Uprazhnenie,
  UprazhnenieStandard,
  Zvanie,
  EfficiencyPreference,
  Podrazdelenie,
} = require("../sequelize"); // Импорт модели Person
const sequelize = require("sequelize");
const { Op } = require("sequelize");

// Создание записи (Create)
router.post("/", async (req, res) => {
  try {
    const newUprazhnenieResult = req.body;
    const createdUprazhnenieResult = await UprazhnenieResult.create(
      newUprazhnenieResult
    );
    res.status(201).json(createdUprazhnenieResult);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании записи" });
  }
});

// Чтение всех записей (Read)
router.get("/", async (req, res) => {
  try {
    const { range, sort, filter } = req.query;
    let options = {};

    if (range) {
      const [start, end] = JSON.parse(range);
      options.offset = start;
      options.limit = end - start + 1;
    }

    if (sort) {
      const [field, order] = JSON.parse(sort);
      options.order = [[field, order]];
    }

    if (filter) {
      options.where = JSON.parse(filter);
    }

    const zvaniya = await UprazhnenieResult.findAll(options);

    if (range) {
      const total = await UprazhnenieResult.count();
      // Устанавливаем заголовок Content-Range
      res.header(
        "Content-Range",
        `zvaniya ${options.offset}-${
          options.offset + zvaniya.length - 1
        }/${total}`
      );
    }

    res.status(200).json(zvaniya);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при чтении записей" });
  }
});
// Чтение всех записей (Read)
router.get("/vedomost", async (req, res) => {
  try {
    if (!req.query.year || !req.query.month || !req.query.podrId) {
      throw new Error("Неверные параметры в get запросе");
    }
    const range = req.query.range;
    const sort = req.query.sort;
    const filter = req.query.filter;

    let options = {};

    if (range) {
      const [start, end] = JSON.parse(range);
      options.offset = start;
      options.limit = end - start + 1;
    }

    if (sort) {
      const [field, order] = JSON.parse(sort);
      options.order = [[field, order]];
    }

    if (filter) {
      options.where = JSON.parse(filter);
    }

    function getMaxMinDatesInMonth(year, month) {
      const maxDays = new Date(year, month, 0).getDate();

      return {
        maxDate: `${year}-${month > 9 ? month : "0" + month}-${
          maxDays > 9 ? maxDays : "" + maxDays
        }`,
        minDate: `${year}-${month > 9 ? month : "0" + month}-01`,
      };
    }
    const { maxDate, minDate } = getMaxMinDatesInMonth(
      parseInt(req.query.year),
      parseInt(req.query.month)
    );
    const uprResults = await UprazhnenieResult.findAll({
      attributes: [
        [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
        "result",
        "personId",
      ], // Выбираем атрибуты и находим максимальную дату
      where: {
        date: {
          [Op.between]: [minDate, maxDate], // Фильтруем по дате
        },
      },
      group: ["personId", "uprazhnenieId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "fName", "lName", "zvanieId"], // Выбираем только необходимые атрибуты из модели Person
          where: {
            podrazdelenieId: req.query.podrId,
          },
        },
        {
          model: Category,
          attributes: ["id", "name", "shortName"], // Выбираем только необходимые атрибуты из модели Person
        },
        {
          model: Uprazhnenie,
          attributes: [
            "id",
            "name",
            "step",
            "valueToAddAfterMaxResult",
            "shortName",
          ], // Выбираем только необходимые атрибуты из модели Person
        },
      ],

      ...options,
    });

    let personalResultsP = {};
    let uprNamesP = [];
    for (const uprResult of uprResults) {
      uprNamesP.push(uprResult.Uprazhnenie.shortName);

      const maxResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
          "id",
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
        },
        limit: 1,
      });
      const maxValue = maxResult.dataValues.maxValue;

      let ball;
      if (!(uprResult.result > maxValue)) {
        ball = await UprazhnenieStandard.findOne({
          where: {
            uprazhnenieId: uprResult.Uprazhnenie.id,
            categoryId: uprResult.Category.id,
            value: uprResult.result,
          },
        });
      } else {
        const additionalResultCount = uprResult.result - maxValue;
        ball = {
          result:
            maxResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step),
        };
      }

      const zvanie = await Zvanie.findOne({
        where: {
          id: uprResult.Person.zvanieId,
        },
      });

      if (!personalResultsP[uprResult.Person.id]) {
        const result = {
          personId: uprResult.Person.id,
          zvanie: zvanie.name ? zvanie.name : "Ошибка",
          person: uprResult.Person.lName ? uprResult.Person.lName : "Ошибка",
          category: uprResult.Category.shortName
            ? uprResult.Category.shortName
            : "Ошибка",
          results: [
            {
              uprName: uprResult.Uprazhnenie.shortName,
              score: uprResult.result,
              ball: ball ? ball.result : 0,
            },
          ],
        };
        personalResultsP[uprResult.Person.id] = result;
      } else {
        personalResultsP[uprResult.Person.id].results.push({
          uprName: uprResult.Uprazhnenie.shortName,
          score: uprResult.result,
          ball: ball ? ball.result : 0,
        });
      }
    }
    let maxResults = 0;
    for (const key in personalResultsP) {
      if (personalResultsP[key].results.length > maxResults) {
        maxResults = personalResultsP[key].results.length;
      }
    }

    uprNamesP = [...new Set(uprNamesP)];
    const sumOfBallsFor5 = uprNamesP.length * 60;
    const sumOfBallsFor4 = uprNamesP.length * 40;
    const sumOfBallsFor3 = uprNamesP.length * 20;

    for (const key in personalResultsP) {
      let sumOfBalls = 0;
      const element = personalResultsP[key];
      for (const result of element.results) {
        if (!result.ball || result.ball == 0) {
          sumOfBalls = 0;
          break;
        }
        sumOfBalls = sumOfBalls + result.ball;
      }
      personalResultsP[key].sumOfBalls = sumOfBalls;
      if (sumOfBalls >= sumOfBallsFor3) {
        personalResultsP[key].totalOcenka = 3;
      }
      if (sumOfBalls >= sumOfBallsFor4) {
        personalResultsP[key].totalOcenka = 4;
      }
      if (sumOfBalls >= sumOfBallsFor5) {
        personalResultsP[key].totalOcenka = 5;
      }
      if (!personalResultsP[key].totalOcenka) {
        personalResultsP[key].totalOcenka = 2;
      }
    }
    for (const key in personalResultsP) {
      const remainingLength = maxResults - personalResultsP[key].results.length;
      for (let i = 0; i < remainingLength; i++) {
        personalResultsP[key].results.push({
          uprName: null,
          score: null,
          ball: null,
        }); // Здесь можно использовать любые значения, в зависимости от ваших потребностей
      }
    }

    // if (range) {
    //   const total = await UprazhnenieResult.count();
    //   // Устанавливаем заголовок Content-Range
    //   res.header(
    //     "Content-Range",
    //     `uprResults ${options.offset}-${
    //       options.offset + uprResults.length - 1
    //     }/${total}`
    //   );
    // }

    res.status(200).json({ data: personalResultsP, uprColums: uprNamesP });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошибка при чтении записей" });
  }
});

router.get("/allVedomost", async (req, res) => {
  try {
    let data = initializeData();

    if (!req.query.year || !req.query.month) {
      throw new Error("Неверные параметры в get запросе");
    }

    const { maxDate, minDate } = getMaxMinDatesInMonth(
      parseInt(req.query.year),
      parseInt(req.query.month)
    );

    data.allTableData.allPersonsChecked = await getAllPersonsChecked(minDate, maxDate);
    data.allTableData.personLenght = await getPersonLength();

    data.allTableData.resultsData.women = await getResultsData(minDate, maxDate, false);
    data.allTableData.resultsData.officers = await getResultsData(minDate, maxDate, true, getOfficerRanks());
    data.allTableData.resultsData.contracts = await getResultsData(minDate, maxDate, true, getContractorRanks(), false);
    data.allTableData.resultsData.conscripts = await getResultsData(minDate, maxDate, true, getConscriptsRanks(), true);

    data.allGrade = calculateOverallGrade(data.allTableData.resultsData);
    data.allTableData.totalGrade = data.allGrade;

    const unionResults = await getUnionResults(minDate, maxDate);
    const separatedResults = separateResultsByPodrazdelenie(unionResults);

    for (const podr of Object.keys(separatedResults)) {
      const podrData = await processPodrazdelenieData(podr, separatedResults[podr]);
      data.tableData.push(podrData);
    }

    data.allChecked = data.tableData.length;
    data.allTableData.personLenght = data.tableData.reduce((sum, item) => sum + item.personLenght, 0);

    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошибка при чтении записей" });
  }
});

function initializeData() {
  return {
    allChecked: undefined,
    allGreat: 0,
    allGood: 0,
    allSatisfactory: 0,
    allUnsatisfactory: 0,
    allGrade: 0,
    allTableData: {
      personLenght: undefined,
      allPersonsChecked: undefined,
      tpt: undefined,
      totalGrade: undefined,
      resultsData: {
        officers: initializeResultsData(),
        contracts: initializeResultsData(),
        conscripts: initializeResultsData(),
        women: initializeResultsData(),
      },
    },
    tableData: [],
  };
}

function initializeResultsData() {
  return {
    checked: 0,
    great: 0,
    good: 0,
    satisfactory: 0,
    unsatisfactory: 0,
    grade: undefined,
  };
}

function getMaxMinDatesInMonth(year, month) {
  const maxDays = new Date(year, month, 0).getDate();
  return {
    maxDate: `${year}-${month > 9 ? month : "0" + month}-${maxDays > 9 ? maxDays : "0" + maxDays}`,
    minDate: `${year}-${month > 9 ? month : "0" + month}-01`,
  };
}

async function getAllPersonsChecked(minDate, maxDate) {
  return (
    await UprazhnenieResult.findAll({
      attributes: [[sequelize.fn("MAX", sequelize.col("date")), "maxDate"], "personId"],
      where: { date: { [Op.between]: [minDate, maxDate] } },
      group: ["personId"],
    })
  ).length;
}

async function getPersonLength() {
  const result = await Person.findOne({
    attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "personL"]],
    where: { podrazdelenieId: { [sequelize.Op.not]: null } },
    raw: true,
  });
  return result.personL;
}

async function getResultsData(minDate, maxDate, isMale, ranks = [], isV = null) {
  const results = await UprazhnenieResult.findAll({
    attributes: [[sequelize.fn("MAX", sequelize.col("date")), "maxDate"], "result", "PersonId"],
    where: { date: { [Op.between]: [minDate, maxDate] } },
    group: ["personId"],
    include: [
      {
        model: Person,
        attributes: ["id", "isMale", "zvanieId", "isV"],
        where: { isMale, ...(isV !== null && { isV }) },
        include: [
          { model: Zvanie, attributes: ["name"], where: { name: ranks } },
          Podrazdelenie,
        ],
      },
      { model: Category, attributes: ["id", "name", "shortName"] },
      { model: Uprazhnenie, attributes: ["id", "name", "step", "valueToAddAfterMaxResult", "shortName"] },
    ],
  });

  const resultsData = initializeResultsData();
  resultsData.checked = results.length;

  const personalResults = await processPersonalResults(results);
  const summary = summarizeResults(personalResults);

  resultsData.great = summary.great;
  resultsData.good = summary.good;
  resultsData.satisfactory = summary.satisfactory;
  resultsData.unsatisfactory = summary.unsatisfactory;
  resultsData.grade = calculateGrade(summary);

  return resultsData;
}

function getOfficerRanks() {
  return [
    "Лейтенант", "Старший лейтенант", "Капитан", "Майор", "Подполковник", "Полковник",
    "Генерал-майор", "Генерал-лейтенант", "Генерал-полковник", "Генерал армии",
    "Капитан-лейтенант", "Капитан третьего ранга", "Капитан второго ранга", "Капитан первого ранга",
    "Контр-адмирал", "Вице-адмирал", "Адмирал"
  ];
}

function getContractorRanks() {
  return [
    "Рядовой", "Ефрейтор", "Младший сержант", "Сержант", "Старший сержант", "Сержант третьего класса",
    "Сержант второго класса", "Сержант первого класса", "Штаб-сержант", "Мастер-сержант",
    "Матрос", "Старший матрос", "Старшина второй статьи", "Старшина первой статьи", "Главный старшина",
    "Старшина третьего класса", "Старшина второго класса", "Старшина первого класса", "Штаб-старшина",
    "Мастер-старшина", "Старшина"
  ];
}

function getConscriptsRanks() {
  return getContractorRanks();
}

async function processPersonalResults(results) {
  let personalResults = {};
  let uprNames = [];

  for (const uprResult of results) {
    uprNames.push(uprResult.Uprazhnenie.shortName);

    const { maxResult, minResult } = await getMaxMinResults(uprResult);
    const efficiencyPreference = maxResult.Uprazhnenie.EfficiencyPreference.name;
    const maxValue = maxResult.dataValues.maxValue;
    const minValue = minResult.dataValues.minValue;

    let res;
    let ball;

    if (efficiencyPreference === "Меньше - лучше") {
      if (minValue > uprResult.result) {
        const additionalResultCount = minValue - uprResult.result;
        res = minResult.result + uprResult.Uprazhnenie.valueToAddAfterMaxResult * (additionalResultCount / uprResult.Uprazhnenie.step);
      }
    } else if (efficiencyPreference === "Больше - лучше") {
      const additionalResultCount = uprResult.result - maxValue;
      res = maxResult.result + uprResult.Uprazhnenie.valueToAddAfterMaxResult * (additionalResultCount / uprResult.Uprazhnenie.step);
    }

    if (!(uprResult.result > maxValue)) {
      ball = await UprazhnenieStandard.findOne({
        where: { uprazhnenieId: uprResult.Uprazhnenie.id, categoryId: uprResult.Category.id, value: uprResult.result },
        include: [{ model: Uprazhnenie, include: [{ model: EfficiencyPreference, attributes: ["name"] }] }],
      });
    } else {
      ball = { result: res ? res : 0 };
    }

    const zvanie = await Zvanie.findOne({ where: { id: uprResult.Person.zvanieId } });

    if (!personalResults[uprResult.Person.id]) {
      personalResults[uprResult.Person.id] = {
        personId: uprResult.Person.id,
        zvanie: zvanie.name || "Ошибка",
        person: uprResult.Person.lName || "Ошибка",
        category: uprResult.Category.shortName || "Ошибка",
        results: [{ uprName: uprResult.Uprazhnenie.shortName, score: uprResult.result, ball: ball ? ball.result : 0 }],
      };
    } else {
      personalResults[uprResult.Person.id].results.push({
        uprName: uprResult.Uprazhnenie.shortName,
        score: uprResult.result,
        ball: ball ? ball.result : 0,
      });
    }
  }

  return personalResults;
}

async function getMaxMinResults(uprResult) {
  const maxResult = await UprazhnenieStandard.findOne({
    attributes: [[sequelize.fn("MAX", sequelize.col("value")), "maxValue"], "id", "uprazhnenieId", "categoryId", "result"],
    where: { uprazhnenieId: uprResult.Uprazhnenie.id, categoryId: uprResult.Category.id },
    limit: 1,
    include: [{ model: Uprazhnenie, include: [{ model: EfficiencyPreference, attributes: ["name"] }] }],
  });

  const minResult = await UprazhnenieStandard.findOne({
    attributes: [[sequelize.fn("MIN", sequelize.col("value")), "minValue"], "id", "uprazhnenieId", "categoryId", "result"],
    where: { uprazhnenieId: uprResult.Uprazhnenie.id, categoryId: uprResult.Category.id },
    limit: 1,
    include: [{ model: Uprazhnenie, include: [{ model: EfficiencyPreference, attributes: ["name"] }] }],
  });

  return { maxResult, minResult };
}

function summarizeResults(personalResults) {
  let summary = { great: 0, good: 0, satisfactory: 0, unsatisfactory: 0 };

  for (const key in personalResults) {
    const element = personalResults[key].totalOcenka;
    switch (element) {
      case 5:
        summary.great += 1;
        break;
      case 4:
        summary.good += 1;
        break;
      case 3:
        summary.satisfactory += 1;
        break;
      case 2:
        summary.unsatisfactory += 1;
        break;
      default:
        break;
    }
  }

  return summary;
}

function calculateGrade(summary) {
  if (summary.great > 0) return 5;
  if (summary.good > 0) return 4;
  if (summary.satisfactory > 0) return 3;
  if (summary.unsatisfactory > 0) return 2;
  return "-";
}

function calculateOverallGrade(resultsData) {
  return Math.min(
    ...[
      resultsData.officers.grade,
      resultsData.women.grade,
      resultsData.conscripts.grade,
      resultsData.contracts.grade,
    ].filter(Number)
  );
}

async function getUnionResults(minDate, maxDate) {
  const uprResults = await getResultsData(minDate, maxDate, false);
  const consResults = await getResultsData(minDate, maxDate, true, getConscriptsRanks(), true);
  const contractorResults = await getResultsData(minDate, maxDate, true, getContractorRanks(), false);
  const officerResults = await getResultsData(minDate, maxDate, true, getOfficerRanks());

  return uprResults.concat(consResults, contractorResults, officerResults);
}

function separateResultsByPodrazdelenie(unionResults) {
  let podrs = [];

  for (const result of unionResults) {
    if (!podrs.includes(result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0])) {
      podrs.push(result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]);
    }
  }

  let separatedResults = {};

  for (const podr of podrs) {
    if (!(podr in separatedResults)) {
      separatedResults[podr] = {
        women: [],
        contracts: [],
        conscripts: [],
        officers: [],
      };
    }
  }

  for (const result of unionResults) {
    separatedResults[result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]][result.Person.isMale ? "men" : "women"].push(result);
  }

  return separatedResults;
}

async function processPodrazdelenieData(podr, results) {
  const consResults = await processPersonalResults(results.conscripts);
  const contractsResults = await processPersonalResults(results.contracts);
  const officersResults = await processPersonalResults(results.officers);
  const womenResults = await processPersonalResults(results.women);

  const consSummary = summarizeResults(consResults);
  const contractsSummary = summarizeResults(contractsResults);
  const officersSummary = summarizeResults(officersResults);
  const womenSummary = summarizeResults(womenResults);

  const consGrade = calculateGrade(consSummary);
  const contractsGrade = calculateGrade(contractsSummary);
  const officersGrade = calculateGrade(officersSummary);
  const womenGrade = calculateGrade(womenSummary);

  const totalGrade = Math.min(...[consGrade, contractsGrade, officersGrade, womenGrade].filter(Number));

  const podrIds = (
    await Podrazdelenie.findAll({
      where: { name: { [Op.like]: `%${podr}%` } },
      raw: true,
    })
  ).map(({ id }) => id);

  const personsCountPodr = await Person.count({
    where: { podrazdelenieId: { [Op.or]: podrIds } },
  });

  return {
    id: data.tableData.length > 0 ? data.tableData.slice(-1)[0]["id"] + 1 : 1,
    podrazdelenie: podr,
    personLenght: personsCountPodr,
    allPersonsChecked: results.women.length + results.contracts.length + results.conscripts.length + results.officers.length,
    tpt: undefined,
    totalGrade: totalGrade,
    resultsData: {
      officers: {
        checked: results.officers.length,
        great: officersSummary.great,
        good: officersSummary.good,
        satisfactory: officersSummary.satisfactory,
        unsatisfactory: officersSummary.unsatisfactory,
        grade: officersGrade,
      },
      contracts: {
        checked: results.contracts.length,
        great: contractsSummary.great,
        good: contractsSummary.good,
        satisfactory: contractsSummary.satisfactory,
        unsatisfactory: contractsSummary.unsatisfactory,
        grade: contractsGrade,
      },
      conscripts: {
        checked: results.conscripts.length,
        great: consSummary.great,
        good: consSummary.good,
        satisfactory: consSummary.satisfactory,
        unsatisfactory: consSummary.unsatisfactory,
        grade: consGrade,
      },
      women: {
        checked: results.women.length,
        great: womenSummary.great,
        good: womenSummary.good,
        satisfactory: womenSummary.satisfactory,
        unsatisfactory: womenSummary.unsatisfactory,
        grade: womenGrade,
      },
    },
  };
}

// Чтение одной записи по ID (Read)
router.get("/:id", async (req, res) => {
  try {
    const uprazhnenieResultId = req.params.id;
    const uprazhnenieResult = await UprazhnenieResult.findByPk(
      parseInt(uprazhnenieResultId)
    );
    if (uprazhnenieResult) {
      res.status(200).json(uprazhnenieResult);
    } else {
      res.status(404).json({ error: "Запись не найдена" });
    }
  } catch (error) {
    res.status(500).json({ error: "Ошибка при чтении записи" });
  }
});

// Обновление записи (Update)
router.put("/:id", async (req, res) => {
  try {
    const uprazhnenieResultId = req.params.id;
    const updatedUprazhnenieResult = req.body;
    const result = await UprazhnenieResult.update(updatedUprazhnenieResult, {
      where: { id: uprazhnenieResultId },
    });
    if (result[0] === 1) {
      res.status(200).json({ message: "Запись успешно обновлена" });
    } else {
      res.status(404).json({ error: "Запись не найдена" });
    }
  } catch (error) {
    res.status(500).json({ error: "Ошибка при обновлении записи" });
  }
});

// Удаление записи (Delete)
router.delete("/:id", async (req, res) => {
  try {
    const uprazhnenieResultId = req.params.id;
    const result = await UprazhnenieResult.destroy({
      where: { id: uprazhnenieResultId },
    });
    if (result === 1) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Запись не найдена" });
    }
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении записи" });
  }
});

module.exports = router;
