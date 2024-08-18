"use client";
import Script from "next/script";
import { useState } from "react";

export default function Home() {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [summary, setSummary] = useState("");
  const [pageNo, setPageNo] = useState(1);

  function onFileChange(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = onLoadFile;
    fileReader.readAsArrayBuffer(file);
  }

  function selectPageNo(event) {
    const newPageNo = Number(event.target.value);

    // Check if the PDF is uploaded before allowing page number selection
    if (!pdfDocument) {
      alert("Please upload a PDF file first.");
      setPageNo(1); // Reset the page number input to 1
      return;
    }

    setPageNo(newPageNo);

    // Trigger summarization when page number changes
    if (pdfDocument) {
      summarizePage(pdfDocument, newPageNo);
    }
  }

  async function onLoadFile(event) {
    const typedarray = new Uint8Array(event.target.result);
    try {
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      if (!pdf) {
        alert("Please choose a PDF :(");
      }
      setPdfDocument(pdf); // Set the PDF document in the state
      console.log("loaded pdf: ", pdf.numPages);

      // Automatically summarize the selected page once the PDF is loaded
      summarizePage(pdf, pageNo);
    } catch (error) {
      console.error("Error loading PDF: ", error);
    }
  }

  async function summarizePage(pdf, pageNumber) {
    if (!pdf) {
      alert("Please upload a PDF first.");
      return;
    }

    if (pageNumber > pdf.numPages || pageNumber < 1) {
      alert(`Please choose a page number between 1 and ${pdf.numPages}`);
      return;
    }

    try {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      let text = "";

      content.items.forEach((item) => {
        text += item.str + " ";
      });

      sendToAPI(text);
    } catch (error) {
      console.error("Error loading page: ", error);
    }
  }

  function sendToAPI(text) {
    fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSummary(data.summary);
        console.log("response: ", data);
      })
      .catch((error) => {
        console.error("Error summarizing text: ", error);
      });
  }

  return (
    <>
      <div className="mx-auto p-8 grid justify-center grid-rows-3 gap-20">
        <h1 className="text-[1.85rem] sm:text-4xl xl:text-5xl font-bold bg-gradient-to-tr from-pink-600 to-violet-400 via-rose-400 inline-block text-transparent bg-clip-text">
          SumTexter - AI PDF Summarizer
        </h1>
        <h2 className="text-center text-[1.25rem] sm:text-3xl xl:text-5xl font-bold bg-gradient-to-r from-gray-100 to-violet-400 via-pink-600 inline-block text-transparent bg-clip-text">
          Upload PDF
        </h2>
    
        <input
          className="w-1/2 p-2 mx-auto border-2 border-purple-300"
          type="file"
          id="file"
          name="file"
          onChange={onFileChange}
          accept=".pdf"
        />
        <input
          className="text-center w-1/2 p-2 text-slate-900 mx-auto border-2 border-purple-300"
          type="number"
          min={1}
          placeholder="Choose the page no of PDF to Summarize"
          onChange={selectPageNo} // Trigger summarization when page number changes
        />
      </div>
      <h2 className="text-center text-[1.5rem] text-gray-200 mt-3 mb-6">
        PDF Summary 👇
      </h2>
      <p className="max-w-md mx-auto border-2 border-purple-400 p-4">
        {summary}
      </p>
      <p className="text-center my-24">
        Made with ❤️<br />
        By Riyaz Ahmed
      </p>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"
        strategy="beforeInteractive" // or "lazyOnload" or "afterInteractive"
      />
    </>
  );
}
