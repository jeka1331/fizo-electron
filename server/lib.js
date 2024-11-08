const {
  EfficiencyPreference,
  Uprazhnenie,
  UprazhnenieStandard,
} = require("./sequelize");
const sequelize = require("sequelize");
const { Op } = require("sequelize");

const calculateBall = async (uprResult) => {
  const c = uprResult.CategoryId;
  const u = uprResult.UprazhnenieId;
  const v = uprResult.result;
  if (!uprResult.result && !uprResult.date) {
    return uprResult;
  }
  const vtaamr = (
    await Uprazhnenie.findOne({
      attributes: ["valueToAddAfterMaxResult", "step"],

      where: {
        id: u,
      },
    })
  ).get();

  const minResultRaw = await UprazhnenieStandard.findOne({
    attributes: [
      [sequelize.fn("MIN", sequelize.col("value")), "minValue"],
      "id",
      "UprazhnenieId",
      "CategoryId",
      "result",
    ],
    where: {
      UprazhnenieId: u,
      CategoryId: c,
    },
    limit: 1,
    include: [
      {
        model: Uprazhnenie,
        include: [{ model: EfficiencyPreference, attributes: ["name"] }],
      },
    ],
  });
  const maxResultRaw = await UprazhnenieStandard.findOne({
    attributes: [
      [sequelize.fn("MAX", sequelize.col("value")), "maxValue"],
      "id",
      "UprazhnenieId",
      "CategoryId",
      "result",
    ],
    where: {
      UprazhnenieId: u,
      CategoryId: c,
    },
    limit: 1,
    include: [
      {
        model: Uprazhnenie,
        include: [{ model: EfficiencyPreference, attributes: ["name"] }],
      },
    ],
  });

  const ep =
    minResultRaw.Uprazhnenie.EfficiencyPreference.name ===
    maxResultRaw.Uprazhnenie.EfficiencyPreference.name
      ? maxResultRaw.Uprazhnenie.EfficiencyPreference.name
      : "error";

  if (ep === "error") {
    return {
      ...uprResult,
      ball: 0,
    };
  }

  const min = {
    value: minResultRaw.dataValues.minValue,
    result: minResultRaw.dataValues.result,
  };
  const max = {
    value: maxResultRaw.dataValues.maxValue,
    result: maxResultRaw.dataValues.result,
  };

  const ball = await UprazhnenieStandard.findOne({
    where: {
      CategoryId: c,
      UprazhnenieId: u,
      value: v,
    },
  });

  let ballResult = ball ? ball.getDataValue("result") : "-";
  if (min.value > v || v > max.value) {
    if (ep === "Меньше - лучше") {
      // if (min.value > uprResult.result) {
      //   const additionalResultCount = minValue - uprResult.result;
      //   res =
      //     min.result +
      //     uprResult.Uprazhnenie.valueToAddAfterMaxResult *
      //       (additionalResultCount / uprResult.Uprazhnenie.step);
      if (v > max.value) {
        return {
          ...uprResult,
          ball: 0,
        };
      }
      const additionalResultCount = min.value - v;
      ballResult =
        min.result +
        vtaamr.valueToAddAfterMaxResult * (additionalResultCount / vtaamr.step);
    } else {
      // const additionalResultCount = uprResult.result - maxValue;

      // res =
      //   max.result +
      //   uprResult.Uprazhnenie.valueToAddAfterMaxResult *
      //     (additionalResultCount / uprResult.Uprazhnenie.step);
      if (min.value > v) {
        return {
          ...uprResult,
          ball: 0,
        };
      }
      const additionalResultCount = v - max.value;
      ballResult =
        max.result +
        vtaamr.valueToAddAfterMaxResult * (additionalResultCount / vtaamr.step);
    }
  }
  return {
    ...uprResult,
    ball: ballResult,
    // BallBolon: bolon(ballResult),
  };
};

module.exports = { calculateBall };
