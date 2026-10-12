import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Document from "./models/Document.js";
import User from "./models/user.js";
import KanbanCard from "./models/KanbanCard.js";
import CollectionShare from "./models/CollectionShare.js";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { protect } from "./middleware/authMiddleware.js";
import { initSocket, getIO } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server);

connectDB();

// General API rate limiter (protects against DoS / brute-force scraping)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 1000, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
});

// Stricter rate limiter specifically for Auth routes (signup / signin)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login/signup attempts from this IP, please try again after 15 minutes" },
});

app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, origin); 
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get("/", (req, res) => {
    res.json({
        message: "iDOCS API is running with Real-Time WebSockets enabled",
    });
});

app.get("/dashboard", (req, res) => {
  res.redirect("http://localhost:5173");
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "defaultsecret", {
    expiresIn: "30d",
  });
};

// ==========================================
// AUTH ROUTES
// ==========================================

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email: email.toLowerCase().trim(), password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/signin
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/search (Search registered users to share with)
app.get("/api/users/search", protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const regex = new RegExp(q.trim(), "i");
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ email: regex }, { name: regex }]
    })
      .select("_id name email")
      .limit(8);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ACCESS HELPER FUNCTIONS
// ==========================================

const buildDocumentQuery = async (userId, userEmail, collectionName = null) => {
  // Find collections shared with the user
  const sharedCollections = await CollectionShare.find({
    $or: [
      { "collaborators.user": userId },
      { "collaborators.email": userEmail.toLowerCase() },
    ],
  }).select("collectionName");

  const sharedCollectionNames = sharedCollections.map((sc) => sc.collectionName);

  const baseOr = [
    { userId: userId },
    { "collaborators.user": userId },
    { "collaborators.email": userEmail.toLowerCase() },
  ];

  if (sharedCollectionNames.length > 0) {
    baseOr.push({ collectionName: { $in: sharedCollectionNames } });
  }

  if (collectionName) {
    return {
      $and: [
        { $or: baseOr },
        { collectionName },
      ],
    };
  }

  return { $or: baseOr };
};

const hasDocAccess = async (doc, user) => {
  if (!doc) return false;
  const docUserId = (doc.userId?._id || doc.userId).toString();
  if (docUserId === user._id.toString()) return true;

  const isCollab = doc.collaborators?.some((c) =>
    (c.user && c.user.toString() === user._id.toString()) ||
    (c.email && c.email.toLowerCase() === user.email.toLowerCase())
  );
  if (isCollab) return true;

  if (doc.collectionName) {
    const colShare = await CollectionShare.findOne({
      collectionName: doc.collectionName,
      $or: [
        { "collaborators.user": user._id },
        { "collaborators.email": user.email.toLowerCase() },
      ],
    });
    if (colShare) return true;
  }

  return false;
};

// ==========================================
// DOCUMENT ROUTES
// ==========================================

