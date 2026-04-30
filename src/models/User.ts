import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  savedRecipes: string[];
  likedRecipes: string[];
  createdAt: Date;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;

  // method we add to every user - used during login to check password
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema ----------
// defines shape of document in Mongodb

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

    resetToken: {
      type: String,
      default: null,
      // select: false - never accidentally returned in API responses
      select: false,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
      select: false,
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

//Pre-save hook-------
// runs automatically BEFORE every .save() call
// if password hasn't changed, skip hashing (important for profile updates)
// if password is new or changed, hash it with bcrypt

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

// ---- Instance method-----------
// comparePassword is added to every user document
// Used in login route: does typed password match stored hash?
// bcrypt.compare handles the comparison

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  // bcrypt.compare returns true if match, false if not
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the Model
// "User" = name of the collection in MongoDB (becomes "users" automatically)
// IUser = TypeScript type for type safety

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
