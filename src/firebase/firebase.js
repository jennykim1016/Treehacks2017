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
    });
};

const addNewEntry = (c, message) => {
    console.log(c);
    firebase.database().ref("gratitude").child("entry" + c).set({
        text: message
    });
    firebase.database().ref("gratitude").update({
        count: c
    })
};

export const returnEntry = () => {  
    console.log("returnEntry");
    var ref = firebase.database().ref("gratitude").child("count");
    ref.once("value").then(function(snapshot) {
        console.log(snapshot.val());
        var rand = Math.floor(Math.random() * snapshot.val());
        return selectRandomEntry(rand);
    });
};

const selectRandomEntry = (rand) => {  
    console.log("selectRandomEntry");
    var ref = firebase.database().ref("gratitude").child("entry" + rand);
    ref.once("value").then(function(snapshot) {
        return snapshot.val().text;
    });
};