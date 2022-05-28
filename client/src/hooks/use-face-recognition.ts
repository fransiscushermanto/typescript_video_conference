import * as faceapi from "face-api.js";
import { useState } from "react";
import { useMe } from ".";
import { RoomParticipantFaceModel } from "../components/api-hooks/type";

export default function useFaceRecognition() {
  const [isLoadingFaceDetector, setIsLoadingFaceDetector] =
    useState<boolean>(true);
  const [is68FacialLandmarkLoading, setIs68FacialLandmarkLoading] =
    useState<boolean>(true);
  const [isFeatureExtractorLoading, setIsFeatureExtractorLoading] =
    useState<boolean>(true);

  const [me] = useMe();

  async function initModels() {
    const MODEL_URL = window.location.origin + "/models";
    try {
      console.log("initializing models");

      await Promise.all([
        faceapi.loadSsdMobilenetv1Model(MODEL_URL),
        faceapi.loadFaceLandmarkTinyModel(MODEL_URL),
        faceapi.loadFaceRecognitionModel(MODEL_URL),
      ]);

      setIsLoadingFaceDetector(false);
      setIs68FacialLandmarkLoading(false);
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

  function drawRectAndLabelFace(descriptions, faceDB, ctx) {
    // Loop through each desc
    descriptions &&
      descriptions.forEach((desc) => {
        // Extract boxes and classes
        const { x, y, width, height } = desc.detection.box;
        const landmarksPoint = desc.landmarks._positions;

        const bestMatch = faceDB.findBestMatch(desc.descriptor);
        let label: string = "";
        // Set styling
        if (bestMatch._label !== "unknown") {
          label = `Approved`;
        } else if (bestMatch._label === "unknown") {
          label = `Not ${me.user_name}`;
        }

        ctx.font = "normal 18px Gotham, Helvetica Neue, sans-serif";
        ctx.lineWidth = 2;
        ctx.strokeStyle = bestMatch._label === "unknown" ? "#E00" : "#0E0";

        //draw 68 points
        landmarksPoint.forEach((point) => {
          ctx.beginPath();
          ctx.fillStyle = bestMatch._label === "unknown" ? "#E00" : "#0E0";
          ctx.arc(point._x, point._y, 3, 0, 2 * Math.PI);
          ctx.closePath();

          ctx.fill();
        });

        // Draw rectangles and text
        ctx.beginPath();
        ctx.fillStyle = bestMatch._label === "unknown" ? "#E00" : "#0E0";
        ctx.rect(x, y, width, height);

        ctx.fillText(label, x, y + height + 20);
        ctx.fillText(`L2: ${bestMatch.distance.toFixed(2)}`, x, y);

        ctx.stroke();
      });
  }

  async function createMatcher(
    faces: RoomParticipantFaceModel[],
    maxDescriptorDistance,
  ) {
    // Create labeled descriptors of member from profile
    let labeledDescriptors = new faceapi.LabeledFaceDescriptors(
      me.user_id,
      faces.map(
        (face) =>
          new Float32Array(
            face.face_description.match(/-?\d+(?:\.\d+)?/g).map(Number),
          ),
      ),
    );

    /**
     * > 0.6 -> false positive case for unknown dataset
     * < 0.3 -> false negative case for known dataset
     * Create face matcher (maximum descriptor distance is 0.5)
     */
    let faceMatcher = new faceapi.FaceMatcher(
      labeledDescriptors,
      maxDescriptorDistance,
    );

    return faceMatcher;
  }

  return {
    initModels,
    isLoadingFaceDetector,
    is68FacialLandmarkLoading,
    isFeatureExtractorLoading,
    getFullFaceDescription,
    drawFaceRect,
    drawRectAndLabelFace,
    createMatcher,
  };
}
