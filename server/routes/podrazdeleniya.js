const express = require('express');
const router = express.Router();
const { Podrazdelenie } = require('../sequelize'); // Импорт модели Person

// Создание записи (Create)
router.post('/', async (req, res) => {
  try {
    
    const newPodrazdelenie = req.body;
    // console.log(newPodrazdelenie)
    const createdPodrazdelenie = await Podrazdelenie.create(newPodrazdelenie);
    res.status(201).json(createdPodrazdelenie);
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
    
        const zvaniya = await Podrazdelenie.findAll(options);
    
        if (range) {
          const total = await Podrazdelenie.count();
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
    const podrazdelenieId = req.params.id;
    console.log(Podrazdelenie.toString());
    const podrazdelenie = await Podrazdelenie.findByPk(parseInt(podrazdelenieId));
    console.log(podrazdelenie)
    if (podrazdelenie) {
      res.status(200).json(podrazdelenie);
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
    // console.log(req.params.id)
    const podrazdelenieId = req.params.id;
    const updatedPodrazdelenie = req.body;
    const result = await Podrazdelenie.update(updatedPodrazdelenie, {
      where: { id: podrazdelenieId },
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
    const podrazdelenieId = req.params.id;
    const result = await Podrazdelenie.destroy({
      where: { id: podrazdelenieId },
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
