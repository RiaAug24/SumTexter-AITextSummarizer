import { NextResponse } from "next/server";

import { Client } from "@octoai/client";

const client = new Client(process.env.OCTOAI_TOKEN);

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
