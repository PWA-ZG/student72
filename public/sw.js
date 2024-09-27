import { del, entries } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const filesToCache = [
    "/",
    "manifest.json",
    "index.html",
    "collection.html",
    "offline.html",
    "404.html",
    "favicon.ico",
    "./scripts/fetchScreenshots.js",
    "./scripts/fileUpload.js",
    "./scripts/push.js",
    "./scripts/registerEvent.js",
    "./scripts/restart.js",
    "./scripts/screenshot.js",
    "./styles/header.css",
    "./styles/styles.css",
    "./assets/img/android/android-launchericon-144-144.png",
    "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm",
];

const staticCacheName = "static-cache";

self.addEventListener("install", (event) => {
    console.log("Attempting to install service worker and predefined assets in static-cache.");
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );

    const cacheWhitelist = [staticCacheName];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method === "POST") return;
    event.respondWith(
        (async () => {
            try {
                const staticCache = await caches.open("static-cache");
                let staticResponse = await staticCache.match(event.request);

                if (staticResponse) {
                    console.log("Static resource found in static cache: " + event.request.url);
                    return staticResponse;
                }

                if (event.request.url.includes("/screenshots")) {
                    const dynamicResponse = await fetch(event.request);
                    let data = await dynamicResponse.clone().json();

                    if (data.length !== 0) {
                        const dynamicCache = await caches.open("dynamic-cache");
                        dynamicCache.put(event.request, dynamicResponse.clone());
                        console.log("Caching dynamic resource and responding for " + event.request.url);
                    } else {
                        console.log("Got empty response (no caching), responding for " + event.request.url);
                    }
                    return dynamicResponse;
                } else {
                    //moguci zahtjevi za slikom iz manifesta, JS skriptom...
                    staticResponse = await fetch(event.request);
                    if (staticResponse.status === 404) {
                        return caches.match("404.html");
                    } else {
                        console.log("Caching static resource and responding for " + event.request.url);
                        staticCache.put(event.request, staticResponse.clone());
                        return staticResponse;
                    }
                }
            } catch (error) {
                console.log(
                    "Server unavailable, or no internet connection -> backup strategy - serving cached screenshots if possible"
                );
                if (event.request.url.includes("/screenshots")) {
                    const dynamicCache = await caches.open("dynamic-cache");
                    const images = await dynamicCache.match(event.request);
                    if (images) {
                        console.log("Serving screenshots from cache");
                        return images;
                    } else {
                        return caches.match("offline.html");
                    }
                } else {
                    //ako je zatrazena neka druga slika, npr. referencirana u manifestu
                    if (event.request.headers.get("Accept").includes("image/")) {
                        return caches.match("./assets/img/android/android-launchericon-144-144.png");
                    } else {
                        return caches.match("offline.html");
                    }
                }
            }
        })()
    );
});

self.addEventListener("sync", function (event) {
    console.log("Background sync!", event);
    if (event.tag === "screenshot-reg") {
        event.waitUntil(syncScreens());
    }
});

let syncScreens = async function () {
    entries().then((entries) => {
        entries.forEach((entry) => {
            let snap = entry[1];
            let formData = new FormData();
            formData.append("id", snap.id);
            formData.append("username", snap.username);
            formData.append("ts", snap.ts);
            formData.append("notes", snap.notes);
            formData.append("image", snap.image, snap.id + ".png");
            fetch("/screenshots", {
                method: "POST",
                body: formData,
            })
                .then(function (res) {
                    if (res.ok) {
                        res.json().then(function (data) {
                            console.log("Deleting from idb:", data.id);
                            del(data.id);
                        });
                    } else {
                        console.log("Server responded with faulty status, screenshot still in IndexedDB.");
                    }
                })
                .catch(function (error) {
                    console.log("Server not responding, screenshot still in IndexedDB.");
                });
        });
    });
};

self.addEventListener("notificationclick", function (event) {
    let notification = event.notification;
    // mogli smo i definirati actions, pa ovdje granati s obzirom na:
    // let action = event.action;
    console.log("notification", notification);
    event.waitUntil(
        clients.matchAll().then(function (clis) {
            clis.forEach((client) => {
                client.navigate(notification.data.redirectUrl);
                client.focus();
            });
            notification.close();
        })
    );
});

self.addEventListener("notificationclose", function (event) {
    console.log("notificationclose", event);
});

self.addEventListener("push", function (event) {
    console.log("push event", event);

    var data = { title: "title", body: "body", redirectUrl: "/" };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.body,
        icon: "./assets/img/android/android-launchericon-144-144.png",
        badge: "./assets/img/android/android-launchericon-144-144.png",
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
            redirectUrl: data.redirectUrl,
        },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});
