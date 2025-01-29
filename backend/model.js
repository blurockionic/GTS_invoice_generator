import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  billNo: {
    type: String,
    required: true,
    unique: true,
    default: "0",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  customer: {
    name: {
      type: String,
      default: "", // Default empty string if not provided
    },
    address: {
      type: String,
      default: "",
    },
    gstNo: {
      type: String,
      default: "",
    },
  },
  items: [
    {
      description: {
        type: String,
        required: true,
      },
      hsnCode: {
        type: String,
        default: "",
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      rate: {
        type: Number,
        required: true,
        min: 0,
      },
      amount: {
        type: Number,
        required: true,
      },
      cgst: {
        type: Number,
        required: true,
      },
      sgst: {
        type: Number,
        required: true,
      },
      igst: {
        type: Number,
        default: 0, // Default 0 for items without IGST
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  subTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
});

const itemsSchema = new mongoose.Schema({
  items: {
    type: [String],
    lowercase: true, // Ensure description is stored in lowercase
  },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
const Item = mongoose.model("Item", itemsSchema);
export { Item };

export default Invoice;
