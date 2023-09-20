const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  address: { type: String, required: true },
  country: { type: String, required: true },
  countryCode: { type: String },
  state: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String },
  postalCode: { type: String},
});

const UserSchema = new Schema({
  user_id:String,
  username: { type: String, unique: true,default:`${String(Math.random()* Date.now())}` },
  password: { type: String,},
  firstName: { type: String },
  lastName: { type: String },
  about: {type:String},
  phone: { type: String },
  workPhone: { type: String },
  email: { type: String, unique: true,default:`default${String(Math.random()* Date.now())}@gmail.com` },
  gender: { type: String },
  nationality: { type: String },
  avatar:{type:String},
  resgistered:{type:Boolean,default:false},
  order_email:String,
  userImages:[Object],
  job:{
    title:String,
    role: String,
    organization:String,
    description:String
  },
  user_url:String,
  isBanned:{
    type:Boolean,
    default:false
  },
  address:addressSchema,
  birthDate: { type: String },
  isSuspended: { type: Boolean,default:false },
  profileCreated:{type:Boolean,default:false},
  nfc_linked:{
    type:Boolean,
    default:false
  },
  links:[{
    name:String,
    link:String
  }]
},{timestamps:true});

const Users = mongoose.model("User", UserSchema);
module.exports = Users;
