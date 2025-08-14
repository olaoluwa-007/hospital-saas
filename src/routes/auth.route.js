const express = require("express");
const {
  registerAdminPlatform,
  registerHospital,
  registerStaff,
  login,
  changePassword,
} = require("../controller/auth.controller");
const authValidation = require("../middleware/authValidation");
const validateUserRole = require("../middleware/validateRole");

const authRouter = express.Router();
authRouter.post("/register/admin-platform", registerAdminPlatform);
authRouter.post(
  "/register/hospital",
  authValidation,
  validateUserRole("platformAdmin"),
  registerHospital
);
authRouter.post(
  "/register/staff",
  authValidation,
  validateUserRole("hospitalAdmin"),
  registerStaff
);
authRouter.post("/login", login);
authRouter.post("/change-password", authValidation, changePassword);

module.exports = { authRouter };
