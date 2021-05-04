import React from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import uuid from 'uuid';
import Environment from './config/environment';
import * as firebase from 'firebase';

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

export default class App extends React.Component {
	state = {
		image: null,
		uploading: false,
		googleResponse: null
	};

	// async componentDidMount() {
	// 	await Permissions.askAsync(Permissions.CAMERA_ROLL);
	// 	await Permissions.askAsync(Permissions.CAMERA);
	// }

	render() {
		let { image } = this.state;
		return (
			<View style={styles.container}>
				<ScrollView
					style={styles.container}
					contentContainerStyle={styles.contentContainer}
				>
					<View style={styles.helpContainer}>
						<View style={{ flexDirection: "row", padding: 10 }}>
							<Button
								onPress={this._pickImage}
								title="Pick an image from camera roll"
							/>
							{this.state.image ?
								<TouchableOpacity onPress={() => {
									this.setState({ image: null })

								}}>
									<MaterialCommunityIcons
										style={{ marginLeft: 15 }}
										name='reload'
										size={30}
										color='red'
									/>
								</TouchableOpacity>
								: null}
						</View>
						<Button onPress={this._takePhoto} title="Take a photo" />

						{this._maybeRenderImage()}
						{this._maybeRenderUploadingOverlay()}
					</View>
				</ScrollView>
			</View>
		);
	}

	_maybeRenderUploadingOverlay = () => {
		if (this.state.uploading) {
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

	_maybeRenderImage = () => {
		let { image, googleResponse } = this.state;
		if (!image) {
			return;
		} else {

			return (
				<View>
					<View>
						<Image source={{ uri: image }} style={{ width: 300, height: 300, marginTop: 10 }} />
					</View>

					<Button
						style={{ marginBottom: 20 }}
						onPress={() => this.submitToGoogle()}
						title="Analyze!"
					/>
					<View style={{ marginTop: 10 }}>
						{this.state.googleResponse && (
							<FlatList
								data={this.state.test}
								extraData={this.state}
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


	// _share = () => {
	// 	Share.share({
	// 		message: JSON.stringify(this.state.googleResponse.responses),
	// 		title: 'Check it out',
	// 		url: this.state.image
	// 	});
	// };

	// _copyToClipboard = () => {
	// 	Clipboard.setString(this.state.image);
	// 	alert('Copied to clipboard');
	// };


	_takePhoto = async () => {
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
			aspect: [3, 3],
			quality: 0.2,
			base64: true,
		});
		this._handleImagePicked(pickerResult);

	};

	_pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
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

	_handleImagePicked = async pickerResult => {
		try {
			this.setState({ uploading: true });

			if (!pickerResult.cancelled) {
				var uploadUrl = await uploadImageAsync(pickerResult.uri);
				this.setState({ image: uploadUrl });
			}
		}
		catch (e) {

			alert('Upload failed, sorry :(');
		}
		finally {
			this.setState({ uploading: false });
		}
	};

	submitToGoogle = async () => {
		try {
			this.setState({ uploading: true });
			let { image } = this.state;
			let body = JSON.stringify({
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
			this.setState({
				test: test,
				googleResponse: responseJson,
				uploading: false
			});
		} catch (error) {
			console.log(error);
		}
	};
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
