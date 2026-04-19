const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const Member = require("../models/member.model");
const WorkoutPlan = require("../models/workout.model");
const DietPlan = require("../models/diet.model");
const Payment = require("../models/payment.model");
const mongoose = require("mongoose");

const seedData = async () => {
  const gymId = "MAIN";
  
  // Clear all data from collections
  console.log("Clearing database...");
  try {
    await Promise.all([
      User.deleteMany({}),
      Plan.deleteMany({}),
      Member.deleteMany({}),
      WorkoutPlan.deleteMany({}),
      DietPlan.deleteMany({}),
      Payment.deleteMany({})
    ]);
    console.log("Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing database:", error.message);
  }
  
  // Seed admin
  console.log("Creating admin...");
  const admin = await User.create({ 
    gymId, 
    name: "Admin User", 
    email: "admin@gymza.com", 
    password: "Password123", 
    role: "admin", 
    phone: "1111111111" 
  });

  // Seed trainers
  console.log("Creating trainers...");
  const trainer1 = await User.create({ 
    gymId, 
    name: "Trainer John", 
    email: "john@gymza.com", 
    password: "Password123", 
    role: "trainer", 
    phone: "2222222221",
    specialty: "Bodybuilding"
  });

  const trainer2 = await User.create({ 
    gymId, 
    name: "Trainer Sarah", 
    email: "sarah@gymza.com", 
    password: "Password123", 
    role: "trainer", 
    phone: "2222222222",
    specialty: "Yoga & Cardio"
  });

  // Seed plans
  console.log("Creating plans...");
  const planMonthly = await Plan.create({ gymId, name: "Monthly Pro", duration: 30, price: 1200, features: ["Gym Access", "Locker Room", "Cardio Area"] });
  const planYearly = await Plan.create({ gymId, name: "Yearly Elite", duration: 365, price: 10000, features: ["All Access", "Free Trainer Consultation", "Sauna"] });
  const planQuarterly = await Plan.create({ gymId, name: "Quarterly Starter", duration: 90, price: 3000, features: ["Gym Access", "Cardio Area"] });

  // Seed Workout Templates
  console.log("Creating workout templates...");
  const workoutTemplate = await WorkoutPlan.create({
    gymId,
    name: "Muscle Gain Basic",
    goal: "Muscle Gain",
    difficulty: "Beginner",
    isTemplate: true,
    createdBy: trainer1._id,
    days: [
      {
        dayName: "Day 1: Chest & Triceps",
        exercises: [
          { name: "Bench Press", sets: 3, reps: "10-12", rest: "90s" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" },
          { name: "Tricep Pushdowns", sets: 3, reps: "15", rest: "45s" }
        ]
      },
      {
        dayName: "Day 2: Back & Biceps",
        exercises: [
          { name: "Pull Ups", sets: 3, reps: "8-10", rest: "90s" },
          { name: "Seated Cable Rows", sets: 3, reps: "12", rest: "60s" },
          { name: "Barbell Curls", sets: 3, reps: "12", rest: "60s" }
        ]
      }
    ]
  });

  await WorkoutPlan.create([
    {
      gymId,
      name: "Fat Loss Express",
      goal: "Fat Loss",
      difficulty: "Beginner",
      isTemplate: true,
      createdBy: trainer2._id,
      days: [
        {
          dayName: "Full Body Circuit",
          exercises: [
            { name: "Bodyweight Squats", sets: 4, reps: "20", rest: "30s" },
            { name: "Push Ups", sets: 4, reps: "15", rest: "30s" },
            { name: "Mountain Climbers", sets: 4, reps: "30s", rest: "30s" },
            { name: "Plank", sets: 4, reps: "45s", rest: "30s" }
          ]
        }
      ]
    },
    {
      gymId,
      name: "Strength & Power",
      goal: "Strength",
      difficulty: "Advanced",
      isTemplate: true,
      createdBy: trainer1._id,
      days: [
        {
          dayName: "Heavy Lower Body",
          exercises: [
            { name: "Back Squat", sets: 5, reps: "5", rest: "180s" },
            { name: "Deadlift", sets: 3, reps: "3", rest: "240s" },
            { name: "Leg Press", sets: 3, reps: "8", rest: "120s" }
          ]
        }
      ]
    }
  ]);

  // Seed Diet Templates
  console.log("Creating diet templates...");
  const dietTemplate = await DietPlan.create({
    gymId,
    name: "High Protein Bulking",
    goal: "Muscle Gain",
    calories: 3000,
    isTemplate: true,
    createdBy: trainer1._id,
    meals: {
      breakfast: [{ foodName: "Oats with Milk", quantity: "1 bowl", calories: 400, protein: 15, carbs: 60, fat: 10 }],
      lunch: [{ foodName: "Chicken Breast with Rice", quantity: "200g + 150g", calories: 700, protein: 50, carbs: 80, fat: 15 }],
      dinner: [{ foodName: "Salmon with Asparagus", quantity: "150g", calories: 500, protein: 40, carbs: 10, fat: 25 }],
      snacks: [{ foodName: "Protein Shake", quantity: "1 scoop", calories: 150, protein: 25, carbs: 5, fat: 2 }]
    }
  });

  await DietPlan.create([
    {
      gymId,
      name: "Keto Lean Diet",
      goal: "Weight Loss",
      calories: 1800,
      isTemplate: true,
      createdBy: trainer2._id,
      meals: {
        breakfast: [{ foodName: "Scrambled Eggs with Avocado", quantity: "3 eggs + 1/2 avocado", calories: 450, protein: 20, carbs: 5, fat: 35 }],
        lunch: [{ foodName: "Beef Salad", quantity: "200g beef", calories: 500, protein: 45, carbs: 10, fat: 30 }],
        dinner: [{ foodName: "Grilled Mackerel", quantity: "200g", calories: 600, protein: 35, carbs: 0, fat: 45 }],
        snacks: [{ foodName: "Almonds", quantity: "30g", calories: 250, protein: 6, carbs: 6, fat: 22 }]
      }
    },
    {
      gymId,
      name: "Balanced Maintenance",
      goal: "Maintenance",
      calories: 2200,
      isTemplate: true,
      createdBy: trainer2._id,
      meals: {
        breakfast: [{ foodName: "Greek Yogurt with Berries", quantity: "200g", calories: 300, protein: 20, carbs: 30, fat: 5 }],
        lunch: [{ foodName: "Turkey Sandwich", quantity: "1 whole", calories: 550, protein: 35, carbs: 50, fat: 15 }],
        dinner: [{ foodName: "Lentil Soup", quantity: "2 bowls", calories: 400, protein: 25, carbs: 60, fat: 5 }],
        snacks: [{ foodName: "Apple with Peanut Butter", quantity: "1 apple + 2tbsp", calories: 300, protein: 8, carbs: 35, fat: 16 }]
      }
    }
  ]);

  // Seed Members
  console.log("Creating members...");
  const createMemberWithData = async (name, email, phone, status, paymentStatus, plan, trainer, daysLeft = 30) => {
    const user = await User.create({
      gymId,
      name,
      email,
      password: "Password123",
      role: "member",
      phone,
      status: status === "inactive" ? "inactive" : "active"
    });

    const member = await Member.create({
      gymId,
      user: user._id,
      trainer: trainer?._id || null,
      currentPlan: plan._id,
      membershipStartDate: new Date(Date.now() - (30 - daysLeft) * 24 * 60 * 60 * 1000),
      membershipExpiryDate: new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000),
      isActivePlan: paymentStatus === "paid" && daysLeft > 0,
      status,
      paymentStatus,
      secretCode: Math.floor(100 + Math.random() * 900).toString()
    });

    // Create a payment for the member
    if (paymentStatus === "paid") {
      await Payment.create({
        gymId,
        member: member._id,
        plan: plan._id,
        amount: plan.price,
        method: "cash",
        status: "paid",
        invoiceNumber: `INV-${Date.now()}-${member.secretCode}`,
        invoice: { memberName: name, planName: plan.name, amount: plan.price }
      });
    }

    return member;
  };

  const member1 = await createMemberWithData("Alice Smith", "alice@test.com", "9998887771", "active", "paid", planMonthly, trainer1, 15);
  const member2 = await createMemberWithData("Bob Johnson", "bob@test.com", "9998887772", "active", "paid", planYearly, trainer2, 330);
  const member3 = await createMemberWithData("Charlie Brown", "charlie@test.com", "9998887773", "pending", "pending", planMonthly, null, 0);
  const member4 = await createMemberWithData("Diana Prince", "diana@test.com", "9998887774", "expired", "paid", planQuarterly, trainer1, -5);
  const member5 = await createMemberWithData("Eve Adams", "eve@test.com", "9998887775", "active", "pending", planMonthly, trainer2, 20);

  // Assign personalized workout and diet to Alice
  console.log("Assigning personalized plans to members...");
  await WorkoutPlan.create({
    ...workoutTemplate.toObject(),
    _id: new mongoose.Types.ObjectId(),
    name: `Alice's Custom Plan`,
    isTemplate: false,
    assignedTo: member1._id,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await DietPlan.create({
    ...dietTemplate.toObject(),
    _id: new mongoose.Types.ObjectId(),
    name: `Alice's Personalized Diet`,
    isTemplate: false,
    assignedTo: member1._id,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log("\n========================================");
  console.log("Database seed complete!");
  console.log("Total Users:", await User.countDocuments());
  console.log("Total Plans:", await Plan.countDocuments());
  console.log("Total Members:", await Member.countDocuments());
  console.log("Total Workout Plans:", await WorkoutPlan.countDocuments());
  console.log("Total Diet Plans:", await DietPlan.countDocuments());
  console.log("Total Payments:", await Payment.countDocuments());
  console.log("========================================\n");
};

module.exports = { seedData };
