const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const Member = require("../models/member.model");

const seedData = async () => {
  const gymId = "MAIN";
  const adminEmail = "admin@gymza.com";
  
  // Check and seed admin
  const existingAdmin = await User.findOne({ gymId, email: adminEmail });
  if (!existingAdmin) {
    console.log(`Admin ${adminEmail} not found. Seeding initial admin...`);
    await User.create({ gymId, name: "Gym Admin", email: adminEmail, password: "Password123", role: "admin", phone: "1111111111" });
  }

  // Check and seed trainer
  const trainerEmail = "trainer@gymza.com";
  let trainer = await User.findOne({ gymId, email: trainerEmail });
  if (!trainer) {
    console.log(`Trainer ${trainerEmail} not found. Seeding...`);
    trainer = await User.create({ gymId, name: "Main Trainer", email: trainerEmail, password: "Password123", role: "trainer", phone: "2222222222" });
  }

  // Check and seed plans
  let plans = await Plan.find({ gymId });
  if (plans.length === 0) {
    console.log("No plans found. Seeding...");
    plans = await Plan.create([
      { gymId, name: "Monthly Pro", durationType: "monthly", price: 1200, features: ["Weights", "Cardio"] },
      { gymId, name: "Yearly Elite", durationType: "yearly", price: 12000, features: ["All Access"] }
    ]);
  }

  // Check and seed member
  const memberEmail = "member@gymza.com";
  let memberUser = await User.findOne({ gymId, email: memberEmail });
  if (!memberUser) {
    console.log(`Member ${memberEmail} not found. Seeding...`);
    memberUser = await User.create({
      gymId,
      name: "Demo Member",
      email: memberEmail,
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
      isActivePlan: true,
      status: "active",
      secretCode: Math.floor(100 + Math.random() * 900).toString()
    });
  }
  
  console.log("Auto-seed complete");
};

module.exports = { seedData };
