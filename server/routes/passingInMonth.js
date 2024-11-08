const express = require("express");
const router = express.Router();
const {
  FixedUpr,
  Person,
  UprazhnenieResult,
  Category,
  UprazhnenieRealValuesType,
  Uprazhnenie,
} = require("../sequelize"); // Импорт модели PassingInMonth
const { Op, fn, col } = require("sequelize");
const sequelize = require("sequelize");
const { calculateBall } = require("../lib");

// Чтение всех записей (Read)
router.get("/", async (req, res) => {
  const { range, sort, filter } = req.query;
  let options = {};

  if (range) {
    const [start, end] = JSON.parse(range);
    options.offset = start;
    options.start = start;
    options.end = end;
    options.limit = end - start + 1;
  }

  if (sort) {
    const [field, order] = JSON.parse(sort);
    options.order = [[field, order]];
  }

  if (filter) {
    const where = JSON.parse(filter);
    // options.where = {
    //   [Op.and]: [
    //     where.lName ? {
    //       lName: {
    //         [Op.like]: `%${where.lName}%`,
    //       },
    //     } : {},
    //     where.ZvanieId ? {
    //       zvanieId: {
    //         [Op.eq]: where.ZvanieId,
    //       },
    //     } : {},
    //   ],
    // };
  }

  // Получаем данные из FixedUpr
  const fixedUprs = await FixedUpr.findAll({
    include: [
      {
        model: Category,
        include: Person,
      },
      {
        model: Uprazhnenie,
        include: UprazhnenieRealValuesType,
      }
    ],
  });

  // Получаем последние результаты UprazhnenieResult для каждого человека
  let results = await UprazhnenieResult.findAll({

    attributes: {
      include: [[fn("MAX", col("date")), "b_Date"], "result", "id"],
    },
    group: ["PersonId", "UprazhnenieId"], // Группировка по PersonId
  });
  const addBallsFields = async (ur) => {
    let res = [];
    for (const element of ur) {
      res.push(await calculateBall(element.dataValues));
    }
    return res;
  };
  results = await addBallsFields(results);

  // Привязываем результаты к людям
  const formattedData = fixedUprs.map((fu) => {
    const relatedPersons = fu.Category.People || [];
    const uprTypeShortName = fu.Uprazhnenie.UprazhnenieRealValuesType.shortName || [];
    return {
      ...fu.get(),
      Persons: relatedPersons.map((person) => {
        const personResult = results.find(
          (res) => (res.PersonId === person.id && res.UprazhnenieId === fu.UprazhnenieId && res.CategoryId === fu.CategoryId)
        );
        return {
          ...person.get(),
          b_Id: personResult ? personResult.id : null,
          b_Date: personResult ? personResult.date : null,
          b_Result: personResult ? personResult.result : null,
          b_Ball: personResult ? personResult.ball : null,
          resultType: uprTypeShortName ? uprTypeShortName : null,
        };
      }),
    };
  });

  const finalizeData = async (formattedData) => {
    let resultData = [];
    let count = 0;
    for (const element of formattedData) {
      element.Persons.map((person) => {
        resultData.push({
          id: count,
          CategoryId: element.Category.id,
          PersonId: person.id,
          PodrazdelenieId: person.PodrazdelenieId,
          UprazhnenieId: element.UprazhnenieId,
          UprazhnenieResultId: person.b_Id || null,
          UprazhnenieResultDate: person.b_Date || null,
          UprazhnenieResultResult: person.b_Result || null,
          UprazhnenieResultBallClassic: person.b_Ball ,
          UprazhnenieResultBallBolon: null,
          resultType: person.resultType || null,
        });
        count++;
      });
    }
    return resultData;
  };

  const result = await finalizeData(formattedData);

  if (range) {
    // const total = await passingInMonths.count();
    const total = result.length;
    // Устанавливаем заголовок Content-Range
    res.header(
      "Content-Range",
      `passingInMonths ${options.offset}-${
        options.offset + result.length - 1
      }/${total}`
    );
  }
  res.status(200).json(result.slice(options.start , options.end + 1));
});

// Чтение одной записи по ID (Read)
router.get("/:id", async (req, res) => {
  res.status(200).json({});
});

module.exports = router;
