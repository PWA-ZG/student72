var restart = function () {
    let canvas = document.getElementById("canvas");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("canvas-div").classList.add("hidden");
    document.getElementById("tools").classList.add("hidden");
    document.getElementById("name-input").classList.add("hidden");
    document.getElementById("notes").value = "";
    document.getElementById("name-input").value = "";

    if (canvasSupport && mediaSupport && !isMobileOrTablet()) {
        document.getElementById("screenshot-button").classList.remove("hidden");
        document.getElementById("video-div").classList.remove("hidden");
    } else {
        document.getElementById("upload-button").classList.remove("hidden");
    }
};
