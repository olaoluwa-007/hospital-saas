const bcrypt = require("bcryptjs");
const userschema = require("../model/user.schema");
const transporter = require("../service/mail.service");

//create a new user with a temporary password and sends an invite email
async function createUserWithTempPassword({ name, email, role, hospitalId, subject, message }) {
  // Generate random temporary password
  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create user document
  const user = new userschema({
    name,
    email,
    password: hashedPassword,
    role,
    hospitalId,
  });
  await user.save();

  // Write an email with strong instruction to change password
  const emailBody = `${message}\n\n` +
    `Your temporary password is: ${tempPassword}\n\n` +
    `⚠ IMPORTANT: Please log in immediately and change your password using the "Change Password" option for security reasons.`;

  // Send invite email
  let emailSent = true;
  let emailErrorMsg = "";
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: emailBody,
    });
  } catch (err) {
    emailSent = false;
    emailErrorMsg = "User created, but invite email failed to send.";
    console.error("Email sending failed:", err);
  }

  return { user, tempPassword, emailSent, emailErrorMsg };
}

module.exports = { createUserWithTempPassword };
