const express = require("express");
const router = express.Router();
const {
  UprazhnenieResult,
  Person,
  Category,
  Uprazhnenie,
  UprazhnenieStandard,
  Zvanie,
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
            "maxResult",
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
          [sequelize.fn("MAX", sequelize.col("valueInt")), "maxValueInt"],
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
      const maxValueInt = maxResult.dataValues.maxValueInt;


      let ball;
      if (!(uprResult.result > maxValueInt)) {
        ball = await UprazhnenieStandard.findOne({
          where: {
            uprazhnenieId: uprResult.Uprazhnenie.id,
            categoryId: uprResult.Category.id,
            valueInt: uprResult.result,
          },
        });
      } else {
        const additionalResultCount = uprResult.result - maxValueInt;
        ball = {
          result:
            maxResult.result + uprResult.Uprazhnenie.valueToAddAfterMaxResult * additionalResultCount,
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
