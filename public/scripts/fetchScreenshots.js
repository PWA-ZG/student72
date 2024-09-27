const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const usernameParam = params.get("username");

if (usernameParam) {
    document.getElementById("fetch-input").value = usernameParam;
    fetchScreenshots();
}

function fetchScreenshots() {
    const container = document.getElementById("screenshot-container");
    const info = document.getElementById("info-text");
    document.getElementById("collection-heading").innerHTML = "Stored screenshots";
    //ukloni sve trenutne slike ako ih ima
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    info.innerHTML = "";
    const username = document.getElementById("fetch-input").value;
    if (username === "") {
        alert("Please enter username of the person whose screenshots you want to see");
        return;
    }
    document.getElementById("collection-heading").innerHTML = username + "'s stored screenshots";
    fetch("/screenshots/" + username)
        .then((response) => {
            if (response.status === 500) {
                info.innerHTML = "Error on the server side.";
                throw new Error("Error on the server side.");
            } else {
                const content = response.headers.get("Content-Type");
                if (content === "text/html; charset=UTF-8") {
                    info.innerHTML =
                        "You are offline, or server is not responding. In either case, we have nothing cached for " +
                        username +
                        ".";
                    throw new Error("Nothing cached for " + username);
                } else {
                    return response.json();
                }
            }
        })
        .then((data) => {
            if (data.length > 0) {
                data.forEach((screenshot) => {
                    const screenshotDiv = document.createElement("div");
                    screenshotDiv.classList.add("screenshot-item");

                    const image = document.createElement("img");
                    image.src = `data:image/png;base64,${screenshot.image_data}`;
                    image.alt = "Screenshot";

                    const notes = document.createElement("p");
                    notes.innerHTML = "Notes: " + screenshot.notes;

                    const ts = document.createElement("p");
                    ts.innerHTML = "Timestamp: " + screenshot.ts;
                    ts.style.color = "chocolate";
                    ts.style.fontWeight = "bold";

                    screenshotDiv.appendChild(image);
                    screenshotDiv.appendChild(notes);
                    screenshotDiv.appendChild(ts);

                    container.appendChild(screenshotDiv);
                });
            } else {
                info.innerHTML = "There are no screenshots for " + username + ".";
            }
        })
        //(offline ILI server nije aktivan) I service worker je zaustavljen/pobrisan
        .catch((error) => console.log("You are offline, or server is not responding + service worker is not active!"));
}
