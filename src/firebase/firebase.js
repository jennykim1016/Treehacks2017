var firebase = require('firebase-admin');

var serviceAccount = require('./helloworld-1a22e-firebase-adminsdk-imvaw-7d0369c4f5.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://helloworld-1a22e.firebaseio.com'
});

export const addToDb = (message) => {
    console.log("I'm in addToDb");
    var ref = firebase.database().ref("gratitude");
    ref.once("value").then(function(snapshot) {
        var count = snapshot.val().count;
        addNewEntry(++count, message);
        console.log("Count " + count + " message " + message);
    }).catch()
};

const addNewEntry = (c, message) => {
    console.log(c);
    firebase.database().ref("gratitude").child("entry" + c).set({
        text: message
    });
    firebase.database().ref("gratitude").set({
        count: c
    })
};

export const returnEntry = () => {    
    var ref = firebase.database().ref("gratitude");
    ref.once("value").then(function(snapshot) {
        var rand = Math.floor(Math.random() * snapshot.numChildren());
        return snapshot.val()["entry" + rand];
    });
};