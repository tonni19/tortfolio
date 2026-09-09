/**
 * Builds the site icons from the artist's avatar.
 *
 * Source: Categorized/my_avatars/pfpwwww.png (1080x1080, opaque black ground).
 * Outputs, all read automatically by the Next App Router from app/:
 *   favicon.ico     16/32/48/64, PNG-compressed inside the ICO container
 *   icon.png        512, what modern browsers actually use for the tab
 *   apple-icon.png  180, the iOS home-screen tile
 *
 * Re-run with: node scripts/make-favicon.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SOURCE = "Categorized/my_avatars/pfpwwww.png";
const ICO_SIZES = [16, 32, 48, 64];

const square = (size) =>
  sharp(SOURCE)
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toBuffer();

/**
 * ICO container: a 6-byte header, then one 16-byte directory entry per size,
 * then the images themselves. Every image here is a PNG payload, which every
 * browser still in use understands and which keeps the file small.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach(({ size, data }, i) => {
    const at = i * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, at); // 0 means 256
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1);
    directory.writeUInt8(0, at + 2); // palette size, 0 for truecolour
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...images.map((i) => i.data)]);
}

const images = [];
for (const size of ICO_SIZES) images.push({ size, data: await square(size) });

writeFileSync("app/favicon.ico", ico(images));
writeFileSync("app/icon.png", await square(512));
// iOS drops alpha and squares off the corners itself, so this is just the
// artwork at tile size.
writeFileSync("app/apple-icon.png", await square(180));

console.log(
  [
    `favicon.ico    ${ICO_SIZES.join("/")}  ${ico(images).length} bytes`,
    `icon.png       512`,
    `apple-icon.png 180`,
  ].join("\n"),
);
