/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import satori from "satori";
import { join } from "path";
import * as fs from "fs";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData: Buffer;

try {
  fontData = fs.readFileSync(fontPath);
} catch (err) {
  console.error("Error reading font file:", err);
  // Handle the error appropriately
}

export const generateImage = async (text: string) => {
  if (!fontData) {
    throw new Error("Font data is not loaded");
  }

  try {
    const svg = await satori(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "Roboto", fontSize: 20 }}>{text}</span>
      </div>,
      {
        width: 600,
        height: 400,
        fonts: [
          {
            data: fontData,
            name: "Roboto",
            weight: 400,
            style: "normal",
          },
        ],
      },
    );

    return svg;
  } catch (err) {
    console.error("Error generating image:", err);
    throw err;
  }
};
