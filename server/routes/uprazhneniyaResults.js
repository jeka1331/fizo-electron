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
const { calculateBall } = require("../lib");


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

    let uprazhnenieResults = await UprazhnenieResult.findAll(options);
    const addBallsFields = async (ur) => {
      let res = [];
      for (const element of ur) {
        res.push(await calculateBall(element.dataValues));
      }
      return res;
    };
    uprazhnenieResults = await addBallsFields(uprazhnenieResults);

    if (range) {
      const total = await UprazhnenieResult.count();
      // Устанавливаем заголовок Content-Range
      res.header(
        "Content-Range",
        `uprazhnenieResults ${options.offset}-${
          options.offset + uprazhnenieResults.length - 1
        }/${total}`
      );
    }

    res.status(200).json(uprazhnenieResults);
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
        "PersonId",
      ], // Выбираем атрибуты и находим максимальную дату
      where: {
        date: {
          [Op.between]: [minDate, maxDate], // Фильтруем по дате
        },
      },
      group: ["PersonId", "UprazhnenieId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "fName", "lName", "ZvanieId"], // Выбираем только необходимые атрибуты из модели Person
          where: {
            PodrazdelenieId: req.query.podrId,
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
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
      });
      const maxValue = maxResult.dataValues.maxValue;

      let ball;
      if (!(uprResult.result > maxValue)) {
        ball = await UprazhnenieStandard.findOne({
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
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
          id: uprResult.Person.ZvanieId,
        },
      });

      if (!personalResultsP[uprResult.Person.id]) {
        const result = {
          PersonId: uprResult.Person.id,
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
    let data = {
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
          officers: {
            checked: 0,
            great: 0,
            good: 0,
            satisfactory: 0,
            unsatisfactory: 0,
            grade: undefined,
          },
          contracts: {
            checked: 0,
            great: 0,
            good: 0,
            satisfactory: 0,
            unsatisfactory: 0,
            grade: undefined,
          },
          conscripts: {
            checked: 0,
            great: 0,
            good: 0,
            satisfactory: 0,
            unsatisfactory: 0,
            grade: undefined,
          },
          women: {
            checked: 0,
            great: 0,
            good: 0,
            satisfactory: 0,
            unsatisfactory: 0,
            grade: undefined,
          },
        },
      },
      tableData: [],
    };

    // let data = {
    //   allChecked: 40,
    //   allGreat: 4,
    //   allGood: 9,
    //   allSatisfactory: 12,
    //   allUnsatisfactory: 16,
    //   allGrade: 2,
    //   allTableData: {
    //     personLenght: 40,
    //     allPersonsChecked: 12,
    //     tpt: 0,
    //     totalGrade: 2,
    //     resultsData: {
    //       officers: {
    //         checked: 0,
    //         great: 0,
    //         good: 0,
    //         satisfactory: 0,
    //         unsatisfactory: 0,
    //         grade: 0,
    //       },
    //       contracts: {
    //         checked: undefined,
    //         great: undefined,
    //         good: undefined,
    //         satisfactory: undefined,
    //         unsatisfactory: undefined,
    //         grade: undefined,
    //       },
    //       conscripts: {
    //         checked: undefined,
    //         great: undefined,
    //         good: undefined,
    //         satisfactory: undefined,
    //         unsatisfactory: undefined,
    //         grade: undefined,
    //       },
    //       women: {
    //         checked: 0,
    //         great: 0,
    //         good: 0,
    //         satisfactory: 0,
    //         unsatisfactory: 0,
    //         grade: 0,
    //       },
    //     },
    //   },
    //   tableData: [
    //     {
    //       id: 1,
    //       podrazdelenie: "ВНВ",
    //       personLenght: 40,
    //       allPersonsChecked: 40,
    //       tpt: 0,
    //       totalGrade: 2,
    //       resultsData: {
    //         officers: {
    //           checked: 10,
    //           great: 1,
    //           good: 2,
    //           satisfactory: 3,
    //           unsatisfactory: 4,
    //           grade: 2,
    //         },
    //         contracts: {
    //           checked: 10,
    //           great: 1,
    //           good: 2,
    //           satisfactory: 3,
    //           unsatisfactory: 4,
    //           grade: 2,
    //         },
    //         conscripts: {
    //           checked: 10,
    //           great: 1,
    //           good: 2,
    //           satisfactory: 3,
    //           unsatisfactory: 4,
    //           grade: 2,
    //         },
    //         women: {
    //           checked: 10,
    //           great: 1,
    //           good: 2,
    //           satisfactory: 3,
    //           unsatisfactory: 4,
    //           grade: 2,
    //         },
    //       },
    //     },
    //   ],
    // };

    if (!req.query.year || !req.query.month) {
      throw new Error("Неверные параметры в get запросе");
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

    data.allTableData.allPersonsChecked = (
      await UprazhnenieResult.findAll({
        attributes: [
          [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
          "PersonId",
        ], // Выбираем атрибуты и находим максимальную дату
        where: {
          date: {
            [Op.between]: [minDate, maxDate], // Фильтруем по дате
          },
        },
        group: ["PersonId"], // Группируем по personId и uprazhnenieId
      })
    ).length;

    data.allTableData.personLenght = await Person.findOne({
      attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "personL"]], // Выбираем атрибуты и находим максимальную дату
      where: {
        PodrazdelenieId: {
          [sequelize.Op.not]: null,
        },
      },
      raw: true,
    });
    data.allTableData.personLenght = data.allTableData.personLenght.personL;

    data.allTableData.resultsData.women.checked = (
      await UprazhnenieResult.findAll({
        attributes: [
          [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
          "PersonId",
        ], // Выбираем атрибуты и находим максимальную дату
        where: {
          date: {
            [Op.between]: [minDate, maxDate], // Фильтруем по дате
          },
        },
        group: ["PersonId", "UprazhnenieId"], // Группируем по personId и uprazhnenieId
        include: [
          {
            model: Person,
            attributes: ["id", "isMale"],
            where: {
              isMale: false,
            },
            include: Podrazdelenie,
          },
        ],
      })
    ).length;

    // -------------------------------------------------------------------------------------
    // ----------------------------- Женщины-военнослужащие --------------------------------
    // -------------------------------------------------------------------------------------
    const uprResults = await UprazhnenieResult.findAll({
      attributes: [
        [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
        "result",
        "PersonId",
      ], // Выбираем атрибуты и находим максимальную дату
      where: {
        date: {
          [Op.between]: [minDate, maxDate], // Фильтруем по дате
        },
      },
      group: ["PersonId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "ZvanieId"],
          where: {
            isMale: false,
          },
          include: Podrazdelenie,
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
    });

    let personalResultsP = {};
    let uprNamesP = [];

    for (const uprResult of uprResults) {
      uprNamesP.push(uprResult.Uprazhnenie.shortName);

      const maxResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });

      const minResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });
      const efficiencyPreference =
        maxResult.Uprazhnenie.EfficiencyPreference.name;
      const maxValue = maxResult.dataValues.maxValue;
      const minValue = minResult.dataValues.minValue;
      let res;
      let ball;

      if (efficiencyPreference === "Меньше - лучше") {
        if (minValue > uprResult.result) {
          const additionalResultCount = minValue - uprResult.result;
          res =
            minResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        } else {
        }
      }
      if (efficiencyPreference === "Больше - лучше") {
        const additionalResultCount = uprResult.result - maxValue;

        res =
          maxResult.result +
          uprResult.Uprazhnenie.valueToAddAfterMaxResult *
            (additionalResultCount / uprResult.Uprazhnenie.step);
      }

      if (!(uprResult.result > maxValue)) {
        ball = await UprazhnenieStandard.findOne({
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
            value: uprResult.result,
          },
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });
      } else {
        ball = {
          result: res ? res : 0,
        };
      }

      const zvanie = await Zvanie.findOne({
        where: {
          id: uprResult.Person.ZvanieId,
        },
      });

      if (!personalResultsP[uprResult.Person.id]) {
        const result = {
          PersonId: uprResult.Person.id,
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
      const element = personalResultsP[key].totalOcenka;
      switch (element) {
        case 5:
          data.allTableData.resultsData.women.great
            ? (data.allTableData.resultsData.women.great += 1)
            : (data.allTableData.resultsData.women.great = 1);
          break;
        case 4:
          data.allTableData.resultsData.women.good
            ? (data.allTableData.resultsData.women.good += 1)
            : (data.allTableData.resultsData.women.good = 1);
          break;
        case 3:
          data.allTableData.resultsData.women.satisfactory
            ? (data.allTableData.resultsData.women.satisfactory += 1)
            : (data.allTableData.resultsData.women.satisfactory = 1);
          break;
        case 2:
          data.allTableData.resultsData.women.unsatisfactory
            ? (data.allTableData.resultsData.women.unsatisfactory += 1)
            : (data.allTableData.resultsData.women.unsatisfactory = 1);
          break;
        default:
          break;
      }
    }

    data.allTableData.resultsData.women.grade = "-";
    if (data.allTableData.resultsData.women.great > 0) {
      data.allTableData.resultsData.women.grade = 5;
    }
    if (data.allTableData.resultsData.women.good > 0) {
      data.allTableData.resultsData.women.grade = 4;
    }
    if (data.allTableData.resultsData.women.satisfactory > 0) {
      data.allTableData.resultsData.women.grade = 3;
    }
    if (data.allTableData.resultsData.women.unsatisfactory > 0) {
      data.allTableData.resultsData.women.grade = 2;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------------- Женщины-военнослужащие --------------------------------
    // -------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------
    // ------------------------------------- Офицеры ---------------------------------------
    // -------------------------------------------------------------------------------------

    const officerResults = await UprazhnenieResult.findAll({
      attributes: [
        [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
        "result",
        "PersonId",
      ], // Выбираем атрибуты и находим максимальную дату
      where: {
        date: {
          [Op.between]: [minDate, maxDate], // Фильтруем по дате
        },
      },
      group: ["PersonId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "ZvanieId"],
          where: {
            isMale: true,
          },

          include: [
            {
              model: Zvanie,
              attributes: ["name"],
              where: {
                name: [
                  "Лейтенант",
                  "Старший лейтенант",
                  "Капитан",
                  "Майор",
                  "Подполковник",
                  "Полковник",
                  "Генерал-майор",
                  "Генерал-лейтенант",
                  "Генерал-полковник",
                  "Генерал армии",
                  "Капитан-лейтенант",
                  "Капитан третьего ранга",
                  "Капитан второго ранга",
                  "Капитан первого ранга",
                  "Контр-адмирал",
                  "Вице-адмирал",
                  "Адмирал",
                ],
              },
            },
            Podrazdelenie,
          ],
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
    });
    data.allTableData.resultsData.officers.checked = officerResults.length;

    let personalResultsO = {};
    let uprNamesO = [];

    for (const uprResult of officerResults) {
      uprNamesO.push(uprResult.Uprazhnenie.shortName);

      const maxResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });

      const minResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });

      const efficiencyPreference =
        maxResult.Uprazhnenie.EfficiencyPreference.name;
      const maxValue = maxResult.dataValues.maxValue;
      const minValue = minResult.dataValues.minValue;
      let res;
      let ball;

      if (efficiencyPreference === "Меньше - лучше") {
        if (minValue > uprResult.result) {
          const additionalResultCount = minValue - uprResult.result;
          res =
            minResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        } else {
          // handle if necessary
        }
      }
      if (efficiencyPreference === "Больше - лучше") {
        const additionalResultCount = uprResult.result - maxValue;

        res =
          maxResult.result +
          uprResult.Uprazhnenie.valueToAddAfterMaxResult *
            (additionalResultCount / uprResult.Uprazhnenie.step);
      }

      if (!(uprResult.result > maxValue)) {
        ball = await UprazhnenieStandard.findOne({
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
            value: uprResult.result,
          },
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });
      } else {
        ball = {
          result: res ? res : 0,
        };
      }

      const zvanie = await Zvanie.findOne({
        where: {
          id: uprResult.Person.ZvanieId,
        },
      });

      if (!personalResultsO[uprResult.Person.id]) {
        const result = {
          PersonId: uprResult.Person.id,
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
        personalResultsO[uprResult.Person.id] = result;
      } else {
        personalResultsO[uprResult.Person.id].results.push({
          uprName: uprResult.Uprazhnenie.shortName,
          score: uprResult.result,
          ball: ball ? ball.result : 0,
        });
      }
    }

    let maxResultsO = 0;
    for (const key in personalResultsO) {
      if (personalResultsO[key].results.length > maxResultsO) {
        maxResultsO = personalResultsO[key].results.length;
      }
    }

    uprNamesO = [...new Set(uprNamesO)];
    const sumOfBallsFor5O = uprNamesO.length * 60;
    const sumOfBallsFor4O = uprNamesO.length * 40;
    const sumOfBallsFor3O = uprNamesO.length * 20;

    for (const key in personalResultsO) {
      let sumOfBallsO = 0;
      const element = personalResultsO[key];
      for (const result of element.results) {
        if (!result.ball || result.ball == 0) {
          sumOfBallsO = 0;
          break;
        }
        sumOfBallsO = sumOfBallsO + result.ball;
      }
      personalResultsO[key].sumOfBalls = sumOfBallsO;
      if (sumOfBallsO >= sumOfBallsFor3O) {
        personalResultsO[key].totalOcenka = 3;
      }
      if (sumOfBallsO >= sumOfBallsFor4O) {
        personalResultsO[key].totalOcenka = 4;
      }
      if (sumOfBallsO >= sumOfBallsFor5O) {
        personalResultsO[key].totalOcenka = 5;
      }
      if (!personalResultsO[key].totalOcenka) {
        personalResultsO[key].totalOcenka = 2;
      }
    }

    for (const key in personalResultsO) {
      const element = personalResultsO[key].totalOcenka;
      switch (element) {
        case 5:
          data.allTableData.resultsData.officers.great
            ? (data.allTableData.resultsData.officers.great += 1)
            : (data.allTableData.resultsData.officers.great = 1);
          break;
        case 4:
          data.allTableData.resultsData.officers.good
            ? (data.allTableData.resultsData.officers.good += 1)
            : (data.allTableData.resultsData.officers.good = 1);
          break;
        case 3:
          data.allTableData.resultsData.officers.satisfactory
            ? (data.allTableData.resultsData.officers.satisfactory += 1)
            : (data.allTableData.resultsData.officers.satisfactory = 1);
          break;
        case 2:
          data.allTableData.resultsData.officers.unsatisfactory
            ? (data.allTableData.resultsData.officers.unsatisfactory += 1)
            : (data.allTableData.resultsData.officers.unsatisfactory = 1);
          break;
        default:
          break;
      }
    }
    data.allTableData.resultsData.officers.grade = "-";

    if (data.allTableData.resultsData.officers.great > 0) {
      data.allTableData.resultsData.officers.grade = 5;
    }
    if (data.allTableData.resultsData.officers.good > 0) {
      data.allTableData.resultsData.officers.grade = 4;
    }
    if (data.allTableData.resultsData.officers.satisfactory > 0) {
      data.allTableData.resultsData.officers.grade = 3;
    }
    if (data.allTableData.resultsData.officers.unsatisfactory > 0) {
      data.allTableData.resultsData.officers.grade = 2;
    }

    // -------------------------------------------------------------------------------------
    // ------------------------------------- Офицеры ---------------------------------------
    // -------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------
    // ---------------------------------- Контрактники -------------------------------------
    // -------------------------------------------------------------------------------------

    const contractorResults = await UprazhnenieResult.findAll({
      attributes: [
        [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
        "result",
        "PersonId",
      ], // Выбираем атрибуты и находим максимальную дату
      where: {
        date: {
          [Op.between]: [new Date(minDate), new Date(maxDate)], // Фильтруем по дате
        },
      },
      group: ["PersonId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "ZvanieId", "isV"],
          where: {
            isMale: { [Op.or]: [{ [Op.eq]: true }] },
            isV: {
              [Op.or]: [{ [Op.eq]: false }, { [Op.eq]: 0 }, { [Op.eq]: null }],
            },
          },
          include: [
            {
              model: Zvanie,
              attributes: ["name"],
              where: {
                name: [
                  "Рядовой",
                  "Ефрейтор",
                  "Младший сержант",
                  "Сержант",
                  "Старший сержант",
                  "Сержант третьего класса",
                  "Сержант второго класса",
                  "Сержант первого класса",
                  "Штаб-сержант",
                  "Мастер-сержант",
                  "Матрос",
                  "Старший матрос",
                  "Старшина второй статьи",
                  "Старшина первой статьи",
                  "Главный старшина",
                  "Старшина третьего класса",
                  "Старшина второго класса",
                  "Старшина первого класса",
                  "Штаб-старшина",
                  "Мастер-старшина",
                  "Старшина",
                ],
              },
            },
            Podrazdelenie,
          ],
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
    });
    data.allTableData.resultsData.contracts.checked = contractorResults.length;

    let personalResultsC = {};
    let uprNamesC = [];

    for (const uprResult of contractorResults) {
      uprNamesC.push(uprResult.Uprazhnenie.shortName);

      const maxResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });

      const minResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });

      const efficiencyPreference =
        maxResult.Uprazhnenie.EfficiencyPreference.name;
      const maxValue = maxResult.dataValues.maxValue;
      const minValue = minResult.dataValues.minValue;
      let res;
      let ball;

      if (efficiencyPreference === "Меньше - лучше") {
        if (minValue > uprResult.result) {
          const additionalResultCount = minValue - uprResult.result;
          res =
            minResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        } else {
          // handle if necessary
        }
      }
      if (efficiencyPreference === "Больше - лучше") {
        const additionalResultCount = uprResult.result - maxValue;

        res =
          maxResult.result +
          uprResult.Uprazhnenie.valueToAddAfterMaxResult *
            (additionalResultCount / uprResult.Uprazhnenie.step);
      }

      if (!(uprResult.result > maxValue)) {
        ball = await UprazhnenieStandard.findOne({
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
            value: uprResult.result,
          },
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });
      } else {
        ball = {
          result: res ? res : 0,
        };
      }

      const zvanie = await Zvanie.findOne({
        where: {
          id: uprResult.Person.ZvanieId,
        },
      });

      if (!personalResultsC[uprResult.Person.id]) {
        const result = {
          PersonId: uprResult.Person.id,
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
        personalResultsC[uprResult.Person.id] = result;
      } else {
        personalResultsC[uprResult.Person.id].results.push({
          uprName: uprResult.Uprazhnenie.shortName,
          score: uprResult.result,
          ball: ball ? ball.result : 0,
        });
      }
    }

    let maxResultsC = 0;
    for (const key in personalResultsC) {
      if (personalResultsC[key].results.length > maxResultsC) {
        maxResultsC = personalResultsC[key].results.length;
      }
    }

    uprNamesC = [...new Set(uprNamesC)];
    const sumOfBallsFor5C = uprNamesC.length * 60;
    const sumOfBallsFor4C = uprNamesC.length * 40;
    const sumOfBallsFor3C = uprNamesC.length * 20;

    for (const key in personalResultsC) {
      let sumOfBallsC = 0;
      const element = personalResultsC[key];
      for (const result of element.results) {
        if (!result.ball || result.ball == 0) {
          sumOfBallsC = 0;
          break;
        }
        sumOfBallsC = sumOfBallsC + result.ball;
      }
      personalResultsC[key].sumOfBalls = sumOfBallsC;
      if (sumOfBallsC >= sumOfBallsFor3C) {
        personalResultsC[key].totalOcenka = 3;
      }
      if (sumOfBallsC >= sumOfBallsFor4C) {
        personalResultsC[key].totalOcenka = 4;
      }
      if (sumOfBallsC >= sumOfBallsFor5C) {
        personalResultsC[key].totalOcenka = 5;
      }
      if (!personalResultsC[key].totalOcenka) {
        personalResultsC[key].totalOcenka = 2;
      }
    }

    for (const key in personalResultsC) {
      const element = personalResultsC[key].totalOcenka;
      switch (element) {
        case 5:
          data.allTableData.resultsData.contracts.great
            ? (data.allTableData.resultsData.contracts.great += 1)
            : (data.allTableData.resultsData.contracts.great = 1);
          break;
        case 4:
          data.allTableData.resultsData.contracts.good
            ? (data.allTableData.resultsData.contracts.good += 1)
            : (data.allTableData.resultsData.contracts.good = 1);
          break;
        case 3:
          data.allTableData.resultsData.contracts.satisfactory
            ? (data.allTableData.resultsData.contracts.satisfactory += 1)
            : (data.allTableData.resultsData.contracts.satisfactory = 1);
          break;
        case 2:
          data.allTableData.resultsData.contracts.unsatisfactory
            ? (data.allTableData.resultsData.contracts.unsatisfactory += 1)
            : (data.allTableData.resultsData.contracts.unsatisfactory = 1);
          break;
        default:
          break;
      }
    }
    data.allTableData.resultsData.contracts.grade = "-";
    if (data.allTableData.resultsData.contracts.great > 0) {
      data.allTableData.resultsData.contracts.grade = 5;
    }
    if (data.allTableData.resultsData.contracts.good > 0) {
      data.allTableData.resultsData.contracts.grade = 4;
    }
    if (data.allTableData.resultsData.contracts.satisfactory > 0) {
      data.allTableData.resultsData.contracts.grade = 3;
    }
    if (data.allTableData.resultsData.contracts.unsatisfactory > 0) {
      data.allTableData.resultsData.contracts.grade = 2;
    }

    // -------------------------------------------------------------------------------------
    // ---------------------------------- Контрактники -------------------------------------
    // -------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------
    // ---------------------------------- Срочники -----------------------------------------
    // -------------------------------------------------------------------------------------

    const consResults = await UprazhnenieResult.findAll({
      attributes: [
        [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
        "result",
        "PersonId",
      ],
      where: {
        date: {
          [Op.between]: [new Date(minDate), new Date(maxDate)],
        },
      },
      group: ["PersonId"],
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "ZvanieId", "isV"],
          where: {
            isMale: { [Op.or]: [{ [Op.eq]: true }] },
            isV: { [Op.or]: [{ [Op.eq]: true }, { [Op.eq]: 1 }] },
          },
          include: Podrazdelenie,
        },
        {
          model: Category,
          attributes: ["id", "name", "shortName"],
        },
        {
          model: Uprazhnenie,
          attributes: [
            "id",
            "name",
            "step",
            "valueToAddAfterMaxResult",
            "shortName",
          ],
        },
      ],
    });
    data.allTableData.resultsData.conscripts.checked = consResults.length;

    let personalResultsS = {};
    let uprNamesS = [];

    for (const uprResult of consResults) {
      uprNamesS.push(uprResult.Uprazhnenie.shortName);

      const maxResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });

      const minResult = await UprazhnenieStandard.findOne({
        attributes: [
          [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
          "id",
          "UprazhnenieId",
          "CategoryId",
          "result",
        ],
        where: {
          UprazhnenieId: uprResult.Uprazhnenie.id,
          CategoryId: uprResult.Category.id,
        },
        limit: 1,
        include: [
          {
            model: Uprazhnenie,
            include: [{ model: EfficiencyPreference, attributes: ["name"] }],
          },
        ],
      });

      const efficiencyPreference =
        maxResult.Uprazhnenie.EfficiencyPreference.name;
      const maxValue = maxResult.dataValues.maxValue;
      const minValue = minResult.dataValues.minValue;
      let res;
      let ball;

      if (efficiencyPreference === "Меньше - лучше") {
        if (minValue > uprResult.result) {
          const additionalResultCount = minValue - uprResult.result;
          res =
            minResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        } else {
          // Handle other cases if needed
        }
      }

      if (efficiencyPreference === "Больше - лучше") {
        const additionalResultCount = uprResult.result - maxValue;

        res =
          maxResult.result +
          uprResult.Uprazhnenie.valueToAddAfterMaxResult *
            (additionalResultCount / uprResult.Uprazhnenie.step);
      }

      if (!(uprResult.result > maxValue)) {
        ball = await UprazhnenieStandard.findOne({
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
            value: uprResult.result,
          },
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });
      } else {
        ball = {
          result: res ? res : 0,
        };
      }

      const zvanie = await Zvanie.findOne({
        where: {
          id: uprResult.Person.ZvanieId,
        },
      });

      if (!personalResultsS[uprResult.Person.id]) {
        const result = {
          PersonId: uprResult.Person.id,
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
        personalResultsS[uprResult.Person.id] = result;
      } else {
        personalResultsS[uprResult.Person.id].results.push({
          uprName: uprResult.Uprazhnenie.shortName,
          score: uprResult.result,
          ball: ball ? ball.result : 0,
        });
      }
    }

    let maxResultsS = 0;
    for (const key in personalResultsS) {
      if (personalResultsS[key].results.length > maxResultsS) {
        maxResultsS = personalResultsS[key].results.length;
      }
    }

    uprNamesS = [...new Set(uprNamesS)];
    const sumOfBallsFor5S = uprNamesS.length * 60;
    const sumOfBallsFor4S = uprNamesS.length * 40;
    const sumOfBallsFor3S = uprNamesS.length * 20;

    for (const key in personalResultsS) {
      let sumOfBallsS = 0;
      const element = personalResultsS[key];
      for (const result of element.results) {
        if (!result.ball || result.ball == 0) {
          sumOfBallsS = 0;
          break;
        }
        sumOfBallsS = sumOfBallsS + result.ball;
      }
      personalResultsS[key].sumOfBalls = sumOfBallsS;
      if (sumOfBallsS >= sumOfBallsFor3S) {
        personalResultsS[key].totalOcenka = 3;
      }
      if (sumOfBallsS >= sumOfBallsFor4S) {
        personalResultsS[key].totalOcenka = 4;
      }
      if (sumOfBallsS >= sumOfBallsFor5S) {
        personalResultsS[key].totalOcenka = 5;
      }
      if (!personalResultsS[key].totalOcenka) {
        personalResultsS[key].totalOcenka = 2;
      }
    }

    for (const key in personalResultsS) {
      const element = personalResultsS[key].totalOcenka;
      switch (element) {
        case 5:
          data.allTableData.resultsData.conscripts.great
            ? (data.allTableData.resultsData.conscripts.great += 1)
            : (data.allTableData.resultsData.conscripts.great = 1);
          break;
        case 4:
          data.allTableData.resultsData.conscripts.good
            ? (data.allTableData.resultsData.conscripts.good += 1)
            : (data.allTableData.resultsData.conscripts.good = 1);
          break;
        case 3:
          data.allTableData.resultsData.conscripts.satisfactory
            ? (data.allTableData.resultsData.conscripts.satisfactory += 1)
            : (data.allTableData.resultsData.conscripts.satisfactory = 1);
          break;
        case 2:
          data.allTableData.resultsData.conscripts.unsatisfactory
            ? (data.allTableData.resultsData.conscripts.unsatisfactory += 1)
            : (data.allTableData.resultsData.conscripts.unsatisfactory = 1);
          break;
        default:
          break;
      }
    }
    data.allTableData.resultsData.conscripts.grade = "-";

    if (data.allTableData.resultsData.conscripts.great > 0) {
      data.allTableData.resultsData.conscripts.grade = 5;
    }
    if (data.allTableData.resultsData.conscripts.good > 0) {
      data.allTableData.resultsData.conscripts.grade = 4;
    }
    if (data.allTableData.resultsData.conscripts.satisfactory > 0) {
      data.allTableData.resultsData.conscripts.grade = 3;
    }
    if (data.allTableData.resultsData.conscripts.unsatisfactory > 0) {
      data.allTableData.resultsData.conscripts.grade = 2;
    }

    // -------------------------------------------------------------------------------------
    // ---------------------------------- Срочники -----------------------------------------
    // -------------------------------------------------------------------------------------

    data.allGrade = Math.min(
      ...[
        data.allTableData.resultsData.officers.grade,
        data.allTableData.resultsData.women.grade,
        data.allTableData.resultsData.conscripts.grade,
        data.allTableData.resultsData.contracts.grade,
      ].filter(Number)
    );
    data.allTableData.totalGrade = data.allGrade;

    const unionResults = uprResults.concat(
      ...[consResults, contractorResults, officerResults]
    );

    let podrs = [];

    for (const result of unionResults) {
      if (
        !podrs.includes(
          result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]
        )
      ) {
        podrs.push(
          result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]
        );
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

    for (const result of uprResults) {
      separatedResults[
        result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]
      ]["women"].push(result);
    }
    for (const result of contractorResults) {
      separatedResults[
        result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]
      ]["contracts"].push(result);
    }
    for (const result of consResults) {
      separatedResults[
        result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]
      ]["conscripts"].push(result);
    }
    for (const result of officerResults) {
      separatedResults[
        result.Person.Podrazdelenie.dataValues["name"].split(" || ")[0]
      ]["officers"].push(result);
    }

    for (const podr of Object.keys(separatedResults)) {
      console.log(podr, separatedResults[podr]);

      /* #region  conscripts podr section */
      const consResults = separatedResults[podr]["conscripts"];

      let personalResultsS = {};
      let uprNamesS = [];

      for (const uprResult of consResults) {
        uprNamesS.push(uprResult.Uprazhnenie.shortName);

        const maxResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });

        const minResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });

        const efficiencyPreference =
          maxResult.Uprazhnenie.EfficiencyPreference.name;
        const maxValue = maxResult.dataValues.maxValue;
        const minValue = minResult.dataValues.minValue;
        let res;
        let ball;

        if (efficiencyPreference === "Меньше - лучше") {
          if (minValue > uprResult.result) {
            const additionalResultCount = minValue - uprResult.result;
            res =
              minResult.result +
              uprResult.Uprazhnenie.valueToAddAfterMaxResult *
                (additionalResultCount / uprResult.Uprazhnenie.step);
          } else {
            // Handle other cases if needed
          }
        }

        if (efficiencyPreference === "Больше - лучше") {
          const additionalResultCount = uprResult.result - maxValue;

          res =
            maxResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        }

        if (!(uprResult.result > maxValue)) {
          ball = await UprazhnenieStandard.findOne({
            where: {
              UprazhnenieId: uprResult.Uprazhnenie.id,
              CategoryId: uprResult.Category.id,
              value: uprResult.result,
            },
            include: [
              {
                model: Uprazhnenie,
                include: [
                  { model: EfficiencyPreference, attributes: ["name"] },
                ],
              },
            ],
          });
        } else {
          ball = {
            result: res ? res : 0,
          };
        }

        const zvanie = await Zvanie.findOne({
          where: {
            id: uprResult.Person.ZvanieId,
          },
        });

        if (!personalResultsS[uprResult.Person.id]) {
          const result = {
            PersonId: uprResult.Person.id,
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
          personalResultsS[uprResult.Person.id] = result;
        } else {
          personalResultsS[uprResult.Person.id].results.push({
            uprName: uprResult.Uprazhnenie.shortName,
            score: uprResult.result,
            ball: ball ? ball.result : 0,
          });
        }
      }

      let maxResultsS = 0;
      for (const key in personalResultsS) {
        if (personalResultsS[key].results.length > maxResultsS) {
          maxResultsS = personalResultsS[key].results.length;
        }
      }

      uprNamesS = [...new Set(uprNamesS)];
      const sumOfBallsFor5S = uprNamesS.length * 60;
      const sumOfBallsFor4S = uprNamesS.length * 40;
      const sumOfBallsFor3S = uprNamesS.length * 20;

      for (const key in personalResultsS) {
        let sumOfBallsS = 0;
        const element = personalResultsS[key];
        for (const result of element.results) {
          if (!result.ball || result.ball == 0) {
            sumOfBallsS = 0;
            break;
          }
          sumOfBallsS = sumOfBallsS + result.ball;
        }
        personalResultsS[key].sumOfBalls = sumOfBallsS;
        if (sumOfBallsS >= sumOfBallsFor3S) {
          personalResultsS[key].totalOcenka = 3;
        }
        if (sumOfBallsS >= sumOfBallsFor4S) {
          personalResultsS[key].totalOcenka = 4;
        }
        if (sumOfBallsS >= sumOfBallsFor5S) {
          personalResultsS[key].totalOcenka = 5;
        }
        if (!personalResultsS[key].totalOcenka) {
          personalResultsS[key].totalOcenka = 2;
        }
      }
      let dataAllTableDataResultsDataConscriptsGreat = 0;
      let dataAllTableDataResultsDataConscriptsGood = 0;
      let dataAllTableDataResultsDataConscriptsSatisfactory = 0;
      let dataAllTableDataResultsDataConscriptsUnsatisfactory = 0;
      let dataAllTableDataResultsDataConscriptsGrade = undefined;
      for (const key in personalResultsS) {
        const element = personalResultsS[key].totalOcenka;
        switch (element) {
          case 5:
            dataAllTableDataResultsDataConscriptsGreat
              ? (dataAllTableDataResultsDataConscriptsGreat += 1)
              : (dataAllTableDataResultsDataConscriptsGreat = 1);
            break;
          case 4:
            dataAllTableDataResultsDataConscriptsGood
              ? (dataAllTableDataResultsDataConscriptsGood += 1)
              : (dataAllTableDataResultsDataConscriptsGood = 1);
            break;
          case 3:
            dataAllTableDataResultsDataConscriptsSatisfactory
              ? (dataAllTableDataResultsDataConscriptsSatisfactory += 1)
              : (dataAllTableDataResultsDataConscriptsSatisfactory = 1);
            break;
          case 2:
            dataAllTableDataResultsDataConscriptsUnsatisfactory
              ? (dataAllTableDataResultsDataConscriptsUnsatisfactory += 1)
              : (dataAllTableDataResultsDataConscriptsUnsatisfactory = 1);
            break;
          default:
            break;
        }
      }
      dataAllTableDataResultsDataConscriptsGrade = "-";

      if (dataAllTableDataResultsDataConscriptsGreat > 0) {
        dataAllTableDataResultsDataConscriptsGrade = 5;
      }
      if (dataAllTableDataResultsDataConscriptsGood > 0) {
        dataAllTableDataResultsDataConscriptsGrade = 4;
      }
      if (dataAllTableDataResultsDataConscriptsSatisfactory > 0) {
        dataAllTableDataResultsDataConscriptsGrade = 3;
      }
      if (dataAllTableDataResultsDataConscriptsUnsatisfactory > 0) {
        dataAllTableDataResultsDataConscriptsGrade = 2;
      }

      /* #endregion */

      /* #region  contracts  podr section */

      const contractorResults = separatedResults[podr]["contracts"];
      // data.allTableData.resultsData.contracts.checked =
      //   contractorResults.length;

      let personalResultsC = {};
      let uprNamesC = [];

      for (const uprResult of contractorResults) {
        uprNamesC.push(uprResult.Uprazhnenie.shortName);

        const maxResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });

        const minResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });

        const efficiencyPreference =
          maxResult.Uprazhnenie.EfficiencyPreference.name;
        const maxValue = maxResult.dataValues.maxValue;
        const minValue = minResult.dataValues.minValue;
        let res;
        let ball;

        if (efficiencyPreference === "Меньше - лучше") {
          if (minValue > uprResult.result) {
            const additionalResultCount = minValue - uprResult.result;
            res =
              minResult.result +
              uprResult.Uprazhnenie.valueToAddAfterMaxResult *
                (additionalResultCount / uprResult.Uprazhnenie.step);
          } else {
            // handle if necessary
          }
        }
        if (efficiencyPreference === "Больше - лучше") {
          const additionalResultCount = uprResult.result - maxValue;

          res =
            maxResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        }

        if (!(uprResult.result > maxValue)) {
          ball = await UprazhnenieStandard.findOne({
            where: {
              UprazhnenieId: uprResult.Uprazhnenie.id,
              CategoryId: uprResult.Category.id,
              value: uprResult.result,
            },
            include: [
              {
                model: Uprazhnenie,
                include: [
                  { model: EfficiencyPreference, attributes: ["name"] },
                ],
              },
            ],
          });
        } else {
          ball = {
            result: res ? res : 0,
          };
        }

        const zvanie = await Zvanie.findOne({
          where: {
            id: uprResult.Person.ZvanieId,
          },
        });

        if (!personalResultsC[uprResult.Person.id]) {
          const result = {
            PersonId: uprResult.Person.id,
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
          personalResultsC[uprResult.Person.id] = result;
        } else {
          personalResultsC[uprResult.Person.id].results.push({
            uprName: uprResult.Uprazhnenie.shortName,
            score: uprResult.result,
            ball: ball ? ball.result : 0,
          });
        }
      }

      let maxResultsC = 0;
      for (const key in personalResultsC) {
        if (personalResultsC[key].results.length > maxResultsC) {
          maxResultsC = personalResultsC[key].results.length;
        }
      }

      uprNamesC = [...new Set(uprNamesC)];
      const sumOfBallsFor5C = uprNamesC.length * 60;
      const sumOfBallsFor4C = uprNamesC.length * 40;
      const sumOfBallsFor3C = uprNamesC.length * 20;

      for (const key in personalResultsC) {
        let sumOfBallsC = 0;
        const element = personalResultsC[key];
        for (const result of element.results) {
          if (!result.ball || result.ball == 0) {
            sumOfBallsC = 0;
            break;
          }
          sumOfBallsC = sumOfBallsC + result.ball;
        }
        personalResultsC[key].sumOfBalls = sumOfBallsC;
        if (sumOfBallsC >= sumOfBallsFor3C) {
          personalResultsC[key].totalOcenka = 3;
        }
        if (sumOfBallsC >= sumOfBallsFor4C) {
          personalResultsC[key].totalOcenka = 4;
        }
        if (sumOfBallsC >= sumOfBallsFor5C) {
          personalResultsC[key].totalOcenka = 5;
        }
        if (!personalResultsC[key].totalOcenka) {
          personalResultsC[key].totalOcenka = 2;
        }
      }
      let dataAllTableDataResultsDataContractsGreat = 0;
      let dataAllTableDataResultsDataContractsGood = 0;
      let dataAllTableDataResultsDataContractsSatisfactory = 0;
      let dataAllTableDataResultsDataContractsUnsatisfactory = 0;
      let dataAllTableDataResultsDataContractsGrade = "-";
      for (const key in personalResultsC) {
        const element = personalResultsC[key].totalOcenka;
        switch (element) {
          case 5:
            dataAllTableDataResultsDataContractsGreat
              ? (dataAllTableDataResultsDataContractsGreat += 1)
              : (dataAllTableDataResultsDataContractsGreat = 1);
            break;
          case 4:
            dataAllTableDataResultsDataContractsGood
              ? (dataAllTableDataResultsDataContractsGood += 1)
              : (dataAllTableDataResultsDataContractsGood = 1);
            break;
          case 3:
            dataAllTableDataResultsDataContractsSatisfactory
              ? (dataAllTableDataResultsDataContractsSatisfactory += 1)
              : (dataAllTableDataResultsDataContractsSatisfactory = 1);
            break;
          case 2:
            dataAllTableDataResultsDataContractsUnsatisfactory
              ? (dataAllTableDataResultsDataContractsUnsatisfactory += 1)
              : (data.allTableData.resultsData.contracts.unsatisfactory = 1);
            break;
          default:
            break;
        }
      }
      if (dataAllTableDataResultsDataContractsGreat > 0) {
        dataAllTableDataResultsDataContractsGrade = 5;
      }
      if (dataAllTableDataResultsDataContractsGood > 0) {
        dataAllTableDataResultsDataContractsGrade = 4;
      }
      if (dataAllTableDataResultsDataContractsSatisfactory > 0) {
        dataAllTableDataResultsDataContractsGrade = 3;
      }
      if (dataAllTableDataResultsDataContractsUnsatisfactory > 0) {
        dataAllTableDataResultsDataContractsGrade = 2;
      }

      /* #endregion */

      /* #region  officers   podr section */

      const officerResults = separatedResults[podr]["officers"];
      // data.allTableData.resultsData.officers.checked = officerResults.length;

      let personalResultsO = {};
      let uprNamesO = [];

      for (const uprResult of officerResults) {
        uprNamesO.push(uprResult.Uprazhnenie.shortName);

        const maxResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });

        const minResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });

        const efficiencyPreference =
          maxResult.Uprazhnenie.EfficiencyPreference.name;
        const maxValue = maxResult.dataValues.maxValue;
        const minValue = minResult.dataValues.minValue;
        let res;
        let ball;

        if (efficiencyPreference === "Меньше - лучше") {
          if (minValue > uprResult.result) {
            const additionalResultCount = minValue - uprResult.result;
            res =
              minResult.result +
              uprResult.Uprazhnenie.valueToAddAfterMaxResult *
                (additionalResultCount / uprResult.Uprazhnenie.step);
          } else {
            // handle if necessary
          }
        }
        if (efficiencyPreference === "Больше - лучше") {
          const additionalResultCount = uprResult.result - maxValue;

          res =
            maxResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        }

        if (!(uprResult.result > maxValue)) {
          ball = await UprazhnenieStandard.findOne({
            where: {
              UprazhnenieId: uprResult.Uprazhnenie.id,
              CategoryId: uprResult.Category.id,
              value: uprResult.result,
            },
            include: [
              {
                model: Uprazhnenie,
                include: [
                  { model: EfficiencyPreference, attributes: ["name"] },
                ],
              },
            ],
          });
        } else {
          ball = {
            result: res ? res : 0,
          };
        }

        const zvanie = await Zvanie.findOne({
          where: {
            id: uprResult.Person.ZvanieId,
          },
        });

        if (!personalResultsO[uprResult.Person.id]) {
          const result = {
            PersonId: uprResult.Person.id,
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
          personalResultsO[uprResult.Person.id] = result;
        } else {
          personalResultsO[uprResult.Person.id].results.push({
            uprName: uprResult.Uprazhnenie.shortName,
            score: uprResult.result,
            ball: ball ? ball.result : 0,
          });
        }
      }

      let maxResultsO = 0;
      for (const key in personalResultsO) {
        if (personalResultsO[key].results.length > maxResultsO) {
          maxResultsO = personalResultsO[key].results.length;
        }
      }

      uprNamesO = [...new Set(uprNamesO)];
      const sumOfBallsFor5O = uprNamesO.length * 60;
      const sumOfBallsFor4O = uprNamesO.length * 40;
      const sumOfBallsFor3O = uprNamesO.length * 20;

      for (const key in personalResultsO) {
        let sumOfBallsO = 0;
        const element = personalResultsO[key];
        for (const result of element.results) {
          if (!result.ball || result.ball == 0) {
            sumOfBallsO = 0;
            break;
          }
          sumOfBallsO = sumOfBallsO + result.ball;
        }
        personalResultsO[key].sumOfBalls = sumOfBallsO;
        if (sumOfBallsO >= sumOfBallsFor3O) {
          personalResultsO[key].totalOcenka = 3;
        }
        if (sumOfBallsO >= sumOfBallsFor4O) {
          personalResultsO[key].totalOcenka = 4;
        }
        if (sumOfBallsO >= sumOfBallsFor5O) {
          personalResultsO[key].totalOcenka = 5;
        }
        if (!personalResultsO[key].totalOcenka) {
          personalResultsO[key].totalOcenka = 2;
        }
      }
      let dataAllTableDataResultsDataOfficersGreat = 0;
      let dataAllTableDataResultsDataOfficersGood = 0;
      let dataAllTableDataResultsDataOfficersSatisfactory = 0;
      let dataAllTableDataResultsDataOfficersUnsatisfactory = 0;
      let dataAllTableDataResultsDataOfficersGrade = "-";
      for (const key in personalResultsO) {
        const element = personalResultsO[key].totalOcenka;
        switch (element) {
          case 5:
            dataAllTableDataResultsDataOfficersGreat
              ? (dataAllTableDataResultsDataOfficersGreat += 1)
              : (dataAllTableDataResultsDataOfficersGreat = 1);
            break;
          case 4:
            dataAllTableDataResultsDataOfficersGood
              ? (dataAllTableDataResultsDataOfficersGood += 1)
              : (dataAllTableDataResultsDataOfficersGood = 1);
            break;
          case 3:
            dataAllTableDataResultsDataOfficersSatisfactory
              ? (dataAllTableDataResultsDataOfficersSatisfactory += 1)
              : (dataAllTableDataResultsDataOfficersSatisfactory = 1);
            break;
          case 2:
            dataAllTableDataResultsDataOfficersUnsatisfactory
              ? (dataAllTableDataResultsDataOfficersUnsatisfactory += 1)
              : (dataAllTableDataResultsDataOfficersUnsatisfactory = 1);
            break;
          default:
            break;
        }
      }

      if (dataAllTableDataResultsDataOfficersGreat > 0) {
        dataAllTableDataResultsDataOfficersGrade = 5;
      }
      if (dataAllTableDataResultsDataOfficersGood > 0) {
        dataAllTableDataResultsDataOfficersGrade = 4;
      }
      if (dataAllTableDataResultsDataOfficersSatisfactory > 0) {
        dataAllTableDataResultsDataOfficersGrade = 3;
      }
      if (dataAllTableDataResultsDataOfficersUnsatisfactory > 0) {
        dataAllTableDataResultsDataOfficersGrade = 2;
      }

      /* #endregion */

      /* #region  women      podr section */

      const uprResults = separatedResults[podr]["women"];

      let personalResultsP = {};
      let uprNamesP = [];

      for (const uprResult of uprResults) {
        uprNamesP.push(uprResult.Uprazhnenie.shortName);

        const maxResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });

        const minResult = await UprazhnenieStandard.findOne({
          attributes: [
            [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
            "id",
            "UprazhnenieId",
            "CategoryId",
            "result",
          ],
          where: {
            UprazhnenieId: uprResult.Uprazhnenie.id,
            CategoryId: uprResult.Category.id,
          },
          limit: 1,
          include: [
            {
              model: Uprazhnenie,
              include: [{ model: EfficiencyPreference, attributes: ["name"] }],
            },
          ],
        });
        const efficiencyPreference =
          maxResult.Uprazhnenie.EfficiencyPreference.name;
        const maxValue = maxResult.dataValues.maxValue;
        const minValue = minResult.dataValues.minValue;
        let res;
        let ball;

        if (efficiencyPreference === "Меньше - лучше") {
          if (minValue > uprResult.result) {
            const additionalResultCount = minValue - uprResult.result;
            res =
              minResult.result +
              uprResult.Uprazhnenie.valueToAddAfterMaxResult *
                (additionalResultCount / uprResult.Uprazhnenie.step);
          } else {
          }
        }
        if (efficiencyPreference === "Больше - лучше") {
          const additionalResultCount = uprResult.result - maxValue;

          res =
            maxResult.result +
            uprResult.Uprazhnenie.valueToAddAfterMaxResult *
              (additionalResultCount / uprResult.Uprazhnenie.step);
        }

        if (!(uprResult.result > maxValue)) {
          ball = await UprazhnenieStandard.findOne({
            where: {
              UprazhnenieId: uprResult.Uprazhnenie.id,
              CategoryId: uprResult.Category.id,
              value: uprResult.result,
            },
            include: [
              {
                model: Uprazhnenie,
                include: [
                  { model: EfficiencyPreference, attributes: ["name"] },
                ],
              },
            ],
          });
        } else {
          ball = {
            result: res ? res : 0,
          };
        }

        const zvanie = await Zvanie.findOne({
          where: {
            id: uprResult.Person.ZvanieId,
          },
        });

        if (!personalResultsP[uprResult.Person.id]) {
          const result = {
            PersonId: uprResult.Person.id,
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

      let dataAllTableDataResultsDataWomenGreat = 0;
      let dataAllTableDataResultsDataWomenGood = 0;
      let dataAllTableDataResultsDataWomenSatisfactory = 0;
      let dataAllTableDataResultsDataWomenUnsatisfactory = 0;
      let dataAllTableDataResultsDataWomenGrade = "-";

      for (const key in personalResultsP) {
        const element = personalResultsP[key].totalOcenka;
        switch (element) {
          case 5:
            dataAllTableDataResultsDataWomenGreat
              ? (dataAllTableDataResultsDataWomenGreat += 1)
              : (dataAllTableDataResultsDataWomenGreat = 1);
            break;
          case 4:
            dataAllTableDataResultsDataWomenGood
              ? (dataAllTableDataResultsDataWomenGood += 1)
              : (dataAllTableDataResultsDataWomenGood = 1);
            break;
          case 3:
            dataAllTableDataResultsDataWomenSatisfactory
              ? (dataAllTableDataResultsDataWomenSatisfactory += 1)
              : (dataAllTableDataResultsDataWomenSatisfactory = 1);
            break;
          case 2:
            dataAllTableDataResultsDataWomenUnsatisfactory
              ? (dataAllTableDataResultsDataWomenUnsatisfactory += 1)
              : (dataAllTableDataResultsDataWomenUnsatisfactory = 1);
            break;
          default:
            break;
        }
      }

      data.allTableData.resultsData.women.grade = "-";
      if (dataAllTableDataResultsDataWomenGreat > 0) {
        dataAllTableDataResultsDataWomenGrade = 5;
      }
      if (dataAllTableDataResultsDataWomenGood > 0) {
        dataAllTableDataResultsDataWomenGrade = 4;
      }
      if (dataAllTableDataResultsDataWomenSatisfactory > 0) {
        dataAllTableDataResultsDataWomenGrade = 3;
      }
      if (dataAllTableDataResultsDataWomenUnsatisfactory > 0) {
        dataAllTableDataResultsDataWomenGrade = 2;
      }

      /* #endregion */

      let dataAllGrade = Math.min(
        ...[
          dataAllTableDataResultsDataOfficersGrade,
          dataAllTableDataResultsDataWomenGrade,
          dataAllTableDataResultsDataConscriptsGrade,
          dataAllTableDataResultsDataConscriptsGrade,
        ].filter(Number)
      );
      switch (dataAllGrade) {
        case 5:
          data.allGreat += 1;
          break;
        case 4:
          data.allGood += 1;
          break;
        case 3:
          data.allSatisfactory += 1;
          break;
        case 2:
          data.allUnsatisfactory += 1;
          break;

        default:
          break;
      }

      const podrIds = (
        await Podrazdelenie.findAll({
          where: {
            name: {
              [Op.like]: `%${podr}%`,
            },
          },
          raw: true,
        })
      ).map(({ id }) => id);

      const personsCountPodr = await Person.count({
        where: {
          PodrazdelenieId: {
            [Op.or]: podrIds,
          },
        },
      });

      data.tableData.push({
        id:
          data.tableData.length > 0 ? data.tableData.slice(-1)[0]["id"] + 1 : 1,
        podrazdelenie: podr,
        personLenght: personsCountPodr,
        allPersonsChecked:
          separatedResults[podr]["women"].length +
          separatedResults[podr]["contracts"].length +
          separatedResults[podr]["conscripts"].length +
          separatedResults[podr]["officers"].length,
        tpt: undefined,
        totalGrade: dataAllGrade,
        resultsData: {
          officers: {
            checked: separatedResults[podr]["officers"].length,
            great: dataAllTableDataResultsDataOfficersGreat,
            good: dataAllTableDataResultsDataOfficersGood,
            satisfactory: dataAllTableDataResultsDataOfficersSatisfactory,
            unsatisfactory: dataAllTableDataResultsDataOfficersUnsatisfactory,
            grade: dataAllTableDataResultsDataOfficersGrade,
          },
          contracts: {
            checked: separatedResults[podr]["contracts"].length,
            great: dataAllTableDataResultsDataContractsGreat,
            good: dataAllTableDataResultsDataContractsGood,
            satisfactory: dataAllTableDataResultsDataContractsSatisfactory,
            unsatisfactory: dataAllTableDataResultsDataContractsUnsatisfactory,
            grade: dataAllTableDataResultsDataContractsGrade,
          },
          conscripts: {
            checked: separatedResults[podr]["conscripts"].length,
            great: dataAllTableDataResultsDataConscriptsGreat,
            good: dataAllTableDataResultsDataConscriptsGood,
            satisfactory: dataAllTableDataResultsDataConscriptsSatisfactory,
            unsatisfactory: dataAllTableDataResultsDataConscriptsUnsatisfactory,
            grade: dataAllTableDataResultsDataConscriptsGrade,
          },
          women: {
            checked: separatedResults[podr]["women"].length,
            great: dataAllTableDataResultsDataWomenGreat,
            good: dataAllTableDataResultsDataWomenGood,
            satisfactory: dataAllTableDataResultsDataWomenSatisfactory,
            unsatisfactory: dataAllTableDataResultsDataWomenUnsatisfactory,
            grade: dataAllTableDataResultsDataWomenGrade,
          },
        },
      });
    }
    data.allChecked = data.tableData.length;
    data.allTableData.personLenght = 0;

    for (const _podr of data.tableData) {
      _podr;
      data.allTableData.personLenght += _podr.personLenght;
    }

    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошибка при чтении записей" });
  }
});

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
