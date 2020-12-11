
node-red-contrib-facial-recognition
===================================


<a href="http://nodered.org" target="_new">Node-RED</a> - Provides a node-red node for Facial Detection & Facial Recognition.

---

## Table of Contents
* [Install](#install)
* [About](#About)
* [Usage](#usage)
* [Node_Properties](#Node_Properties)
  * [Name](#Name)
  * [Image](#Image)
  * [Settings](#Settings)
  * [Bindings](#Bindings)
  * [FaceDetector](#FaceDetector)
  * [FaceRecognition](#FaceRecognition)
* [Example_Flows](#Example_Flows)
* [Bugs_Feature_request](#Bugs_Feature_request)
* [License](#license)
* [Work](#work)
* [Contributor](#Contributor)

---

## Install

Install with node-red Palette Manager or,

Run the following command in your Node-RED user directory - typically `~/.node-red`:

```
node-red-contrib-facial-recognition
```

## About

At its core it uses [@vladmandic/face-api](https://www.npmjs.com/package/@vladmandic/face-api) and [@tensorflow/tfjs-node ver.2.7.x](https://www.npmjs.com/package/@tensorflow/tfjs-node) and it can use @tensorflow/tfjs-node-gpu for the CUDA crazy amongst you.

vladmandic was a big help for us nodejs guys. After finding a bug and fielding questions, he took the time to make a nodejs build specific to tfjs-node. If you like this node-red-contrib-facial-recognition, I highly recommend you take the time to goto vladmandic's github page [https://github.com/vladmandic/face-api](https://github.com/vladmandic/face-api) and throw his repo a star.


## Usage

Takes a buffered image and runs TensorFlow Facial Detection and/or Facial Recognition to Detect:<br>
> - Faces in an image
> - Facial landmarks
> - Compute Face Descriptors
> - Face Expressions
> - Age & Gender Recognition
> - Face Recognition by Matching Descriptors


## Node_Properties

### Name

Define the msg name if you wish to change the name displayed on the node.

### Image

You can change the msg property value that you send a buffered image of your choice to.<br>Example: msg.NameOfYourChoice

### Settings
This is optional, you do not have to send it anything. Used to override settings in the nodes config Properties menu.

You can change the msg property value that you send an object of your choice to.<br>
Example: msg.NameOfYourChoice

Sending a object to this msg property value will override any settings in the nodes config Properties menu. Great for using input messages to change settings on the fly.<br>
Please see/inport the example Flow section of this documentation for better understanding.<br>
Example:
```JS
msg.settings = {
  FaceDetector :
  {
    SsdMobilenetv1 :
    {
      maxResults : 4,
      minConfidence : 0.6
    }
  },
  Tasks :
  {
    detectAllFaces :
    {
      withFaceLandmarks : true,
      withFaceExpressions : true,
      withAgeAndGender : true,
      withFaceDescriptors : true
    }
  },
  FaceRecognition :
  {
    enabled :
    {
      KnownFacesPath : "/example/known_face",
      distanceThreshold : 0.6,
      ReInitializeFaceMatcher : false
    }
  }            
};
return msg;
```
You do not have to fill out every option. You can omit any object key and its value. This node will then use the settings found in the nodes config Properties menu for that omitted object key and its value.

<b>Note: ReInitializeFaceMatcher</b><br>
Set this value to <b>true</b> if you have changed/edited/added images or image folders to your KnownFacesPath to ReInitialize the FaceMatcher. Used to process all the images into Labeled Face Descriptors for each dir name and individual descriptions for images. Do not leave set to true! it takes significant time to process. Once its ran after you have made changes to images or image folder it is saved to context and used for Facial Recognition.

Else you can just re-deploy node-red and ReInitializeFaceMatcher will run one time only on the first image you send.

### Bindings

By default it is set to <b>CPU - @tensorflow/tfjs-node</b>, this will use your CPU to process images. However you may choose to install [@tensorflow/tfjs-node-gpu](https://www.npmjs.com/package/@tensorflow/tfjs-node) to utilize your video card to process images. This is not an easy process to get CUDA working. However if you go down this rabbit hole the benefits in time to process images are significant.

Good luck.

### FaceDetector

<b>SsdMobilenetv1</b> - A Single Shot Multibox Detector; based on MobileNetV1.<br>
Computes the locations of each face in an image and returns the bounding boxes with it's probability for each face. High accuracy in detecting face bounding boxes at the cost of time to compute.<br>
> - maxResults - The max number of faces to return<br>
> - minConfidence - returns results for face(s) in a image above Confidence threshold

<b>tinyFaceDetector</b> - a fast realtime face detector, and less resource consuming compared to the SSD Mobilenet V1 face detector. It is poor at detecting small faces. Best face detector on resource limited devices.<br>
> - inputSize - size at which image is processed, the smaller the faster, <b>number must be divisible by 32</b>. Common sizes are 128, 160, 224, 320, 416, 512, 608<br>
> - scoreThreshold - returns results for face(s) in a image above Confidence threshold

### Tasks

<b>detectAllFaces</b> - Utilize the selected FaceDetector to detect multiple faces in a buffered image sent in message by user<br>
<b>detectSingleFace</b> - Utilize the selected FaceDetector to detect a single face in a buffered image sent in message by user. If image contains multiple faces it will only detect one of them, hopefully the highest probability one.<br>
> - withFaceLandmarks - computes landmarks for each detected face(s)<br>
> - withFaceExpressions - recognize face expressions of each face(s)<br>
> - withAgeAndGender - estimate age and recognize gender of each face(s)<br>
> - withFaceDescriptor - computes the face descriptors for each face(s)<br>

### FaceRecognition

<b>disabled</b> - Don't use any facial recognition<br>
<b>enabled</b> - Performs face recognition, by comparing reference face descriptor(s) to determine the similarity to query face descriptor(s).<br>
> - KnownFacesPath - The location of the main folder that contains all subfolders, labeled with persons name. Subfolders should contain close-up face images of the individual. The actual name if the file in this folder does not matter. Please look at the structure of the example folder for more understanding. The name of the subfolder is what is used to label the faces for facial recognition.<br>
> - distanceThreshold - returns results based on measures of how far away, Euclidean distance of face descriptor, the user submitted image is compared to how far away, Euclidean distance of face descriptors, it is to all the faces found in the labeled subfolder that are above the distanceThreshold. <b>Simply put: return names for person if it is this distanceThreshold of confidence.</b> The lower the distanceThreshold is the more likely you are to get a incorrect match. The higher the distanceThreshold is the more likely it is that a person will not be recognized.



## Example_Flows

![examplenode.png](./doc/examplenode.png)

```
comming soon!
```

<br>
Please import this flow as an example of how to use.

<br>


## Bugs_Feature_request
Please [report](https://github.com/meeki007/node-red-contrib-facial-recognition/issues) bugs and feel free to [ask](https://github.com/node-red-contrib-facial-recognition/issues) for new features directly on GitHub.


## License
This project is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.

All photos are free to use and provided by: [unsplash](https://unsplash.com/license).


## Work
_Need a node?
_Need automation work?
_Need computers to flip switches?

Contact me at meeki007@gmail.com


## Contributor

Thanks to:

[The @tensorflow/tfjs-node team](https://github.com/tarunbatra/password-validator) for supporting and maintaining a repo that allows us JS guys to create cool stuff.

[vladmandic and his @vladmandic/face-api](https://github.com/tarunbatra/password-validator) for help and support in creating a nodeJS specific build for the face-api.

<b>protocolus</b> for his work on finding images for the user example.

[Joshua Rondeau](https://unsplash.com/@liferondeau) for free use of his photos.

[Brandon Atchison](https://unsplash.com/@b_atchison98) for free use of his photos.


## release notes ##
0.0.0 = (majorchange) . (new_feature) . (bugfix-simple_mod)
<br>
<br>
version 0.24.85 - Fix documentation, updating examples!
<br>
<br>
version 0.24.84 - First Public release
<br>
<br>
