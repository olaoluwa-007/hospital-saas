const jwt = require("jsonwebtoken");
const authValidation = (req, res, next) => {
  try {
    //console.log(req);
    //grab the access token
    const token = req.headers.authorization.replace("Bearer ", "").trim();
    //decode the access token to obtain the user data
    const decodedData = jwt.verify(token, process.env.JWTSECRET);
    console.log(decodedData);
    req.userData = decodedData;
    req.hospitalId = decodedData.hospitalId;
    req.role = decodedData.role;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentication fail, unathourized token",
    });
  }
};

module.exports = authValidation;
