// change the file name dummy.environment.js to "environment.js"
// and add your keys below
import {
	GOOGLE_CLOUD_VISION_API_KEY,
	FIREBASE_API_KEY,
	FIREBASE_AUTH_DOMAIN,
		FIREBASE_DATABASE_URL,
		FIREBASE_PROJECT_ID,
		FIREBASE_STORAGE_BUCKET,
		FIREBASE_MESSAGING_SENDER_ID
	} from "../secret.js";

	var environments = {
		staging: {
			FIREBASE_API_KEY,
			FIREBASE_AUTH_DOMAIN,
			FIREBASE_DATABASE_URL,
			FIREBASE_PROJECT_ID,
			FIREBASE_STORAGE_BUCKET,
			FIREBASE_MESSAGING_SENDER_ID,
			GOOGLE_CLOUD_VISION_API_KEY,
		},


		production: {
			FIREBASE_API_KEY,
			FIREBASE_AUTH_DOMAIN,
			FIREBASE_DATABASE_URL,
			FIREBASE_PROJECT_ID,
			FIREBASE_STORAGE_BUCKET,
			FIREBASE_MESSAGING_SENDER_ID,
			GOOGLE_CLOUD_VISION_API_KEY,
		}
	};

function getReleaseChannel() {
	// let releaseChannel = Expo.Constants.manifest.releaseChannel;
	// if (releaseChannel === undefined) {
	// 	return 'staging';
	// } else if (releaseChannel === 'staging') {
	// 	return 'staging';
	// } else {
	// 	return 'staging';
	// }
	return 'staging';
}
function getEnvironment(env) {
	console.log('Release Channel: ', getReleaseChannel());
	return environments[env];
}
var Environment = getEnvironment(getReleaseChannel());
export default Environment;