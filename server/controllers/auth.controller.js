const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { signAccessToken, signRefreshToken } = require("../utils/tokens");
const { AppError } = require("../utils/appError");

const toTokens = (user) => {
  const payload = { sub: user._id, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
};

const sanitizeUser = (user, member = null) => ({
  _id: user._id,
  gymId: user.gymId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  photo: user.photo,
  status: member ? member.status : user.status,
  paymentStatus: member ? member.paymentStatus : "paid" // Admins/Trainers are always "paid"
});

const Member = require("../models/member.model");

const signup = asyncHandler(async (req, res) => {
  const { gymId, name, email, phone, password, role = "member" } = req.body;
  
  // Ensure role is valid
  const allowedRoles = ["admin", "trainer", "member"];
  const finalRole = allowedRoles.includes(role) ? role : "member";

  const user = await User.create({ gymId, name, email, phone, password, role: finalRole });
  
  let member = null;
  // If signing up as a member, also create the Member profile with pending status
  if (finalRole === "member") {
    member = await Member.create({
      gymId,
      user: user._id,
      branchCode: "MAIN",
      isActivePlan: false,
      status: "pending"
    });
  }

  const tokens = toTokens(user);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();
  
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  sendResponse(res, { status: 201, message: "Signup successful", data: { user: sanitizeUser(user, member), accessToken: tokens.accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { gymId, email, password, role } = req.body;
  const query = { gymId, email };
  if (role) query.role = role;

  const user = await User.findOne(query);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }
  
  let member = null;
  // If user is a member, check approval status
  if (user.role === "member") {
    member = await Member.findOne({ user: user._id });
    if (member && member.status === "inactive") {
      throw new AppError("Your account is inactive. Please contact admin.", 403, "ACCOUNT_INACTIVE");
    }
  }

  const tokens = toTokens(user);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();
  
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  sendResponse(res, { message: "Login successful", data: { user: sanitizeUser(user, member), accessToken: tokens.accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token required", 401, "REFRESH_TOKEN_REQUIRED");
  
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }
  
  const user = await User.findById(decoded.sub);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new AppError("Refresh token revoked", 401, "REFRESH_TOKEN_REVOKED");
  }
  
  const tokens = toTokens(user);
  user.refreshTokens = user.refreshTokens.slice(-4);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();
  
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  sendResponse(res, { message: "Token refreshed", data: { accessToken: tokens.accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token required for logout", 401, "REFRESH_TOKEN_REQUIRED");
  
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.clearCookie("refreshToken");
    return sendResponse(res, { message: "Logout successful", data: {} });
  }
  
  const user = await User.findById(decoded.sub);
  if (user) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    await user.save();
  }
  
  res.clearCookie("refreshToken");
  sendResponse(res, { message: "Logout successful", data: {} });
});

module.exports = { signup, login, refresh, logout };
