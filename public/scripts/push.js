let btnNotif = document.getElementById("notification-button");

if ("Notification" in window && "serviceWorker" in navigator) {
    btnNotif.addEventListener("click", function () {
        Notification.requestPermission(async function (res) {
            if (res === "granted") {
                await setupPushSubscription();
            } else {
                console.log("User denied push notifications.");
            }
        });
    });
} else {
    btnNotif.setAttribute("disabled", "");
}

function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function setupPushSubscription() {
    try {
        let reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub === null) {
            var publicKey = "BAZyl7YhytrkbLcm4HiiXAZrSbiTKRfY7PN6dddIkjfPDOnRmHCzXpgUIIYlzdf_MiqnwVViWww_g9ocM89-B9E";
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
            let res = await fetch("/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ sub }),
            });
            if (res.ok) {
                alert("Subscription successfully generated.");
            }
        } else {
            alert("Subscription already exists.");
        }
    } catch (error) {
        console.log(error);
    }
}
