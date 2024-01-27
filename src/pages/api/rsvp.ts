import { init, fetchQuery } from "@airstack/node";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prisma";

init("a3e2d76f7afd4e6bb2202fcc57fd0132");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const fid = req.body?.untrustedData?.fid;

      if (!fid) {
        return res.status(400).send("Invalid FID");
      }

      // GraphQL query to fetch NFTs
      const graphqlQuery = `
      query NFTsOwnedByFarcasterUse($fid: String!) {
        Ethereum: TokenBalances(
          input: {
            filter: {
              owner: { _in: [fc_fid:[$fid]] }
              tokenType: { _in: [ERC1155, ERC721] }
            }
            blockchain: ethereum
            limit: 50
          }
        ) {
          TokenBalance {
            owner {
              socials(input: { filter: { dappName: { _eq: farcaster } } }) {
                profileName
                userId
                userAssociatedAddresses
              }
            }
            amount
            tokenAddress
            tokenId
            tokenType
            tokenNfts {
              contentValue {
                image {
                  extraSmall
                  small
                  medium
                  large
                }
              }
            }
          }
          pageInfo {
            nextCursor
            prevCursor
          }
        }
        Base: TokenBalances(
          input: {
            filter: {
              owner: { _in: [fc_fid:[$fid]] }
              tokenType: { _in: [ERC1155, ERC721] }
            }
            blockchain: base
            limit: 50
          }
        ) {
          TokenBalance {
            owner {
              socials(input: { filter: { dappName: { _eq: farcaster } } }) {
                profileName
                userId
                userAssociatedAddresses
              }
            }
            amount
            tokenAddress
            tokenId
            tokenType
            tokenNfts {
              contentValue {
                image {
                  extraSmall
                  small
                  medium
                  large
                }
              }
            }
          }
          pageInfo {
            nextCursor
            prevCursor
          }
        }
          Zora: TokenBalances(
          input: {
            filter: {
              owner: { _in: [fc_fid:[$fid]] }
              tokenType: { _in: [ERC1155, ERC721] }
            }
            blockchain: zora
            limit: 50
          }
        ) {
          TokenBalance {
            owner {
              socials(input: { filter: { dappName: { _eq: farcaster } } }) {
                profileName
                userId
                userAssociatedAddresses
              }
            }
            amount
            tokenAddress
            tokenId
            tokenType
            tokenNfts {
              contentValue {
                image {
                  extraSmall
                  small
                  medium
                  large
                }
              }
            }
          }
          pageInfo {
            nextCursor
            prevCursor
          }
        }
`;

      // Fetch data from Airstack
      const { data, error } = await fetchQuery(graphqlQuery, {
        variables: { fid: `fc_fid:${fid}` },
      });

      if (error) {
        console.error(error);
        return res.status(500).send("Error fetching NFT data");
      }

      // Select a random NFT image from the response
      const randomNftImage = selectRandomNFTImage(data);

      if (randomNftImage) {
        // Send response with the random NFT image
        return res.send(createHtmlResponse(randomNftImage));
      } else {
        // Handle case where no image is found
        // ...
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

function selectRandomNFTImage(data) {
  let images = [];

  // Extract images from each blockchain's data
  ["Ethereum", "Polygon", "Base", "Zora"].forEach((blockchain) => {
    if (data[blockchain] && data[blockchain].TokenBalance) {
      data[blockchain].TokenBalance.forEach((token) => {
        if (
          token.tokenNfts &&
          token.tokenNfts.contentValue &&
          token.tokenNfts.contentValue.image &&
          token.tokenNfts.contentValue.image.medium // Assuming medium is preferred
        ) {
          images.push(token.tokenNfts.contentValue.image.medium);
        }
      });
    }
  });

  // Select a random image from the array
  if (images.length > 0) {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  } else {
    return null; // Return null if no images are found
  }
}

// In your handler function, handle the case where no image is found
if (randomNftImage) {
  // Send response with the random NFT image
  return res.send(createHtmlResponse(randomNftImage));
} else {
  // Handle case where no image is found
  return res.status(404).send("No NFT image found for the given FID");
}

function createHtmlResponse(imageUrl: string) {
  // Function to create the HTML response with the given image URL
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Your Random NFT</title>
      <meta property="og:title" content="Your Random NFT">
      <meta property="og:image" content="${imageUrl}">
      <meta name="fc:frame" content="vNext">
      <meta name="fc:frame:image" content="${imageUrl}">
      <meta name="fc:frame:button:1" content="See Another">
    </head>
    <body>
      <p>Your random NFT image is displayed.</p>
    </body>
    </html>
  `;
}
