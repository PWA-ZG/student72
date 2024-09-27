import { set } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

let canvas = document.getElementById("canvas");
let regButton = document.getElementById("register-button");

regButton.addEventListener("click", function (event) {
    event.preventDefault();
    let username = document.getElementById("name-input").value;
    if (username === "") {
        alert("You have to enter your name.");
        return;
    }
    let url = canvas.toDataURL();
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
                let ts = new Date().toISOString();
                let id = ts + "_" + document.getElementById("notes").value;
                set(id, {
                    id,
                    username,
                    ts,
                    notes: document.getElementById("notes").value,
                    image: blob,
                });
                restart();
                return navigator.serviceWorker.ready;
            })
            .then((swRegistration) => {
                return swRegistration.sync.register("screenshot-reg");
            })
            .then(() => {
                console.log("Queued for sync.");
            })
            .catch((error) => {
                console.log(error);
            });
    } else {
        console.log("Browser does not support background sync... doing 'one-time' data send.");
        fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
                let ts = new Date().toISOString();
                let id = ts + "_" + document.getElementById("notes").value;
                let notes = document.getElementById("notes").value;
                let formData = new FormData();
                formData.append("id", id);
                formData.append("username", username);
                formData.append("ts", ts);
                formData.append("notes", notes);
                formData.append("image", blob, id + ".png");
                fetch("/screenshots", {
                    method: "POST",
                    body: formData,
                })
                    .then(function (res) {
                        if (res.ok) {
                            //ako je screenshot uspješno poslan, resetiraj sučelje
                            console.log("Screenshot successfully sent to server.");
                            restart();
                        } else {
                            alert("Server responded with faulty status, you can try again.");
                        }
                    })
                    .catch(function (error) {
                        alert("Server not responding. Wait for a bit, then try again.");
                    });
            })
            .catch(function (error) {
                console.log(error);
            });
    }
});
