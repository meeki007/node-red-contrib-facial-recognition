
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
  * [symbols](#symbols)
  * [spaces](#spaces)
  * [min](#min)
  * [max](#max)
* [Example_Flows](#Example_Flows)
* [Bugs / Feature request](#bugs--feature-request)
* [License](#license)
* [Work](#work)
* [Contributor_to_Project](#Contributor_of_Project)

---

## Install

Install with node-red Palette Manager or,

Run the following command in your Node-RED user directory - typically `~/.node-red`:

```
node-red-contrib-facial-recognition
```

---

## About

At its core it uses [@vladmandic/face-api](https://www.npmjs.com/package/@vladmandic/face-api) and [@tensorflow/tfjs-node ver.2.7.x](https://www.npmjs.com/package/@tensorflow/tfjs-node) and it can use @tensorflow/tfjs-node-gpu for the CUDA crazy amongst you.

vladmandic was a big help for us nodejs guys. After finding a bug and fielding questions, he took the time to make a nodejs build specific to tfjs-node. If you like this node-red-contrib-facial-recognition, I highly recommend you take the time to goto his github page [https://github.com/vladmandic/face-api](https://github.com/vladmandic/face-api) and throw his repo a star. This is the fastest solution without overhead for us nodejs guys.

---

## Usage

Takes a buffered image and runs TensorFlow Facial Detection & Facial Recognition to<br> Detect:
<br>Faces in an image
<br>Facial landmarks
<br>Compute Face Descriptors
<br>Face Expressions
<br>Age & Gender Recognition
<br>Face Recognition by Matching Descriptors

---

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
You do not have to fill out every option. You can omit any object key and its value. This node will then use the settings found in the nodes config Properties menu.

Note: ReInitializeFaceMatcher<br>
Set this value to <b>true</b> if you have changed/edited/added images or image folders to your KnownFacesPath to ReInitialize the FaceMatcher. Used to process all the images into Labeled Face Descriptors for each dir name and individual descriptions for images. Do not leave set to true! it takes significant time to process. Once its ran after you have made changes to images or image folder it is saved to context and used for Facial Recognition.

Else you can just re-deploy node-red and ReInitializeFaceMatcher will run one time only.

### Bindings

By default it is set to CPU - @tensorflow/tfjs-node, this will use your CPU to process images. However you may choose to install [@tensorflow/tfjs-node-gpu](https://www.npmjs.com/package/@tensorflow/tfjs-node) to utilize your video card to process images. This is not an easy process to get CUDA working. However if you go down this rabbit hole the benefits in time to process images are significant.

Good luck.

### FaceDetector

SsdMobilenetv1 - A Single Shot Multibox Detector; based on MobileNetV1.<br>
Computes the locations of each face in an image and returns the bounding boxes with it's probability for each face. High accuracy in detecting face bounding boxes at the cost of time to compute.<br>
&emsp;&emsp;maxResults - The max number of faces to return<br>
&emsp;&emsp;minConfidence - returns results for face(s) in a image above Confidence threshold

tinyFaceDetector - a fast realtime face detector, and less resource consuming compared to the SSD Mobilenet V1 face detector. It is poor at detecting small faces. Best face detector on resource limited devices.<br>
&emsp;&emsp;inputSize - size at which image is processed, the smaller the faster, <b>number must be divisible by 32</b>. Common sizes are 128, 160, 224, 320, 416, 512, 608<br>
&emsp;&emsp;scoreThreshold - returns results for face(s) in a image above Confidence threshold




### digits

The number of digits, as an integer, the message string must contain to be valid.<br><u>Example:</u> A value of 2 requires that the message has two integers in its string to be valid. A value of 0 requires that the message has no integers in its string to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as many or none in the message string as you want.

### letters

The number of letters, as an integer, the message string must contain to be valid.<br><u>Example:</u> A value of 2 requires that the message has two integers in its string to be valid. A value of 0 requires that the message has no integers in its string to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as many or none in the message string as you want.

### lowercase

The number of lowercase, as an integer, the message string must contain to be valid.<br><u>Example:</u> A value of 2 requires that the message has two integers in its string to be valid. A value of 0 requires that the message has no integers in its string to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as many or none in the message string as you want.

### uppercase

The number of uppercase, as an integer, the message string must contain to be valid.<br><u>Example:</u> A value of 2 requires that the message has two integers in its string to be valid. A value of 0 requires that the message has no integers in its string to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as many or none in the message string as you want.

### symbols

The number of symbols, as an integer, the message string must contain to be valid.<br><u>Example:</u> A value of 2 requires that the message has two integers in its string to be valid. A value of 0 requires that the message has no integers in its string to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as many or none in the message string as you want.

### spaces

The number of spaces, as an integer, the message string must contain to be valid.<br><u>Example:</u> A value of 2 requires that the message has two integers in its string to be valid. A value of 0 requires that the message has no integers in its string to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as many or none in the message string as you want.

### min

The minimum length of the string, as an integer, the message string length must be to be valid.<br><u>Example:</u> A value of 8 requires that the message length must be at least 8 to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as short of a message string as you want.

### max

The maximum length of the string, as an integer, the message string length must be to be valid.<br><u>Example:</u> A value of 10 requires that the message cant be any longer than 10 to be valid. Leaving the field empty/blank will ignore the validation check, so you can have as long of a message string as you want.


## Example_Flows

![examplenode.png](./doc/examplenode.png)

```
[{"id":"73c29dde.c5cc64","type":"password-validator","z":"a9e4b48d.e82d3","property":"payload","name":"","digits":"2","letters":"","lowercase":"","uppercase":"2","symbols":"2","spaces":"0","min":"10","max":"38","x":850,"y":220,"wires":[["7c253a1e.145744"]]},{"id":"86ad8c7f.0fab2","type":"inject","z":"a9e4b48d.e82d3","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":280,"y":200,"wires":[["b64bca70.6254f"]]},{"id":"7c253a1e.145744","type":"debug","z":"a9e4b48d.e82d3","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":810,"y":260,"wires":[]},{"id":"b64bca70.6254f","type":"change","z":"a9e4b48d.e82d3","name":"msg.payload = &!rf3Pl3YeNSq^a@bloL!a!J","rules":[{"t":"set","p":"payload","pt":"msg","to":"&!rf3Pl3YeNSq^a@bloL!a!J","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":550,"y":200,"wires":[["73c29dde.c5cc64"]]},{"id":"46bdb6bb.52347","type":"comment","z":"a9e4b48d.e82d3","name":"Good Password","info":"","x":460,"y":160,"wires":[]},{"id":"82f9cef1.16781","type":"inject","z":"a9e4b48d.e82d3","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":280,"y":280,"wires":[["80722e1b.250948"]]},{"id":"80722e1b.250948","type":"change","z":"a9e4b48d.e82d3","name":"msg.payload = password","rules":[{"t":"set","p":"payload","pt":"msg","to":"password","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":490,"y":280,"wires":[["73c29dde.c5cc64"]]},{"id":"84b6fa87.9ce408","type":"comment","z":"a9e4b48d.e82d3","name":"Bad Password","info":"","x":450,"y":240,"wires":[]}]
```

<br>
Please import this flow as an example of how to use.

<br>


## Bugs / Feature request
Please [report](https://github.com/meeki007/node-red-contrib-ads1x15-raspi/issues) bugs and feel free to [ask](https://github.com/node-red-contrib-ads1x15-raspi/issues) for new features directly on GitHub.


## License
This project is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.


## Work
_Need a node?
_Need automation work?
_Need computers to flip switches?

Contact me at meeki007@gmail.com


## Contributor_to_Project

Thanks to [Tarun Batra AKA tarunbatra](https://github.com/tarunbatra/password-validator) for his work on password-validator. It made making this node for node-red possible.


## release notes ##
0.0.0 = (majorchange) . (new_feature) . (bugfix-simple_mod)
<br>
<br>
version 0.2.16 - First Public release
<br>
<br>
version 0.2.17 - correct documentation linking names in MD file
<br>
<br>
