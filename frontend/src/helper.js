export const handlePrint = async (billData) => {
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