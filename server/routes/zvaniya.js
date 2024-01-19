const express = require('express');
const router = express.Router();
const { Zvanie } = require('../sequelize'); // Импорт модели Person

// Создание записи (Create)
router.post('/', async (req, res) => {
  try {
    
    const newZvanie = req.body;
    console.log(newZvanie)
    const createdZvanie = await Zvanie.create(newZvanie);
    res.status(201).json(createdZvanie);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании записи' });
  }
});

// Чтение всех записей (Read)
router.get('/', async (req, res) => {
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
    
        const zvaniya = await Zvanie.findAll(options);
    
        if (range) {
          const total = await Zvanie.count();
          // Устанавливаем заголовок Content-Range
          res.header('Content-Range', `zvaniya ${options.offset}-${options.offset + zvaniya.length - 1}/${total}`);
        }
    
        res.status(200).json(zvaniya);
      } catch (error) {
        res.status(500).json({ error: 'Ошибка при чтении записей' });
      }
});

// Чтение одной записи по ID (Read)
router.get('/:id', async (req, res) => {
  try {
    const zvanieId = req.params.id;
    console.log(Zvanie.toString());
    const zvanie = await Zvanie.findByPk(parseInt(zvanieId));
    console.log(zvanie)
    if (zvanie) {
      res.status(200).json(zvanie);
    } else {
      res.status(404).json({ error: 'Запись не найдена' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при чтении записи' });
  }
});

// Обновление записи (Update)
router.put('/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    const zvanieId = req.params.id;
    const updatedZvanie = req.body;
    const result = await Zvanie.update(updatedZvanie, {
      where: { id: zvanieId },
    });
    if (result[0] === 1) {
      res.status(200).json({ message: 'Запись успешно обновлена' });
    } else {
      res.status(404).json({ error: 'Запись не найдена' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении записи' });
  }
});

// Удаление записи (Delete)
router.delete('/:id', async (req, res) => {
  try {
    const zvanieId = req.params.id;
    const result = await Zvanie.destroy({
      where: { id: zvanieId },
    });
    if (result === 1) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Запись не найдена' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении записи' });
  }
});

module.exports = router;
