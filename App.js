import React, { useState, useEffect } from 'react';
import {
	ActivityIndicator,
	Button,
	Clipboard,
	FlatList,
	Image,
	Share,
	StyleSheet,
	Text,
	ScrollView,
	View,
	Alert,
	TouchableOpacity,
	platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import * as ImageManipulator from 'expo-image-manipulator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import uuid from 'uuid';
import Environment from './config/environment';
import * as firebase from 'firebase';
import { render } from 'react-dom';

const config = {
	apiKey: Environment['FIREBASE_API_KEY'],
	authDomain: Environment['FIREBASE_AUTH_DOMAIN'],
	databaseURL: Environment['FIREBASE_DATABASE_URL'],
	projectId: Environment['FIREBASE_PROJECT_ID'],
	storageBucket: Environment['FIREBASE_STORAGE_BUCKET'],
	messagingSenderId: Environment['FIREBASE_MESSAGING_SENDER_ID']
};

!firebase.apps.length
	? firebase.initializeApp(config).firestore()
	: firebase.app();


const App = () => {

	const [image, SetImage] = useState(null)
	const [uploading, SetUploading] = useState(false)
	const [googleResponse, SetGoogleResponse] = useState(null)
	const [test, SetTest] = useState(null)

	useEffect(() => {
		if (image) {
			submitToGoogle();
		}
	}, [image])


	const maybeRenderUploadingOverlay = () => {
		if (uploading) {
			return (
				<View
					style={[
						{
							backgroundColor: '#fff',
							alignItems: 'center',
							justifyContent: 'center'
						}
					]}
				>
					<ActivityIndicator style={{ marginTop: 60 }} color="blue" animating size="large" />
				</View>
			);
		}
	};

	const maybeRenderImage = () => {
		if (!image) {
			return;
		} else {

			return (
				<View>
					<View>
						<Image source={{ uri: image }} style={{ width: 250, height: 250, marginTop: 10, marginBottom: 20, borderRadius: 20 }} />
					</View>

					{/* <TouchableOpacity onPress={submitToGoogle}>
						<View style={{ padding: 10, backgroundColor: "#395dbf", borderRadius: 30, marginTop: 10 }}>
							<Text style={{ color: "#fff", fontWeight: "bold", alignSelf: "center" }}>Analyze</Text>

						</View>
					</TouchableOpacity> */}
					<View style={{ marginTop: 10 }}>
						{googleResponse && (
							<FlatList
								data={test}
								// extraData={this.state}
								keyExtractor={(item, index) => item.id}
								renderItem={({ item }) =>
									<TouchableOpacity>
										<Text style={{
											borderStyle: 'solid',
											borderWidth: 1,
											borderRadius: 5,
											paddingVertical: 5,
											paddingLeft: 5,
											fontSize: 16,
											height: 40,
											color: '#150b2e',
											fontWeight: 'bold',
										}}>
											{item}
										</Text>
									</TouchableOpacity>}
							/>
						)}


					</View>
				</View>
			);
		}
	};



	const takePhoto = async () => {
		if (Constants.platform.ios) {
			const { status: cameraStatus } = await Permissions.askAsync(
				Permissions.CAMERA,
			);
			if (cameraStatus !== 'granted') {
				alert('Sorry, Camera permissions not granted');
			}
		}
		let pickerResult = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,

		});
		handleImagePicked(pickerResult);

	};

	const pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
		});

		handleImagePicked(pickerResult);
	};

	// _handleImagePicked = async pickerResult => {
	// 	try {
	// 		this.setState({ uploading: true });

	// 		if (!pickerResult.cancelled) {

	// 			const uploadUrl = pickerResult.uri

	// 			this.setState({ image: uploadUrl });
	// 		}
	// 	}

	// 	finally {
	// 		this.setState({ uploading: false });
	// 	}
	// }

	const handleImagePicked = async pickerResult => {
		try {
			SetUploading(true)

			if (!pickerResult.cancelled) {
				var uploadUrl = await uploadImageAsync(pickerResult.uri);
				SetImage(uploadUrl)
				// if (uploadUrl) {
				// 	submitToGoogle()
				// }
			}
		}
		catch (e) {

			alert('Upload failed, sorry :(');
		}
		finally {
			SetUploading(false)
		}
	};

	const submitToGoogle = async () => {
		try {
			SetUploading(true)

			const body = JSON.stringify({
				requests: [
					{
						features: [
							// { type: 'LABEL_DETECTION', maxResults: 10 },
							// { type: 'LANDMARK_DETECTION', maxResults: 5 },
							// { type: 'FACE_DETECTION', maxResults: 5 },
							// { type: 'LOGO_DETECTION', maxResults: 5 },
							{ type: 'TEXT_DETECTION', maxResults: 5 },
							{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 5 },
							// { type: 'SAFE_SEARCH_DETECTION', maxResults: 5 },
							// { type: 'IMAGE_PROPERTIES', maxResults: 5 },
							// { type: 'CROP_HINTS', maxResults: 5 },
							// { type: 'WEB_DETECTION', maxResults: 5 }
						],
						image: {
							source: {
								imageUri: image
							}
						}
					}
				]
			});
			const response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=' +
				Environment['GOOGLE_CLOUD_VISION_API_KEY'],
				{
					headers: {
						Accept: 'application',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: body
				}
			);
			const responseJson = await response.json();
			const test = responseJson.responses[0].textAnnotations[0].description.split("\n");
			SetTest(test),
				SetGoogleResponse(responseJson),
				SetUploading(false)

		} catch (error) {
			console.log(error);
		}
	};


	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.contentContainer}
			>
				<View style={styles.helpContainer}>

					<View style={{ alignSelf: "flex-end", marginRight: 10 }}>
						{image ?
							<TouchableOpacity onPress={() => {
								SetImage(null),
									SetTest(null)

							}}>
								<MaterialCommunityIcons
									name='reload'
									size={30}
									color='red'
								/>
							</TouchableOpacity>
							: null}
					</View>


					<View style={{ flexDirection: "row" }} >
						<Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 30 }}>Select Type</Text>

					</View>

					<TouchableOpacity onPress={() => {
						pickImage(),
							SetImage(null),
							SetTest(null)
					}}>
						<View style={{ padding: 10, backgroundColor: "#395dbf", borderRadius: 30, marginTop: 10 }}>
							<Text style={{ color: "#fff", fontWeight: "bold" }}>Pick an image from camera roll</Text>

						</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => {
						takePhoto(),
							SetImage(null),
							SetTest(null)
					}}>
						<View style={{ padding: 10, backgroundColor: "#395dbf", borderRadius: 30, marginTop: 10 }}>
							<Text style={{ color: "#fff", fontWeight: "bold" }}>Take a photo</Text>

						</View>
					</TouchableOpacity>

					{maybeRenderImage()}
					{maybeRenderUploadingOverlay()}
				</View>
			</ScrollView>
		</View>
	);
}



async function uploadImageAsync(uri) {
	const blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function () {
			resolve(xhr.response);
		};
		xhr.onerror = function (e) {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});

	const ref = firebase
		.storage()
		.ref()
		.child(uuid.v4());
	const snapshot = await ref.put(blob);

	blob.close();

	return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingBottom: 10
	},
	contentContainer: {
		paddingTop: 30
	},

	getStartedContainer: {
		alignItems: 'center',
		marginHorizontal: 50
	},
	EyeOff: {
		marginTop: -10,
		textAlign: 'right',
		marginRight: 10,
	},

	getStartedText: {
		fontSize: 17,
		color: 'rgba(96,100,109, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	helpContainer: {
		marginTop: 15,
		alignItems: 'center'
	}
});
export default App;
