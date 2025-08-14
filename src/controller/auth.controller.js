const userschema = require("../model/user.schema");
const hospitalschema = require("../model/hospital.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../service/mail.service");

const registerAdminPlatform = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingPlatformAdmin = await userschema.findOne({ email });
    if (existingPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Platform admin with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const platformAdmin = new userschema({
      name,
      email,
      password: hashedPassword,
      role: "platformAdmin",
    });

    await platformAdmin.save();

    res.status(201).json({
      success: true,
      data: {
        platformAdmin: {
          name: platformAdmin.name,
          email: platformAdmin.email,
          role: platformAdmin.role,
        },
      },
      message: "Platform admin registered successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin platform should register hospitals
const registerHospital = async (req, res) => {
  try {
    const {
      name,
      whatsappNumber,
      subaccountCode,
      adminName,
      adminEmail,
    } = req.body;
    const existingHospital = await hospitalschema.findOne({ whatsappNumber });

    if (existingHospital) {
      return res.status(403).json({
        success: false,
        message: "Hospital with this whatsapp number already exists",
      });
    }

    const existingAdmin = await userschema.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const hospital = new hospitalschema({
      name,
      whatsappNumber,
      subaccountCode,
      subscription: { active: true },
    });

    await hospital.save();

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const admin = new userschema({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "hospitalAdmin",
      hospitalId: hospital._id,
    });
    await admin.save();

    // Send email invite to hospital admin
    let emailSent = true;
    let emailErrorMsg = "";

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: "Hospital Admin Registration",
        text: `Hello ${adminName},\n\nYou have been registered as a hospital admin.\nYour temporary password is: ${tempPassword}\nPlease log in and change your password.\n\nThank you.`,
      });
    } catch (emailErr) {
      emailSent = false;
      emailErrorMsg =
        "Hospital admin registered, but invite email failed to send.";
      console.error("Email sending failed:", emailErr);
    }

    res.status(201).json({
      success: true,
      data: {
        hospital: {
          name: hospital.name,
          hospitalId: hospital._id,
        },
        admin: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      message: `Hospital registered${
        emailSent
          ? " and admin invite sent successfully"
          : ", but admin invite email failed to send"
      }`,
      emailSent,
      ...(emailErrorMsg && { emailErrorMsg }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { name, staffEmail, role } = req.body;
    const hospitalId = req.hospitalId; // from authValidation middleware

    if (!["doctor", "nurse"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Role must be doctor or nurse" });
    }

    const existingStaff = await userschema.findOne({ email: staffEmail });
    if (existingStaff) {
      return res.status(403).json({
        success: false,
        message: "Staff with this email already exists",
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    console.log("Temporary password >>>>>", tempPassword);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const staff = new userschema({
      name,
      email: staffEmail,
      password: hashedPassword,
      role,
      hospitalId,
    });

    await staff.save();

    // Send email invite

    let emailSent = true;
    let emailErrorMsg = "";

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: staffEmail,
        subject: "Hospital Platform Staff Invitation",
        text: `Hello ${name},\n\nYou have been registered as a ${role} at your hospital.\nYour temporary password is: ${tempPassword}\nPlease log in and change your password.\n\nThank you.`,
      });
    } catch (emailErr) {
      emailSent = false;
      emailErrorMsg = "Staff registered, but invite email failed to send.";
      console.error("Email sending failed:", emailErr);
    }

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered${
        emailSent
          ? " and invite sent successfully"
          : ", but invite email failed to send"
      }`,
      emailSent,
      ...(emailErrorMsg && { emailErrorMsg }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userschema.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Authorization failed" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const jwtToken = jwt.sign(
      {
        email: user.email,
        userId: user._id,
        name: user.name,
        hospitalId: user.hospitalId,
        role: user.role,
      },
      process.env.JWTSECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({
      accessToken: jwtToken,
      userId: user._id,
      hospitalId: user.hospitalId,
      role: user.role,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId } = req.userData; 
    const { oldPassword, newPassword } = req.body;

    const user = await userschema.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  registerAdminPlatform,
  registerHospital,
  registerStaff,
  login,
  changePassword,
};
