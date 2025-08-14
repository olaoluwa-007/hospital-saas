const userschema = require('../model/user.schema');

const validateUserRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.userData;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized user" });
      }
      const user = await userschema.findById(userId).select('-password');
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      if (roles.includes(user.role)) {
        next();
      } else {
        return res.status(403).json({ message: "Forbidden request" });
      }
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
  };
};

module.exports = validateUserRole ;