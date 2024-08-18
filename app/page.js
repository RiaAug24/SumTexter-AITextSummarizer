"use client";
import Script from "next/script";

import { useState } from "react";

export default function Home() {
  const [summary, setSummary] = useState("");

  function onFileChange(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = onLoadFile;
    fileReader.readAsArrayBuffer(file);
  }

  function onLoadFile(event) {
    const typedarray = new Uint8Array(event.target.result);
    pdfjsLib
      .getDocument({
        data: typedarray,
      })
      .promise.then((pdf) => {
        console.log("loaded pdf: ", pdf.numPages);
        pdf.getPage(1).then((page) => {
          page.getTextContent().then((content) => {
            let text = "";
            content.items.forEach((item) => {
              text += item.str + " ";
            });
            // console.log("text: ", text);
            sendToAPI(text);
          });
        });
      });
  }

  function sendToAPI(text) {
    fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setSummary(data.summary);
        console.log("response: ", data);
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
        ></input>
      </div>
      <h2 className="text-center text-[1.5rem] text-gray-200 mt-3 mb-6">
        PDF Summary 👇
      </h2>
      <p className="max-w-md mx-auto border-2 border-purple-400 p-4">
        {summary}
      </p>
      <p className="text-center my-24">Made with ❤️<br></br>By Riyaz Ahmed</p>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"
        strategy="beforeInteractive" // or "lazyOnload" or "afterInteractive"
      />
    </>
  );
}
