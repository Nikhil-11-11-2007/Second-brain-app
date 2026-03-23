import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadFile(file) {
  const base64File = file.buffer.toString("base64");

  const res = await imagekit.upload({
    file: base64File,
    fileName: file.originalname,
    folder: "/collections",
  });

  console.log(res);
  return res.url;
}
