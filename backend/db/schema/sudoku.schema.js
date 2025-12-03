import mongoose from "mongoose";

const sudokuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },

    mode: {
      type: String,
      enum: ["EASY", "NORMAL"],
      required: true,
    },

    creator: { type: String, required: true },

    puzzle: {
      type: [[Number]],
      required: true,
    },
    solution: {
      type: [[Number]],
      required: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default sudokuSchema;
