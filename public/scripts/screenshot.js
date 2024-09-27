let player = document.getElementById("player");
let canvas = document.getElementById("canvas");
let c = canvas.getContext("2d");
let isDrawing;

var canvasSupport = !!document.createElement("canvas").getContext;
var mediaSupport = !!document.createElement("video").canPlayType;

var isMobileOrTablet = function () {
    const userAgent = navigator.userAgent;
    return /Mobi|Android/i.test(userAgent) || /(iPad|Tablet)/i.test(userAgent);
};

//ne mogu napraviti screenshot na mobitelu
if (mediaSupport && canvasSupport && !isMobileOrTablet()) {
    document.getElementById("video-div").classList.remove("hidden");
    document.getElementById("screenshot-button").classList.remove("hidden");
} else {
    document.getElementById("upload-button").classList.remove("hidden");
}

async function screenshot() {
    try {
        const captureStream = await navigator.mediaDevices.getDisplayMedia();
        player.srcObject = captureStream;

        document.getElementById("canvas-div").classList.remove("hidden");
        document.getElementById("tools").classList.remove("hidden");
        document.getElementById("name-input").classList.remove("hidden");
        document.getElementById("screenshot-button").classList.add("hidden");

        canvas.width = player.getBoundingClientRect().width;
        canvas.height = player.getBoundingClientRect().height;

        player.addEventListener("loadedmetadata", () => {
            c.drawImage(player, 0, 0, canvas.width, canvas.height);
            document.getElementById("video-div").classList.add("hidden");
            player.srcObject.getVideoTracks().forEach(function (track) {
                track.stop();
            });
        });

        drawOnImage();
    } catch (e) {
        if (e.name === "NotAllowedError" || e.name === "AbortError") {
            console.log("User cancelled the action of taking a screenshot.");
        }
    }
}

function getColor() {
    const radioButtons = document.getElementsByName("colorRadio");
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            return radioButton.value;
        }
    }
    return null;
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    c.beginPath();
    c.lineWidth = 4;
    c.strokeStyle = getColor();
    c.lineJoin = "round";
    c.lineCap = "round";
    if (e.type == "touchmove") {
        c.moveTo(
            e.touches[0].clientX - canvas.getBoundingClientRect().left,
            e.touches[0].clientY - canvas.getBoundingClientRect().top
        );
    } else {
        c.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    }
}

function draw(e) {
    e.preventDefault();
    if (isDrawing) {
        if (e.type == "touchmove") {
            c.lineTo(
                e.touches[0].clientX - canvas.getBoundingClientRect().left,
                e.touches[0].clientY - canvas.getBoundingClientRect().top
            );
        } else {
            c.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
        }
        c.stroke();
    }
}

function endDrawing(e) {
    e.preventDefault();
    isDrawing = false;
    c.closePath();
}

var drawOnImage = function () {
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });

    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchmove", draw, { passive: false });

    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("touchend", endDrawing, { passive: false });
};
