const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

/* ---------------- DB ---------------- */
mongoose.connect("mongodb://127.0.0.1:27017/service_availability")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* ---------------- SCHEMAS ---------------- */

// Admin
const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String
});
const Admin = mongoose.model("Admin", AdminSchema);

// Facility
const FacilitySchema = new mongoose.Schema({
  name: String,
  type: String
});
const Facility = mongoose.model("Facility", FacilitySchema);

// Service
const ServiceSchema = new mongoose.Schema({
  facilityId: mongoose.Schema.Types.ObjectId,
  name: String,
  status: { type: String, default: "Available" },
  reason: String,
  expectedTime: String,
  contact: String,
  updatedAt: Date
});
const Service = mongoose.model("Service", ServiceSchema);

/* ---------------- AUTH ---------------- */

// Register admin (one time)
app.post("/api/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const admin = await Admin.create({
      email: req.body.email,
      password: hashed
    });
    res.json({ message: "Admin registered" });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login admin
app.post("/api/login", async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(req.body.password, admin.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ message: "Login success" });
});

/* ---------------- USER APIs ---------------- */

app.get("/api/facilities", async (req, res) => {
  res.json(await Facility.find());
});

app.get("/api/services/:facilityId", async (req, res) => {
  res.json(await Service.find({ facilityId: req.params.facilityId }));
});

/* ---------------- ADMIN APIs ---------------- */

// Add facility
app.post("/api/facilities", async (req, res) => {
  res.json(await Facility.create(req.body));
});

// Add service
app.post("/api/services", async (req, res) => {
  res.json(await Service.create(req.body));
});

// Update service status
app.put("/api/services/:id", async (req, res) => {
  const update = {
    ...req.body,
    updatedAt: new Date()
  };
  res.json(await Service.findByIdAndUpdate(req.params.id, update, { new: true }));
});

// Delete service
app.delete("/api/services/:id", async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ---------------- SEED ---------------- */
app.get("/api/seed", async (req, res) => {
  await Facility.deleteMany({});
  await Service.deleteMany({});

  const campus = await Facility.create({ name: "ABC Campus", type: "Campus" });

  await Service.insertMany([
    { facilityId: campus._id, name: "IT Lab 1" },
    { facilityId: campus._id, name: "Cafeteria" }
  ]);

  res.send("Seeded");
});

/* ---------------- START ---------------- */
app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);