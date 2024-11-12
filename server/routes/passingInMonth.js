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

  const data = [
    { UprazhnenieResultBallClassic: 100, UprazhnenieResultBallBolon: 100, rating: 4 },
    { UprazhnenieResultBallClassic: 99, UprazhnenieResultBallBolon: 99, rating: 4 },
    { UprazhnenieResultBallClassic: 98, UprazhnenieResultBallBolon: 99, rating: 4 },
    { UprazhnenieResultBallClassic: 97, UprazhnenieResultBallBolon: 99, rating: 4 },
    { UprazhnenieResultBallClassic: 96, UprazhnenieResultBallBolon: 99, rating: 4 },
    { UprazhnenieResultBallClassic: 95, UprazhnenieResultBallBolon: 98, rating: 4 },
    { UprazhnenieResultBallClassic: 94, UprazhnenieResultBallBolon: 98, rating: 4 },
    { UprazhnenieResultBallClassic: 93, UprazhnenieResultBallBolon: 98, rating: 4 },
    { UprazhnenieResultBallClassic: 92, UprazhnenieResultBallBolon: 98, rating: 4 },
    { UprazhnenieResultBallClassic: 91, UprazhnenieResultBallBolon: 97, rating: 4 },
    { UprazhnenieResultBallClassic: 90, UprazhnenieResultBallBolon: 97, rating: 4 },
    { UprazhnenieResultBallClassic: 89, UprazhnenieResultBallBolon: 97, rating: 4 },
    { UprazhnenieResultBallClassic: 88, UprazhnenieResultBallBolon: 97, rating: 4 },
    { UprazhnenieResultBallClassic: 87, UprazhnenieResultBallBolon: 96, rating: 4 },
    { UprazhnenieResultBallClassic: 86, UprazhnenieResultBallBolon: 96, rating: 4 },
    { UprazhnenieResultBallClassic: 85, UprazhnenieResultBallBolon: 96, rating: 4 },
    { UprazhnenieResultBallClassic: 84, UprazhnenieResultBallBolon: 96, rating: 4 },
    { UprazhnenieResultBallClassic: 83, UprazhnenieResultBallBolon: 95, rating: 4 },
    { UprazhnenieResultBallClassic: 82, UprazhnenieResultBallBolon: 95, rating: 4 },
    { UprazhnenieResultBallClassic: 81, UprazhnenieResultBallBolon: 95, rating: 4 },
    { UprazhnenieResultBallClassic: 80, UprazhnenieResultBallBolon: 95, rating: 4 },
    { UprazhnenieResultBallClassic: 79, UprazhnenieResultBallBolon: 94, rating: 3.67 },
    { UprazhnenieResultBallClassic: 78, UprazhnenieResultBallBolon: 94, rating: 3.67 },
    { UprazhnenieResultBallClassic: 77, UprazhnenieResultBallBolon: 94, rating: 3.67 },
    { UprazhnenieResultBallClassic: 76, UprazhnenieResultBallBolon: 94, rating: 3.67 },
    { UprazhnenieResultBallClassic: 75, UprazhnenieResultBallBolon: 93, rating: 3.67 },
    { UprazhnenieResultBallClassic: 74, UprazhnenieResultBallBolon: 93, rating: 3.67 },
    { UprazhnenieResultBallClassic: 73, UprazhnenieResultBallBolon: 93, rating: 3.67 },
    { UprazhnenieResultBallClassic: 72, UprazhnenieResultBallBolon: 93, rating: 3.67 },
    { UprazhnenieResultBallClassic: 71, UprazhnenieResultBallBolon: 92, rating: 3.67 },
    { UprazhnenieResultBallClassic: 70, UprazhnenieResultBallBolon: 92, rating: 3.67 },
    { UprazhnenieResultBallClassic: 69, UprazhnenieResultBallBolon: 92, rating: 3.67 },
    { UprazhnenieResultBallClassic: 68, UprazhnenieResultBallBolon: 92, rating: 3.67 },
    { UprazhnenieResultBallClassic: 67, UprazhnenieResultBallBolon: 91, rating: 3.67 },
    { UprazhnenieResultBallClassic: 66, UprazhnenieResultBallBolon: 91, rating: 3.67 },
    { UprazhnenieResultBallClassic: 65, UprazhnenieResultBallBolon: 91, rating: 3.67 },
    { UprazhnenieResultBallClassic: 64, UprazhnenieResultBallBolon: 91, rating: 3.67 },
    { UprazhnenieResultBallClassic: 63, UprazhnenieResultBallBolon: 90, rating: 3.67 },
    { UprazhnenieResultBallClassic: 62, UprazhnenieResultBallBolon: 90, rating: 3.67 },
    { UprazhnenieResultBallClassic: 61, UprazhnenieResultBallBolon: 90, rating: 3.67 },
    { UprazhnenieResultBallClassic: 60, UprazhnenieResultBallBolon: 90, rating: 3.67 },
    { UprazhnenieResultBallClassic: 59, UprazhnenieResultBallBolon: 89, rating: 3.33 },
    { UprazhnenieResultBallClassic: 58, UprazhnenieResultBallBolon: 88, rating: 3.33 },
    { UprazhnenieResultBallClassic: 57, UprazhnenieResultBallBolon: 87, rating: 3.33 },
    { UprazhnenieResultBallClassic: 56, UprazhnenieResultBallBolon: 86, rating: 3.33 },
    { UprazhnenieResultBallClassic: 55, UprazhnenieResultBallBolon: 85, rating: 3.33 },
    { UprazhnenieResultBallClassic: 54, UprazhnenieResultBallBolon: 84, rating: 3 },
    { UprazhnenieResultBallClassic: 53, UprazhnenieResultBallBolon: 83, rating: 3 },
    { UprazhnenieResultBallClassic: 52, UprazhnenieResultBallBolon: 82, rating: 3 },
    { UprazhnenieResultBallClassic: 51, UprazhnenieResultBallBolon: 81, rating: 3 },
    { UprazhnenieResultBallClassic: 50, UprazhnenieResultBallBolon: 80, rating: 3 },
    { UprazhnenieResultBallClassic: 49, UprazhnenieResultBallBolon: 79, rating: 2.67 },
    { UprazhnenieResultBallClassic: 48, UprazhnenieResultBallBolon: 78, rating: 2.67 },
    { UprazhnenieResultBallClassic: 47, UprazhnenieResultBallBolon: 77, rating: 2.67 },
    { UprazhnenieResultBallClassic: 46, UprazhnenieResultBallBolon: 76, rating: 2.67 },
    { UprazhnenieResultBallClassic: 45, UprazhnenieResultBallBolon: 75, rating: 2.67 },
    { UprazhnenieResultBallClassic: 44, UprazhnenieResultBallBolon: 74, rating: 2.33 },
    { UprazhnenieResultBallClassic: 43, UprazhnenieResultBallBolon: 73, rating: 2.33 },
    { UprazhnenieResultBallClassic: 42, UprazhnenieResultBallBolon: 72, rating: 2.33 },
    { UprazhnenieResultBallClassic: 41, UprazhnenieResultBallBolon: 71, rating: 2.33 },
    { UprazhnenieResultBallClassic: 40, UprazhnenieResultBallBolon: 70, rating: 2.33 },
    { UprazhnenieResultBallClassic: 39, UprazhnenieResultBallBolon: 69, rating: 2 },
    { UprazhnenieResultBallClassic: 38, UprazhnenieResultBallBolon: 68, rating: 2 },
    { UprazhnenieResultBallClassic: 37, UprazhnenieResultBallBolon: 67, rating: 2 },
    { UprazhnenieResultBallClassic: 36, UprazhnenieResultBallBolon: 66, rating: 2 },
    { UprazhnenieResultBallClassic: 35, UprazhnenieResultBallBolon: 65, rating: 2 },
    { UprazhnenieResultBallClassic: 34, UprazhnenieResultBallBolon: 64, rating: 1.67 },
    { UprazhnenieResultBallClassic: 33, UprazhnenieResultBallBolon: 63, rating: 1.67 },
    { UprazhnenieResultBallClassic: 32, UprazhnenieResultBallBolon: 62, rating: 1.67 },
    { UprazhnenieResultBallClassic: 31, UprazhnenieResultBallBolon: 61, rating: 1.67 },
    { UprazhnenieResultBallClassic: 30, UprazhnenieResultBallBolon: 60, rating: 1.67 },
    { UprazhnenieResultBallClassic: 29, UprazhnenieResultBallBolon: 59, rating: 1.33 },
    { UprazhnenieResultBallClassic: 28, UprazhnenieResultBallBolon: 58, rating: 1.33 },
    { UprazhnenieResultBallClassic: 27, UprazhnenieResultBallBolon: 57, rating: 1.33 },
    { UprazhnenieResultBallClassic: 26, UprazhnenieResultBallBolon: 56, rating: 1.33 },
    { UprazhnenieResultBallClassic: 25, UprazhnenieResultBallBolon: 55, rating: 1.33 },
    { UprazhnenieResultBallClassic: 24, UprazhnenieResultBallBolon: 54, rating: 1 },
    { UprazhnenieResultBallClassic: 23, UprazhnenieResultBallBolon: 53, rating: 1 },
    { UprazhnenieResultBallClassic: 22, UprazhnenieResultBallBolon: 52, rating: 1 },
    { UprazhnenieResultBallClassic: 21, UprazhnenieResultBallBolon: 51, rating: 1 },
    { UprazhnenieResultBallClassic: 20, UprazhnenieResultBallBolon: 50, rating: 1 },
    { UprazhnenieResultBallClassic: 19, UprazhnenieResultBallBolon: 48.4, rating: 0.5 },
    { UprazhnenieResultBallClassic: 18, UprazhnenieResultBallBolon: 45.8, rating: 0.5 },
    { UprazhnenieResultBallClassic: 17, UprazhnenieResultBallBolon: 43.2, rating: 0.5 },
    { UprazhnenieResultBallClassic: 16, UprazhnenieResultBallBolon: 40.6, rating: 0.5 },
    { UprazhnenieResultBallClassic: 15, UprazhnenieResultBallBolon: 38, rating: 0.5 },
    { UprazhnenieResultBallClassic: 14, UprazhnenieResultBallBolon: 35.4, rating: 0.5 },
    { UprazhnenieResultBallClassic: 13, UprazhnenieResultBallBolon: 32.8, rating: 0.5 },
    { UprazhnenieResultBallClassic: 12, UprazhnenieResultBallBolon: 30.2, rating: 0.5 },
    { UprazhnenieResultBallClassic: 11, UprazhnenieResultBallBolon: 27.6, rating: 0.5 },
    { UprazhnenieResultBallClassic: 10, UprazhnenieResultBallBolon: 25, rating: 0.5 },
    { UprazhnenieResultBallClassic: 9, UprazhnenieResultBallBolon: 24, rating: 0 },
    { UprazhnenieResultBallClassic: 8, UprazhnenieResultBallBolon: 21.36, rating: 0 },
    { UprazhnenieResultBallClassic: 7, UprazhnenieResultBallBolon: 18.69, rating: 0 },
    { UprazhnenieResultBallClassic: 6, UprazhnenieResultBallBolon: 16.02, rating: 0 },
    { UprazhnenieResultBallClassic: 5, UprazhnenieResultBallBolon: 13.35, rating: 0 },
    { UprazhnenieResultBallClassic: 4, UprazhnenieResultBallBolon: 10.68, rating: 0 },
    { UprazhnenieResultBallClassic: 3, UprazhnenieResultBallBolon: 8.01, rating: 0 },
    { UprazhnenieResultBallClassic: 2, UprazhnenieResultBallBolon: 5.34, rating: 0 },
    { UprazhnenieResultBallClassic: 1, UprazhnenieResultBallBolon: 2.67, rating: 0 },
    { UprazhnenieResultBallClassic: 0, UprazhnenieResultBallBolon: 0, rating: 0 }
  ];
  
  // Функция для поиска значений по первому столбцу
  function getValuesByClassicValue(value) {
    // Находим объект, где значение в первом столбце соответствует переданному
    const result = data.find(item => item.UprazhnenieResultBallClassic === Math.floor(value.UprazhnenieResultBallClassic));
    if (value.UprazhnenieResultBallClassic > 100) {
      return {
        ...value,
        UprazhnenieResultBallBolon: 100,
        UprazhnenieResultBallBolonRating: 4
      };
    } 
    if (result) {
      return {
        ...value,
        UprazhnenieResultBallBolon: result.UprazhnenieResultBallBolon,
        UprazhnenieResultBallBolonRating: result.rating
      };
    } else {
      return {
        ...value,
        UprazhnenieResultBallBolon: null,
        UprazhnenieResultBallBolonRating: null
      } // Если значение не найдено
    }
  }

  const _result = await finalizeData(formattedData);

  const result = _result.map(getValuesByClassicValue) 



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
