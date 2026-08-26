import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
}

// Document Schema
const documentSchema = new mongoose.Schema({
    desc: { type: String, required: true },
    filesize: { type: String, default: ".9mb" },
    collectionName: { type: String, default: "General" },
    tag: {
        isOpen: { type: Boolean, default: false },
        tagTitle: { type: String, default: "Notes" },
        tagColor: { type: String, default: "green" }
    }
}, { timestamps: true });

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

app.get("/", (req, res) => {
    res.json({ message: "iDOCS API is running" });
});

// GET documents (supports optional ?collectionName= query param)
app.get("/api/documents", async (req, res) => {
    try {
        await connectDB();
        const { collectionName } = req.query;
        let query = {};
        if (collectionName) query.collectionName = collectionName;

        let documents = await Document.find(query);

        // Auto-seed if empty
        if ((await Document.countDocuments({})) === 0) {
            const seedData = [
                { desc: "Medical Research Notes & Clinical Case Studies", filesize: ".9mb", collectionName: "Medical Research", tag: { tagTitle: "MBBS", tagColor: "green" }},
                { desc: "Frontend Architecture & System Guidelines", filesize: "1.2mb", collectionName: "Engineering", tag: { tagTitle: "Engineering", tagColor: "blue" }},
                { desc: "General Project Notes, Ideas & Daily Standup Log", filesize: "0.5mb", collectionName: "General", tag: { tagTitle: "General Notes", tagColor: "sky" }},
                { desc: "Design System UI Components, Tokens & Branding Assets", filesize: "1.8mb", collectionName: "Design System", tag: { tagTitle: "Design System", tagColor: "amber" }},
                { desc: "API Specifications, Endpoints & Authentication Guides", filesize: "1.1mb", collectionName: "API Specs & References", tag: { tagTitle: "API Specs", tagColor: "blue" }},
                { desc: "Project Notes & Sprint Archives Summary", filesize: "0.7mb", collectionName: "Project Notes", tag: { tagTitle: "Project Notes", tagColor: "green" }}
            ];
            await Document.insertMany(seedData);
            documents = await Document.find(query);
        }

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single document by ID
app.get("/api/documents/:id", async (req, res) => {
    try {
        await connectDB();
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Document not found" });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new document
app.post("/api/documents", async (req, res) => {
    try {
        await connectDB();
        const { desc, filesize, tag, collectionName } = req.body;
        const newDoc = new Document({
            desc,
            filesize,
            tag,
            collectionName: collectionName || "General"
        });
        const savedDoc = await newDoc.save();
        res.status(201).json(savedDoc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update document
app.put("/api/documents/:id", async (req, res) => {
    try {
        await connectDB();
        const { desc } = req.body;
        const updatedDoc = await Document.findByIdAndUpdate(
            req.params.id,
            { desc },
            { new: true }
        );
        res.json(updatedDoc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default app;
