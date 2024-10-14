const express = require("express");
const router = express.Router();
const { FixedUpr } = require("../sequelize"); // Импорт модели FixedUpr
const { Op } = require("sequelize");

// Создание записи (Create)
router.post("/", async (req, res) => {
  try {
    const newFixedUpr = req.body;
    const createdFixedUpr = await FixedUpr.create(newFixedUpr);
    res.status(201).json(createdFixedUpr);
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
    // console.log(options);
    const fixedUprs = await FixedUpr.findAll(options);

    if (range) {
      const total = await FixedUpr.count();
      // Устанавливаем заголовок Content-Range
      res.header(
        "Content-Range",
        `fixedUprs ${options.offset}-${options.offset + fixedUprs.length - 1
        }/${total}`
      );
    }

    res.status(200).json(fixedUprs);
  } catch (error) {
    res
      .status(500)
      .json({ error: error, message: "Ошибка при чтении записей" });
  }
});

// Чтение одной записи по ID (Read)
router.get("/:id", async (req, res) => {
  try {
    const fixedUprId = req.params.id;
    const fixedUpr = await FixedUpr.findByPk(fixedUprId);
    if (fixedUpr) {
      res.status(200).json(fixedUpr);
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
    const fixedUprId = req.params.id;
    const updatedFixedUpr = req.body;
    const result = await FixedUpr.update(updatedFixedUpr, {
      where: { id: fixedUprId },
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
    const fixedUprId = req.params.id;
    const result = await FixedUpr.destroy({
      where: { id: fixedUprId },
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
