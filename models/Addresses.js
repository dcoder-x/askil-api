const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  seller: { type: Schema.Types.ObjectId, ref: "Seller" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String },
  country: { type: String, required: true },
  countryCode: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String },
  building: { type: String },
  floor: { type: String },
  apartment: { type: String },
  phoneNumber: { type: String, required: true },
  postalCode: { type: Number, required: true },
  isPrimary: { type: Boolean }
});

const Address = mongoose.model("Address", AddressSchema);
module.exports = Address;
