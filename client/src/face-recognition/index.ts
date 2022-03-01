import * as faceapi from "face-api.js";

export async function loadModels() {
  const MODEL_URL = window.location.origin + "/models";
  try {
    console.log("MODEL_URL", MODEL_URL);

    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    console.log("Face Detector Loaded");

    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
    console.log("68 Facial Landmark Detector Loaded");

    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    console.log("Feature Extractor Loaded");
  } catch (error) {
    console.log("loadModels", error);
  }
}

export async function getFullFaceDescription(blob, maxResults = 600) {
  try {
    // tiny_face_detector options
    let minConfidence = 0.3;
    const OPTION = new faceapi.SsdMobilenetv1Options({
      minConfidence,
      maxResults,
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

export const drawFaceRect = (descriptions, ctx) => {
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
};
