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

// GET all documents
app.get("/api/documents", async (req, res) => {
    try {
        let documents = await Document.find({});
        if (documents.length === 0) {
            // Auto-seed database if empty
            const seedData = [
                { desc: "This is the doc content you are seeing from MongoDB Atlas!", filesize: ".9mb", tag: { tagTitle: "MBBS", tagColor: "green" }},
                { desc: "This is the second doc content from MongoDB Atlas", filesize: "1.2mb", tag: { tagTitle: "Engineering", tagColor: "blue" }},
                { desc: "Another document loaded dynamically from the cloud", filesize: "0.5mb", tag: { tagTitle: "Download Now", tagColor: "sky" }}
            ];
            await Document.insertMany(seedData);
            documents = await Document.find({});
        }
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new document
app.post("/api/documents", async (req, res) => {
    try {
        const { desc, filesize, tag } = req.body;
        const newDoc = new Document({
            desc,
            filesize,
            tag,
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