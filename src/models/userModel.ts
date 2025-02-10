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
        minLength: [6,'Email must have at least 5 characters'],
        lowercase: true,
    },
    phone_number: {
        type: Number,
        trim: true,
        unique: [true, 'Email must be unique'],
        minLength: [11,'Email must have 5 characters'],
        lowercase: true,
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