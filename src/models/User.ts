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

// -- schema ----------

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
      select: false,
    },

    savedRecipes: {
      type: [String],
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
    timestamps: true,
  },
);

// -- Pre-save hook-------

userSchema.pre("save", async function () {
  // "this" refers to the user document being saved
  // isModified checks if password was changed if not skip hashing logic
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---- Instance method-----------
// comparePassword is added to every user document

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the Model
// "User" = name of the collection in MongoDB (becomes "users" automatically)
// IUser = TypeScript type for type safety

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;

// : Promise<boolean>
// This is the return type. means: This function will eventually return a boolean (true or false), but because it's asynchronous it returns a Promise first.
