const express = require("express");
const router = express.Router();
const { UprazhnenieResult } = require("../sequelize"); // Импорт модели Person

// Создание записи (Create)
router.post("/", async (req, res) => {
  try {
    const newUprazhnenieResult = req.body;
    console.log(newUprazhnenieResult);
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
    if (!req.query.year || !req.query.month) {
      throw new Error('Неверные параметры в get запросе')
    }
    // const range = req.query.range;
    // const sort = req.query.sort;
    // const filter = req.query.filter;

    // let options = {};

    // if (range) {
    //   const [start, end] = JSON.parse(range);
    //   options.offset = start;
    //   options.limit = end - start + 1;
    // }

    // if (sort) {
    //   const [field, order] = JSON.parse(sort);
    //   options.order = [[field, order]];
    // }

    // if (filter) {
    //   options.where = JSON.parse(filter);
    // }

    function getMaxMinDatesInMonth(year, month) {
      const maxDays = new Date(year, month, 0).getDate()

      
      return { maxDate: `${year}-${month > 9 ? month : "0" + month}-${maxDays > 9 ? maxDays : "" + maxDays}`, minDate: `${year}-${month > 9 ? month : "0" + month}-01` };
    }
    const { maxDate, minDate } = getMaxMinDatesInMonth(parseInt(req.query.year), parseInt(req.query.month));
    console.log(getMaxMinDatesInMonth(parseInt(req.query.year), parseInt(req.query.month)))
    const uprResults = await UprazhnenieResult.findAll({
      attributes: [
        "personId",
        "uprazhnenieId",
        [sequelize.fn("MAX", sequelize.col("date")), "maxDate"],
      ], // Выбираем атрибуты и находим максимальную дату
      where: {
        date: {
          [Op.between]: [minDate, maxDate], // Фильтруем по дате
        },
      },
      group: ["personId", "uprazhnenieId"], // Группируем по personId и uprazhnenieId
      ...options,
    });
    console.log(uprResults)

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

    // res.status(200).json(uprResults);

    // console.log(req.query);
    res.status(200).json({ message: "Данные на печать отправлены" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при чтении записей" });
  }
});

// Чтение одной записи по ID (Read)
router.get("/:id", async (req, res) => {
  try {
    const uprazhnenieResultId = req.params.id;
    console.log(UprazhnenieResult.toString());
    const uprazhnenieResult = await UprazhnenieResult.findByPk(
      parseInt(uprazhnenieResultId)
    );
    console.log(uprazhnenieResult);
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
    console.log(req.params.id);
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
