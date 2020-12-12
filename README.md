
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
<b>Note: If you have changed/edited/added images or image folders to your KnownFacesPath you must redeploy the node to ReInitialize the FaceMatcher.</b> On the first image you send, FaceMatcher is ran to process all the images into Labeled Face Descriptors for each dir name and individual descriptions for images. Then it is saved to context and used for Facial Recognition for all future images you send in a message. <br>
> - distanceThreshold - returns results based on measures of how far away, Euclidean distance of face descriptor, the user submitted image is compared to how far away, Euclidean distance of face descriptors, it is to all the faces found in the labeled subfolder that are above the distanceThreshold. <b>Simply put: return names for person if it is this distanceThreshold of confidence.</b> The lower the distanceThreshold is the more likely you are to get a incorrect match. The higher the distanceThreshold is the more likely it is that a person will not be recognized.



## Example_Flows

<b>BASIC:</b>

![basic_example.png](./doc/basic_example.jpg)

```
[{"id":"461f9a48.bcb9dc","type":"tab","label":"basic - face","disabled":false,"info":""},{"id":"253c371.ef72948","type":"inject","z":"461f9a48.bcb9dc","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":160,"y":100,"wires":[["780b7c48.705bb4"]]},{"id":"780b7c48.705bb4","type":"file in","z":"461f9a48.bcb9dc","name":"","filename":".node-red/node_modules/node-red-contrib-facial-recognition/example/unknown_face/sample (1).jpg","format":"","chunk":false,"sendError":false,"encoding":"none","x":420,"y":140,"wires":[["723b347d.de38c4"]]},{"id":"ce4c6bba.732628","type":"debug","z":"461f9a48.bcb9dc","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":330,"y":180,"wires":[]},{"id":"723b347d.de38c4","type":"facial-recognition","z":"461f9a48.bcb9dc","image":"payload","settings":"settings","name":"","bindings":"CPU","FaceDetector":"SsdMobilenetv1","FaceDetector_SsdMobilenetv1_maxResults":3,"FaceDetector_SsdMobilenetv1_minConfidence":"0.6","FaceDetector_tinyFaceDetector_inputSize":"416","FaceDetector_tinyFaceDetector_scoreThreshold":".4","Tasks":"detectAllFaces","FaceLandmarks":true,"FaceExpressions":true,"AgeAndGender":true,"FaceDescriptors":true,"Face_Recognition":"Face_Recognition_disabled","Face_Recognition_enabled_path":"/example/labeled_face","Face_Recognition_distanceThreshold":0.7,"x":170,"y":180,"wires":[["ce4c6bba.732628"]]},{"id":"e8f9b7f9.d068c","type":"comment","z":"461f9a48.bcb9dc","name":"Detect all faces in image","info":"","x":150,"y":60,"wires":[]},{"id":"8dfa5c87.07ff88","type":"inject","z":"461f9a48.bcb9dc","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":160,"y":280,"wires":[["436bc2a1.d01c0c"]]},{"id":"436bc2a1.d01c0c","type":"file in","z":"461f9a48.bcb9dc","name":"","filename":".node-red/node_modules/node-red-contrib-facial-recognition/example/unknown_face/sample (1).jpg","format":"","chunk":false,"sendError":false,"encoding":"none","x":420,"y":320,"wires":[["9141c2c6.98d8"]]},{"id":"e60e1e9a.162488","type":"debug","z":"461f9a48.bcb9dc","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":330,"y":360,"wires":[]},{"id":"9141c2c6.98d8","type":"facial-recognition","z":"461f9a48.bcb9dc","image":"payload","settings":"settings","name":"","bindings":"CPU","FaceDetector":"SsdMobilenetv1","FaceDetector_SsdMobilenetv1_maxResults":3,"FaceDetector_SsdMobilenetv1_minConfidence":"0.6","FaceDetector_tinyFaceDetector_inputSize":"416","FaceDetector_tinyFaceDetector_scoreThreshold":".4","Tasks":"detectSingleFace","FaceLandmarks":true,"FaceExpressions":true,"AgeAndGender":true,"FaceDescriptors":true,"Face_Recognition":"Face_Recognition_disabled","Face_Recognition_enabled_path":"/example/labeled_face","Face_Recognition_distanceThreshold":0.7,"x":170,"y":360,"wires":[["e60e1e9a.162488"]]},{"id":"78c855b8.487054","type":"comment","z":"461f9a48.bcb9dc","name":"Detect a single face in image","info":"","x":160,"y":240,"wires":[]},{"id":"89e26069.bd2b28","type":"inject","z":"461f9a48.bcb9dc","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":160,"y":800,"wires":[["f11f6aa8.b70e28"]]},{"id":"f11f6aa8.b70e28","type":"file in","z":"461f9a48.bcb9dc","name":"","filename":".node-red/node_modules/node-red-contrib-facial-recognition/example/unknown_face/sample (1).jpg","format":"","chunk":false,"sendError":false,"encoding":"none","x":420,"y":840,"wires":[["a5c2774c.45ee18"]]},{"id":"b2275b16.4bf098","type":"debug","z":"461f9a48.bcb9dc","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":330,"y":880,"wires":[]},{"id":"a5c2774c.45ee18","type":"facial-recognition","z":"461f9a48.bcb9dc","image":"payload","settings":"settings","name":"","bindings":"CPU","FaceDetector":"SsdMobilenetv1","FaceDetector_SsdMobilenetv1_maxResults":3,"FaceDetector_SsdMobilenetv1_minConfidence":"0.6","FaceDetector_tinyFaceDetector_inputSize":"416","FaceDetector_tinyFaceDetector_scoreThreshold":".4","Tasks":"detectSingleFace","FaceLandmarks":true,"FaceExpressions":true,"AgeAndGender":true,"FaceDescriptors":true,"Face_Recognition":"Face_Recognition_enabled","Face_Recognition_enabled_path":"/example/labeled_face","Face_Recognition_distanceThreshold":0.7,"x":170,"y":880,"wires":[["b2275b16.4bf098"]]},{"id":"a61a85b5.9ca8a8","type":"comment","z":"461f9a48.bcb9dc","name":"Recognize a single face in image","info":"","x":170,"y":680,"wires":[]},{"id":"6014abc6.1b1e44","type":"inject","z":"461f9a48.bcb9dc","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":160,"y":540,"wires":[["9fdd93b3.5bae78"]]},{"id":"9fdd93b3.5bae78","type":"file in","z":"461f9a48.bcb9dc","name":"","filename":".node-red/node_modules/node-red-contrib-facial-recognition/example/unknown_face/sample (1).jpg","format":"","chunk":false,"sendError":false,"encoding":"none","x":420,"y":580,"wires":[["674fa2c4.b218a4"]]},{"id":"9e1ff55a.983518","type":"debug","z":"461f9a48.bcb9dc","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":330,"y":620,"wires":[]},{"id":"674fa2c4.b218a4","type":"facial-recognition","z":"461f9a48.bcb9dc","image":"payload","settings":"settings","name":"","bindings":"CPU","FaceDetector":"SsdMobilenetv1","FaceDetector_SsdMobilenetv1_maxResults":3,"FaceDetector_SsdMobilenetv1_minConfidence":"0.6","FaceDetector_tinyFaceDetector_inputSize":"416","FaceDetector_tinyFaceDetector_scoreThreshold":".4","Tasks":"detectAllFaces","FaceLandmarks":true,"FaceExpressions":true,"AgeAndGender":true,"FaceDescriptors":true,"Face_Recognition":"Face_Recognition_enabled","Face_Recognition_enabled_path":"/example/labeled_face","Face_Recognition_distanceThreshold":0.7,"x":170,"y":620,"wires":[["9e1ff55a.983518"]]},{"id":"8cf4cfb4.ed002","type":"comment","z":"461f9a48.bcb9dc","name":"Recognize all faces in image","info":"","x":160,"y":420,"wires":[]},{"id":"c5fd45b7.420ca","type":"comment","z":"461f9a48.bcb9dc","name":"Note: you will notice it takes longer the first time as it has to load all images","info":"","x":340,"y":460,"wires":[]},{"id":"ef0f1da5.894ba","type":"comment","z":"461f9a48.bcb9dc","name":"the next time you run it it should take less time","info":"","x":250,"y":500,"wires":[]},{"id":"34375cfb.87a60c","type":"comment","z":"461f9a48.bcb9dc","name":"Note: you will notice it takes longer the first time as it has to load all images","info":"","x":340,"y":720,"wires":[]},{"id":"58e76f00.7b4288","type":"comment","z":"461f9a48.bcb9dc","name":"the next time you run it it should take less time","info":"","x":250,"y":760,"wires":[]}]
```


