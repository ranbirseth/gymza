const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const Member = require("../models/member.model");
const mongoose = require("mongoose");

const seedData = async () => {
  const gymId = "MAIN";
  
  // Clear all data from collections by dropping indexes and clearing data
  console.log("Clearing database...");
  try {
    // Drop indexes first
    await User.collection.dropIndexes().catch(() => {});
    await Plan.collection.dropIndexes().catch(() => {});
    await Member.collection.dropIndexes().catch(() => {});
    
    // Then delete all documents
    await User.deleteMany({});
    await Plan.deleteMany({});
    await Member.deleteMany({});
    
    console.log("Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing database:", error.message);
  }
  
  // Seed admin
  const adminEmail = "admin@gymza.com";
  console.log(`Creating admin user: ${adminEmail}...`);
  const admin = await User.create({ 
    gymId, 
    name: "Gym Admin", 
    email: adminEmail, 
    password: "Password123", 
    role: "admin", 
    phone: "1111111111" 
  });
  console.log("✓ Admin created");

  // Seed trainer
  const trainerEmail = "trainer@gymza.com";
  console.log(`Creating trainer user: ${trainerEmail}...`);
  const trainer = await User.create({ 
    gymId, 
    name: "Main Trainer", 
    email: trainerEmail, 
    password: "Password123", 
    role: "trainer", 
    phone: "2222222222" 
  });
  console.log("✓ Trainer created");

  // Seed plans
  console.log("Creating plans...");
  const plans = await Plan.create([
    { gymId, name: "Monthly Pro", duration: 30, price: 1200, features: ["Weights", "Cardio"] },
    { gymId, name: "Yearly Elite", duration: 365, price: 12000, features: ["All Access"] }
  ]);
  console.log("✓ Plans created");

  // Seed member
  const memberEmail = "member@gymza.com";
  console.log(`Creating member user: ${memberEmail}...`);
  const memberUser = await User.create({
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
  console.log("✓ Member created");
  
  console.log("\n========================================");
  console.log("Database seed complete!");
  console.log("========================================\n");
};

module.exports = { seedData };
