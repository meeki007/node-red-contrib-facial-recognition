
node-red-contrib-facial-recognition
===================================


<a href="http://nodered.org" target="_new">Node-RED</a> Provides a node-red node for Facial Detection & Facial Recognition.

---
## Table of Contents
* [Install](#install)
* [About](#About)
* [Usage](#usage)
  * [node_Properties](#node_Properties)
  * [node_outputs](#node_outputs)
  * [Name](#Name)
  * [digits](#digits)
  * [letters](#letters)
  * [lowercase](#lowercase)
  * [uppercase](#uppercase)
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

vladmandic was a big help for us nodejs guys. After finding a bug and fielding questions, he took the time to make a nodejs build specific to tfjs-node. If you like this node-red-contrib-facial-recognition, I highly recommend you take the time to goto his github page [https://github.com/vladmandic/face-api](https://github.com/vladmandic/face-api) and throw this repo a star. This is the fastest solution without overhead for us nodejs guys.

---
## Usage

Takes a buffered image and runs TensorFlow Facial Detection & Facial Recognition to<br> Detect:
<br>Faces in an image
<br>Facial landmarks
<br>Compute Face Descriptors
<br>Face Expressions
<br>Age & Gender Recognition
<br>Face Recognition by Matching Descriptors


### node_Properties

Name : value will change default name of the node


Send a message string with the value you want to validate.

### node_outputs

Outputs a message object with the value of your input and if it is valid. If not valid will also list an array of the failed checks

### Name

Define the msg name if you wish to change the name displayed on the node.

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
