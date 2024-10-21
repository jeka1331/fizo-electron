const express = require("express");
const router = express.Router();
const pdf = require("html-pdf");
const pug = require("pug");
const PDFDocument = require("pdfkit");
const { ipcMain } = require("electron");
const { Zvanie, Podrazdelenie, Category, Person } = require("../sequelize");

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
          td=1
          td=zvanie
          td=fioWithInitials
          td=category
          td
          td 
          td 
          td 
          td 
          td 
          td 
          td 
          td=comment


    // Колонтитул
    // footer
      p Надпись в колонтитуле

`;

const podrazdelenieTemplate = `
doctype html
html(lang="en")
  head
    title My PDF
    style.
      @media print {
        .page-break { page-break-after: always; }
      }
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

  body
    //- Ваш контент страницы
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
        each p in data
          tr
            td=1
            td=p.zvanie
            td=p.fioWithInitials
            td=p.category
            td
            td 
            td 
            td 
            td 
            td 
            td 
            td 
            td=p.comment
//- JavaScript для увеличения номера страницы перед разрывом страницы

`;

const allVedomostTemplate = `
-
  const data2 = {
  allChecked: 40,
  allGreat: 4,
  allGood: 9,
  allSatisfactory: 12,
  allUnsatisfactory: 16,
  allGrade: 2,
  allTableData: {
    personLenght: 40,
    allPersonsChecked: 40,
    tpt: 0,
    totalGrade: 2,
    resultsData: 
      {officers: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      },
      contracts: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      },
      conscripts: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      },
      women: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      }}
    },
  tableData: [{
    id: 1,
    podrazdelenie: "ВНВ",
    personLenght: 40,
    allPersonsChecked: 40,
    tpt: 0,
    totalGrade: 2,
    resultsData: {
      officers: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      },
      contracts: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      },
      conscripts: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      },
      women: {
        checked: 10,
        great: 1,
        good: 2,
        satisfactory: 3,
        unsatisfactory: 4,
        grade: 2        
      }
    }

  }]}

