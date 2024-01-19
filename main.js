const express = require('express');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const { sequelize, Person } = require('./server/sequelize'); // Импорт Sequelize и настройки
const personsRouter = require('./server/routes/persons');
const zvaniyaRouter = require('./server/routes/zvaniya');

const appExpress = express();
appExpress.use(express.json());

appExpress.use('/persons', personsRouter);
appExpress.use('/zvaniya', zvaniyaRouter);

// appExpress.use(crud('/persons', sequelizeCrud(Person)))


// Устанавливаем middleware и маршруты Express.js здесь
// appExpress.use(express.static(path.join(__dirname, 'public')));

appExpress.get('/', (req, res) => {
  res.send('Hello Express!');
});

// Синхронизация с базой данных и запуск сервера
sequelize.sync().then(() => {
  appExpress.listen(3333, () => {
    console.log('Сервер запущен на порту 3333');
  });
}).catch(() => {
  console.log("Сервер не запущен")
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'client/dist', 'index.html'));
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Обработчик закрытия Electron-приложения
app.on('before-quit', () => {
  // Закрываем Express.js сервер при закрытии Electron-приложения
  server.close();
});
