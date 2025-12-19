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
  status: { type: String, default: "Available" },
  reason: String,
  expectedTime: String,
  contact: String,
  updatedAt: Date
});
const Service = mongoose.model("Service", ServiceSchema);

/* ---------------- REGISTER OWNER ---------------- */
app.post("/api/register", async (req, res) => {
  try {
    const {
      email,
      password,
      facilityName,
      facilityType,
      services
    } = req.body;

    if (!email || !password || !facilityName || !facilityType) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create facility
    const facility = await Facility.create({
      name: facilityName,
      type: facilityType,
      ownerEmail: email
    });

    // Create services
    if (services && services.length > 0) {
      const serviceDocs = services.map(s => ({
        facilityId: facility._id,
        name: s
      }));
      await Service.insertMany(serviceDocs);
    }

    // Create owner
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

/* ---------------- OWNER UPDATE SERVICE ---------------- */

app.put("/api/service/update/:id", async (req, res) => {
  const updated = await Service.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      reason: req.body.reason,
      expectedTime: req.body.expectedTime,
      contact: req.body.contact,
      updatedAt: new Date()
    },
    { new: true }
  );
  res.json(updated);
});

/* ---------------- START ---------------- */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});