const Member = require("../models/member.model");
const Payment = require("../models/payment.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getCache, setCache } = require("../services/cache.service");

const getStats = asyncHandler(async (req, res) => {
  const cacheKey = `dashboard:stats:${req.gymId}`;
  const cached = await getCache(cacheKey);
  if (cached) return sendResponse(res, { message: "Dashboard stats fetched (cache)", data: cached });
  const [totalMembers, activePlans, revenueObj] = await Promise.all([
    Member.countDocuments({ gymId: req.gymId }),
    Member.countDocuments({ gymId: req.gymId, isActivePlan: true }),
    Payment.aggregate([{ $match: { gymId: req.gymId, status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
  ]);
  const data = { totalMembers, activePlans, revenue: revenueObj[0]?.total || 0 };
  await setCache(cacheKey, data, 30);
  sendResponse(res, { message: "Dashboard stats fetched", data });
});

module.exports = { getStats };
