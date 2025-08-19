const userschema = require("../model/user.schema");
const hospitalschema = require("../model/hospital.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const registerAdminPlatform = async (req, res) => {
  try {
    const { name, email, password, seedSecret } = req.body;

    if (seedSecret !== process.env.SEED_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid seed secret"
      });
    }

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
      isActive: true,
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
      adminWhatsappNumber,
      address,
      city,
      state,
      country,
      bank,
      subscription,
      pricing,
    } = req.body;
    const existingHospital = await hospitalschema.findOne({ whatsappNumber });

    if (existingHospital) {
      return res.status(403).json({
        success: false,
        message: "Hospital with this whatsapp number already exists",
      });
    }

    const existingAdmin = await userschema.findOne({ whatsappNumber: adminWhatsappNumber });
    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin with this whatsapp number already exists",
      });
    }

    const hospital = new hospitalschema({
      name,
      whatsappNumber,
      address,
      city,
      state,
      country: country || "Nigeria",
      subaccountCode,
      bank,
      subscription: subscription || { active: true, plan: "monthly" },
      pricing: pricing || { folderFee: 0, consultation: 0, followUp: 0 },
    });

    await hospital.save();

    // create hospital admin
    const hospitalAdmin = new userschema({
      name: adminName,
      whatsappNumber: adminWhatsappNumber,
      role: "hospitalAdmin",
      hospitalId: hospital._id,
      isActive: true,
    });

    await hospitalAdmin.save();

    res.status(201).json({
      success: true,
      data: {
        hospital: {
          name: hospital.name,
          hospitalId: hospital._id,
        },
        admin: {
          name: hospitalAdmin.name,
          whatsappNumber: hospitalAdmin.whatsappNumber,
          role: hospitalAdmin.role,
          adminId: hospitalAdmin._id
        },
      },
      message: "Hospital registered and admin onboarded successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { name, role, whatsappNumber } = req.body;
    const hospitalId = req.hospitalId; // from authValidation middleware

    if (!["doctor", "nurse"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Role must be doctor or nurse" });
    }

    const existingStaff = await userschema.findOne({ whatsappNumber, hospitalId });
    if (existingStaff) {
      return res.status(403).json({
        success: false,
        message: "Staff with this whatsapp number already exists",
      });
    }

    const staff = new userschema({
      name,
      whatsappNumber,
      role,
      hospitalId,
      isActive: true,
    });

    await staff.save();
    
    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      staff: {
        id: staff._id,
        name: staff.name,
        whatsappNumber: staff.whatsappNumber,
        role: staff.role,
      },
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


module.exports = {
  registerAdminPlatform,
  registerHospital,
  registerStaff,
  login,
  changePassword,
};
