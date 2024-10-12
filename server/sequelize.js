const { Sequelize, DataTypes } = require("sequelize");

const database_init = (dialect, storage, logs) => {
  const sequelize = new Sequelize({
    dialect: dialect, // Выбор диалекта
    storage: storage, // Путь к файлу базы данных SQLite
    define: {
      timestamps: false, // Отключить создание полей createdAt и updatedAt
    },
    logging: logs,
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

  return {
    UprazhnenieResult: UprazhnenieResult,
    UprazhnenieSchedule: UprazhnenieSchedule,
    sequelize: sequelize,
    UprazhnenieStandard: UprazhnenieStandard,
    Person: Person,
    Zvanie: Zvanie,
    Podrazdelenie: Podrazdelenie,
    Category: Category,
    Uprazhnenie: Uprazhnenie,
    UprazhnenieRealValuesType: UprazhnenieRealValuesType,
    EfficiencyPreference: EfficiencyPreference,
  }
};
let dbPath = 'mydatabase.db'
const node_env = process.env.NODE_ENV;
if (node_env == 'test') {
  dbPath = 'test.db'
}
const dbDefinition = database_init("sqlite", dbPath, false);


const UprazhnenieResult = dbDefinition.UprazhnenieResult
const UprazhnenieSchedule = dbDefinition.UprazhnenieSchedule
const sequelize = dbDefinition.sequelize
const UprazhnenieStandard = dbDefinition.UprazhnenieStandard
const Person = dbDefinition.Person
const Zvanie = dbDefinition.Zvanie
const Podrazdelenie = dbDefinition.Podrazdelenie
const Category = dbDefinition.Category
const Uprazhnenie = dbDefinition.Uprazhnenie
const UprazhnenieRealValuesType = dbDefinition.UprazhnenieRealValuesType
const EfficiencyPreference = dbDefinition.EfficiencyPreference

module.exports = {
  database_init,
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

  dbPath
};
