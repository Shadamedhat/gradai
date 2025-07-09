const mongoose = require("mongoose");

const orderDoctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    // orderPrice: {
    //   type: Number,
    //   default: 0,
    // },
    type: {
      type: String,
      enum: [
        "Tooth Extraction",
        "Veneers",
        "Root Canal Treatment",
        "Dental Filling",
        "Scaling & Polishing",
        "Orthodontics (Braces)",
      ],
    },
    status: {
      type: String,
      default: "Upcoming",
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    time: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

orderDoctorSchema.pre(/^find/, function (next) {
  this;
  // .populate({
  //   path: "user",
  //   select: "fullName profileImg Email Phone",
  // })
  next();
});

module.exports = mongoose.model("orderDoctor", orderDoctorSchema);
