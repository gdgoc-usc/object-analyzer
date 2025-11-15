const video = document.getElementById('webcam');
const captureButton = document.getElementById("captureButton");
const resultsElement = document.getElementById("result");

async function startWebcam(){

    try{

        const stream = await navigator.mediaDevices.getUserMedia({

            video: { width: 640, height: 480 },
            audio: false,

        });

        video.srcObject = stream;

    }catch(err){

        console.error("Error accessing webcam: ", err);
        resultsElement.textContent = "Error: Could not access webcam. Please allow permission and refresh";

    }

}

function captureFrame(){

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height= video.videoHeight;

    const context = canvas.getContext("2d");

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {

        canvas.toBlob(resolve, "image/jpeg", 0.9);

    });

}

function callGeminiApi(){

  const dummy = {

    "description": "A person with black hair, glasses, is seated, looking sligthly at the camera, they are wearing a dark cloth hoodie. The scene is dimly lit, likely indoors, with a dark and somewhat blurry background",
    "mainObject": "Person",
    "detectedObjects": [

        "Glasses",
        "Hoodie",
        "Chair",
        "Hair",
        "Window frame"

    ],
    "confidence": 0.64

  }

    return dummy;

}

async function handleCapture(){

    captureButton.disabled = true;
    captureButton.textContent = "Analyzing...";
    resultsElement.textContent = "Capturing Frane...";

    try{

        const imageBlob = await captureFrame();

        resultsElement.textContent = "Encoding image...";

        const analysisObject = await callGeminiApi();

        resultsElement.textContent = JSON.stringify(analysisObject, null, 2);

    }catch(err){

        console.error("Error: ", err);
        resultsElement.textContent = `Error: ${err.message}`;

    }finally{

        captureButton.disabled = false;
        captureButton.textContent = "Capture and Analyze";

    }

}

startWebcam();

captureButton.addEventListener("click", handleCapture);