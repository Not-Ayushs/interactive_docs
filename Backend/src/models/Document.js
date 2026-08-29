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
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;