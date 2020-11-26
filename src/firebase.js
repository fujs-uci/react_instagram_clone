import firebase from "firebase";

// uses all firebase for auth, static fire storage, and db
const firebaseApp = firebase.initializeApp(
    {

    }
);

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();


export { db, auth, storage };



