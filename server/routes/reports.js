const express = require("express");
const router = express.Router();
const pdf = require("html-pdf");
const pug = require("pug");
const PDFDocument = require("pdfkit");
const { ipcMain } = require('electron');

const personTemplate = `
doctype html
html
  head
    title My PDF
    style.
      body {
        font-family: Serif;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #333;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
      footer {
        position: fixed;
        bottom: 20px;
        width: 100%;
        text-align: center;
      }
  
  body
    
    div(style="text-align: right;")
      p(style="text-align: center;display: inline-block;") 
        | Қазақстан Республикасының
        br
        | Қарулы Күштеріндегі дене шынықтыру
        br
        | дайындығы қағидаларына
        br
        | 9-қосымша
    

    // Заголовок таблицы (по центру)
    p(style="text-align: center; margin-top: 100px") 
      | ӘСК жаттығуларын орындауын есепке алу
      br
      | <strong>арнайы ведомосы</strong>

    // Таблица
    table
      thead
        tr
          th(colspan='1' rowspan='4' style='text-align: center;') 
            | Р/c
            br
            | №
          
          th(colspan='1' rowspan='4' style='text-align: center;')
            | Әскери
            br
            | атағы
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Тегі және инициалдары
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жас ерекшелігі тобы
          th(colspan='6') Орындалған жаттығулардың нәтижелері
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жалпы балл
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Орташа балл
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') ӘСК дәрежесі
        tr
          th(colspan='2') 1
          th(colspan='2') 2
          th(colspan='2') 3
        tr
          th(colspan='2') Жат 1
          th(colspan='2') Жат 2
          th(colspan='2') Жат 3
        
        tr
          th(style='text-align: center;')
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Нәтиже
          th(style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Балл
          th(style='text-align: center;')
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Нәтиже
          th(style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Балл
          th(style='text-align: center;')
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Нәтиже
          th(style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Балл

        


      tbody
        tr
          td 1
          td қ/ж
          td Ольхин Е.А.
          td ???
          td 50
          td 43.3
          td 15
          td 20.4
          td 21
          td 60
          td 120
          td 60
          td Солдат


    // Колонтитул
    // footer
      p Надпись в колонтитуле

`

router.get("/person", async (req, res) => {
    try {
        const compiledFunction = pug.compile(personTemplate);
        const html = compiledFunction();
        ipcMain.emit('print-person-report', html)
        res.status(200).json({"message" : "Add document to schedule"});
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при отправке на печать' });
        
    }
    // const compiledFunction = pug.compileFile('./server/templates/person.pug');
    // const html = compiledFunction();
    // ipcMain.emit('print-person-report', html)
    
});

// Маршрут для создания и отправки PDF
router.get("/test", (req, res) => {
    try {
        const compiledFunction = pug.compileFile('./server/templates/person.pug');
        const html = compiledFunction();
        ipcMain.emit('print-person-report', html)
        res.status(200).json({"message" : "Add document to schedule"});
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при отправке на печать' });
        
    }
});

router.get("/podrazdelenie", async (req, res) => {});

module.exports = router;
