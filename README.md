
node-red-contrib-facial-recognition
===================================


<a href="http://nodered.org" target="_new">Node-RED</a> - Provides a node-red node for Facial Detection & Facial Recognition.

![image.jpg](./doc/image.jpg)

---

## Table of Contents
* [Requirements](#Requirements)
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
* [Heavy_image_processing_or_mjpeg_video_stream](#Heavy_image_processing_or_mjpeg_video_stream)
* [FaceRecognition_Persistant_labeledFaceDescriptors](#FaceRecognition_Persistant_labeledFaceDescriptors)
* [Bugs_Feature_request](#Bugs_Feature_request)
* [License](#license)
* [Work](#work)
* [Contributor](#Contributor)

---

## Requirements

Node version 12.x or higher. Use `node -v` in terminal to find out

Node-red version 1.x or higher.

---

## Install

Install with node-red Palette Manager or,

Run the following command in your Node-RED user directory - typically `~/.node-red`:
```
npm install node-red-contrib-facial-recognition
```

**Windows users:** If your having issues and use the trouble shooting guide. Run the commands in the [Windows troubleshooting guide](https://github.com/tensorflow/tfjs/blob/master/tfjs-node/WINDOWS_TROUBLESHOOTING.md) from within your Node-RED user directory - typically ~/.node-red

**Docker users:** Node-red's official docker will not work. It is based on alpine and is not `libc6` compatible. Please see this thread for how to install a docker version of node-red that works. [https://discourse.nodered.org/t/announce-node-red-contrib-facial-recognition/37384/53](https://discourse.nodered.org/t/announce-node-red-contrib-facial-recognition/37384/53)


---

## About

At its core it uses [@vladmandic/face-api](https://www.npmjs.com/package/@vladmandic/face-api) and [@tensorflow/tfjs-node ver.2.7.x](https://www.npmjs.com/package/@tensorflow/tfjs-node) and it can use @tensorflow/tfjs-node-gpu for the CUDA crazy amongst you.

vladmandic was a big help for us nodejs guys. After finding a bug and fielding questions, he took the time to make a nodejs build specific to tfjs-node. If you like this node-red-contrib-facial-recognition, I highly recommend you take the time to goto vladmandic's github page [https://github.com/vladmandic/face-api](https://github.com/vladmandic/face-api) and throw his repo a star.

---

## Usage

Takes a buffered image and runs TensorFlow Facial Detection and/or Facial Recognition to Detect:<br>
> - Faces in an image
> - Facial landmarks
> - Compute Face Descriptors
> - Face Expressions
> - Age & Gender Recognition
> - Face Recognition by Matching Descriptors

---

## Node_Properties

### Name

Define the msg name if you wish to change the name displayed on the node.

### Image

You can change the msg property value that you send a buffered image of your choice to.<br>Example: msg.NameOfYourChoice

<b>Image size and the avalible memory on the device your using.</b> Sending a 4mb image on a raspberry pi will crash the node. If your running other stuff this size will be lower. The tensorfolow core only sends out a Standard Error when you push the limits of your devices memory. If your unsure look at your node-red console log to see if you unsure if the image size is too big.

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
Note: FaceDetector minConfidence Properties affect the labeledFaceDescriptors. If you have a minConfidence of .9 you may miss a bunch of faces when building your labeledFaceDescriptors. after you run the node once or supply it a labeledFaceDescriptors from a persistant storage you can set the value to any level you wish for screening the input image you send<br>
> - KnownFacesPath - The location of the main folder that contains all subfolders, labeled with persons name. If you change the value of this path you mush use a full path. Example: /home/myuser/name/TheFolderIPutAllTheLabledFaceFolderIn.<br> Subfolders should contain close-up face images of the individual. The actual name of the file in this folder does not matter. Please look at the structure of the example folder for more understanding. The name of the subfolder is what is used to label the faces for facial recognition.<br>
<b>Note: If you have changed/edited/added images or image folders to your KnownFacesPath you must redeploy the node to ReInitialize the FaceMatcher.</b> On the first image you send, FaceMatcher is ran to process all the images into Labeled Face Descriptors for each dir name and individual descriptions for images. Then it is saved to context and used for Facial Recognition for all future images you send in a message. <br>
> - distanceThreshold - returns results based on measures of how far away, Euclidean distance of face descriptor, the user submitted image is compared to how far away, Euclidean distance of face descriptors, it is to all the faces found in the labeled subfolder that are above the distanceThreshold. <b>Simply put: return names for person if it is this distanceThreshold of confidence.</b> The lower the distanceThreshold is the more likely you are to get a incorrect match. The higher the distanceThreshold is the more likely it is that a person will not be recognized.

---

## Example_Flows

<b>BASIC:</b>

![basic_example.jpg](./doc/basic_example.jpg)

[Click Me For BASIC example](https://raw.githubusercontent.com/meeki007/node-red-contrib-facial-recognition/main/doc/basic)


---

<b>Advanced:</b>

<b>NOTE: other node-red nodes required</b>

[node-red-node-annotate-image](https://flows.nodered.org/node/node-red-node-annotate-image)

[node-red-contrib-image-output](https://flows.nodered.org/node/node-red-contrib-image-output)



![advanced_example.jpg](./doc/advanced_example.jpg)

[Click Me For Advanced example](https://raw.githubusercontent.com/meeki007/node-red-contrib-facial-recognition/main/doc/advanced)


---

## Heavy_image_processing_or_mjpeg_video_stream

Every output object message from this node has sec_to_complete with the amount of time it took to process the image.<br>
Based on your device/processing speed/CPU or CUDA will vary the amount of time it takes to process the image.

So if it takes 0.623 seconds to do a facialrecognition and your sending it 15 frames a second you will create a backlog of work and overflow the node.

The best thing to do is use multiple facial-recognition nodes to process the images as individual workers.

then check to see if it is keeping up.

Example Flow:

<b>NOTE: other node-red nodes required</b>

[node-red-contrib-msg-router](https://flows.nodered.org/node/node-red-contrib-msg-router)

![Heavy_image_processing.jpg](./doc/Heavy_image_processing.jpg)

[Click Me For Heavy_image_processing_or_mjpeg_video_stream example](https://raw.githubusercontent.com/meeki007/node-red-contrib-facial-recognition/main/doc/Heavy_image_processing_or_mjpeg_video_stream)

---

## FaceRecognition_Persistant_labeledFaceDescriptors

Note: FaceDetector minConfidence Properties affect the labeledFaceDescriptors. If you have a minConfidence of .9 you may miss a bunch of faces when building your labeledFaceDescriptors. after you run the node once or supply it a labeledFaceDescriptors from a persistant storage you can set the value to any level you wish for screening the input image you send.

You can save the FaceRecognition labeledFaceDescriptors to persistant storage solution so you don't have to load all the images in your KnownFacesPath folder every time you deploy node red or if node-red/your device restarts.

This could be a HUGE time savings if you have thousands of people in your KnownFacesPath folder.

Also this shows how the msg.settings is used. Just un-comment anything you wish to override in the Properties menu of the node.

Example Flow:

![persistant_example.jpg](./doc/persistant_example.jpg)

[Click Me For FaceRecognition_Persistant_labeledFaceDescriptors example](https://raw.githubusercontent.com/meeki007/node-red-contrib-facial-recognition/main/doc/FaceRecognition_Persistant_labeledFaceDescriptors)

---

## Bugs_Feature_request
Please [report](https://github.com/meeki007/node-red-contrib-facial-recognition/issues) bugs and feel free to [ask](https://github.com/node-red-contrib-facial-recognition/issues) for new features directly on GitHub.

---

## License
This project is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.

All photos are free to use and provided by: [unsplash](https://unsplash.com/license).

---

## Work
_Need a node?
_Need automation work?
_Need computers to flip switches?

Contact me at meeki007@gmail.com

---

## Contributor

Thanks to:

[The @tensorflow/tfjs-node team](https://github.com/tarunbatra/password-validator) for supporting and maintaining a repo that allows us JS guys to create cool stuff.

[vladmandic and his @vladmandic/face-api](https://github.com/tarunbatra/password-validator) for help and support in creating a nodeJS specific build for the face-api.

<b>protocolus</b> for his work on finding images for the user example.

[Joshua Rondeau](https://unsplash.com/@liferondeau) for free use of his photos.

[Brandon Atchison](https://unsplash.com/@b_atchison98) for free use of his photos.

[zenofmud](https://discourse.nodered.org/u/zenofmud/summary) for bug fixes and new feature.

[M0ebiu5](https://discourse.nodered.org/u/moebius/summary) for helping change the logic of KnownFacesPath


---
Heavy_image_processing_or_mjpeg_video_stream
## release notes ##
0.0.0 = (majorchange) . (new_feature) . (bugfix-simple_mod)
<br>
<br>
version 0.29.104 - new_feature - Checks for node version greather than 12, added checks for @vladmandic/face-api
<br>
<br>
version 0.28.104 - documentation - Added Docker use info and Requirements section
<br>
<br>
version 0.28.103 - documentation - Switched to using msg-router for Heavy_image_processing_or_mjpeg_video_stream
<br>
<br>
version 0.28.102 - bug - fix how README.md is displayed on web pages
<br>
<br>
version 0.28.101 - documentation - Update FaceRecognition_Persistant_labeledFaceDescriptors to version based on zenofmud
<br>
<br>
version 0.28.100 - bug - M0ebiu5 change the logic of KnownFacesPath
<br>
<br>
version 0.28.99 - bug - fix faceapi = require for gpu, so the gpu option will work and up date documentation for path
<br>
<br>
version 0.28.98 - bug - docker post install script
<br>
<br>
version 0.28.97 - documentation - fix missing'<' for details
<br>
<br>
version 0.28.96 - documentation - add expand for examples
<br>
<br>
version 0.28.95 - documentation - correction
<br>
<br>
version 0.28.94 - documentation - Windows troubleshooting guide
<br>
<br>
version 0.28.93 - bug - fix disc in JSON file
<br>
<br>
version 0.28.92 - new_feature - persistent storage of labeledFaceDescriptors
<br>
<br>
version 0.27.92 - bug - remove github code mistake
<br>
<br>
version 0.27.91 - new_feature - zenofmud submitted a fix for MacOS .DS_Store file removal from files
<br>
<br>
version 0.26.91 - bug/new_feature - zenofmud submitted fix for MacOS .DS_Store file removal from folders, and a spelling error
<br>
<br>
version 0.26.90 - bug - file location fix
<br>
<br>
version 0.26.89 - new_feature - Removed eval and other optimizations
<br>
<br>
version 0.25.89 - bug - UnhandledPromiseRejection - added catch to handle these
<br>
<br>
<br>
version 0.25.88 - new_feature -added error checks for user submiting bad/unkown images to the folder or as msg.input
<br>
<br>
version 0.24.88 - bug -typo fix in documentation
<br>
<br>
version 0.24.87 - documentation - added Heavy_image_processing_or_mjpeg_video_stream section and example for it
<br>
<br>
version 0.24.86 - documentation - Fix documentation, added examples and intro image to top of page.
<br>
<br>
version 0.24.85 - documentation - Fix documentation, updating examples!
<br>
<br>
version 0.24.84 - First Public release
<br>
<br>
