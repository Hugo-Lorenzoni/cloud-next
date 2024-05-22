import * as fs from "fs";
import * as path from "path";
import cv from "@techstark/opencv-js";
import numeric from "numeric";
// Assuming you have opencv.js properly included in your project

interface Features {
  [key: string]: number[];
}

export function loadFeatures(folderModel: string): Features {
  /**
   * Function to load features from the database for a given model
   */
  const features: Features = {};
  const featuresPath = path.join("public", "index", folderModel);
  const files = fs.readdirSync(featuresPath);

  files.forEach((file) => {
    const filePath = path.join(featuresPath, file);
    const data = fs
      .readFileSync(filePath, "utf-8")
      .split("\n")
      .map((line) => parseFloat(line.trim()));
    // retirer le dernier élément qui est une chaine vide
    data.pop();
    features[`public/image/${path.basename(file, path.extname(file))}.jpg`] =
      numeric.clone(data);
  });

  return features;
}

export function extractReqFeatures(
  fileName: string,
  features: Features
): number[] {
  /**
   * Function to retrieve the feature of the image from its name
   * Assumption: all request images belong to the database
   */
  const file = path.basename(fileName);
  return features[`public/image/${file}`];
}

export function euclidean(l1: number[], l2: number[]): number {
  /**
   * Function to calculate the Euclidean distance between two vectors:
   * allows comparing features of two images and finding the closest neighbors
   */
  const n = Math.min(l1.length, l2.length);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.pow(l1[i] - l2[i], 2);
  }
  return Math.sqrt(sum);
}

export function bhatta(l1: number[], l2: number[]): number {
  /**
   * Function to calculate the Bhattacharyya distance between two vectors
   */
  const sum1 = numeric.sum(l1);
  const sum2 = numeric.sum(l2);
  const prod = numeric.mul(l1, l2);
  const num = Math.sqrt(numeric.sum(prod));
  const den = Math.sqrt(sum1 * sum2);
  return Math.sqrt(1 - num / den);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  /**
   * Function to calculate the cosine similarity between two vectors
   */
  const dotProduct = numeric.dot(a, b);

  const normA = Math.sqrt(numeric.sum(numeric.pow(a, 2)));
  const normB = Math.sqrt(numeric.sum(numeric.pow(b, 2)));
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return Number(dotProduct) / (normA * normB);
}

export function intersection(a: number[], b: number[]): number {
  /**
   * Function to calculate the intersection between two vectors
   */
  const histA = cv.matFromArray(1, a.length, cv.CV_32F, a);
  const histB = cv.matFromArray(1, b.length, cv.CV_32F, b);

  return cv.compareHist(histA, histB, cv.HISTCMP_INTERSECT);
}

export function distance_f(
  l1: number[],
  l2: number[],
  distanceName: string
): number {
  /**
   * Function to calculate the distance between two vectors using a given method
   */
  let distance: number;
  switch (distanceName) {
    case "Euclidienne":
      distance = euclidean(l1, l2);
      break;
    case "Correlation":
      const histA = cv.matFromArray(1, l1.length, cv.CV_32F, l1);
      const histB = cv.matFromArray(1, l2.length, cv.CV_32F, l2);
      distance = cv.compareHist(histA, histB, cv.HISTCMP_CORREL);
      break;
    case "Intersection":
      distance = intersection(l1, l2);
      break;
    case "Bhattacharyya":
      distance = bhatta(l1, l2);
      break;
    case "Cosine":
      distance = cosineSimilarity(l1, l2);
      break;
    default:
      throw new Error(`Unknown distance name: ${distanceName}`);
  }
  return distance;
}

export function getkVoisins(
  featureReq: number[],
  features: Features,
  distance: string,
  k: number
): [string, number][] {
  /**
   * Function to identify the k nearest neighbors for a query image
   *
   * @param featureReq - Array of features for the query image
   * @param features - Dictionary of features for all images
   * @param distance - Distance metric to use for comparison
   */

  // Calculate the distances for each image with respect to the query image
  const distances: { [key: string]: number } = {};
  for (const img in features) {
    if (features.hasOwnProperty(img)) {
      distances[img] = distance_f(featureReq, features[img], distance);
    }
  }

  // If distance is Correlation, Intersection or Cosine similarity, we want the largest values
  if (["Correlation", "Intersection", "Cosine"].includes(distance)) {
    return Object.entries(distances)
      .sort((a, b) => b[1] - a[1])
      .slice(0, k);
  } else {
    // Sort images by their distance to the query image and return the closest k neighbors
    return Object.entries(distances)
      .sort((a, b) => a[1] - b[1])
      .slice(0, k);
  }
}

export function getRappelPrecision(
  voisins: [string, number][],
  imageName: string
): {
  rappels: number[];
  precision: number[];
} {
  /**
   * Function to calculate the recall and precision values for the k nearest neighbors
   */
  const imageClass = Math.floor(Number(imageName.split(".")[0]) / 100);

  const rappels: number[] = [];
  const precision: number[] = [];
  let tp = 0;
  let fp = 0;
  for (let i = 0; i < voisins.length; i++) {
    const voisinClass = Math.floor(
      Number(voisins[i][0].split("/")[2].split(".")[0]) / 100
    );
    if (voisinClass === imageClass) {
      tp++;
    } else {
      fp++;
    }
    rappels.push(tp / 100);
    precision.push(tp / (tp + fp));
  }
  return { rappels, precision };
}
