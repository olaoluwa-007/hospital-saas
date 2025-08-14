const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  subaccountCode: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  subscription: {
    active: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    expiresAt: {
      type: Date,
    },
  },
  pricing: {
    folderFee: {
      type: Number,
      default: 0,
    },
  },
}, {timestamps: true});

hospitalSchema.index({whatsappNumber: 1}, {unique: true});

module.exports = mongoose.model("hospital", hospitalSchema);
