'use strict';

const functions = require("firebase-functions");
const smartcar = require('smartcar');
const admin = require('firebase-admin');
admin.initializeApp();

const client = new smartcar.AuthClient({
    clientId: functions.config().smartcar.client_id,
    clientSecret: functions.config().smartcar.client_secret,
    redirectUri: functions.config().smartcar.redirectUri,
    testMode: true,
})

async function setAccess(data) {
    const write = await admin.firestore().collection('auth').doc('access').set(data);
}

async function getAccess() {
    const doc = await admin.firestore().collection('auth').doc('access').get();
    return doc.data();
}

exports.exchange = functions.https.onRequest(async (req, res) => {
    //get smartcar response
    const code = req.query.code;
    const access = await client.exchangeCode(code);
    await setAccess(access);
    
    res.redirect('/vehicle');
});


exports.vehicle = functions.https.onRequest(async (req, res) => {
    const access = await getAccess();
    console.log(access);
    const vehicles = await smartcar.getVehicles(access.accessToken);

    //instantiate first vehicle in list
    const vehicle = new smartcar.Vehicle(
        vehicles.vehicles[0],
        access.accessToken,
    );

    console.log("vehicle initialized");
    //get vehicle info
    const attributes = await vehicle.battery();
    res.send(attributes);
    console.log(attributes);
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
