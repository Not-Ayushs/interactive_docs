import mongoose from "mongoose";

const kanbanCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionName: {
        type: String,
        default: "General"
    },
    title: {
      type: String,
      required: true,
      default: "New Card",
    },
    desc: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["User story", "To do", "In progress", "Done"],
      default: "User story",
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

const KanbanCard = mongoose.model("KanbanCard", kanbanCardSchema);
export default KanbanCard;
