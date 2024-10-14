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
  step: DataTypes.DOUBLE,
  valueToAddAfterMaxResult: DataTypes.INTEGER,
});

const UprazhnenieStandard = sequelize.define("UprazhnenieStandard", {
  value: DataTypes.DOUBLE,
  result: DataTypes.INTEGER,
});

const UprazhnenieResult = sequelize.define("UprazhnenieResult", {
  result: DataTypes.INTEGER,
  date: DataTypes.DATE,
});

const FixedUpr = sequelize.define("FixedUpr", {
  date: DataTypes.DATE,
});

// FixedUpr

Uprazhnenie.hasMany(FixedUpr);
FixedUpr.belongsTo(Uprazhnenie);

Category.hasMany(FixedUpr);
FixedUpr.belongsTo(Category);

// UprazhnenieResult

Person.hasMany(UprazhnenieResult);
UprazhnenieResult.belongsTo(Person);

Category.hasMany(UprazhnenieResult);
UprazhnenieResult.belongsTo(Category);

Uprazhnenie.hasMany(UprazhnenieResult);
UprazhnenieResult.belongsTo(Uprazhnenie);

// Uprazhnenie

EfficiencyPreference.hasMany(Uprazhnenie);
Uprazhnenie.belongsTo(EfficiencyPreference);

UprazhnenieRealValuesType.hasMany(Uprazhnenie);
Uprazhnenie.belongsTo(UprazhnenieRealValuesType);

Zvanie.hasMany(Person);
Person.belongsTo(Zvanie);

Podrazdelenie.hasMany(Person);
Person.belongsTo(Podrazdelenie);

Uprazhnenie.hasMany(UprazhnenieStandard);
UprazhnenieStandard.belongsTo(Uprazhnenie);

Category.hasMany(UprazhnenieStandard);
UprazhnenieStandard.belongsTo(Category);

Category.hasMany(Person);
Person.belongsTo(Category);





module.exports = {
  UprazhnenieResult,
  sequelize,
  UprazhnenieStandard,
  Person,
  Zvanie,
  Podrazdelenie,
  Category,
  Uprazhnenie,
  UprazhnenieRealValuesType,
  EfficiencyPreference,
  FixedUpr
};
