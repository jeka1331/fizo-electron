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
    let data = {
      allChecked: undefined,
      allGreat: undefined,
      allGood: undefined,
      allSatisfactory: undefined,
      allUnsatisfactory: undefined,
      allGrade: undefined,
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
      tableData: [
        {
          id: undefined,
          podrazdelenie: undefined,
          personLenght: undefined,
          allPersonsChecked: undefined,
          tpt: undefined,
          totalGrade: undefined,
          resultsData: {
            officers: {
              checked: undefined,
              great: undefined,
              good: undefined,
              satisfactory: undefined,
              unsatisfactory: undefined,
              grade: undefined,
            },
            contracts: {
              checked: undefined,
              great: undefined,
              good: undefined,
              satisfactory: undefined,
              unsatisfactory: undefined,
              grade: undefined,
            },
            conscripts: {
              checked: undefined,
              great: undefined,
              good: undefined,
              satisfactory: undefined,
              unsatisfactory: undefined,
              grade: undefined,
            },
            women: {
              checked: undefined,
              great: undefined,
              good: undefined,
              satisfactory: undefined,
              unsatisfactory: undefined,
              grade: undefined,
            },
          },
        },
      ],
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
          "personId",
        ], // Выбираем атрибуты и находим максимальную дату
        where: {
          date: {
            [Op.between]: [minDate, maxDate], // Фильтруем по дате
          },
        },
        group: ["personId"], // Группируем по personId и uprazhnenieId
      })
    ).length;

    data.allTableData.personLenght = await Person.findOne({
      attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "personL"]], // Выбираем атрибуты и находим максимальную дату
      where: {
        podrazdelenieId: {
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
        group: ["personId", "uprazhnenieId"], // Группируем по personId и uprazhnenieId
        include: [
          {
            model: Person,
            attributes: ["id", "isMale"],
            where: {
              isMale: false,
            },
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
      group: ["personId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "zvanieId"],
          where: {
            isMale: false,
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
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
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
            uprazhnenieId: uprResult.Uprazhnenie.id,
            categoryId: uprResult.Category.id,
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
      group: ["personId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "zvanieId"],
          where: {
            isMale: true,
          },
          include: {
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
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
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
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
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
            uprazhnenieId: uprResult.Uprazhnenie.id,
            categoryId: uprResult.Category.id,
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
          id: uprResult.Person.zvanieId,
        },
      });

      if (!personalResultsO[uprResult.Person.id]) {
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
      group: ["personId"], // Группируем по personId и uprazhnenieId
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "zvanieId", "isV"],
          where: {
            isMale: { [Op.or]: [{ [Op.eq]: true }] },
            isV: {
              [Op.or]: [{ [Op.eq]: false }, { [Op.eq]: 0 }, { [Op.eq]: null }],
            },
          },
          include: {
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
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
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
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
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
            uprazhnenieId: uprResult.Uprazhnenie.id,
            categoryId: uprResult.Category.id,
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
          id: uprResult.Person.zvanieId,
        },
      });

      if (!personalResultsC[uprResult.Person.id]) {
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
      group: ["personId"],
      include: [
        {
          model: Person,
          attributes: ["id", "isMale", "zvanieId", "isV"],
          where: {
            isMale: { [Op.or]: [{ [Op.eq]: true }] },
            isV: { [Op.or]: [{ [Op.eq]: true }, { [Op.eq]: 1 }] },
          },
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
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
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
          "uprazhnenieId",
          "categoryId",
          "result",
        ],
        where: {
          uprazhnenieId: uprResult.Uprazhnenie.id,
          categoryId: uprResult.Category.id,
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
            uprazhnenieId: uprResult.Uprazhnenie.id,
            categoryId: uprResult.Category.id,
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
          id: uprResult.Person.zvanieId,
        },
      });

      if (!personalResultsS[uprResult.Person.id]) {
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

    data.allGrade = Math.min(...[
      data.allTableData.resultsData.officers.grade,
      data.allTableData.resultsData.women.grade,
      data.allTableData.resultsData.conscripts.grade,
      data.allTableData.resultsData.contracts.grade
    ].filter( Number ));
    data.allTableData.totalGrade = data.allGrade

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
