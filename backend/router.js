import express from "express";
import {
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  createInvoice,
} from "./controller.js"; // Assuming the above functions are in a 'services' file
import mongoose from "mongoose";

const router = express.Router();
import Invoice, { Item } from "./model.js";

// Middleware to validate MongoDB ID
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ status: "fail", error: "Invalid ID format" });
  }
  next();
};

/**
 * @route POST /api/invoices
 * @desc Create a new invoice
 */

router.get("/get-bill-no", async (req, res) => {
  try {
    const invoices = await getInvoices(); // Fetch invoices from the database
   
    const lastInvoice = invoices.length - 1; // Get the last invoice
    
    const nextBillNo = lastInvoice ? lastInvoice + 1 : 1; 
    // Send the next billNo as the response
    return res.json({ billNo: nextBillNo });
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    // Send an error response
    return res.status(500).json({ error: `Unable to fetch invoices: ${error.message}` });
  }
});
router.post("/", async (req, res) => {
  try {
    const invoice = await createInvoice(req.body);
    res.status(201).json({ status: "success", data: invoice });
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    res.status(500).json({ status: "error", error: error.message });
  }
});

/**
 * @route GET /api/invoices
 * @desc Get all invoices
 */
router.get("/", async (req, res) => {
  try {
    const invoices = await getInvoices(req.query);
    res.status(200).json({ status: "success", data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    res.status(500).json({ status: "error", error: error.message });
  }
});

/**
 * @route GET /api/invoices/:id
 * @desc Get a specific invoice by ID
 */
router.get("/bill/:billNo", async (req, res) => {
  try {
    const billNo = req.params.billNo;

    // Fetch the invoice using the bill number
    const invoice = await Invoice.findOne({ billNo: billNo });

    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: `Invoice with bill number ${billNo} not found`,
      });
    }

    res.status(200).json({
      status: "success",
      data: invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error.message);
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
});


/**
 * @route PUT /api/invoices/:id
 * @desc Update an invoice by ID
 */
router.put("/:id", [validateId], async (req, res) => {
  try {
    const updatedInvoice = await updateInvoice(req.params.id, req.body);
    res.status(200).json({ status: "success", data: updatedInvoice });
  } catch (error) {
    console.error("Error updating invoice:", error.message);
    res.status(404).json({ status: "fail", error: error.message });
  }
});



router.get("/getItems", async (req, res) => {

  const data =  await Item.find()
  res.status(200).json({ status: "success", data });
});


/**
 * @route DELETE /api/invoices/:id
 * @desc Delete an invoice by ID
 */
router.delete("/:id", validateId, async (req, res) => {
  try {
    const result = await deleteInvoice(req.params.id);
    res
      .status(200)
      .json({
        status: "success",
        message: "Invoice deleted successfully",
        data: result,
      });
  } catch (error) {
    console.error("Error deleting invoice:", error.message);
    res.status(404).json({ status: "fail", error: error.message });
  }
});

export default router;
