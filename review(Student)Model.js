const mongoose = require("mongoose");

const Student = require("./userModel");
const reviewStudentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min rating value is 1.0"],
      max: [5, "Max rating value is 5.0"],
      required: [true, "review rating required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    // Parent reference (one to many) => لما يكون عدد ال شايلد كبير
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to student"],
    },
    appointment: {
      type: mongoose.Schema.ObjectId,
      ref: "orderDoctor",
      required: [true, "Review must belong to appointment"],
    },
  },
  { timestamps: true }
);
reviewStudentSchema.statics.calcAverageRatingsAndQuantity = async function (
  studentId
) {
  const result = await this.aggregate([
    // stage 1: get all reviews in specific product
    {
      $match: { student: studentId },
    },
    {
      $group: {
        _id: "student",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Student.findByIdAndUpdate(studentId, {
      ratingsQuantity: result[0].ratingsQuantity,
      ratingsAverage: result[0].avgRatings,
    });
  } else {
    await Student.findByIdAndUpdate(studentId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewStudentSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.student);
});

reviewStudentSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.student);
});

reviewStudentSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "fullName profileImg" }).populate({
    path: "student",
    select: "fullName profileImg",
  });
  next();
});

module.exports = mongoose.model("ReviewStudent", reviewStudentSchema);