<b>Advanced:</b>

<b>NOTE: other node-red nodes required</b>

[node-red-node-annotate-image](https://flows.nodered.org/node/node-red-node-annotate-image)

[node-red-contrib-image-output](https://flows.nodered.org/node/node-red-contrib-image-output)
<br>
<br>
<br>


![advanced_example.png](./doc/advanced_example.jpg)

```
[{"id":"63368d69.d11d5c","type":"tab","label":"Advanced - face","disabled":false,"info":""},{"id":"bdc0b3ae.b9a248","type":"inject","z":"63368d69.d11d5c","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":180,"y":220,"wires":[["f42eabc3.f6e658"]]},{"id":"f42eabc3.f6e658","type":"file in","z":"63368d69.d11d5c","name":"","filename":".node-red/node_modules/node-red-contrib-facial-recognition/example/unknown_face/sample (1).jpg","format":"","chunk":false,"sendError":false,"encoding":"none","x":620,"y":220,"wires":[["510508cd.bc342"]]},{"id":"da4443a6.9f59d8","type":"function","z":"63368d69.d11d5c","name":"Prep rects for annotate image node","func":"//global vars\nvar the_rects;\n\n//was detectAllFaces or detectSingleFace used\n//check to see if payload.Result is an array (detectAllFaces)\nvar Result = msg.payload.Result;\nif ( Array.isArray(Result) ) {\n    // get just the rect values and place in array\n    the_rects = Result.map(x => {\n        //check for label from FaceRecognition\n        var match_label;\n        if ( x.match ) {\n            match_label = x.match._label;\n        }\n        else {\n            match_label = \"\";\n        }\n        var result = {\n            type: \"rect\",\n            x: x.detection._box._x,\n            y: x.detection._box._y,\n            w: x.detection._box._width,\n            h: x.detection._box._height,\n            label: match_label\n        }\n        return result;\n    });\n    msg.annotations = the_rects;\n}\n//else detectSingleFace was used\nelse {\n    //check for label from FaceRecognition\n        var match_label;\n        if ( Result.match ) {\n            match_label = Result.match._label;\n        }\n        else {\n            match_label = \"\";\n        }\n    the_rects = [{\n        type: \"rect\",\n        x: Result.detection._box._x,\n        y: Result.detection._box._y,\n        w: Result.detection._box._width,\n        h: Result.detection._box._height,\n        label: match_label.match._label\n    }]\n    msg.annotations = the_rects;\n}\n\n\n\n//var xx = msg.payload.Result[0].detection._box._x;\n//var yy = msg.payload.Result[0].detection._box._y;\n//var ww = msg.payload.Result[0].detection._box._width;\n//var hh = msg.payload.Result[0].detection._box._height;\n\n//msg.annotations = [ {\n//    type: \"rect\",\n//    //bbox: [ xx, yy, ww, hh],\n//    x: xx, y: yy, w: ww, h: hh,\n//    //bbox: [ 100, 100, 100, 100],\n//    label: \"Tara Sanford\"\n//}]\n\nmsg.payload = msg.payload.OriginalBufferedImg;\n\nreturn msg;\n\n","outputs":1,"noerr":0,"initialize":"","finalize":"","x":500,"y":300,"wires":[["c4b929f7.c31d78"]]},{"id":"c4b929f7.c31d78","type":"annotate-image","z":"63368d69.d11d5c","name":"","fill":"","stroke":"#0070c0","lineWidth":"20","fontSize":"48","fontColor":"#0070c0","x":800,"y":300,"wires":[["1504ab31.07575d"]]},{"id":"1504ab31.07575d","type":"image","z":"63368d69.d11d5c","name":"","width":"800","data":"payload","dataType":"msg","thumbnail":false,"active":true,"pass":false,"outputs":0,"x":180,"y":300,"wires":[]},{"id":"1bc415e3.ed6bea","type":"debug","z":"63368d69.d11d5c","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":410,"y":260,"wires":[]},{"id":"510508cd.bc342","type":"facial-recognition","z":"63368d69.d11d5c","image":"payload","settings":"settings","name":"","bindings":"CPU","FaceDetector":"SsdMobilenetv1","FaceDetector_SsdMobilenetv1_maxResults":"5","FaceDetector_SsdMobilenetv1_minConfidence":"0.6","FaceDetector_tinyFaceDetector_inputSize":"416","FaceDetector_tinyFaceDetector_scoreThreshold":"0.5","Tasks":"detectAllFaces","FaceLandmarks":true,"FaceExpressions":true,"AgeAndGender":true,"FaceDescriptors":true,"Face_Recognition":"Face_Recognition_enabled","Face_Recognition_enabled_path":"/example/labeled_face","Face_Recognition_distanceThreshold":0.7,"x":190,"y":260,"wires":[["1bc415e3.ed6bea","da4443a6.9f59d8"]]},{"id":"ee417043.f6b968","type":"comment","z":"63368d69.d11d5c","name":"Recognize all faces in image","info":"","x":180,"y":100,"wires":[]},{"id":"5bc97bde.44ff3c","type":"comment","z":"63368d69.d11d5c","name":"Note: you will notice it takes longer the first time as it has to load all images","info":"","x":360,"y":140,"wires":[]},{"id":"d0d6d5db.66c4b","type":"comment","z":"63368d69.d11d5c","name":"the next time you run it it should take less time","info":"","x":270,"y":180,"wires":[]}]
```

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
version 0.24.86 - Fix documentation, added examples and intro image to top of page.
<br>
<br>
version 0.24.85 - Fix documentation, updating examples!
<br>
<br>
version 0.24.84 - First Public release
<br>
<br>
