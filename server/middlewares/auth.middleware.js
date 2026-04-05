const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const Member = require("../models/member.model");

const protect = async (req, _res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return next(Object.assign(new Error("Unauthorized"), { statusCode: 401 }));
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.sub).select("-password -refreshTokens");
    if (!req.user) throw new Error("User not found");
    req.gymId = req.user.gymId;
    
    // If user is a member, check their status/payment
    if (req.user.role === "member") {
      const member = await Member.findOne({ user: req.user._id, gymId: req.gymId });
      if (member) {
        req.member = member;
        // Block access for inactive or pending members if they try to access non-approval routes
        // (Wait, the frontend handles redirection, but backend should also protect)
        if (member.status === "inactive") {
          return next(Object.assign(new Error("Account discarded by admin"), { statusCode: 403 }));
        }
      }
    }
    
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

const checkPlanAccess = (req, _res, next) => {
  if (req.user.role === "member") {
    const member = req.member;
    if (!member) return next(Object.assign(new Error("Member profile not found"), { statusCode: 404 }));
    
    const now = new Date();
    const isExpired = member.membershipExpiryDate && now > new Date(member.membershipExpiryDate);
    const isPaid = member.paymentStatus === "paid";
    
    if (isExpired || !isPaid) {
      return next(Object.assign(new Error("Membership expired or payment pending"), { statusCode: 403 }));
    }
  }
  next();
};

module.exports = { protect, authorize, checkPlanAccess };
