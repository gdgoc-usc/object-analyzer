// CONSTANTS
const GEMINI_API_KEY = "API_KEY_HERE";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const PROMPT = `Analyze this image and return a JSON object.
    The JSON object should have the following keys:
    - "description": A string describing the entire scene.
    - "mainObject": A string identifying the primary object of focus.
    - "detectedObjects": An array of strings, listing other objects you can identify.
    - "confidence": A number between 0 and 1 representing your confidence in the analysis.`;

const video = document.getElementById("webcam");
const captureButton = document.getElementById("captureButton");
const resultsElement = document.getElementById("result");

async function callGeminiApi(base64Image) {
  const payload = {
    contents: [
      {
        parts: [
          {
            text: PROMPT,
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  const text = data.candidates[0].content.parts[0].text;
  const parsedText = JSON.parse(text);

  return parsedText;
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      resolve(base64data);
    };
    reader.readAsDataURL(blob);
  });
}

async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false,
    });

    video.srcObject = stream;
  } catch (err) {
    console.error("Error accessing webcam: ", err);
    resultsElement.textContent =
      "Error: Could not access webcam. Please allow permission and refresh";
  }
}

function captureFrame() {
  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  context.translate(canvas.width, 0);
  context.scale(-1, 1);

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });
}

async function handleCapture() {
  captureButton.disabled = true;
  captureButton.textContent = "Analyzing...";
  resultsElement.textContent = "Capturing Frane...";

  try {
    const imageBlob = await captureFrame();
    const base64Image = await blobToBase64(imageBlob);

    resultsElement.textContent = "Encoding image...";

    const analysisObject = await callGeminiApi(base64Image);

    resultsElement.textContent = JSON.stringify(analysisObject, null, 2);
  } catch (err) {
    console.error("Error: ", err);
    resultsElement.textContent = `Error: ${err.message}`;
  } finally {
    captureButton.disabled = false;
    captureButton.textContent = "Capture and Analyze";
  }
}

startWebcam();

captureButton.addEventListener("click", handleCapture);
