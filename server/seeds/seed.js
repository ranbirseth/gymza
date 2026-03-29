require("dotenv").config();
const { connectDb } = require("../config/db");
const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const Member = require("../models/member.model");

const run = async () => {
  const gymId = "MAIN";
  await connectDb();
  await Promise.all([User.deleteMany({}), Plan.deleteMany({}), Member.deleteMany({})]);
  const [admin, trainer] = await User.create([
    { gymId, name: "Gym Admin", email: "admin@gymza.com", password: "Password123", role: "admin", phone: "1111111111" },
    { gymId, name: "Main Trainer", email: "trainer@gymza.com", password: "Password123", role: "trainer", phone: "2222222222" }
  ]);
  const plans = await Plan.create([
    { gymId, name: "Monthly Pro", durationType: "monthly", price: 1200, features: ["Weights", "Cardio"] },
    { gymId, name: "Yearly Elite", durationType: "yearly", price: 12000, features: ["All Access"] }
  ]);
  const memberUser = await User.create({
    gymId,
    name: "Demo Member",
    email: "member@gymza.com",
    password: "Password123",
    role: "member",
    phone: "3333333333"
  });
  await Member.create({
    gymId,
    user: memberUser._id,
    trainer: trainer._id,
    currentPlan: plans[0]._id,
    membershipStartDate: new Date(),
    membershipExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActivePlan: true
  });
  console.log("Seed complete");
  process.exit(0);
};

run();
