const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospital",
    required: true,
  },
  whatsappNumber: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  address: { type: String },
  medicalHistory: [
    {
      visitDate: { type: Date, default: Date.now },
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, 
      complaint: { type: String },
      diagnosis: { type: String }, 
      medications: [{ type: String }], 
      plan: { type: String }, //"Follow-up in 2 weeks"
    },
  ],
  appointments: [
    {
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appointment",
      },
    },
  ],

  outstandingBalance: {
    type: Number,
    default: 0
  },
  lastPaymentDate: { type: Date },
});

patientSchema.index({ whatsappNumber: 1, hospitalId: 1 }, { unique: true });

module.exports = mongoose.model("patient", patientSchema);
