const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const Member = require("../models/member.model");

const seedData = async () => {
  const gymId = "MAIN";
  const adminEmail = "admin@gymza.com";
  
  const existingAdmin = await User.findOne({ gymId, email: adminEmail });
  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists in Gym ${gymId}.`);
    return;
  }

  console.log(`Admin ${adminEmail} not found. Seeding initial data...`);
  
  const [admin, trainer] = await User.create([
    { gymId, name: "Gym Admin", email: adminEmail, password: "Password123", role: "admin", phone: "1111111111" },
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
  
  console.log("Auto-seed complete");
};

module.exports = { seedData };
