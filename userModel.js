const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { captureRejectionSymbol } = require("nodemailer/lib/xoauth2");
//1-create Schema

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, "username required"],
    },
    Email: {
      type: String,
      unique: true,
      required: [true, "email required"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [8, "too short password"],
    },
    Phone: String,
    passwordChangeAt: String,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "student"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female"],
    },
    healthRecord: {
      type: String,
    },
    skills:{
      type: String,
    },
    year:{
      type: String,
    },
    profileImg: String,
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal to 1.0"],
      max: [5, "Rating must be below or equal to 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    createReport: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//@ dec remove "password" &"__v" from the output
userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password; // remove "password" from the output
    delete ret.__v; // remove "__v" from the output
    return ret;
  },
});

userSchema.virtual("reviews", {
  ref: "ReviewStudent",
  foreignField: "student",
  localField: "_id",
});

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   //Hashing user password
//   const saltRounds = parseInt(process.env.HASH_PASS, 10);
//   this.password = await bcrypt.hash(this.password, saltRounds);
//   next();
// });

// const setImageURL = (doc) => {
//   if (doc.profileImg) {
//     const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
//     doc.profileImg = imageUrl;
//   }
// };
// //findALL , findOne , update
// userSchema.post("init", (doc) => {
//   setImageURL(doc);
// });

// //create
// userSchema.post("save", (doc) => {
//   setImageURL(doc);
// });

//2-create Model
module.exports = mongoose.model("User", userSchema);
