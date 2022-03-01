import * as faceapi from "face-api.js";
import { useState } from "react";

export default function useFaceRecognition() {
  const [isLoadingFaceDetector, setIsLoadingFaceDetector] =
    useState<boolean>(true);
  const [is68FacialLandmarkLoading, setIs68FacialLandmarkLoading] =
    useState<boolean>(true);
  const [isFeatureExtractorLoading, setIsFeatureExtractorLoading] =
    useState<boolean>(true);

  async function initModels() {
    const MODEL_URL = window.location.origin + "/models";
    try {
      console.log("initializing models");

      await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
      setIsLoadingFaceDetector(false);

      await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
      setIs68FacialLandmarkLoading(false);

      await faceapi.loadFaceRecognitionModel(MODEL_URL);
      setIsFeatureExtractorLoading(false);

      console.log("done initializing models");
    } catch (error) {
      console.log("initModels", error);
      throw error;
    }
  }

  async function getFullFaceDescription(blob, maxResults = 512) {
    try {
      /**
       * Max Results:
       *
       * - size at which image is processed, the smaller the faster,
       * but less precise in detecting smaller faces, must be divisible
       * by 32, common  sizes are 128, 160, 224, 320, 416, 512, 608
       *
       * - for face tracking via webcam it is recommended using smaller sizes, e.g. 128. 160
       *
       * - for detecting smaller faces use larger sizes, e.g. 512, 608
       *
       * - default maxResult: 416
       */

      // tiny_face_detector options
      let minConfidence = 0.3;
      const OPTION = new faceapi.SsdMobilenetv1Options({
        maxResults,
        minConfidence,
      });
      const useTinyModel = true;

      // fetch image to api
      let img = await faceapi.fetchImage(blob);

      // detect all faces and generate full description from image
      // including landmark and descriptor of each face
      let fullDesc = await faceapi
        .detectAllFaces(img, OPTION)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptors();

      return fullDesc;
    } catch (error) {
      console.log("getFullFaceDescription", error);
    }
  }

  function drawFaceRect(descriptions, ctx) {
    try {
      // Loop through each desc
      descriptions &&
        descriptions.forEach((desc) => {
          // Extract boxes and classes
          const { x, y, width, height } = desc.detection.box;
          const landmarksPoint = desc.landmarks._positions;

          ctx.font = "normal 18px Gotham, Helvetica Neue, sans-serif";
          ctx.lineWidth = 2;
          ctx.strokeStyle = "aqua";

          //draw 68 points
          landmarksPoint.map((point) => {
            ctx.beginPath();
            ctx.fillStyle = "aqua";
            ctx.arc(point._x, point._y, 3, 0, 2 * Math.PI);
            ctx.closePath();

            ctx.fill();
          });

          // Draw rectangles and text
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.stroke();
        });
    } catch (error) {
      console.log("drawFaceRect", error);
    }
  }

  return {
    initModels,
    isLoadingFaceDetector,
    is68FacialLandmarkLoading,
    isFeatureExtractorLoading,
    getFullFaceDescription,
    drawFaceRect,
  };
}
