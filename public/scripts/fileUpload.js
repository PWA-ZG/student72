function handleFileSelect(e) {
    document.getElementById("tools").classList.remove("hidden");
    document.getElementById("name-input").classList.remove("hidden");
    document.getElementById("upload-button").classList.add("hidden");

    var URL = window.webkitURL || window.URL;
    var url = URL.createObjectURL(e.target.files[0]);
    var img = new Image();
    img.src = url;

    img.onload = function () {
        let img_width = img.width;
        let img_height = img.height;
        let ratio = img_width / img_height;

        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");

        canvas.width = document.documentElement.clientWidth * 0.8;
        canvas.height = canvas.width / ratio;

        img.width = canvas.width;
        img.height = canvas.height;

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        document.getElementById("canvas-div").classList.remove("hidden");
        e.target.value = null;
        drawOnImage();
    };
}
