const { sequelize, Person } = require('./sequelize');
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
const mockData = [
    {
      uprajnenia: [{ "Бег": 0 }],
      uprajneniaDate: [{ "Бег": "08-01-2024" }],
      fName: generateString(5),
      lName: generateString(10),
      sName: generateString(15),
      dob: "03-12-2001",
      zvanie: "Майор",
      selected: false,
      comment: "",
      num: "ВНВ",
      isMale: true,
      isV: true,
      rating: 1,
      isFree: false,
      otpuskFrom: "03-12-2023",
      otpuskTo: "03-12-2024"
    },
    // Добавьте другие объекты с данными
  ];
  async function seedDatabase() {
    try {
      // Синхронизируйте модель Person с базой данных
      await sequelize.sync();
  
      // Добавьте мок-данные в базу данных
      await Person.bulkCreate(mockData);
  
      console.log('Мок-данные успешно добавлены в базу данных.');
    } catch (error) {
      console.error('Ошибка при добавлении мок-данных в базу данных:', error);
    } finally {
      // Закройте соединение с базой данных
      await sequelize.close();
    }
  }
  
  // Вызовите функцию для заполнения базы данных мок-данными
  seedDatabase();