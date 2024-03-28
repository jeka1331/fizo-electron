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
  comment: DataTypes.STRING,
  num: DataTypes.STRING,
  isMale: DataTypes.BOOLEAN,
  isV: DataTypes.BOOLEAN,
  rating: DataTypes.INTEGER,
  isFree: DataTypes.BOOLEAN,
  otpuskFrom: DataTypes.DATE,
  otpuskTo: DataTypes.DATE,
});

const EfficiencyPreference = sequelize.define("EfficiencyPreference", {
  name: DataTypes.STRING,
});

const Uprazhnenie = sequelize.define("Uprazhnenie", {
  name: DataTypes.STRING,
  shortName: DataTypes.STRING,
  uprazhnenieRealValuesTypeId: UprazhnenieRealValuesType,
  step: DataTypes.DOUBLE,
  valueToAddAfterMaxResult: DataTypes.INTEGER,
});

const UprazhnenieStandard = sequelize.define("UprazhnenieStandard", {
  // uprazhnenieId: Uprazhnenie,
  categoryId: Category,
  value: DataTypes.DOUBLE,
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
});
Person.hasMany(UprazhnenieResult);
UprazhnenieResult.belongsTo(Person);
EfficiencyPreference.hasMany(Uprazhnenie);
Uprazhnenie.belongsTo(EfficiencyPreference);
Zvanie.hasMany(Person, {
  foreignKey: "zvanieId",
});
Person.belongsTo(Zvanie, {
  foreignKey: "zvanieId",
});

Podrazdelenie.hasMany(Person, {
  foreignKey: "podrazdelenieId",
});
Person.belongsTo(Podrazdelenie, {
  foreignKey: "podrazdelenieId",
});

Uprazhnenie.hasMany(UprazhnenieStandard, {
  foreignKey: "uprazhnenieId",
});
UprazhnenieStandard.belongsTo(Uprazhnenie, {
  foreignKey: "uprazhnenieId",
});

Category.hasMany(Person, {
  foreignKey: "categoryId",
});
Person.belongsTo(Category, {
  foreignKey: "categoryId",
});
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
  EfficiencyPreference,
};
