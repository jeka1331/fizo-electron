const express = require('express');
const router = express.Router();
const { UprazhnenieRealValuesType } = require('../sequelize'); // Импорт модели Person

// Создание записи (Create)
router.post('/', async (req, res) => {
  try {
    
    const newUprazhnenieType = req.body;
    console.log(newUprazhnenieType)
    const createdUprazhnenieType = await UprazhnenieRealValuesType.create(newUprazhnenieType);
    res.status(201).json(createdUprazhnenieType);
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
    
        const zvaniya = await UprazhnenieRealValuesType.findAll(options);
    
        if (range) {
          const total = await UprazhnenieRealValuesType.count();
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
    const uprazhnenieTypeId = req.params.id;
    console.log(uprazhnenieTypeId.toString());
    const uprazhnenieRealValuesType = await UprazhnenieRealValuesType.findByPk(parseInt(uprazhnenieTypeId));
    console.log(uprazhnenieRealValuesType)
    if (uprazhnenieRealValuesType) {
      res.status(200).json(uprazhnenieRealValuesType);
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
    const uprazhnenieTypeId = req.params.id;
    const updatedUprazhnenieType = req.body;
    const result = await UprazhnenieRealValuesType.update(updatedUprazhnenieType, {
      where: { id: uprazhnenieTypeId },
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
    const uprazhnenieTypeId = req.params.id;
    const result = await UprazhnenieRealValuesType.destroy({
      where: { id: uprazhnenieTypeId },
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
