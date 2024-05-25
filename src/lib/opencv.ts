import cv from "@techstark/opencv-js";

function loadOpenCV() {
  /**
   * Function to load OpenCV.js
   */
  return new Promise<void>((resolve) => {
    if (!cv.onRuntimeInitialized) {
      cv.onRuntimeInitialized = () => {
        resolve();
      };
    }
    resolve();
  });
}

export async function intersection(a: number[], b: number[]): Promise<number> {
  /**
   * Function to calculate the intersection between two vectors
   */

  await loadOpenCV();

  const histA = cv.matFromArray(1, a.length, cv.CV_32F, a);
  const histB = cv.matFromArray(1, b.length, cv.CV_32F, b);
  const result = cv.compareHist(histA, histB, cv.HISTCMP_INTERSECT);

  histA.delete();
  histB.delete();

  return result;
}

export async function correlation(a: number[], b: number[]): Promise<number> {
  /**
   * Function to calculate the correlation between two vectors
   */

  await loadOpenCV();

  const histA = cv.matFromArray(1, a.length, cv.CV_32F, a);
  const histB = cv.matFromArray(1, b.length, cv.CV_32F, b);
  const result = cv.compareHist(histA, histB, cv.HISTCMP_CORREL);

  histA.delete();
  histB.delete();

  return result;
}
