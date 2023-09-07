const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  address1: { type: String, required: true },
  address2: { type: String },
  country: { type: String, required: true },
  countryCode: { type: String },
  state: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String },
  postalCode: { type: Number},
});

const Address = mongoose.model("Address", AddressSchema);
module.exports = Address;
