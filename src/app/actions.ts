"use server";

import {
  extractReqFeatures,
  getRappelPrecision,
  getkVoisins,
  loadFeatures,
} from "@/lib/other";

/**
 * Retrieves similar images based on the provided form data.
 * @param formData - The form data containing the image, model, distance, and k value.
 * @returns An object containing the k nearest neighbors and the recall-precision values.
 */
export async function getSimilarImages(formData: FormData) {
  // Extract form data
  const imageData = formData.get("image")?.toString();
  const model = formData.get("model")?.toString();
  const distance = formData.get("distance")?.toString();
  const kData = formData.get("k")?.toString();

  // Check for invalid input
  if (!model || !distance || !imageData || !kData) {
    console.log("Invalid input");
    return;
  }

  // Parse k value
  const k = parseInt(kData);
  if (k !== 20 && k !== 50) {
    console.log("Invalid k value");
    return;
  }

  // Load features
  const features = loadFeatures(model);

  // Extract required features from image data
  const featureReq = extractReqFeatures(imageData, features);

  // Get k nearest neighbors
  const voisins = await getkVoisins(featureReq, features, distance, 100);
  const kVoisins = voisins.slice(0, k);

  // Calculate recall-precision values
  const { rappels, precision } = getRappelPrecision(voisins, imageData);

  // Format recall-precision values
  const rappelPrecision = rappels.map((rappel, index) => ({
    Rappel: rappel,
    Precision: precision[index],
  }));

  return { voisins: kVoisins, rappelPrecision };
}
