const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    hospitalId: {
      type: mongoose.Schema.ObjectId,
      ref: "hospital",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["platformAdmin", "hospitalAdmin", "doctor", "nurse", "staff"],
      default: "staff",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1, whatsappNumber: 1 });

module.exports = mongoose.model("user", userSchema);