# Gymza - SaaS Gym Management System (MERN)

Production-oriented gym management platform for real-world usage (admin/trainer/member), with modular backend and typed frontend.

## 🚀 Role-Based Features

### **1. Admin Dashboard**
The control center for gym owners to manage the entire facility.
- **Dashboard Overview:** Real-time statistics on total members, active subscriptions, total revenue, and active trainers.
- **Member Management:** 
    - Full CRUD (Create, Read, Update, Delete) operations for members.
    - **Approval Workflow:** Approve or discard new member signups.
    - **Unique IDs:** Automatic generation of unique 3-digit secret codes for every member (used for QR attendance).
    - **Search & Filter:** Find members instantly by name, email, phone, or status.
- **Trainer Management:** Manage the gym's professional staff, their specialties, and system access.
- **Plan & Subscription Management:**
    - Create and manage membership plans (Price, Duration, Features).
    - **Assign to Member:** Directly assign plans to members from the Plans section.
    - **Subscription Actions:** Renew, Freeze (Snowflake), Resume, or Cancel member plans.
- **Attendance System:**
    - **QR Generation:** View and download the official gym attendance QR code.
    - **Manual Logs:** Manually check-in members if they forget their code.
    - **Real-time Logs:** Track check-in and check-out times for every member.
- **Payments:** Record offline (cash) payments and view payment history for the entire gym.

### **2. Trainer Portal**
Focused on daily operations and member progress.
- **Member Tracking:** View the list of active members and their current plans.
- **Attendance Tracking:** Assist in marking member attendance.
- **Workout & Diet Plans:** Create and assign personalized workout and diet routines to members (viewable in the Member portal).

### **3. Member Portal**
A mobile-friendly experience for gym members.
- **Profile Dashboard:** View current membership plan, expiry date, and personal 3-digit Secret Code.
- **QR Attendance:** 
    - Scan the gym's QR code to open a dedicated attendance page.
    - Enter the 3-digit secret code to **Check-In** or **Check-Out**.
- **Access Control:** Automatic redirection to status pages if the account is `Pending`, `Inactive`, `Expired`, or `Frozen`.
- **Workout Access:** View workout routines and diet plans assigned by their trainer.

---

## 🛠️ Technical Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Redis, Socket.IO
- **Frontend:** React (Vite), TypeScript, Zustand, Axios
- **Icons:** Lucide-React
- **UI Design:** Glassmorphism theme with Dark/Light mode support.

## 🏁 Run Locally

### 1) Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 2) Seed data (optional)
```bash
cd server
npm run seed
```
**Default users after seed:**
- `admin@gymza.com` / `Password123`
- `trainer@gymza.com` / `Password123`
- `member@gymza.com` / `Password123`

### 3) Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

---

## 🏗️ Core Logic & Workflows

### **QR Attendance Flow**
1. Admin prints the QR code from the **Attendance** section and places it at the entrance.
2. Member scans the QR → opens `https://your-app.com/mark-attendance`.
3. Member enters their unique 3-digit code and clicks **Check-In**.
4. At the end of the workout, member scans again and clicks **Check-Out**.
5. Admin sees the exact entry/exit times in the dashboard logs.

### **Subscription Logic**
- Members are automatically restricted from the system if their payment status is `pending` or their plan has `expired`.
- **Freezing:** Admins can "Freeze" a plan (e.g., if a member is on vacation). This stops the expiry countdown and restricts access until resumed.

### **Security Hardening**
- **JWT Authentication:** Secure access with Refresh Tokens stored in `HttpOnly` cookies.
- **Role Protection:** Middleware ensures members cannot access Admin APIs and vice versa.
- **Multi-Tenant Ready:** Support for multiple gyms using the `gymId` (default: `MAIN`).

## 📈 Production Notes
- Add request validation (Zod middleware) before public release.
- Configure HTTPS and reverse proxy for secure production traffic.
- Configure Cloudinary or local storage for member profile photos.
