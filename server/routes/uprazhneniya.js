const express = require("express");
const router = express.Router();
const { Uprazhnenie } = require("../sequelize"); // Импорт модели Person
const { Op } = require("sequelize");

// Создание записи (Create)
router.post("/", async (req, res) => {
  try {
    const newUprazhnenie = req.body;
    console.log(newUprazhnenie);
    const createdUprazhnenie = await Uprazhnenie.create(newUprazhnenie);
    res.status(201).json(createdUprazhnenie);
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
      options.where = {};
      if (where.name) {
        options.where = {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${where.name}%`,
              },
            },
            {
              shortName: {
                [Op.like]: `%${where.name}%`,
              },
            },
          ],
        };
      }
    }

    const zvaniya = await Uprazhnenie.findAll(options);

    if (range) {
      const total = await Uprazhnenie.count();
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

// Чтение одной записи по ID (Read)
router.get("/:id", async (req, res) => {
  try {
    const uprazhnenieId = req.params.id;
    console.log(Uprazhnenie.toString());
    const uprazhnenie = await Uprazhnenie.findByPk(parseInt(uprazhnenieId));
    console.log(uprazhnenie);
    if (uprazhnenie) {
      res.status(200).json(uprazhnenie);
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
    const uprazhnenieId = req.params.id;
    const updatedUprazhnenie = req.body;
    const result = await Uprazhnenie.update(updatedUprazhnenie, {
      where: { id: uprazhnenieId },
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
    const uprazhnenieId = req.params.id;
    const result = await Uprazhnenie.destroy({
      where: { id: uprazhnenieId },
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
