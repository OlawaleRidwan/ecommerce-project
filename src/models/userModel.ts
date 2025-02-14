import mongoose from 'mongoose';

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
        default: "",  // Ensures phone_number is an empty string if not provided
        validate: {
            validator: function (value: string) {
                return value === "" || true
            },
            message: "Email number must have at least 6-7"
        }
    },
    phone_number: {
        type: String,
        trim: true,
        unique: [true, 'phone number must be unique'],
        sparse: true, // ✅ Allows multiple `null` values
        default: "",   // Ensures phone_number is an empty string if not provided
        validate: {
            validator: function (value: string) {
                return value === "" || /^[0-9]{10,11}$/.test(value); 
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
}, {
   timestamps : true
})


export const UserModel = mongoose.model('User', UserSchema);

export const getUsers = () => UserModel.find();

// export const getUserBySessionToken=(sessionToken: string) => UserModel.findOne({
//     'authentication.sessionToken': sessionToken
// });

export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) => new UserModel(values)
    .save().then((user=>user.toObject()));
export const deleteUserById = (id: string)=> UserModel.findByIdAndDelete({_id: id})
 export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id,values);