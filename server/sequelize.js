const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "mydatabase.db", // Путь к файлу базы данных SQLite
  define: {
    timestamps: true, // Отключить создание полей createdAt и updatedAt
  },
});
// Определение модели "Person"
const Zvanie = sequelize.define("Zvanie", {
  name: DataTypes.STRING,
});

// Определение модели "Person"
const Person = sequelize.define("Person", {
  uprajnenia: DataTypes.JSON,
  uprajneniaDate: DataTypes.JSON,
  fName: DataTypes.STRING,
  lName: DataTypes.STRING,
  sName: DataTypes.STRING,
  dob: DataTypes.DATE,
  zvanieId: Zvanie,
  comment: DataTypes.STRING,
  num: DataTypes.STRING,
  isMale: DataTypes.BOOLEAN,
  isV: DataTypes.BOOLEAN,
  rating: DataTypes.INTEGER,
  isFree: DataTypes.BOOLEAN,
  otpuskFrom: DataTypes.DATE,
  otpuskTo: DataTypes.DATE,
});

const Podrazdelenie = sequelize.define("Podrazdelenie", {
  name: DataTypes.STRING,
});

const Category = sequelize.define("Category", {
  name: DataTypes.STRING,
  from: DataTypes.INTEGER,
  to: DataTypes.INTEGER,
  isMale: DataTypes.BOOLEAN,
  isV: DataTypes.BOOLEAN,
});

const UprazhnenieType = sequelize.define("UprazhnenieType", {
  name: DataTypes.STRING,
});

const Uprazhnenie = sequelize.define("Uprazhnenie", {
  name: DataTypes.STRING,
  ballList: DataTypes.INTEGER,
  povtList: DataTypes.INTEGER,
  UprazhnenieTypeId: UprazhnenieType,
  isV: DataTypes.BOOLEAN,
});

module.exports = {
  sequelize,
  Person,
  Zvanie,
  Podrazdelenie,
  Category,
  Uprazhnenie,
  UprazhnenieType,
};
