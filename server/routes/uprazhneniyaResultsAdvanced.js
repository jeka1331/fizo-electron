const express = require('express');
const router = express.Router();
const { UprazhnenieResult } = require('../sequelize'); // Импорт модели Person

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
    
        const zvaniya = await UprazhnenieResult.findAll(options);
    
        if (range) {
          const total = await UprazhnenieResult.count();
          // Устанавливаем заголовок Content-Range
          res.header('Content-Range', `zvaniya ${options.offset}-${options.offset + zvaniya.length - 1}/${total}`);
        }
    
        res.status(200).json(zvaniya);
      } catch (error) {
        res.status(500).json({ error: 'Ошибка при чтении записей' });
      }
});


module.exports = router;
