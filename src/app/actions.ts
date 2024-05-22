"use server";

import {
  extractReqFeatures,
  getkVoisins,
  loadFeatures,
  removeUpToChar,
} from "@/lib/other";

export async function getSimilarImages(formData: FormData) {
  const imageData = formData.get("image");

  const model = formData.get("model")?.toString();
  const distance = formData.get("distance")?.toString();
  if (
    !model ||
    !distance ||
    !imageData ||
    !(imageData instanceof File) ||
    imageData.size === 0
  ) {
    console.log("Invalid input");

    return;
  }
  //   console.log(imageData, model, distance);
  const features = loadFeatures(model);
  //   console.log(features);
  const featureReq = extractReqFeatures(imageData.name, features);
  //   console.log(featureReq);
  const voisins = getkVoisins(featureReq, features, distance);
  //   console.log(voisins);
  const results = voisins.map(([name, distance]) => {
    return removeUpToChar(name, "/");
  });
  //   console.log(results);

  return results;
}
