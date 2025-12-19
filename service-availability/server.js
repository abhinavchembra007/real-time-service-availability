const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.static("public"));

/* ---------------- DB ---------------- */
mongoose
  .connect("mongodb://127.0.0.1:27017/service_availability")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* ---------------- SCHEMAS ---------------- */

// OWNER / USER
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  facilityId: mongoose.Schema.Types.ObjectId
});
const User = mongoose.model("User", UserSchema);

// FACILITY
const FacilitySchema = new mongoose.Schema({
  name: String,
  type: String,
  ownerEmail: String,
  createdAt: { type: Date, default: Date.now }
});
const Facility = mongoose.model("Facility", FacilitySchema);

// SERVICE
const ServiceSchema = new mongoose.Schema({
  facilityId: mongoose.Schema.Types.ObjectId,
  name: String,

  status: {
    type: String,
    default: "Available"
  },

  reason: String,

  // 🔥 IMPORTANT FOR COUNTDOWN
  backInMinutes: Number,

  contact: String,

  // 🔥 REQUIRED FOR TIMER
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
const Service = mongoose.model("Service", ServiceSchema);

/* ---------------- REGISTER OWNER ---------------- */
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, facilityName, facilityType, services } = req.body;

    if (!email || !password || !facilityName || !facilityType) {
      return res.status(400).json({ error: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const facility = await Facility.create({
      name: facilityName,
      type: facilityType,
      ownerEmail: email
    });

    if (Array.isArray(services) && services.length > 0) {
      await Service.insertMany(
        services.map(s => ({
          facilityId: facility._id,
          name: s
        }))
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashed,
      facilityId: facility._id
    });

    res.json({ message: "Registration successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/api/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  res.json({
    message: "Login success",
    facilityId: user.facilityId
  });
});

/* ---------------- PUBLIC APIs ---------------- */

app.get("/api/facilities", async (req, res) => {
  res.json(await Facility.find());
});

app.get("/api/services/:facilityId", async (req, res) => {
  res.json(await Service.find({ facilityId: req.params.facilityId }));
});

/* ---------------- UPDATE SERVICE (OWNER) ---------------- */
app.put("/api/service/update/:id", async (req, res) => {
  const update = {
    status: req.body.status,
    reason: req.body.reason,
    contact: req.body.contact,

    // 🔥 THIS FIXES COUNTDOWN
    updatedAt: new Date()
  };

  // Only set minutes if provided
  if (req.body.backInMinutes !== null && req.body.backInMinutes !== undefined) {
    update.backInMinutes = Number(req.body.backInMinutes);
  }

  const updated = await Service.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );

  res.json(updated);
});

/* ---------------- AI REVIEW ---------------- */
app.get("/api/review/:facilityId", async (req, res) => {
  const services = await Service.find({
    facilityId: req.params.facilityId
  });

  const total = services.length;
  if (total === 0) return res.json(null);

  const available = services.filter(s => s.status === "Available").length;
  const delayed = services.filter(s => s.status === "Delayed").length;
  const down = services.filter(s => s.status === "Down").length;

  let rating = 5;
  let badge = "Excellent Reliability";
  let summary = "Highly reliable services with smooth operations.";

  if (down > total * 0.4) {
    rating = 2;
    badge = "Poor Reliability";
    summary = "Multiple services unavailable causing disruptions.";
  } else if (delayed > total * 0.3) {
    rating = 3;
    badge = "Average Reliability";
    summary = "Some services are delayed but manageable.";
  } else if (delayed > 0 || down > 0) {
    rating = 4;
    badge = "Good Reliability";
    summary = "Mostly reliable with occasional delays.";
  }

  res.json({
    rating,
    badge,
    summary,
    counts: { available, delayed, down }
  });
});

/* ---------------- SEED DATA (OPTIONAL) ---------------- */
app.get("/api/seed", async (req, res) => {
  try {
    await Facility.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({});

    const facility = await Facility.create({
      name: "ABC Hospital",
      type: "Hospital",
      ownerEmail: "demo@hospital.com"
    });

    await Service.insertMany([
      { facilityId: facility._id, name: "Reception", status: "Available" },
      { facilityId: facility._id, name: "ICU", status: "Delayed" },
      { facilityId: facility._id, name: "Billing", status: "Available" }
    ]);

    res.send("Seed data created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Seed failed");
  }
});

/* ---------------- START ---------------- */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});