
var deferredPrompt;


//Mahfuz --Notification
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'You successfully subscribed to Notification service',
            icon: '/images/icons/push-on.png',
            image: '/images/logo.png',
            dir: 'ltr',
            lang: 'en-US', //BCP 47
            vibrate: [100, 50, 200],
            badge: '/images/icons/push-on.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                { action: 'confirm', title: 'Okay', icon: '/images/icons/push-on.png' },
                { action: 'cancel', title: 'Cancel', icon: '/images/icons/push-on.png' }
            ]
        };
        navigator.serviceWorker.ready.then(function (swreg) {
            swreg.showNotification('Successfully subscribed!', options);
        });
    }
}

function configurePushSub() {
    if (!('serviceWorker') in navigator) {
        return;
    }
    var reg;
    navigator.serviceWorker.ready.then(function (swreg) {
        reg = swreg;
        return swreg.pushManager.getSubscription();
    }).then(function (sub) {
        if (sub === null) {
            //create new subscription
            var vapidPublicKey = 'BK657G5J_o3JGmLsORQCWjdFPT3-w0OsZ25Bnk5PgoEv22wh5Gil0wPFdpzctbcQeLo6eIdaUReglsNk7McAtCI';
            var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
            reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidPublicKey
            });
        }
        else {
        }
    }).then(function (newSub) {
        fetch();
    }).then(function (res) {
        if (res.ok) { }
    });
}

function askForNotificationPermission() {
    Notification.requestPermission(function (result) {
        console.log('User Choice', result);
        if (result !== 'granted') {
            console.log('No notification permission granted')
            document.getElementById("pushImg").src = "/images/push-off.png";
        }
        else {
            document.getElementById("pushImg").src = "/images/push-on.png";
            //configurePushSub();
            displayConfirmNotification();
        }
    });
};

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
};



// if (!window.Promise) {
//   window.Promise = Promise;
// }

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then(function () {
            console.log('Service worker registered!');
        })
        .catch(function (err) {
            console.log(err);
        });
}

// window.addEventListener('beforeinstallprompt', function(event) {
//   console.log('beforeinstallprompt fired');
//   event.preventDefault();
//   deferredPrompt = event;
//   return false;
// });


window.addEventListener('load', function () {
    var snackbar = document.querySelector('#snackbar');
    var online = document.querySelector('#text-online');
    var offline = document.querySelector('#text-offline');

    function updateNetworkStatus(event) {

        if (navigator.onLine) {
            snackbar.className = "show";
            online.style.display = "inline-block";
            offline.style.display = "none";
            setTimeout(function () {
                snackbar.className = snackbar.className.replace("show", "");
                online.style.visbility = "hidden";
            }, 1000);
        }
        else {
            snackbar.className = "show";
            offline.style.display = "inline-block";
            online.style.display = "none";
        }
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
});


var addToJulyAction = {
    title: "Add To July",
    id: "add-to-july",
    image: "/images/add-user.png"
}

var planPopupTemplate = {
    title: "{name}",
    content: "Located at: {address} <br> " +
        "Product: {product} <br>" +
        "Started : {startDate} | " +
        "$ {fees}</b>"
};

var advisorPopupTemplate = {
    title: "{name} | {city}",
    content: "<div class='container-fluid'><div class='row'><div class='col-3'><img src='/images/face.png'></div><div class=col-8''><h4>Contact Details</h4>Located at: {address} <br> " +
        "Email: {email} <br>" +
        "State: {state} | Zip : {zip} <br>" +
        "Company: {company}</b></div></div></div>",
    actions: [addToJulyAction]
};

var planUrl = 'https://geo-tracking-dc7aa.firebaseio.com/plan-list.json';
var fetchAdvisorUrl = 'https://geo-tracking-dc7aa.firebaseio.com/advisor-list.json';
