import React, { useReducer, useEffect, useState } from "react";
import { AiFillPrinter } from "react-icons/ai";
import { data } from "./static";
const backend = "http://localhost:3000";

const initialState = {
  billNo: "0",
  date: new Date().toLocaleDateString(),
  customerName: "",
  customerAddress: "",
  gstNo: "",
  items: [],
  subTotal: 0,
  total: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_CUSTOMER_DETAILS":
      return { ...state, [action.field]: action.value };

    case "ADD_ITEM": {
      const amount = parseFloat(action.payload.amount) || 0;
      const cgst = (amount * 9) / 100; // 9% CGST
      const sgst = (amount * 9) / 100; // 9% SGST
      const totalWithGST = parseFloat(amount + cgst + sgst).toFixed(2);

      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, cgst, sgst, total: parseFloat(totalWithGST) },
        ],
        subTotal: state.subTotal + amount,
        total: state.total + parseFloat(totalWithGST),
      };
    }

    case "REMOVE_ITEM": {
      const removedItem = state.items[action.payload];
      if (!removedItem) return state;

      const amount = parseFloat(removedItem.amount) || 0;
      const totalWithGST = parseFloat(
        amount + removedItem.cgst + removedItem.sgst
      );

      const updatedItems = state.items.filter((_, index) => index !== action.payload);

      return {
        ...state,
        items: updatedItems,
        subTotal: state.subTotal - amount,
        total: state.total - totalWithGST,
      };
    }

    case "SET_BILL_NO":
      return {
        ...state,
        billNo: action.payload,
      };

    default:
      return state;
  }
};

const inputFields = [
  {
    type: "number",
    placeholder: "Quantity",
    key: "quantity",
  },
  {
    type: "text",
    placeholder: "Description",
    key: "description",
  },
  {
    type: "text",
    placeholder: "HSN Code",
    key: "hsnCode",
  },
  {
    type: "number",
    placeholder: "Rate",
    key: "rate",
  },
];
const field = [
  "quantity",
  "description",
  "hsnCode",
  "rate",
  "amount",
  "cgst",
  "igst",
  "sgst",
  "total",
];

