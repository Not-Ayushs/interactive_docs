import mongoose from "mongoose";

const collectionShareSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
          required: true,
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
  },
  {
    timestamps: true,
  }
);

collectionShareSchema.index({ collectionName: 1, owner: 1 }, { unique: true });

const CollectionShare = mongoose.model("CollectionShare", collectionShareSchema);

export default CollectionShare;
