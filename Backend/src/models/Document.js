import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
        type: String,
        default: "Untitled Document"
    },
    desc: {
      type: String,
      default: "",
    },

    filesize: {
      type: String,
      default: "",
    },

    collectionName: {
      type: String,
      default: "General",
    },

    docType: {
      type: String,
      default: "text",
    },

    canvasData: {
      type: String,
      default: "",
    },

    tag: {
      tagTitle: {
        type: String,
        default: "",
      },
      tagColor: {
        type: String,
        default: "",
      },
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
          lowercase: true,
          trim: true,
        },
        name: {
          type: String,
          default: "",
        },
        role: {
          type: String,
          default: "editor",
          enum: ["editor", "viewer"],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isCollaborative: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;