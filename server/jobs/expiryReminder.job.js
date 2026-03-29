const cron = require("node-cron");
const Member = require("../models/member.model");
const Notification = require("../models/notification.model");

const startExpiryReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    const now = new Date();
    const inThreeDays = new Date(now);
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const expiring = await Member.find({
      membershipExpiryDate: { $gte: now, $lte: inThreeDays },
      isActivePlan: true
    });
    if (!expiring.length) return;
    await Notification.insertMany(
      expiring.map((m) => ({
        user: m.user,
        title: "Membership expiring soon",
        message: "Your membership will expire within 3 days.",
        type: "expiry"
      }))
    );
  });
};

module.exports = { startExpiryReminderJob };
