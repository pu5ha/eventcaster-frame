/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prisma";

export const revalidate = 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const fid = req.body?.untrustedData?.fid;
      const { hash } = req.body?.untrustedData.castId;

      console.log({ fid, hash });

      if (!fid || !hash) {
        return res.status(400).send("Invalid message");
      }

      // check if they're already RSVPed
      const rsvp = await prisma.rSVP.findUnique({ where: { fid } });

      if (rsvp) {
        console.log("already rsvped");
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Test Event</title>
              <meta property="og:title" content="Test Event">
              <meta property="og:image" content="${process.env.HOST}/api/image_rsvped">
              <meta name="fc:frame" content="vNext">
              <meta name="fc:frame:image" content="${process.env.HOST}/api/image_rsvped">
              <meta name="fc:frame:button:1" content="Cool">
          </head>
          <body>
              <p>Farc! Already RSVPed.</p>
          </body>
          </html>
        `);
      } else {
        console.log("now rsvped");

        const new_rsvp = await prisma.rSVP.create({
          data: { fid, cast_hash: hash },
        });

        if (!new_rsvp) {
          return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Test Event</title>
              <meta property="og:title" content="Test Event">
              <meta property="og:image" content="${process.env.HOST}/api/image_fail">
              <meta name="fc:frame" content="vNext">
              <meta name="fc:frame:image" content="${process.env.HOST}/api/image_fail">
              <meta name="fc:frame:button:1" content="Cool">
          </head>
          <body>
              <p>Farc! Couldn't RSVP.</p>
          </body>
          </html>
        `);
        } else {
          const num_rsvps = await prisma.rSVP.count();

          return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Event</title>
                <meta property="og:title" content="Test Event">
                <meta property="og:image" content="${process.env.HOST}/api/image_success">
                <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image" content="${process.env.HOST}/api/image_success">
                <meta name="fc:frame:button:1" content="Cool">
            </head>
            <body>
                <p>You are good to go! The event now has ${num_rsvps} RSVPs.</p>
            </body>
            </html>
          `);
        }
      }
    } catch (e: unknown) {
      // @ts-expect-error
      return res.status(400).send(`Failed to validate message: ${e.message}`);
    }
  } else {
    return res.status(400).send("Invalid method");
  }
}
