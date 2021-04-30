import Environment from './environment';
import * as firebase from 'firebase';


const config = {
	apiKey: Environment['FIREBASE_API_KEY'],
	authDomain: Environment['FIREBASE_AUTH_DOMAIN'],
	databaseURL: Environment['FIREBASE_DATABASE_URL'],
	projectId: Environment['FIREBASE_PROJECT_ID'],
	storageBucket: Environment['FIREBASE_STORAGE_BUCKET'],
	messagingSenderId: Environment['FIREBASE_MESSAGING_SENDER_ID']
};

// const config = {
// 	apiKey: 'AIzaSyDjgC0tjyu_xinMaCIKjs8G-nUND7xQHzc',
// 	authDomain: 'cezcon-crm.firebaseapp.com',
// 	databaseURL:'https://cezcon-crm-default-rtdb.firebaseio.com/',
// 	projectId:'cezcon-crm',
// 	storageBucket: 'gs://cezcon-crm.appspot.com',
// 	messagingSenderId: '8724396675',
// };

export default !firebase.apps.length 
  ? firebase.initializeApp(config).firestore()
  : firebase.app();
