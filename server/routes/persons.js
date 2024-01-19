const express = require('express');
const router = express.Router();
const { Person } = require('../sequelize'); // Импорт модели Person

// Создание записи (Create)
router.post('/', async (req, res) => {
  try {
    const newPerson = req.body;
    const createdPerson = await Person.create(newPerson);
    res.status(201).json(createdPerson);
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
    
        const persons = await Person.findAll(options);
    
        if (range) {
          const total = await Person.count();
          // Устанавливаем заголовок Content-Range
          res.header('Content-Range', `persons ${options.offset}-${options.offset + persons.length - 1}/${total}`);
        }
    
        res.status(200).json(persons);
      } catch (error) {
        res.status(500).json({ error: 'Ошибка при чтении записей' });
      }
});

// Чтение одной записи по ID (Read)
router.get('/:id', async (req, res) => {
  try {
    const personId = req.params.id;
    const person = await Person.findByPk(personId);
    if (person) {
      res.status(200).json(person);
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
    const personId = req.params.id;
    const updatedPerson = req.body;
    const result = await Person.update(updatedPerson, {
      where: { id: personId },
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
    const personId = req.params.id;
    const result = await Person.destroy({
      where: { id: personId },
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