doctype html
html(lang="en")
  head
    title Ведомость за подразделение
    style.
      @media print {
        .page-break { page-break-after: always; }
      }
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
        padding: 2px;
        text-align: center;
      }
      th {
        background-color: #f2f2f2;
      }

  body
    //- Ваш контент страницы
    //- div(style="text-align: right;")
    //-   p(style="text-align: center;display: inline-block;") 
    //-     | Қазақстан Республикасының
    //-     br
    //-     | Қарулы Күштеріндегі дене шынықтыру
    //-     br
    //-     | дайындығы қағидаларына
    //-     br
    //-     | 9-қосымша

    // Заголовок таблицы (по центру)
    p(style="text-align: center; margin-top: 100px") 
      | ___________________ үшін "Оңтүстік" ӨңҚ дене шынықтыру дайндығы бойынша нәтижелерінің
      br
      | (наурыз, 2024)
      br
      | <strong>жиынтық ведомосты</strong>



    // Таблица    
    table
      thead
        tr
          th(colspan='1' rowspan='2' style='text-align: center;') 
            | Р/c
            br
            | №

          th(colspan='1' rowspan='2' style='text-align: center;')
            | Әскери
            br
            | бөлім
          th(colspan='1' rowspan='2' style='text-align: center;')  
            | Тізім
            br
            | бойынша
          th(colspan='1'  rowspan='2' style='text-align: center;')  
            | Текстер-
            br
            | ілгені
            br
            | барлығы
          th(colspan='6' style='text-align: center;') Офицерлер
          th(colspan='6' style='text-align: center;') Келісімшарт бойынша әскери қызметшілер
          th(colspan='6' style='text-align: center;') Мерзімді қызмет әскери қызметшілері
          th(colspan='6' style='text-align: center;') Әскери қызметші әйелдер
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') ЕДШ
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жалпы баға

        tr

          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Текстерілді
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') өте Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттарлық
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттанарлықсыз
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Баға
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Текстерілді
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') өте Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттарлық
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттанарлықсыз
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Баға
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Текстерілді
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') өте Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттарлық
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттанарлықсыз
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Баға
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Текстерілді
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') өте Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жақсы
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттарлық
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Қанағаттанарлықсыз
          th(colspan='1') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Баға

      tbody
        each row, key in data.tableData
          tr
            td=row.id
            td=row.podrazdelenie
            td=row.personLenght
            td=row.allPersonsChecked

            td=row.resultsData.officers.checked
            td=row.resultsData.officers.great
            td=row.resultsData.officers.good
            td=row.resultsData.officers.satisfactory
            td=row.resultsData.officers.unsatisfactory
            td=row.resultsData.officers.grade

            td=row.resultsData.contracts.checked
            td=row.resultsData.contracts.great
            td=row.resultsData.contracts.good
            td=row.resultsData.contracts.satisfactory
            td=row.resultsData.contracts.unsatisfactory
            td=row.resultsData.contracts.grade

            td=row.resultsData.conscripts.checked
            td=row.resultsData.conscripts.great
            td=row.resultsData.conscripts.good
            td=row.resultsData.conscripts.satisfactory
            td=row.resultsData.conscripts.unsatisfactory
            td=row.resultsData.conscripts.grade

            td=row.resultsData.women.checked
            td=row.resultsData.women.great
            td=row.resultsData.women.good
            td=row.resultsData.women.satisfactory
            td=row.resultsData.women.unsatisfactory
            td=row.resultsData.women.grade

            td=row.tpt
            td=row.totalGrade
          


        tr
          td 
          td <b>Жиыны</b>
          td=data.allTableData.personLenght
          td=data.allTableData.allPersonsChecked

          td=data.allTableData.resultsData.officers.checked
          td=data.allTableData.resultsData.officers.great
          td=data.allTableData.resultsData.officers.good
          td=data.allTableData.resultsData.officers.satisfactory
          td=data.allTableData.resultsData.officers.unsatisfactory
          td=data.allTableData.resultsData.officers.grade

          td=data.allTableData.resultsData.contracts.checked
          td=data.allTableData.resultsData.contracts.great
          td=data.allTableData.resultsData.contracts.good
          td=data.allTableData.resultsData.contracts.satisfactory
          td=data.allTableData.resultsData.contracts.unsatisfactory
          td=data.allTableData.resultsData.contracts.grade

          td=data.allTableData.resultsData.conscripts.checked
          td=data.allTableData.resultsData.conscripts.great
          td=data.allTableData.resultsData.conscripts.good
          td=data.allTableData.resultsData.conscripts.satisfactory
          td=data.allTableData.resultsData.conscripts.unsatisfactory
          td=data.allTableData.resultsData.conscripts.grade

          td=data.allTableData.resultsData.women.checked
          td=data.allTableData.resultsData.women.great
          td=data.allTableData.resultsData.women.good
          td=data.allTableData.resultsData.women.satisfactory
          td=data.allTableData.resultsData.women.unsatisfactory
          td=data.allTableData.resultsData.women.grade

          td=data.allTableData.tpt
          td=data.allTableData.totalGrade


    p(style="text-align: left; margin-bottom: 0; margin-top: 0") <u><b>#{data.allChecked}</b></u> әскери бөлім текстерілді
    p(style="text-align: left; margin-bottom: 0; margin-top: 0") "өте жақсы" <u><b>#{data.allGreat}</b></u> әскери бөлім
    p(style="text-align: left; margin-bottom: 0; margin-top: 0") "жақсы" <u><b>#{data.allGood}</b></u> әскери бөлім
    p(style="text-align: left; margin-bottom: 0; margin-top: 0") "қанағаттанарлық" <u><b>#{data.allSatisfactory}</b></u> әскери бөлім
    p(style="text-align: left; margin-bottom: 0; margin-top: 0") "қанағаттанарлықсыз" <u><b>#{data.allUnsatisfactory}</b></u> әскери бөлім
    p(style="text-align: left; margin-bottom: 0; margin-top: 0") Жалпы баға <u><b>#{data.allGrade}</b></u>
      



`

const podrazdelenieTemplate2 = `

- var widthUpr = data.uprColums.length * 2;


