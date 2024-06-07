import * as fs from "fs";
import * as path from "path";
import numeric from "numeric";
import { correlation, intersection } from "./opencv";

interface Features {
  [key: string]: number[];
}

/**
 * Loads features from the specified folder of the given model.
 * @param folderModel - The folder containing the features.
 * @returns The loaded features.
 */
export function loadFeatures(folderModel: string): Features {
  // Create an empty object to store the features
  const features: Features = {};

  // Construct the path to the features folder
  const featuresPath = path.join("public", "index", folderModel);

  // Read the files in the features folder
  const files = fs.readdirSync(featuresPath);

  // Process each file
  files.forEach((file) => {
    // Construct the path to the current file
    const filePath = path.join(featuresPath, file);

    // Read the file contents as a string and split it into lines
    const data = fs
      .readFileSync(filePath, "utf-8")
      .split("\n")
      .map((line) => parseFloat(line.trim()));

    // Remove the last element, which is an empty string
    data.pop();

    // Store the data in the features object using the file name as the key
    features[`public/images/${path.basename(file, path.extname(file))}.jpg`] =
      data;
  });

  // Return the loaded features
  return features;
}

/**
 * Extracts the features for the specified file name from the given features object.
 * @param fileName - The name of the file to extract features for.
 * @param features - The features object.
 * @returns The extracted features.
 */
export function extractReqFeatures(
  fileName: string,
  features: Features
): number[] {
  // Extract the file name from the full path
  const file = path.basename(fileName);

  // Return the features for the specified file name
  return features[`public/images/${file}`];
}

/**
 * Calculates the Euclidean distance between two feature vectors.
 * @param l1 - The first feature vector.
 * @param l2 - The second feature vector.
 * @returns The Euclidean distance between the feature vectors.
 */
export function euclidean(l1: number[], l2: number[]): number {
  // Calculate the minimum length of the feature vectors
  const n = Math.min(l1.length, l2.length);

  // Calculate the sum of squared differences between corresponding elements
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.pow(l1[i] - l2[i], 2);
  }

  // Return the square root of the sum
  return Math.sqrt(sum);
}

/**
 * Calculates the Bhattacharyya distance between two feature vectors.
 * @param l1 - The first feature vector.
 * @param l2 - The second feature vector.
 * @returns The Bhattacharyya distance between the feature vectors.
 */
export function bhatta(l1: number[], l2: number[]): number {
  // Calculate the sum of the first feature vector
  const sum1 = numeric.sum(l1);

  // Calculate the sum of the second feature vector
  const sum2 = numeric.sum(l2);

  // Calculate the element-wise product of the feature vectors
  const prod = numeric.mul(l1, l2);

  // Calculate the square root of the sum of the product
  const num = Math.sqrt(numeric.sum(prod));

  // Calculate the square root of the product of the sums
  const den = Math.sqrt(sum1 * sum2);

  // Calculate the Bhattacharyya distance
  return Math.sqrt(1 - num / den);
}

/**
 * Calculates the cosine similarity between two feature vectors.
 * @param a - The first feature vector.
 * @param b - The second feature vector.
 * @returns The cosine similarity between the feature vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  // Calculate the dot product of the feature vectors
  const dotProduct = numeric.dot(a, b);

  // Calculate the norm of the first feature vector
  const normA = Math.sqrt(numeric.sum(numeric.pow(a, 2)));

  // Calculate the norm of the second feature vector
  const normB = Math.sqrt(numeric.sum(numeric.pow(b, 2)));

  // Check for zero norms to avoid division by zero
  if (normA === 0 || normB === 0) {
    return 0;
  }

  // Calculate the cosine similarity
  return Number(dotProduct) / (normA * normB);
}

/**
 * Calculates the distance between two feature vectors based on the specified distance name.
 * @param l1 - The first feature vector.
 * @param l2 - The second feature vector.
 * @param distanceName - The name of the distance metric to use.
 * @returns The distance between the feature vectors.
 */
export async function getDistance(
  l1: number[],
  l2: number[],
  distanceName: string
): Promise<number> {
  let distance: number;

  // Calculate the distance based on the specified distance name
  switch (distanceName) {
    case "Euclidienne":
      distance = euclidean(l1, l2);
      break;
    case "Correlation":
      distance = await correlation(l1, l2);
      break;
    case "Intersection":
      distance = await intersection(l1, l2);
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

  // Return the calculated distance
  return distance;
}

/**
 * Calculates the k nearest neighbors based on the specified query feature vector, features object, distance metric, and k value.
 * @param featureReq - The query feature vector.
 * @param features - The features object.
 * @param distance - The name of the distance metric to use.
 * @param k - The number of nearest neighbors to retrieve.
 * @returns The k nearest neighbors.
 */
export async function getkVoisins(
  featureReq: number[],
  features: Features,
  distance: string,
  k: number
): Promise<[string, number][]> {
  // Calculate the distances for each image with respect to the query image
  const distances: { [key: string]: number } = {};
  for (const img in features) {
    if (features.hasOwnProperty(img)) {
      distances[img] = await getDistance(featureReq, features[img], distance);
    }
  }

  // If the distance metric is Correlation, Intersection, or Cosine similarity, sort the distances in descending order
  if (["Correlation", "Intersection", "Cosine"].includes(distance)) {
    return Object.entries(distances)
      .sort((a, b) => b[1] - a[1])
      .slice(0, k);
  } else {
    // Sort the distances in ascending order
    return Object.entries(distances)
      .sort((a, b) => a[1] - b[1])
      .slice(0, k);
  }
}

/**
 * Calculates the recall and precision values for the k nearest neighbors.
 * @param voisins - The k nearest neighbors.
 * @param imageName - The name of the query image.
 * @returns The recall and precision values.
 */
export function getRappelPrecision(
  voisins: [string, number][],
  imageName: string
): {
  rappels: number[];
  precision: number[];
} {
  // Calculate the class of the query image
  const imageClass = Math.floor(Number(imageName.split(".")[0]) / 100);

  // Initialize variables for true positives and false positives
  let tp = 0;
  let fp = 0;

  // Initialize arrays for recall and precision values
  const rappels: number[] = [];
  const precision: number[] = [];

  // Calculate the recall and precision values for each neighbor
  for (let i = 0; i < voisins.length; i++) {
    // Calculate the class of the current neighbor
    const voisinClass = Math.floor(
      Number(voisins[i][0].split("/")[2].split(".")[0]) / 100
    );

    // Update the true positives and false positives counts
    if (voisinClass === imageClass) {
      tp++;
    } else {
      fp++;
    }

    // Calculate the recall and precision values and add them to the arrays
    rappels.push(tp / 100);
    precision.push(tp / (tp + fp));
  }

  // Return the recall and precision values
  return { rappels, precision };
}
