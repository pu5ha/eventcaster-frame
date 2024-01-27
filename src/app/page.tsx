/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { Metadata } from "next";
import prisma from "lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Eventcaster RSVP test",
    description: "Test event",
    openGraph: {
      title: "Eventcaster RSVP test",
      images: [`${process.env.HOST}/api/image`],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": `${process.env.HOST}/api/image`,
      "fc:frame:button:1": "RSVP",
      "fc:frame:post_url": `${process.env.HOST}/api/rsvp`,
    },
    metadataBase: new URL(process.env.HOST ?? ""),
  };
}

export default async function HomePage() {
  const rsvps = await prisma.rSVP.findMany();

  const users = await Promise.all(
    rsvps.map(async ({ fid }) => {
      const endpoint = `https://nemes.farcaster.xyz:2281/v1/userDataByFid?fid=${fid}`;
      const { messages } = await fetch(endpoint).then((r) => r.json());
      const profile = _buildProfileFromUserMessages(fid, messages);
      return profile;
    }),
  );

  return (
    <div className="col-fs-c w-full pt-20">
      <div
        className="col w-full border-2 border-slate-400 p-4"
        style={{ maxWidth: 540 }}
      >
        <h1
          className="text-xl font-bold text-slate-800"
          style={{ fontSize: 36 }}
        >
          @matthew&apos;s event
        </h1>
        <div className="h-3" />
        <h1 className="text-sm font-medium text-slate-800 opacity-75">
          When: it&apos;s all happening now people!
        </h1>
        <h1 className="text-sm font-medium text-slate-800 opacity-75">
          Where: farcaster
        </h1>
        <div className="h-3" />
        <Link href="https://warpcast.com/matthew/0x78b950dc" target="_blank">
          <button className="bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
            RSVP in Warpcast
          </button>
        </Link>
        <div className="h-3" />
        <div>
          <span className="text-md font-medium text-slate-800">
            Current RSVPs ({rsvps.length}):
          </span>
          {users.map(({ pfp_url, username }, i) => (
            <div className="row-fs-c gap-1 py-1" key={i}>
              <img src={pfp_url} className="h-6 w-6 rounded-full" />
              <span className="text-md font-medium text-slate-800">
                @{username}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function _buildProfileFromUserMessages(fid: number, messages: any[]) {
  if (messages.length === 0) return { fid };
  // make sure to sort by timestamp so that the most recent message is the one we write
  const sorted_messages = messages.sort((a, b) => b.timestamp - a.timestamp);

  // build the profile
  const username =
    sorted_messages.find(
      ({ data }) => data.userDataBody.type === "USER_DATA_TYPE_USERNAME",
    )?.data?.userDataBody?.value ?? undefined;
  const pfp_url =
    sorted_messages.find(
      ({ data }) => data.userDataBody.type === "USER_DATA_TYPE_PFP",
    )?.data?.userDataBody?.value ?? undefined;
  const display_name =
    sorted_messages.find(
      ({ data }) => data.userDataBody.type === "USER_DATA_TYPE_DISPLAY",
    )?.data?.userDataBody?.value ?? undefined;
  const link_url =
    sorted_messages.find(
      ({ data }) => data.userDataBody.type === "USER_DATA_TYPE_URL",
    )?.data?.userDataBody?.value ?? undefined;
  const bio =
    sorted_messages.find(
      ({ data }) => data.userDataBody.type === "USER_DATA_TYPE_BIO",
    )?.data?.userDataBody?.value ?? undefined;

  return {
    fid,
    username,
    pfp_url,
    display_name,
    link_url,
    bio,
  };
}
