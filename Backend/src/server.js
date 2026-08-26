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
                { desc: "Medical Research Notes & Patient Case Studies", filesize: ".9mb", collectionName: "Medical Research", tag: { tagTitle: "MBBS", tagColor: "green" }},
                { desc: "Frontend Architecture & API Documentation", filesize: "1.2mb", collectionName: "Engineering", tag: { tagTitle: "Engineering", tagColor: "blue" }},
                { desc: "General Project Notes and Ideas", filesize: "0.5mb", collectionName: "General", tag: { tagTitle: "Notes", tagColor: "sky" }}
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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});