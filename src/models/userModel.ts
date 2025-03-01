import mongoose from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  phone_number?: string;
  password: string;
  verified?: boolean;
  verificationCode?: string;
  verificationCodeValidation?: number;
  forgotPasswordCode?: string;
  forgotPasswordCodeValidation?: number,
  firstName?: string,
  lastName?: string,
  address?: string
}

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: [true, 'Username has been taken, use another']
    },
    email: {
        type: String,
        trim: true,
        unique: [true, 'Email must be unique'],
        lowercase: true,
        sparse: true, // ✅ Allows multiple `null` values
        default: null,  // Ensures phone_number is an empty string if not provided
        validate: {
            validator: function (value: string) {
                return !value || true
            },
            message: "Email number must have at least 6-7"
        }
    },
    phone_number: {
        type: String,
        trim: true,
        unique: [true, 'phone number must be unique'],
        sparse: true, // ✅ Allows multiple `null` values
        default: null,   // Ensures phone_number is an empty string if not provided
        validate: {
            validator: function (value: string) {
                return !value || /^[0-9]{10,11}$/.test(value); 
            },
            message: "Phone number must have 10-11 digits."
        }
        

    },
    password: {
        type: String,
        required: [true, 'Password must be provided'],
        trim: true,
        select: false,
     },
     verified: {
        type: Boolean,
        default: false,
     },
     verificationCode: {
      type: String,
      select: false,
     },
     verificationCodeValidation: {
      type: Number,
      select: false,
     },
     forgotPasswordCode: {
      type: String,
      select: false,
     },
     forgotPasswordCodeValidation: {
      type: Number,
      select: false,
     },
     firstName: { type: String },
     lastName: { type: String },
     address: { type: String }
    

}, {
   timestamps : true
})

UserSchema.pre('save', function (next) {
    console.log("User Data Before Validation:", this);

    if (!this.email && !this.phone_number) {
        this.invalidate('email', 'At least one contact method (email or phone number) is required.');
        this.invalidate('phone_number', 'At least one contact method (email or phone number) is required.');
    }
    next();
});


export const UserModel = mongoose.model<IUser>('User', UserSchema);