// GET documents (supports optional ?collectionName= query param)
app.get("/api/documents", protect, async (req, res) => {
  try {
    const { collectionName } = req.query;
    const query = await buildDocumentQuery(req.user._id, req.user.email, collectionName);

    const documents = await Document.find(query)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email")
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single document by ID
app.get("/api/documents/:id", protect, async (req, res) => {
  try {
    let doc = await Document.findById(req.params.id)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email");

    // Auto-fix for legacy Kanban cards that don't have a linked Document yet
    if (!doc) {
      const card = await KanbanCard.findOne({
        _id: req.params.id,
        $or: [
          { userId: req.user._id },
          { "collaborators.user": req.user._id },
          { "collaborators.email": req.user.email.toLowerCase() },
        ],
      });

      if (card) {
        doc = await Document.create({
          _id: card._id,
          userId: card.userId,
          title: card.title,
          desc: card.desc,
          collectionName: card.collectionName || "General",
          docType: card.docType || "text",
          collaborators: card.collaborators || [],
          isCollaborative: card.isCollaborative || false,
        });

        doc = await Document.findById(doc._id)
          .populate("userId", "name email")
          .populate("collaborators.user", "name email");
      } else {
        return res.status(404).json({ message: "Document not found or unauthorized" });
      }
    }

    const permitted = await hasDocAccess(doc, req.user);
    if (!permitted) {
      return res.status(403).json({ message: "You do not have access to this document" });
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new document
app.post("/api/documents", protect, async (req, res) => {
  try {
    const { desc, filesize, tag, collectionName, docType, title } = req.body;

    const chosenCollection = collectionName || "General";

    // If this collection is shared, inherit the collaborators
    const colShare = await CollectionShare.findOne({
      collectionName: chosenCollection,
      owner: req.user._id,
    });

    const collaborators = colShare?.collaborators?.map((c) => ({
      user: c.user,
      email: c.email,
      name: c.name,
      role: c.role || "editor",
    })) || [];

    const isCollaborative = collaborators.length > 0;

    const newDoc = new Document({
      userId: req.user._id,
      title: title || (tag && tag.tagTitle) || "Untitled Document",
      desc: desc || "",
      filesize: filesize || "0.1 MB",
      tag,
      docType: docType || "text",
      collectionName: chosenCollection,
      collaborators,
      isCollaborative,
    });
    const savedDoc = await newDoc.save();

    // Sync with KanbanCard
    await KanbanCard.create({
      _id: savedDoc._id,
      userId: req.user._id,
      title: savedDoc.title,
      desc: savedDoc.desc,
      status: "User story",
      order: 0,
      docType: savedDoc.docType,
      collectionName: savedDoc.collectionName,
      collaborators,
      isCollaborative,
    });

    const populatedDoc = await Document.findById(savedDoc._id)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email");

    res.status(201).json(populatedDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) an existing document
app.put("/api/documents/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const permitted = await hasDocAccess(doc, req.user);
    if (!permitted) {
      return res.status(403).json({ message: "Unauthorized to edit this document" });
    }

    const { desc, canvasData, title, collectionName, tag } = req.body;
    if (desc !== undefined) doc.desc = desc;
    if (canvasData !== undefined) doc.canvasData = canvasData;
    if (title !== undefined) doc.title = title;
    if (collectionName !== undefined) doc.collectionName = collectionName;
    if (tag !== undefined) doc.tag = tag;

    const updatedDoc = await doc.save();

    // Sync title & desc with KanbanCard
    await KanbanCard.findByIdAndUpdate(req.params.id, {
      ...(title !== undefined && { title }),
      ...(desc !== undefined && { desc }),
      ...(collectionName !== undefined && { collectionName }),
    });

    const populatedDoc = await Document.findById(updatedDoc._id)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email");

    res.json(populatedDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a document
app.delete("/api/documents/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Only original owner can delete
    const isOwner = (doc.userId?._id || doc.userId).toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: "Only the original owner can delete this document" });
    }

    await Document.findByIdAndDelete(req.params.id);
    await KanbanCard.findByIdAndDelete(req.params.id);

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// COLLABORATION & SHARING ROUTES
// ==========================================

// POST /api/documents/:id/share (Share document with a partner by email)
app.post("/api/documents/:id/share", protect, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Partner email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({ message: "You cannot share a document with yourself" });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isOwner = (doc.userId?._id || doc.userId).toString() === req.user._id.toString();
    const isCollabEditor = doc.collaborators?.some(
      (c) =>
        (c.user && c.user.toString() === req.user._id.toString()) ||
        (c.email && c.email.toLowerCase() === req.user.email.toLowerCase())
    );

    if (!isOwner && !isCollabEditor) {
      return res.status(403).json({ message: "Unauthorized to share this document" });
    }

    // Find if partner is an existing user
    const partnerUser = await User.findOne({ email: cleanEmail });

    // Check if partner is already a collaborator
    const existingIndex = doc.collaborators.findIndex(
      (c) => c.email.toLowerCase() === cleanEmail
    );

    if (existingIndex >= 0) {
      doc.collaborators[existingIndex].role = role || "editor";
      if (partnerUser && !doc.collaborators[existingIndex].user) {
        doc.collaborators[existingIndex].user = partnerUser._id;
        doc.collaborators[existingIndex].name = partnerUser.name;
      }
    } else {
      doc.collaborators.push({
        user: partnerUser ? partnerUser._id : null,
        email: cleanEmail,
        name: partnerUser ? partnerUser.name : cleanEmail.split("@")[0],
        role: role || "editor",
        addedAt: new Date(),
      });
    }

    doc.isCollaborative = true;
    await doc.save();

    // Also update KanbanCard
    await KanbanCard.findByIdAndUpdate(req.params.id, {
      collaborators: doc.collaborators,
      isCollaborative: true,
    });

    const updatedDoc = await Document.findById(doc._id)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email");

    // Real-time socket notification to partner if online
    const io = getIO();
    if (io && partnerUser) {
      io.to(`user:${partnerUser._id}`).emit("document-shared", {
        doc: updatedDoc,
        sharedBy: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      });
    }

    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/documents/:id/collaborators/:email (Remove a collaborator)
app.delete("/api/documents/:id/collaborators/:email", protect, async (req, res) => {
  try {
    const { email } = req.params;
    const cleanEmail = email.toLowerCase().trim();

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isOwner = (doc.userId?._id || doc.userId).toString() === req.user._id.toString();
    const isSelfLeaving = req.user.email.toLowerCase() === cleanEmail;

    if (!isOwner && !isSelfLeaving) {
      return res.status(403).json({ message: "Only the original owner can remove other collaborators" });
    }

    doc.collaborators = doc.collaborators.filter(
      (c) => c.email.toLowerCase() !== cleanEmail
    );

    if (doc.collaborators.length === 0) {
      doc.isCollaborative = false;
    }

    await doc.save();

    // Sync with KanbanCard
    await KanbanCard.findByIdAndUpdate(req.params.id, {
      collaborators: doc.collaborators,
      isCollaborative: doc.isCollaborative,
    });

    const updatedDoc = await Document.findById(doc._id)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email");

    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/collections/:collectionName/share (Share an entire collection)
app.post("/api/collections/:collectionName/share", protect, async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Partner email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({ message: "Cannot share collection with yourself" });
    }

    const partnerUser = await User.findOne({ email: cleanEmail });

    let colShare = await CollectionShare.findOne({
      collectionName,
      owner: req.user._id,
    });

    if (!colShare) {
      colShare = new CollectionShare({
        collectionName,
        owner: req.user._id,
        collaborators: [],
      });
    }

    const existingIndex = colShare.collaborators.findIndex(
      (c) => c.email.toLowerCase() === cleanEmail
    );

    if (existingIndex >= 0) {
      colShare.collaborators[existingIndex].role = role || "editor";
      if (partnerUser) {
        colShare.collaborators[existingIndex].user = partnerUser._id;
        colShare.collaborators[existingIndex].name = partnerUser.name;
      }
    } else {
      colShare.collaborators.push({
        user: partnerUser ? partnerUser._id : null,
        email: cleanEmail,
        name: partnerUser ? partnerUser.name : cleanEmail.split("@")[0],
        role: role || "editor",
        addedAt: new Date(),
      });
    }

    await colShare.save();

    // Sync all existing documents and kanban cards in this collection
    await Document.updateMany(
      { collectionName, userId: req.user._id },
      {
        $addToSet: {
          collaborators: {
            user: partnerUser ? partnerUser._id : null,
            email: cleanEmail,
            name: partnerUser ? partnerUser.name : cleanEmail.split("@")[0],
            role: role || "editor",
          },
        },
        $set: { isCollaborative: true },
      }
    );

    await KanbanCard.updateMany(
      { collectionName, userId: req.user._id },
      {
        $addToSet: {
          collaborators: {
            user: partnerUser ? partnerUser._id : null,
            email: cleanEmail,
            name: partnerUser ? partnerUser.name : cleanEmail.split("@")[0],
            role: role || "editor",
          },
        },
        $set: { isCollaborative: true },
      }
    );

    const populatedShare = await CollectionShare.findById(colShare._id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    // Real-time notification to partner
    const io = getIO();
    if (io && partnerUser) {
      io.to(`user:${partnerUser._id}`).emit("collection-shared", {
        collectionName,
        sharedBy: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      });
    }

    res.json(populatedShare);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/collections/shares (List shared collections for current user)
app.get("/api/collections/shares", protect, async (req, res) => {
  try {
    const shares = await CollectionShare.find({
      $or: [
        { owner: req.user._id },
        { "collaborators.user": req.user._id },
        { "collaborators.email": req.user.email.toLowerCase() },
      ],
    })
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.json(shares);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET export a collection to markdown
app.get("/api/collections/:collectionName/export", protect, async (req, res) => {
  try {
    const { collectionName } = req.params;
    const query = await buildDocumentQuery(req.user._id, req.user.email, collectionName);
    const documents = await Document.find(query);

    let markdownString = `# Collection: ${collectionName}\n*Generated by iDOCS*\n\n---\n\n`;

    if (documents.length === 0) {
      markdownString += `*This collection is currently empty.*\n`;
    } else {
      documents.forEach((doc) => {
        markdownString += `## Title: ${doc.title || doc.tag?.tagTitle || "Untitled"}\n`;
        if (doc.createdAt) {
          markdownString += `**Created at:** ${new Date(doc.createdAt).toLocaleDateString()}\n\n`;
        }
        markdownString += `${doc.desc || ""}\n\n`;
        markdownString += `---\n\n`;
      });
    }

    res.json({ markdown: markdownString });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// KANBAN ROUTES
// ==========================================

// GET kanban cards (supports optional ?collectionName= query param)
app.get("/api/kanban", protect, async (req, res) => {
  try {
    const { collectionName } = req.query;
    const query = await buildDocumentQuery(req.user._id, req.user.email, collectionName);

    const cards = await KanbanCard.find(query)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email")
      .sort({ order: 1 });

    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new kanban card
app.post("/api/kanban", protect, async (req, res) => {
  try {
    const { title, desc, status, order, collectionName, docType } = req.body;
    const chosenCollection = collectionName || "General";

    // Check if collection is shared
    const colShare = await CollectionShare.findOne({
      collectionName: chosenCollection,
      owner: req.user._id,
    });

    const collaborators = colShare?.collaborators?.map((c) => ({
      user: c.user,
      email: c.email,
      name: c.name,
      role: c.role || "editor",
    })) || [];

    const isCollaborative = collaborators.length > 0;

    const newCard = new KanbanCard({
      userId: req.user._id,
      title: title || "New Card",
      desc: desc || "",
      status: status || "User story",
      order: order || 0,
      collectionName: chosenCollection,
      docType: docType || "text",
      collaborators,
      isCollaborative,
    });
    const savedCard = await newCard.save();

    // Create corresponding Document
    await Document.create({
      _id: savedCard._id,
      userId: req.user._id,
      title: savedCard.title,
      desc: savedCard.desc,
      collectionName: savedCard.collectionName,
      docType: savedCard.docType,
      collaborators,
      isCollaborative,
    });

    const populatedCard = await KanbanCard.findById(savedCard._id)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email");

    res.status(201).json(populatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) an existing kanban card
app.put("/api/kanban/:id", protect, async (req, res) => {
  try {
    const card = await KanbanCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const permitted = await hasDocAccess(card, req.user);
    if (!permitted) {
      return res.status(403).json({ message: "Unauthorized to update card" });
    }

    const { title, desc, status, order } = req.body;
    if (title !== undefined) card.title = title;
    if (desc !== undefined) card.desc = desc;
    if (status !== undefined) card.status = status;
    if (order !== undefined) card.order = order;

    const updatedCard = await card.save();

    // Also sync title & desc with Document if changed
    if (title !== undefined || desc !== undefined) {
      await Document.findByIdAndUpdate(req.params.id, {
        ...(title !== undefined && { title }),
        ...(desc !== undefined && { desc }),
      });
    }

    const populatedCard = await KanbanCard.findById(updatedCard._id)
      .populate("userId", "name email")
      .populate("collaborators.user", "name email");

    res.json(populatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a kanban card
app.delete("/api/kanban/:id", protect, async (req, res) => {
  try {
    const card = await KanbanCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const isOwner = (card.userId?._id || card.userId).toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: "Only the original owner can delete this card" });
    }

    await KanbanCard.findByIdAndDelete(req.params.id);
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: "Card removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT} with WebSockets enabled`);
    });
}

export default app;