doctype html
html(lang="en")
  head
    title Ведомость за подразделение
    style.
      @media print {
        .page-break { page-break-after: always; }
      }
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

  body
    //- Ваш контент страницы
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
          th(colspan=\`\$\{widthUpr\}\`) Орындалған жаттығулардың нәтижелері
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Жалпы балл
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Орташа балл
          th(colspan='1' rowspan='4' style='text-align: center;') 
            div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') ӘСК дәрежесі
        tr
          each uprName, idx in data.uprColums
            th(colspan='2')=idx+1
        tr
          each uprName in data.uprColums

            th(colspan='2')=uprName

        
        tr
          each uprName, idx in data.uprColums
            th(style='text-align: center;')
              div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Нәтиже
            th(style='text-align: center;') 
              div(style='writing-mode: vertical-lr;transform: scaleY(-1) scaleX(-1);margin-left: auto; margin-right: auto;') Балл
            

      tbody
        each pr, key in data.data
          tr
            td
            td=pr.zvanie
            td=pr.person
            td=pr.category
            each r in pr.results
              td=r.score
              td=r.ball
            
           
            td=pr.sumOfBalls 
            td=pr.totalOcenka
            td=pr.comment
//- JavaScript для увеличения номера страницы перед разрывом страницы

`;

router.get("/person", async (req, res) => {
  try {
    const compiledFunction = pug.compile(personTemplate);
    const html = compiledFunction();
    ipcMain.emit("print-person-report", html);
    res.status(200).json({ message: "Added document to schedule" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при отправке на печать" });
  }
  // const compiledFunction = pug.compileFile('./server/templates/person.pug');
  // const html = compiledFunction();
  // ipcMain.emit('print-person-report', html)
});

router.post("/person", async (req, res) => {
  try {
    const compiledFunction = pug.compile(personTemplate);
    // ----- Request body: -----
    // {
    //   id: 2,
    //   uprajnenia: null,
    //   uprajneniaDate: null,
    //   fName: 'Евгений',
    //   lName: 'Ольхин',
    //   sName: 'Александрович',
    //   dob: '2001-03-12T00:00:00.000Z',
    //   zvanieId: 1,
    //   podrazdelenieId: 1,
    //   comment: 'Солдат',
    //   num: null,
    //   isMale: true,
    //   isV: true,
    //   rating: null,
    //   isFree: false,
    //   otpuskFrom: null,
    //   otpuskTo: null,
    //   createdAt: '2024-03-01T05:22:58.741Z',
    //   updatedAt: '2024-03-01T05:22:58.741Z'
    // }
    let person = req.body;
    const zvanie = await Zvanie.findByPk(person["ZvanieId"]);
    person["zvanie"] = zvanie.name ? zvanie.name : "";
    const podrazdelenie = await Podrazdelenie.findByPk(
      person["PodrazdelenieId"]
    );
    person["podrazdelenie"] = podrazdelenie.name ? podrazdelenie.name : "";
    const category = await Category.findByPk(person["CategoryId"]);
    person["category"] = category.name ? category.name : "";
    person.fioWithInitials = `${person.lName} ${person.fName[0]}.${person.sName[0]}.`;

    // console.log(person)

    const html = compiledFunction(person);
    ipcMain.emit("print-person-report", html);
    res.status(200).json({ message: "Added document to schedule" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при отправке на печать" });
  }
  // const compiledFunction = pug.compileFile('./server/templates/person.pug');
  // const html = compiledFunction();
  // ipcMain.emit('print-person-report', html)
});

// Маршрут для создания и отправки PDF
router.get("/test", (req, res) => {
  try {
    const compiledFunction = pug.compileFile("./server/templates/person.pug");
    const html = compiledFunction();
    ipcMain.emit("print-person-report", html);
    res.status(200).json({ message: "Add document to schedule" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при отправке на печать" });
  }
});

router.post("/podrazdelenie", async (req, res) => {
  try {
    const compiledFunction = pug.compile(podrazdelenieTemplate);
    // ----- Request body: -----
    // {
    //   id: 2,
    //   uprajnenia: null,
    //   uprajneniaDate: null,
    //   fName: 'Евгений',
    //   lName: 'Ольхин',
    //   sName: 'Александрович',
    //   dob: '2001-03-12T00:00:00.000Z',
    //   zvanieId: 1,
    //   podrazdelenieId: 1,
    //   comment: 'Солдат',
    //   num: null,
    //   isMale: true,
    //   isV: true,
    //   rating: null,
    //   isFree: false,
    //   otpuskFrom: null,
    //   otpuskTo: null,
    //   createdAt: '2024-03-01T05:22:58.741Z',
    //   updatedAt: '2024-03-01T05:22:58.741Z'
    // }
    const podrazdelenieId = req.body["id"];
    const persons = await Person.findAll({
      where: {
        id: podrazdelenieId,
      },
      raw: true,
      nest: true,
    });
    // console.log(persons)
    for (const element of persons) {
      const zvanie = await Zvanie.findByPk(element["ZvanieId"]);
      element["zvanie"] = zvanie.name ? zvanie.name : "";
      const podrazdelenie = await Podrazdelenie.findByPk(
        element["PodrazdelenieId"]
      );
      element["podrazdelenie"] = podrazdelenie.name ? podrazdelenie.name : "";
      const category = await Category.findByPk(element["CategoryId"]);
      element["category"] = category.name ? category.name : "";
      element.fioWithInitials = `${element.lName} ${element.fName[0]}.${element.sName[0]}.`;
    }

    // console.log(persons)
    // const zvanie = await Zvanie.findByPk(person['zvanieId'])
    // person['zvanie'] = zvanie.name ? zvanie.name : ""
    // const podrazdelenie = await Podrazdelenie.findByPk(person['podrazdelenieId'])
    // person['podrazdelenie'] = podrazdelenie.name ? podrazdelenie.name : ""
    // const category = await Category.findByPk(person['categoryId'])
    // person['category'] = category.name ? category.name : ""
    // person.fioWithInitials = `${person.lName} ${person.fName[0]}.${person.sName[0]}.`

    // console.log(person)
    const testPersons = persons[0] ? Array(50).fill(persons[0]) : [];
    const html = compiledFunction({ data: testPersons });
    ipcMain.emit("print-person-report", html);
    res.status(200).json({ message: "Added document to schedule" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при отправке на печать" });
  }
  // const compiledFunction = pug.compileFile('./server/templates/person.pug');
  // const html = compiledFunction();
  // ipcMain.emit('print-person-report', html)
});

router.post("/podrtest", async (req, res) => {
  try {
    const compiledFunction = pug.compile(podrazdelenieTemplate2);
    // ----- Request body: -----
    // {
    //   id: 2,
    //   uprajnenia: null,
    //   uprajneniaDate: null,
    //   fName: 'Евгений',
    //   lName: 'Ольхин',
    //   sName: 'Александрович',
    //   dob: '2001-03-12T00:00:00.000Z',
    //   zvanieId: 1,
    //   podrazdelenieId: 1,
    //   comment: 'Солдат',
    //   num: null,
    //   isMale: true,
    //   isV: true,
    //   rating: null,
    //   isFree: false,
    //   otpuskFrom: null,
    //   otpuskTo: null,
    //   createdAt: '2024-03-01T05:22:58.741Z',
    //   updatedAt: '2024-03-01T05:22:58.741Z'
    // }
    // console.log(req.body);
    // const podrazdelenieId = req.body['id'];

    // person.fioWithInitials = `${person.lName} ${person.fName[0]}.${person.sName[0]}.`

    // console.log(person)
    // const testPersons = persons[0] ? Array(50).fill(persons[0]) : [];
    const html = compiledFunction({ data: req.body })
    // ipcMain.emit("print-person-report", html);
    res.status(200).send(html);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошибка при отправке на печать" });
  }
  // const compiledFunction = pug.compileFile('./server/templates/person.pug');
  // const html = compiledFunction();
  // ipcMain.emit('print-person-report', html)
});

router.post("/allVedomost", async (req, res) => {
  try {
    const compiledFunction = pug.compile(allVedomostTemplate);
    const data = req.body.data
    // ----- Request body: -----
    // {
    //   id: 2,
    //   uprajnenia: null,
    //   uprajneniaDate: null,
    //   fName: 'Евгений',
    //   lName: 'Ольхин',
    //   sName: 'Александрович',
    //   dob: '2001-03-12T00:00:00.000Z',
    //   zvanieId: 1,
    //   podrazdelenieId: 1,
    //   comment: 'Солдат',
    //   num: null,
    //   isMale: true,
    //   isV: true,
    //   rating: null,
    //   isFree: false,
    //   otpuskFrom: null,
    //   otpuskTo: null,
    //   createdAt: '2024-03-01T05:22:58.741Z',
    //   updatedAt: '2024-03-01T05:22:58.741Z'
    // }
    // console.log(req.body);
    // const podrazdelenieId = req.body['id'];

    // person.fioWithInitials = `${person.lName} ${person.fName[0]}.${person.sName[0]}.`

    // console.log(person)
    // const testPersons = persons[0] ? Array(50).fill(persons[0]) : [];
    // console.log(req.body)
    const html = compiledFunction({ data: data});
    res.status(200).send(html);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошибка при отправке на печать" });
  }
  // const compiledFunction = pug.compileFile('./server/templates/person.pug');
  // const html = compiledFunction();
  // ipcMain.emit('print-person-report', html)
});

module.exports = router;
