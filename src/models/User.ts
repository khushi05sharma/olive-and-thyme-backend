import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// ─── STEP 1: TypeScript interface ─────────────────────────────
// Describes what a User looks like in TypeScript
// Document is a Mongoose type — gives us _id, save(), etc automatically

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  savedRecipes: string[];
  likedRecipes: string[];
  createdAt: Date;

  // Method we add to every user — used during login to check password
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── STEP 2: Schema ───────────────────────────────────────────
// Defines the shape of the document in MongoDB
// this is like a column definitions in a database table

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/, // basic email format check
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // we never return password in API responses — select: false hides it by default
      select: false,
    },

    savedRecipes: {
      type: [String], // array of strings
      default: [], // starts as empty array for every new user
    },

    likedRecipes: {
      type: [String],
      default: [],
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    // MongoDB manages these — you never set them manually
    timestamps: true,
  },
);

// ─── STEP 3: Pre-save hook ────────────────────────────────────
// This runs automatically BEFORE every .save() call
// If password hasn't changed, skip hashing (important for profile updates)
// If password is new or changed, hash it with bcrypt

userSchema.pre("save", async function () {
  // "this" refers to the user document being saved
  // isModified checks if password field was changed in this save operation
  if (!this.isModified("password")) {
    return; // password unchanged — skip hashing, move on
  }

  // 10 = salt rounds — higher = more secure but slower
  // 10 is the industry standard balance
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── STEP 4: Instance method ──────────────────────────────────
// comparePassword is added to every user document
// Used in login route: does typed password match stored hash?
// bcrypt.compare handles the comparison

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  // bcrypt.compare returns true if match, false if not
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── STEP 5: Create and export the Model ─────────────────────
// "User" = name of the collection in MongoDB (becomes "users" automatically)
// IUser = TypeScript type for type safety

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
