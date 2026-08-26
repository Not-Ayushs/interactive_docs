import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Document from "./models/Document.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "API is running",
    });
});

app.get("/dashboard", (req, res) => {
  res.redirect("http://localhost:5173");
});

// GET documents (supports optional ?collectionName= query param)
app.get("/api/documents", async (req, res) => {
    try {
        const { collectionName } = req.query;
        let query = {};
        if (collectionName) {
            query.collectionName = collectionName;
        }

        let documents = await Document.find(query);
        
        // Auto-seed database if completely empty
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

// GET a single document by ID
app.get("/api/documents/:id", async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Document not found" });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new document
app.post("/api/documents", async (req, res) => {
    try {
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

// PUT (update) an existing document
app.put("/api/documents/:id", async (req, res) => {
    try {
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

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

export default app;