import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
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