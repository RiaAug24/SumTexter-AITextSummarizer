import { NextResponse } from "next/server";

import { Client } from "@octoai/client";

const pdf = require("pdf-parse");
const prompts = require("prompts");
const fs = require("fs/promises");
const path = require("path");
prompts.override(require("yargs").argv);

if (!process.env.OCTOAI_TOKEN) {
  console.log(
    "No OcotAI API key found. Please rename .env.eg to .env and add your OcotAI API key"
  );
  return;
}

const client = new Client(process.env.OCTOAI_TOKEN);

const pdfSelected = await prompts([
  {
    type: "select",
    name: "filename",
    message: "Pick a PDF to Summarize",
    choices,
  },
]);

if (!pdfSelected.filename) {
  alert("No PDF selected. Please try again!");
  return;
}

export const POST = async (req) => {
  const body = await req.json();
  console.log("body: ", body);

  const completion = await client.chat.completions.create({
    model: "llama-2-13b-chat",
    messages: [
      {
        role: "system",
        content: "Summarize the following text: " + body.text,
      },
    ],
  });

  return NextResponse.json({
    success: true,
    message: "Hello World!",
    summary: completion.choices[0].message.content,
  });
};
