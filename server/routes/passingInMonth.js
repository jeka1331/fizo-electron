const express = require("express");
const router = express.Router();
const { FixedUpr, Person, UprazhnenieResult, Category } = require("../sequelize"); // Импорт модели PassingInMonth
const { Op, fn, col } = require("sequelize");
const sequelize = require("sequelize");



// Чтение всех записей (Read)
router.get("/", async (req, res) => {

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
        include: [
          {
            model: Person,
            required: false,
          },
        ],
      },
    ],
  });

  // Получаем последние результаты UprazhnenieResult для каждого человека
  const results = await UprazhnenieResult.findAll({
    attributes: {
      include: [
        [fn('MAX', col('date')), 'b_Date'],
        'result'
      ],
    },
    group: 'PersonId', // Группировка по PersonId
  });

  // Привязываем результаты к людям
  const formattedData = fixedUprs.map(fu => {
    const relatedPersons = fu.Category.Persons || [];
    return {
      ...fu.get(),
      Persons: relatedPersons.map(person => {
        const personResult = results.find(res => res.PersonId === person.id);
        return {
          ...person.get(),
          b_Date: personResult ? personResult.b_Date : null,
          b_Result: personResult ? personResult.result : null,
        };
      }),
    };

  });
  
  const finalizeData = async (formattedData) => {
    let resultData = []
    let count = 0
    for (const element of formattedData) {
      element.Category.People.map(person => {
        
        resultData.push({
          id: count,
          CategoryId: element.Category.id,
          PersonId: person.id,
          PodrazdelenieId: person.PodrazdelenieId,
          UprazhnenieId: element.UprazhnenieId,
        })
        count++
      })
    }
    return resultData
  }

  const result = await finalizeData(formattedData);

  if (range) {
    // const total = await passingInMonths.count();
    const total = result.length;
    // Устанавливаем заголовок Content-Range
    res.header(
      "Content-Range",
      `passingInMonths ${options.offset}-${options.offset + result.length - 1
      }/${total}`
    );
  }
  res.status(200).json(result);

});

// Чтение одной записи по ID (Read)
router.get("/:id", async (req, res) => {
  res.status(200).json({ });
});



module.exports = router;
