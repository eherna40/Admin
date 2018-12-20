import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'
import {firebaseConfig} from 'Constants/defaultValues'

firebase.initializeApp(firebaseConfig);
const firebaseApp = firebase
const auth = firebase.auth();
const database = firebase.firestore()
database.settings({ timestampsInSnapshots: true })

export {
    auth,
    database,
    firebaseApp
};
