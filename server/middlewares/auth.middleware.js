const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, _res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return next(Object.assign(new Error("Unauthorized"), { statusCode: 401 }));
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.sub).select("-password -refreshTokens");
    if (!req.user) throw new Error("User not found");
    req.gymId = req.user.gymId;
    next();
  } catch {
    next(Object.assign(new Error("Invalid token"), { statusCode: 401 }));
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || (req.user.role !== "superadmin" && !roles.includes(req.user.role))) {
    return next(Object.assign(new Error("Forbidden"), { statusCode: 403 }));
  }
  next();
};

module.exports = { protect, authorize };
