/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Import Airstack
import { init, fetchQuery } from "@airstack/node";

// Initialize Airstack with your API key
init("a3e2d76f7afd4e6bb2202fcc57fd0132");

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const fid = req.body?.untrustedData?.fid;
      if (!fid) {
        return res.status(400).send("Invalid FID");
      }

      // Define your GraphQL query here
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

      const { data, error } = await fetchQuery(graphqlQuery, {
        variables: { fid },
      });

      if (error) {
        console.error(error);
        return res.status(500).send("Error fetching NFT data");
      }

      // Process the data to select a random NFT image
      const randomNftImage = selectRandomNFTImage(data);

      if (randomNftImage) {
        // Send response with the random NFT image
        return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Your Random NFT</title>
      <meta property="og:title" content="Your Random NFT">
      <meta property="og:image" content="${randomNftImage}">
      <meta name="fc:frame" content="vNext">
      <meta name="fc:frame:image" content="${randomNftImage}">
      <meta name="fc:frame:button:1" content="See Another">
    </head>
    <body>
      <p>Your random NFT image is displayed.</p>
    </body>
    </html>
  `);
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
    data[blockchain]?.TokenBalance.forEach((token) => {
      if (
        token.tokenNfts &&
        token.tokenNfts.contentValue &&
        token.tokenNfts.contentValue.image
      ) {
        // You can choose the size of image you want, e.g., medium
        images.push(token.tokenNfts.contentValue.image.medium);
      }
    });
  });

  // Select a random image
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}
