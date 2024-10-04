const express = require("express");
const router = express.Router();
const { FixedUpr, Person } = require("../sequelize"); // Импорт модели PassingInMonth
const { Op } = require("sequelize");
const sequelize = require("sequelize");


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

      const where = JSON.parse(filter);
      // options.where = {
      //   [Op.and]: [
      //     where.lName ? {
      //       lName: {
      //         [Op.like]: `%${where.lName}%`,
      //       },
      //     } : {},
      //     where.zvanieId ? {
      //       zvanieId: {
      //         [Op.eq]: where.zvanieId,
      //       },
      //     } : {},
      //   ],
      // };

    }
    // console.log(options);
    // const leftJoin = FixedUpr.findAll({
    //   include: [{
    //     model: Person,
    //     required: false, // LEFT JOIN
    //     where: {
    //       categoryId: { [Op.eq]: sequelize.col('FixedUpr.CategoryId') }
    //     }
    //   }]
    // });
  
    // const rightJoin = Person.findAll({
    //   include: [{
    //     model: FixedUpr,
    //     required: false, // RIGHT JOIN
    //     where: {
    //       CategoryId: { [Op.eq]: sequelize.col('Person.categoryId') }
    //     }
    //   }]
    // });
    // const combined = [...leftJoin, ...rightJoin]

    // const passingInMonths = Array.from(new Set(combined.map(JSON.stringify)))
    //   .map(JSON.parse);

    const passingInMonths = []
    if (range) {
      // const total = await passingInMonths.count();
      const total = passingInMonths.length;
      // Устанавливаем заголовок Content-Range
      res.header(
        "Content-Range",
        `passingInMonths ${options.offset}-${options.offset + passingInMonths.length - 1
        }/${total}`
      );
    }

    res.status(200).json(passingInMonths);
  } catch (error) {
    res
      .status(500)
      .json({ error: error, message: "Ошибка при чтении записей" });
  }
});

// // Чтение одной записи по ID (Read)
// router.get("/:id", async (req, res) => {
//   try {
//     const passingInMonthId = req.params.id;
//     const passingInMonth = await PassingInMonth.findByPk(passingInMonthId);
//     if (passingInMonth) {
//       res.status(200).json(passingInMonth);
//     } else {
//       res.status(404).json({ error: "Запись не найдена" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка при чтении записи" });
//   }
// });

module.exports = router;
