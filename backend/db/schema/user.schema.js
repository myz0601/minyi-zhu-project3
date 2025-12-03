import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },

    wins: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default userSchema;
