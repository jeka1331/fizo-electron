const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "mydatabase.db", // Путь к файлу базы данных SQLite
  define: {
    timestamps: false, // Отключить создание полей createdAt и updatedAt
  },
});
// Определение модели "Person"
const Zvanie = sequelize.define("Zvanie", {
  name: DataTypes.STRING,
});

const Podrazdelenie = sequelize.define("Podrazdelenie", {
  name: DataTypes.STRING,
});

const Category = sequelize.define("Category", {
  name: DataTypes.STRING,
  shortName: DataTypes.STRING,
});
const UprazhnenieRealValuesType = sequelize.define(
  "UprazhnenieRealValuesType",
  {
    name: DataTypes.STRING,
    shortName: DataTypes.STRING,
  }
);

// Определение модели "Person"
const Person = sequelize.define("Person", {
  fName: DataTypes.STRING,
  lName: DataTypes.STRING,
  sName: DataTypes.STRING,
  dob: DataTypes.DATE,
  zvanieId: Zvanie,
  podrazdelenieId: Podrazdelenie,
  categoryId: Category,
  comment: DataTypes.STRING,
  num: DataTypes.STRING,
  isMale: DataTypes.BOOLEAN,
  isV: DataTypes.BOOLEAN,
  rating: DataTypes.INTEGER,
  isFree: DataTypes.BOOLEAN,
  otpuskFrom: DataTypes.DATE,
  otpuskTo: DataTypes.DATE,
});

const Uprazhnenie = sequelize.define("Uprazhnenie", {
  name: DataTypes.STRING,
  shortName: DataTypes.STRING,
  uprazhnenieRealValuesTypeId: UprazhnenieRealValuesType,
  maxResult: DataTypes.INTEGER,
  valueToAddAfterMaxResult: DataTypes.INTEGER,
});

const UprazhnenieStandard = sequelize.define("UprazhnenieStandard", {
  uprazhnenieId: Uprazhnenie,
  categoryId: Category,
  valueInt: DataTypes.INTEGER,
  result: DataTypes.INTEGER,
});

const UprazhnenieSchedule = sequelize.define("UprazhnenieSchedule", {
  uprazhnenieId: Uprazhnenie,
  name: Category,
  personId: Person,
  date: DataTypes.DATE,
});

const UprazhnenieResult = sequelize.define("UprazhnenieResult", {
  result: DataTypes.INTEGER,
  date: DataTypes.DATE,
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  },
});
Person.hasMany(UprazhnenieResult);
UprazhnenieResult.belongsTo(Person);
Category.hasMany(UprazhnenieResult);
UprazhnenieResult.belongsTo(Category);
Uprazhnenie.hasMany(UprazhnenieResult);
UprazhnenieResult.belongsTo(Uprazhnenie);

module.exports = {
  UprazhnenieResult,
  UprazhnenieSchedule,
  sequelize,
  UprazhnenieStandard,
  Person,
  Zvanie,
  Podrazdelenie,
  Category,
  Uprazhnenie,
  UprazhnenieRealValuesType,
};
