import React, { useReducer, useEffect, useState } from "react";
import { handlePrint } from "../helper";
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

      const updatedItems = state.items.filter(
        (_, index) => index !== action.payload
      );

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

  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsView, setSuggestionsView] = useState(false);

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

  const fetchItems = async () => {
    try {
      const itemList = await fetch(`${backend}/getItems`);
      const item = await itemList.json();

      setItems(item.data[0]?.items);

      console.log(item.data[0]?.items);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (newItem.description.length > 1) {
        const filteredData = items.filter((item) =>
          item?.toLowerCase().startsWith(newItem?.description.toLowerCase())
        );

        setSuggestions(filteredData);
        setSuggestionsView(filteredData.length > 0);
      } else {
        setSuggestions([]);
        setSuggestionsView(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [newItem.description, items]);

  useEffect(() => {
    fetchItems();
    fetchBillNo();

    // return cleaner function
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

  const handleSuggestionClick = (field) => {
    setNewItem({ ...newItem, description: field });
    setSuggestions([]);
    setSuggestionsView(false);
  };

  return (
    <div className="container mx-auto md:p-6  bg-gray-100 rounded-lg shadow-lg">
      {/* Form Section */}
      <div className="form-section p-10  bg-slate-300 mb-6">
        <h1 className="text-2xl font-bold mb-4">Create Bill</h1>
        {/* Customer Details */}
        <div className="mb-6 justify-between flex gap-5 sm:flex-row flex-col">
          <input
            type="text"
            placeholder="Customer Name"
            value={billData.customerName}
            onChange={(e) =>
              dispatch({
                type: "SET_CUSTOMER_DETAILS",
                field: "customerName",
                value: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Customer Address"
            value={billData.customerAddress}
            onChange={(e) =>
              dispatch({
                type: "SET_CUSTOMER_DETAILS",
                field: "customerAddress",
                value: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="GST Number"
            value={billData.gstNo}
            onChange={(e) =>
              dispatch({
                type: "SET_CUSTOMER_DETAILS",
                field: "gstNo",
                value: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Item Input */}
        <div className="mb-6 ">
         
            {billData.items.length > 0 && (
              <div className="overflow-x-auto  cursor-pointer my-5 ">
                <h2 className="text-lg font-bold mt-6">Items</h2>
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
              </div>
            )}
         

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4   gap-2 mb-4">
            {inputFields.map((field, idx) => (
              <div className="relative w-full flex flex-col gap-2" key={idx}>
                <label className="text-sm font-bold" htmlFor={field.key}>
                  {field.placeholder}
                </label>
                <input
                  autoFocus={field.key == "quantity"}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={newItem[field.key]}
                  onChange={(e) => handleInputChange(e, field.key)}
                  className="border p-2"
                />
                {field.key === "description" &&
                  suggestions.length > 0 &&
                  suggestionsView && (
                    <ul className="  absolute top-full left-0 w-full bg-white border  text-black border-gray-300 shadow-md z-10 max-h-40 overflow-auto">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="p-2 cursor-pointer  hover:bg-gray-200"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
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
          <div className="lg:w-1/2 my-2  capitalize ">{data.policy}</div>
        </div>
      </div>
      <button
        onClick={() => handlePrint(billData)}
        className=" flex rounded-sm  justify-center items-center mt-6 bg-green-500 text-white px-6 gap-2 py-2 mx-auto "
      >
        <AiFillPrinter /> Print
      </button>
    </div>
  );
}

export default BillGenerator;
