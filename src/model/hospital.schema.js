const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    address: { 
      type: String, 
      trim: true 
    },
    city: { 
      type: String, 
      trim: true 
    },
    state: { 
      type: String, 
      trim: true 
    },
    country: { 
      type: String, 
      trim: true, 
      default: "Nigeria" 
    },
    subaccountCode: {
      type: String,
      required: true,
      trim: true,
    },
    bank: {
      accountName: { 
        type: String, 
        trim: true 
      },
      accountNumber: { 
        type: String, 
        trim: true 
      },
      bankCode: { 
        type: String, 
        trim: true 
      },
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
      paystackCustomerCode: { 
        type: String, 
        trim: true 
      },
      paystackPlanCode: { 
        type: String, 
        trim: true 
      },
      lastPaymentRef: { 
        type: String, 
        trim: true 
      },
    },
    pricing: {
      folderFee: {
        type: Number,
        default: 0,
      },
      consultation: { 
        type: Number, 
        default: 0 
      },
      followUp: { 
        type: Number, 
        default: 0 
      },
    },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patient",
      },
    ],
  },
  { timestamps: true }
);

hospitalSchema.index({ name: "text", whatsappNumber: "text", clinicCode: "text" });

module.exports = mongoose.model("hospital", hospitalSchema);