function BillGenerator() {
  const [billNo, setBillNo] = useState("");
  const [billData, dispatch] = useReducer(reducer, initialState);
  const [newItem, setNewItem] = useState({
    description: "",
    hsnCode: "",
    rate: 0,
    quantity: 0,
  });
  const [editableField, setEditableField] = useState(null);

  useEffect(() => {
    const fetchBillNo = async () => {
      try {
        const response = await fetch(`${backend}/get-bill-no`);
        const data = await response.json();
        setBillNo(data.billNo);
        dispatch({
          type: "SET_BILL_NO",
          payload: data.billNo,
        });
      } catch (error) {
        console.error("Error fetching bill number:", error);
      }
    };

    fetchBillNo();
  }, []);

  const handleAddItem = () => {
    if (!newItem.description || newItem.rate <= 0 || newItem.quantity <= 0) {
      alert(
        "Please fill out all fields and ensure rate and quantity are positive numbers."
      );
      return;
    }
    const amount = newItem.rate * newItem.quantity;

    dispatch({
      type: "ADD_ITEM",
      payload: { ...newItem, amount },
    });
    setNewItem({ description: "", hsnCode: "", rate: 0, quantity: 0 });
  };

  const handleRemoveItem = (index) => {
    dispatch({ type: "REMOVE_ITEM", payload: index });
  };

  const handleInputChange = (e, field) => {
    setNewItem({ ...newItem, [field]: e.target.value });
  };

  const handleEditField = (field) => {
    setEditableField(field);
  };

  const handleSaveField = (e, field) => {
    dispatch({
      type: "SET_CUSTOMER_DETAILS",
      field,
      value: e.target.value,
    });
    setEditableField(null);
  };

  //   it should print in same design

  const handlePrint = async () => {
    // save in db and print
    if (!billData.customerName.trim()) {
      alert("Customer Name is mandatory.");
      return;
    }
    if (!billData.customerAddress.trim()) {
      alert("Customer Address is mandatory.");
      return;
    }
    if (!billData.gstNo.trim()) {
      alert("GST Number is mandatory.");
      return;
    }
    if (billData.items.length === 0) {
      alert("At least one item should be added to the invoice.");
      return;
    }

    const res = await fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(billData),
    }).then((res) => res.json());

    console.log(res);

    if (!res.status === "success") {
      alert("Error in saving data");
      return;
    } else {
      console.log("Data saved successfully");
    }

    const printContent = document.getElementById("printDetail").innerHTML;
    const printWindow = window.open("", "_blank", "height=650,width=900");

    printWindow.document.write("<html><head><title>Invoice</title>");

    // Adding custom styles for print layout
    printWindow.document.write("<style>");
    printWindow.document.write(`
    @media print {
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
      }
      .topHeader {
        display: flex;
        justify-content: space-between;
      }
      .print-section {
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .text-right {
        text-align: right;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 10px;
        text-align: left;
        border: 1px solid #ddd;
      }
      .font-bold {
        font-weight: bold;
      }
      .uppercase {
        text-transform: uppercase;
      }
      .topHeader p, .topHeader span {
        font-size: 12px;
      }
        .totalAmount{
            margin-top: 20px;
        }
    }
  `);
    printWindow.document.write("</style>");

    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");

    printWindow.document.close(); // Necessary to load the document
    printWindow.print(); // Trigger the print
  };

  const EditableField = ({ label, value, field, onEdit, onChange }) => (
    <div className="mb-4 w-full max-w-md">
      {editableField === field ? (
        <input
          type="text"
          autoFocus
          placeholder={label}
          value={value}
          onBlur={(e) => onEdit(e, field)}
          onChange={(e) => onChange(e, field)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
        />
      ) : (
        <span
          onDoubleClick={() => onEdit(field)}
          className="text-gray-600 cursor-pointer hover:text-blue-500 transition duration-300"
        >
          {value || `Double-click to enter ${label}`}
        </span>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      {/* Form Section */}
      <div className="form-section p-10  bg-slate-300 mb-6">
        <h1 className="text-2xl font-bold mb-4">Create Bill</h1>
        {/* Customer Details */}
        <div className="mb-6 justify-between flex gap-5 sm:flex-row flex-col">
          <EditableField
            label="Customer Name"
            value={billData.customerName}
            field="customerName"
            onEdit={handleEditField}
            onChange={(e, field) =>
              dispatch({
                type: "SET_CUSTOMER_DETAILS",
                field,
                value: e.target.value,
              })
            }
          />

          <EditableField
            label="Customer Address"
            value={billData.customerAddress}
            field="customerAddress"
            onEdit={handleEditField}
            onChange={(e, field) =>
              dispatch({
                type: "SET_CUSTOMER_DETAILS",
                field,
                value: e.target.value,
              })
            }
          />

          <EditableField
            label="GST Number"
            value={billData.gstNo}
            field="gstNo"
            onEdit={handleEditField}
            onChange={(e, field) =>
              dispatch({
                type: "SET_CUSTOMER_DETAILS",
                field,
                value: e.target.value,
              })
            }
          />
        </div>

        {/* Item Input */}
        <div className="mb-6 " >
          <h2 className="text-lg font-bold mt-6">Items</h2>
          
          <div className="overflow-x-scroll  cursor-pointer my-5 ">
          {billData.items.length > 0 && (
            <table className="my-10 table-auto  overflow-hidden w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  {field.map((item, index) => (
                    <th key={index} className="border capitalize p-2">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {billData.items.map((item, index) => (
                  <tr key={index}>
                    {field.map((field, idx) => (
                      <td key={idx} className="border p-2">
                        {item[field] || "N/A"}{" "}
                        {/* You can also set a default value like "N/A" */}
                      </td>
                    ))}
                    <td className=" p-2">
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="bg-red-500 text-white px-2 py-1"
                      >
                       Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4   gap-2 mb-4">
            {inputFields.map((field, idx) => (
              <div className="w-full flex flex-col gap-2" key={idx}>
                <label className="text-sm font-bold" htmlFor={field.key}>
                  {field.placeholder}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={newItem[field.key]}
                  onChange={(e) => handleInputChange(e, field.key)}
                  className="border p-2"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center">
            <button
              onClick={handleAddItem}
              className="bg-blue-500  text-white px-6 rounded-sm py-2 col-span-5"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Printable Section */}
      <div
        id="printDetail"
        className="print-section  bg-white p-6 rounded-lg shadow-lg"
      >
        <div id="" className="flex topHeader justify-between mb-6">
          <div className="  ">
            <h2 className="text-3xl w-1/2 font-bold">DEE GEE</h2>
            <span className="text-sm flex justify-end w-1/2 -translate-x-3">
              --------CATERERS
            </span>
            <address>
              B-33/F/2/3136, New Gurnam Nagar, <br /> G.T. Road, Ludhiana
            </address>
          </div>
          <div className=" ">
            <h1 className="text-2xl font-bold  mb-4">Tax Invoice</h1>
            <div></div>
            <div>
              <p>Phone: {data.phone} </p>
              <p className="">GSTIN: 03AHTPG2710R2Z1</p>
              <p className="">Website: {data.website}</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="py-8">Bill No. {billData.billNo}</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <p>To M/s: {billData.customerName || "N/A"}</p>
        <p>Address: {billData.customerAddress || "N/A"}</p>
        <p>GST No: {billData.gstNo || "N/A"}</p>

        <h2 className="text-lg font-bold mt-6">Items</h2>
       <div className="overflow-x-scroll">
       <table className="table-auto  w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {field.map((item, index) => (
                <th key={index} className="border uppercase p-2">
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {billData.items.map((item, index) => (
              <tr key={index}>
                {field.map((field, idx) => (
                  <td key={idx} className="border p-2">
                    
                    {field === "sgst" || field === "cgst"
                      ? ` ${item[field]?.toFixed(2)} (9%)`
                      : item[field] || "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
       </div>

        <div className="mt-6 totalAmount ">
          <div className=" ">
            <span className="font-bold uppercase">Total: </span>
            &#8377;{(parseFloat(billData.total) || 0).toFixed(2)}

          </div>
          <div className="lg:w-1/2 my-2  capitalize ">
            {data.policy}
          </div>
        </div>
      </div>
      <button
        onClick={handlePrint}
        className=" flex rounded-sm  justify-center items-center mt-6 bg-green-500 text-white px-6 gap-2 py-2 mx-auto "
      >
        <AiFillPrinter /> Print
      </button>
    </div>
  );
}

export default BillGenerator;
