const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      pref: "patient",
      required: true,
    },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    // Appointment details
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["consultation", "followUp", "emergency", "other"],
      default: "consultation",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    // Payments
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
    paymentRef: {
      type: String,
      trim: true,
    },

    // For reminders
    notes: {
      type: String,
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("appointment", appointmentSchema);
