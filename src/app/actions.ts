"use server";

import {
  extractReqFeatures,
  getRappelPrecision,
  getkVoisins,
  loadFeatures,
} from "@/lib/other";

export async function getSimilarImages(formData: FormData) {
  const imageData = formData.get("image")?.toString();

  const model = formData.get("model")?.toString();
  const distance = formData.get("distance")?.toString();
  const kData = formData.get("k")?.toString();

  // console.log(imageData, model, distance, kData);

  if (
    !model ||
    !distance ||
    !imageData ||
    // !(imageData instanceof File) ||
    // imageData.size === 0 ||
    !kData
  ) {
    console.log("Invalid input");

    return;
  }
  const k = parseInt(kData);
  if (k !== 20 && k !== 50) {
    console.log("Invalid k value");
    return;
  }
  //   console.log(imageData, model, distance);
  const features = loadFeatures(model);
  //   console.log(features);
  const featureReq = extractReqFeatures(imageData, features);
  //   console.log(featureReq);

  // const voisins = getkVoisins(featureReq, features, distance, k);
  const voisins = await getkVoisins(featureReq, features, distance, 100);
  const kVoisins = voisins.slice(0, k);
  //   console.log(voisins);
  const { rappels, precision } = getRappelPrecision(voisins, imageData);
  // console.log(rappels, precision);

  const rappelPrecision = rappels.map((rappel, index) => ({
    Rappel: rappel,
    Precision: precision[index],
  }));
  // console.log(rappelPrecision);

  return { voisins: kVoisins, rappelPrecision };
}
