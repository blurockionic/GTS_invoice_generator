import mongoose from "mongoose";
import Invoice, { Item } from "./model.js";

/**
 * Create a new invoice
 * @param {Object} invoiceData - The invoice data to create
 * @returns {Object} The created invoice
 *
 *
 */
export const createInvoice = async (invoiceData) => {
  try {
    let existingItemDoc = await Item.findOne();

    // Extract all existing items
    const prevItemDescriptions = existingItemDoc
      ? existingItemDoc.items.map((desc) => desc.toLowerCase())
      : [];

    // Filter new items that are not already stored
    const newItems = invoiceData.items
      .map((item) => item.description.toLowerCase())
      .filter((desc) => !prevItemDescriptions.includes(desc));

    // Save new items in the existing document
    if (newItems.length > 0) {
      await Item.updateOne(
        {},
        { $addToSet: { items: { $each: newItems } } },
        { upsert: true }
      );
    }
    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();
    return newInvoice;
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    throw new Error(`Unable to create invoice: ${error.message}`);
  }
};

/**
 * Get all invoices or filter them based on a query
 * @param {Object} query - The query to filter invoices
 * @returns {Array} The list of invoices
 */
export const getInvoices = async (query = {}) => {
  try {
    const invoices = await Invoice.find(query).sort({ date: -1 }); // Sort by date descending
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    throw new Error(`Unable to fetch invoices: ${error.message}`);
  }
};

/**
 * Get a single invoice by its ID
 * @param {String} id - The ID of the invoice
 * @returns {Object} The invoice with the given ID
 */
export const getInvoiceById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid invoice ID");
    }
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    return invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error.message);
    throw new Error(`Unable to fetch the invoice: ${error.message}`);
  }
};

/**
 * Update an invoice by its ID
 * @param {String} id - The ID of the invoice to update
 * @param {Object} updateData - The data to update the invoice
 * @returns {Object} The updated invoice
 */
export const updateInvoice = async (id, updateData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid invoice ID");
    }
    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedInvoice) {
      throw new Error("Invoice not found");
    }
    return updatedInvoice;
  } catch (error) {
    console.error("Error updating invoice:", error.message);
    throw new Error(`Unable to update the invoice: ${error.message}`);
  }
};

/**
 * Delete an invoice by its ID
 * @param {String} id - The ID of the invoice to delete
 * @returns {Object} The deleted invoice
 */
export const deleteInvoice = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid invoice ID");
    }
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice) {
      throw new Error("Invoice not found");
    }
    return deletedInvoice;
  } catch (error) {
    console.error("Error deleting invoice:", error.message);
    throw new Error(`Unable to delete the invoice: ${error.message}`);
  }
};
