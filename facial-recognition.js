
//2020 David L Burrows
//Contact me @ https://github.com/meeki007
//or meeki007@gmail.com

//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at
//http://www.apache.org/licenses/LICENSE-2.0

//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

//Node.js LTS                 ✔   Node v12.19.0   Npm 6.14.8
//Node-RED core               ✔   1.2.2








////////////////////////////////////////////////////////////////////

//things todo
//put timer on the whole thing and output it in payload
//add status msg for everything
//build a html page for the image to display the detections
//bring in other nodes to do lifting as well and document that too.

module.exports = function(RED)
{
  ///////////////////////////////////
  // Import Required(s) by this node
  //////////////////////////////////

  //let tf = require('tf');
  let fs        = require('fs'); //Node.js fs module see https://nodejs.dev/learn/the-nodejs-fs-module
  let path      = require('path'); //Node.js path module see https://nodejs.dev/learn/the-nodejs-path-module
  let os        = require('os'); //Node.js os module see https://nodejs.dev/learn/the-nodejs-os-module
  var faceapi; //value becomes user selection of: require('@vladmandic/face-api/dist/face-api.node.js'); or
  var tf; //value becomes user selection of: require('@tensorflow/tfjs-node'); or require('@tensorflow/tfjs-node-gpu');

  ///////////////////////////////////
  //Global stuff used by entire node
  ///////////////////////////////////

  // check if a module is installed and working, if not return error code;
  function module_check (module_name)
  {
    try
    {
      require(module_name);
      return true;
    }
    catch (error)
    {
      return error.code;
      //return error;
    }
  }

  //////////////////////////////////////////////////////////////
  // Stuff to do / load before loading/constructing this node //
  //////////////////////////////////////////////////////////////
  // check if module @vladmandic/face-api/dist/face-api.node.js is installed and working;
  let vladmandic_faceapi_node_module_check = module_check('@vladmandic/face-api/dist/face-api.node.js');
  // check if module @vladmandic/face-api/dist/face-api.node-gpu.js is installed and working;
  let vladmandic_faceapi_node_gpu_module_check = module_check('@vladmandic/face-api/dist/face-api.node-gpu.js');
  // check if module @tensorflow/tfjs-node [GPU] is installed and working;
  let tfjs_node_gpu_module_check = module_check('@tensorflow/tfjs-node-gpu');
  // check if module @tensorflow/tfjs-node [CPU] is installed and working;
  let tfjs_node_cpu_module_check = module_check('@tensorflow/tfjs-node');

  //users system information =
  let system =
  {
    os:
    {
      arch : os.arch(),
      platform : os.platform(),
      release : os.release(),
      type : os.type()
    }
  };

  ////////////////////////
  // construct the node //
  ////////////////////////
  function facialrecognitionNode(config)
  {
    RED.nodes.createNode(this,config);

    //Clear user notices Function, used for timmer after deploy
    var status_clear = function()
    {
      //clear status icon
      node.status({});
    };

    // config for this nodes html file
    this.image = config.image||'payload';
    this.settings = config.settings||'settings';
    this.bindings = config.bindings || 'CPU';
    this.FaceDetector = config.FaceDetector || 'SsdMobilenetv1';
    this.FaceDetector_SsdMobilenetv1_maxResults = Number(config.FaceDetector_SsdMobilenetv1_maxResults || 3);
    this.FaceDetector_SsdMobilenetv1_minConfidence = Number(config.FaceDetector_SsdMobilenetv1_minConfidence || 0.5);
    this.FaceDetector_tinyFaceDetector_inputSize = Number(config.FaceDetector_tinyFaceDetector_inputSize || 416);
    this.FaceDetector_tinyFaceDetector_scoreThreshold = Number(config.FaceDetector_tinyFaceDetector_scoreThreshold || 0.5);
    this.Tasks = config.Tasks || 'detectAllFaces';
    this.FaceLandmarks = config.FaceLandmarks || false;
    this.FaceExpressions = config.FaceExpressions || false;
    this.AgeAndGender = config.AgeAndGender || false;
    this.FaceDescriptors = config.FaceDescriptors || false;
    this.Face_Recognition = config.Face_Recognition || 'Face_Recognition_disabled';
    this.Face_Recognition_enabled_path = config.Face_Recognition_enabled_path || 'FullPathToLabeledFaces';
    this.Face_Recognition_distanceThreshold = Number(config.Face_Recognition_distanceThreshold || 0.7);

    //require modules based on user input to node image bindings
    //warn user if bindings selection is not valid for lack of module
    var found_tfjs_CPU_GPU_module;
    var found_vladmandic_faceapi_module;
    if ( this.bindings === 'CPU' && tfjs_node_cpu_module_check === true && vladmandic_faceapi_node_module_check === true )
    {
      found_tfjs_CPU_GPU_module = true;
      tf = require('@tensorflow/tfjs-node');
      faceapi = require('@vladmandic/face-api/dist/face-api.node.js'); //JavaScript face recognition API for nodejs see https://www.npmjs.com/package/@vladmandic/face-api
    }
    else if ( this.bindings === 'CPU' && tfjs_node_cpu_module_check !== true || vladmandic_faceapi_node_module_check !== true )
    {
      if ( vladmandic_faceapi_node_module_check !== true )
      {
        found_vladmandic_faceapi_module = "Error: " + vladmandic_faceapi_node_module_check + " - Unable to use @vladmandic/face-api/dist/face-api.node.js; CPU binding. Check your loggs when installing. See this node's documentation and Make sure that module @tensorflow/tfjs-node is properly working & installed under your Node-RED user directory, typically ~/.node-red";
        this.warn(found_vladmandic_faceapi_module);
      }
      if ( tfjs_node_cpu_module_check !== true )
      {
        found_tfjs_CPU_GPU_module = "Error: " + tfjs_node_cpu_module_check + " - Unable to use @tensorflow/tfjs-node; CPU binding. Check your loggs when installing. See this node's documentation and Make sure that module @tensorflow/tfjs-node is properly working & installed under your Node-RED user directory, typically ~/.node-red";
        this.warn(found_tfjs_CPU_GPU_module);
      }
    }
    else if ( this.bindings === 'GPU' && tfjs_node_gpu_module_check === true && vladmandic_faceapi_node_gpu_module_check === true )
    {
      found_tfjs_CPU_GPU_module = true;
      tf = require('@tensorflow/tfjs-node-gpu');
      faceapi = require('@vladmandic/face-api/dist/face-api.node-gpu.js'); //JavaScript face recognition API for nodejs see https://www.npmjs.com/package/@vladmandic/face-api
    }
    else if ( this.bindings === 'GPU' && tfjs_node_gpu_module_check !== true || vladmandic_faceapi_node_gpu_module_check !== true )
    {
      if ( vladmandic_faceapi_node_gpu_module_check !== true )
      {
        found_vladmandic_faceapi_module = "Error: " + vladmandic_faceapi_node_module_check + " - Unable to use @vladmandic/face-api/dist/face-api.node-gpu.js; CPU binding. Check your loggs when installing. See this node's documentation and Make sure that module @tensorflow/tfjs-node is properly working & installed under your Node-RED user directory, typically ~/.node-red";
        this.warn(found_vladmandic_faceapi_module);
      }
      if ( tfjs_node_gpu_module_check !== true )
      {
        found_tfjs_CPU_GPU_module = "Error: " + tfjs_node_gpu_module_check + " - Unable to use @tensorflow/tfjs-node-gpu; GPU binding. Check your loggs when installing. See this node's documentation and Make sure that module @tensorflow/tfjs-node-gpu is properly working & installed under your Node-RED user directory, typically ~/.node-red";
        this.warn(found_tfjs_CPU_GPU_module);
      }
    }

    //clear status icon every new deploy
    this.status({});
    this.status(
    {
      fill: 'yellow',
      shape: 'dot',
      text: "Initialize tfjs"
    });

    //setup tfjs
    //tfjs_backend
    var tfjs_backend; //error check of tfjs_backend
    Promise.resolve
    (
      faceapi.tf.setBackend('tensorflow')
    )
    .then( tfjs_backend = true )
    .catch(error =>
      {
      tfjs_backend = ("Could not set tfjs backend" + error),
      this.warn(tfjs_backend),
      this.status(
      {
        fill: 'red',
        shape: 'dot',
        text: "detected error"
      });
    });

    //enableProdMode
    var tfjs_ProdMode; //error check of tfjs_ProdMode
    Promise.resolve
    (
      faceapi.tf.enableProdMode()
    )
    .then( tfjs_ProdMode = true )
    .catch(error =>
      {
      tfjs_ProdMode = ("Could not set tfjs ProdMode" + error),
      this.warn(tfjs_ProdMode),
      this.status(
      {
        fill: 'red',
        shape: 'dot',
        text: "detected error"
      });
    });

    //setDEBUG
    var tfjs_setDEBUG; //error check of tfjs_setDEBUG
    Promise.resolve
    (
      faceapi.tf.ENV.set('DEBUG', false)
    )
    .then( tfjs_setDEBUG = true )
    .catch(error =>
      {
      tfjs_setDEBUG = ("Could not set tfjs DEBUG" + error),
      this.warn(tfjs_setDEBUG),
      this.status(
      {
        fill: 'red',
        shape: 'dot',
        text: "detected error"
      });
    });

    //is tfjs_ready
    var tfjs_ready; //error check of tfjs_ready
    Promise.resolve
    (
      faceapi.tf.ready()
    )
    .then( tfjs_ready = true )
    .catch(error =>
      {
      tfjs_ready = ("tfjs is not ready" + error),
      this.warn(tfjs_ready),
      this.status(
      {
        fill: 'red',
        shape: 'dot',
        text: "detected error"
      });
    });

    //get the tensorflow core version the user is using
    var faceapi_tf_version_core = faceapi.tf.version_core;

    //clear status icon
    //this.status({});
    this.status(
    {
      fill: 'yellow',
      shape: 'dot',
      text: "loading the modles"
    });

    //set path to models
    const modelPath = `${__dirname}/models`;

    //load models before sending msg to this node
    var loadthemodels_no_error; //error check of loadthemodels_no_error
    Promise.all
    ([
      faceapi.nets.ageGenderNet.loadFromDisk(modelPath),
      faceapi.nets.faceExpressionNet.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68TinyNet.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath)
    ])
    .then(loadthemodels_no_error = true)
    .catch(error =>
      {
      loadthemodels_no_error = ("A face-api.js model(s) did not load. "+ error),
      this.warn(loadthemodels_no_error),
      this.status(
      {
        fill: 'red',
        shape: 'dot',
        text: "detected error"
      });
    });

    // Access the node's context object
    var nodeContext = this.context();

    //on a deploy Set context so FaceMatcher will initialize again on next img sent
    nodeContext.set('FaceMatcherInitialized',false);



    //clear status icon
    this.status({});

    //////////////////////////////////////////////
    // Do Stuff when a msg is sent to this node //
    //////////////////////////////////////////////
    var node = this;
    this.on('input', async function(msg, send, done)
    {
      //process.on('unhandledRejection', function(error) {
      //  notify_user_errors(error);
      //});


      //Start timmer
      const start = Date.now();



      // For maximum backwards compatibility, check that send exists.
      // If this node is installed in Node-RED 0.x, it will need to
      // fallback to using `node.send`
      send = send || function() { node.send.apply(node,arguments); };

      //function to work with buffered image in from msg payload
      async function image(buffer)
      {

        try {
          const decoded = tf.node.decodeImage(buffer);
          const casted = decoded.toFloat();
          const result = casted.expandDims(0);
          decoded.dispose();
          casted.dispose();
          return result;
        } catch (error) {
          notify_user_errors(error);
        }

      }

      async function listDirectories(rootPath)
      {
          const fileNames = await fs.promises.readdir(rootPath);

          if ( fileNames.indexOf(".DS_Store") == 0 ) //for MacOS - if fileNames contains .DS_Store
          {
            fileNames.shift();                       // get rid of it
          }
          const filePaths = fileNames.map(fileName => path.join(rootPath, fileName));
          const filePathsAndIsDirectoryFlagsPromises = filePaths.map(async filePath => ({path: filePath, isDirectory: (await fs.promises.stat(filePath)).isDirectory()}));
          const filePathsAndIsDirectoryFlags = await Promise.all(filePathsAndIsDirectoryFlagsPromises);
          return filePathsAndIsDirectoryFlags.filter(filePathAndIsDirectoryFlag => filePathAndIsDirectoryFlag.isDirectory)
              .map(filePathAndIsDirectoryFlag => filePathAndIsDirectoryFlag.path);
      }

      async function listFiles(rootPath)
      {
          const fileNames = await fs.promises.readdir(rootPath);
          if ( fileNames.indexOf(".DS_Store") == 0 ) //for MacOS - if fileNames contains .DS_Store
          {
            fileNames.shift();                       // get rid of it
          }
          const filePaths = fileNames.map(fileName => path.join(rootPath, fileName));
          const filePathsAndIsFileFlagsPromises = filePaths.map(async filePath => ({path: filePath, isFile: (await fs.promises.stat(filePath)).isFile()}));
          const filePathsAndIsFileFlags = await Promise.all(filePathsAndIsFileFlagsPromises);
          return filePathsAndIsFileFlags.filter(filePathAndIsFileFlag => filePathAndIsFileFlag.isFile)
              .map(filePathAndIsFileFlag => filePathAndIsFileFlag.path);
      }

      function LoadLabeledImages()
      {

        return Promise.all(
          list_dirs_in_labeled_face_folder_names_only.map(async each_dir_name => {
            const image_names_in_each_dir_name = await listFiles(path.join(user_path, each_dir_name)).catch(error => {
              notify_user_errors(error);
            });
            const length = image_names_in_each_dir_name.length
            const descriptions = [];
            for (let i = 0; i < length; i++)
            {
              const image_file_size = fs.statSync(image_names_in_each_dir_name[i]);
              if ( image_file_size.size > 1024000 )
              {
                notify_user_errors('Face_Recognition: Image File Size too big. Greater than 1024kB. Did not load this image. Please reduce file size ' + image_names_in_each_dir_name[i]);
              }
              else if ( image_file_size.size > 512000 )
              {
                notify_user_errors('Face_Recognition: Image File a bit large. Greater than 512kB.  Image was loaded but suggest reduced file size ' + image_names_in_each_dir_name[i]);
                const bufferd_img = await fs.readFileSync(image_names_in_each_dir_name[i]);
                const face_detect_tensor = await image(bufferd_img);
                var detections;
                if ( face_detect_tensor )
                {
                  detections = await faceapi.detectSingleFace(face_detect_tensor).withFaceLandmarks().withFaceDescriptor();
                  //make dang sure that a face was detected and a descriptor was created.
                  //else a undefined value sent to the descriptions array causes new faceapi.LabeledFaceDescriptors(each_dir_name, descriptions); to fail
                  if ( detections )
                  {
                    if ( detections.descriptor )
                    {
                      descriptions.push(detections.descriptor);
                      face_detect_tensor.dispose();
                    }
                  }
                  else
                  {
                    notify_user_errors('Unable to create FaceDescriptor. Please replace this image with a face that can be found. Did not load this image ' + image_names_in_each_dir_name[i]);
                  }
                }
                else
                {
                  notify_user_errors('unable to decode file ' + image_names_in_each_dir_name[i]);
                }
              }
              else
              {

                const bufferd_img = await fs.readFileSync(image_names_in_each_dir_name[i]);
                const face_detect_tensor = await image(bufferd_img);
                var detections;
                if ( face_detect_tensor )
                {
                  detections = await faceapi.detectSingleFace(face_detect_tensor).withFaceLandmarks().withFaceDescriptor();
                  //make dang sure that a face was detected and a descriptor was created.
                  //else a undefined value sent to the descriptions array causes new faceapi.LabeledFaceDescriptors(each_dir_name, descriptions); to fail
                  if ( detections )
                  {
                    if ( detections.descriptor )
                    {
                      descriptions.push(detections.descriptor);
                      face_detect_tensor.dispose();
                    }
                  }
                  else
                  {
                    notify_user_errors('Unable to create FaceDescriptor. Please replace this image with a face that can be found. Did not load this image ' + image_names_in_each_dir_name[i]);
                  }
                }
                else
                {
                  notify_user_errors('unable to decode file ' + image_names_in_each_dir_name[i]);
                }
              }
            }
            return new faceapi.LabeledFaceDescriptors(each_dir_name, descriptions);
            //return image_names_in_each_dir_name;
            //return length;
            //return descriptions;
          })
        );
      }

      //user error function
      function notify_user_errors(err)
      {
        if (done)
        {
          // Node-RED 1.0 compatible
          done(err);
        }
        else
        {
          // Node-RED 0.x compatible
          node.error(err, msg);
        }
      }

      //set user img to node to var
      var img = msg[node.image.valueOf()];
      //get the msg.name used for for img into node
      var img_name = node.image.valueOf();

      ///////////////// CHECKS /////////////////
      //check that img to this node on user defined message image or default image msg.payload
      if ( !img ) //is falsy
      {
        notify_user_errors("message image msg." + img_name + " is falsy! no img or img value found for msg." + img_name + " , please send this node a image. like a *.png *.gif *.jpg *.bmp");
      }
      if ( found_vladmandic_faceapi_module !== true )
      {
        notify_user_errors(found_vladmandic_faceapi_module);
      }
      if ( found_tfjs_CPU_GPU_module !== true )
      {
        notify_user_errors(found_tfjs_CPU_GPU_module);
      }
      if ( tfjs_backend !== true )
      {
        notify_user_errors(tfjs_backend);
      }
      if ( tfjs_ProdMode !== true )
      {
        notify_user_errors(tfjs_ProdMode);
      }
      if ( tfjs_setDEBUG !== true )
      {
        notify_user_errors(tfjs_setDEBUG);
      }
      if ( tfjs_ready !== true )
      {
        notify_user_errors(tfjs_ready);
      }
      if ( loadthemodels_no_error !== true )
      {
        notify_user_errors(loadthemodels_no_error);
      }


      ///////////////// facial-recognition /////////////////
      if ( img && found_tfjs_CPU_GPU_module === true && tfjs_backend === true && tfjs_ProdMode === true && tfjs_setDEBUG === true && tfjs_ready === true && loadthemodels_no_error === true )
      {
        this.status(
        {
          fill: 'blue',
          shape: 'dot',
          text: "working"
        });

        //set user img to node to var
        var user_settings = msg[node.settings.valueOf()];
        //get the msg.name used for for img into node
        var user_settings_name = node.settings.valueOf();
        //overide user settings propery for node via msg
        if ( user_settings ) // is not falsy
        {
          if ( user_settings.FaceDetector )
          {
            if ( user_settings.FaceDetector.SsdMobilenetv1 )
            {
              this.FaceDetector = 'SsdMobilenetv1';
              if ( user_settings.FaceDetector.SsdMobilenetv1.maxResults )
              {
                this.FaceDetector_SsdMobilenetv1_maxResults = Number(user_settings.FaceDetector.SsdMobilenetv1.maxResults);
              }
              if ( user_settings.FaceDetector.SsdMobilenetv1.minConfidence )
              {
                this.FaceDetector_SsdMobilenetv1_minConfidence = Number(user_settings.FaceDetector.SsdMobilenetv1.minConfidence);
              }
            }
            if ( user_settings.FaceDetector.tinyFaceDetector )
            {
              this.FaceDetector = 'tinyFaceDetector';
              if ( user_settings.FaceDetector.tinyFaceDetector.inputSize )
              {
                this.FaceDetector_tinyFaceDetector_inputSize = Number(user_settings.FaceDetector.tinyFaceDetector.inputSize);
              }
              if ( user_settings.FaceDetector.tinyFaceDetector.scoreThreshold )
              {
                this.FaceDetector_tinyFaceDetector_scoreThreshold = Number(user_settings.FaceDetector.tinyFaceDetector.scoreThreshold);
              }
            }
          }
          if ( user_settings.Tasks )
          {
            if ( user_settings.Tasks.detectAllFaces )
            {
              this.Tasks = 'detectAllFaces';
              if ( user_settings.Tasks.detectAllFaces.withFaceLandmarks )
              {
                this.FaceLandmarks = user_settings.Tasks.detectAllFaces.withFaceLandmarks;
              }
              if ( user_settings.Tasks.detectAllFaces.withFaceExpressions )
              {
                this.FaceExpressions = user_settings.Tasks.detectAllFaces.withFaceExpressions;
              }
              if ( user_settings.Tasks.detectAllFaces.withAgeAndGender )
              {
                this.AgeAndGender = user_settings.Tasks.detectAllFaces.withAgeAndGender;
              }
              if ( user_settings.Tasks.detectAllFaces.withFaceDescriptors )
              {
                this.FaceDescriptors = user_settings.Tasks.detectAllFaces.withFaceDescriptors;
              }
            }
            if ( user_settings.Tasks.detectSingleFace)
            {
              this.Tasks = 'detectSingleFace';
              if ( user_settings.Tasks.detectSingleFace.withFaceLandmarks )
              {
                this.FaceLandmarks = user_settings.Tasks.detectSingleFace.withFaceLandmarks;
              }
              if ( user_settings.Tasks.detectSingleFace.withFaceExpressions )
              {
                this.FaceExpressions = user_settings.Tasks.detectSingleFace.withFaceExpressions;
              }
              if ( user_settings.Tasks.detectSingleFace.withAgeAndGender )
              {
                this.AgeAndGender = user_settings.Tasks.detectSingleFace.withAgeAndGender;
              }
              if ( user_settings.Tasks.detectSingleFace.withFaceDescriptors )
              {
                this.FaceDescriptors = user_settings.Tasks.detectSingleFace.withFaceDescriptors;
              }
            }
          }
          if ( user_settings.FaceRecognition )
          {
            if ( user_settings.FaceRecognition.enabled )
            {
              this.Face_Recognition = 'Face_Recognition_enabled';
              if ( user_settings.FaceRecognition.enabled.KnownFacesPath )
              {
                this.Face_Recognition_enabled_path = user_settings.FaceRecognition.enabled.KnownFacesPath;
              }
              if ( user_settings.FaceRecognition.enabled.distanceThreshold )
              {
                this.Face_Recognition_distanceThreshold = user_settings.FaceRecognition.enabled.distanceThreshold;
              }
              //Set context so FaceMatcher will initialize again on next img sent
              if ( user_settings.FaceRecognition.enabled.ReInitializeFaceMatcher === true )
              {
                nodeContext.set('FaceMatcherInitialized',false);
                //msg.userset_labeledFaceDescriptors = user_settings.FaceRecognition.enabled.labeledFaceDescriptors;
              }
              //Stop FaceMatcher from initalizing and check if user sent labeledFaceDescriptors
              if ( user_settings.FaceRecognition.enabled.ReInitializeFaceMatcher === false )
              {
                if ( user_settings.FaceRecognition.enabled.labeledFaceDescriptors )
                {
                nodeContext.set('labeledFaceDescriptors',user_settings.FaceRecognition.enabled.labeledFaceDescriptors);
                nodeContext.set('FaceMatcherInitialized',true);
                }
              }
            }
          }
        }


        //format user selected FaceDetector object for output message
        var user_selected_FaceDetector_object;
        if ( this.FaceDetector === 'SsdMobilenetv1' )
        {
          user_selected_FaceDetector_object = {
            SsdMobilenetv1 :
            {
              maxResults : this.FaceDetector_SsdMobilenetv1_maxResults,
              minConfidence : this.FaceDetector_SsdMobilenetv1_minConfidence
            }
          };
        }
        if ( this.FaceDetector === 'tinyFaceDetector' )
        {
          user_selected_FaceDetector_object = {
            tinyFaceDetector :
            {
              inputSize : this.FaceDetector_tinyFaceDetector_inputSize,
              scoreThreshold : this.FaceDetector_tinyFaceDetector_scoreThreshold
            }
          };
        }
        //format user selected FaceMatcher object for output message
        var user_selected_FaceMatcher_object;
        if ( this.Face_Recognition === 'Face_Recognition_disabled' )
        {
          user_selected_FaceMatcher_object = 'disabled';
        }
        if ( this.Face_Recognition === 'Face_Recognition_enabled' )
        {
          if ( user_settings )
          {
            if ( user_settings.FaceRecognition )
            {
              if ( user_settings.FaceRecognition.enabled )
              {
                if ( user_settings.FaceRecognition.enabled.ReInitializeFaceMatcher )
                {
                  user_selected_FaceMatcher_object = {
                    enabled :
                    {
                      KnownFacesPath : this.Face_Recognition_enabled_path,
                      distanceThreshold : this.Face_Recognition_distanceThreshold,
                      ReInitializeFaceMatcher : user_settings.FaceRecognition.enabled.ReInitializeFaceMatcher
                    }
                  };
                }
                else
                {
                  user_selected_FaceMatcher_object = {
                    enabled :
                    {
                      KnownFacesPath : this.Face_Recognition_enabled_path,
                      distanceThreshold : this.Face_Recognition_distanceThreshold
                    }
                  };
                }
              }
              else
              {
                user_selected_FaceMatcher_object = {
                  enabled :
                  {
                    KnownFacesPath : this.Face_Recognition_enabled_path,
                    distanceThreshold : this.Face_Recognition_distanceThreshold
                  }
                };
              }
            }
            else
            {
              user_selected_FaceMatcher_object = {
                enabled :
                {
                  KnownFacesPath : this.Face_Recognition_enabled_path,
                  distanceThreshold : this.Face_Recognition_distanceThreshold
                }
              };
            }
          }
          else
          {
            user_selected_FaceMatcher_object = {
              enabled :
              {
                KnownFacesPath : this.Face_Recognition_enabled_path,
                distanceThreshold : this.Face_Recognition_distanceThreshold
              }
            };
          }
        }

        // load image from payload
        const tensor = await image(img);


        /////////////////////////////////////////////////////////////////
        // add check image size for inputs mabye if too large??? hold off on this
        /////////////////////////////////////////////////////////////////



        // apply configuration options
        //FaceDetector
        var options;
        if ( this.FaceDetector ===  'SsdMobilenetv1' )
        {
          try {
            // actual model execution for image send via msg payload
            options = new faceapi.SsdMobilenetv1Options({ minConfidence: this.FaceDetector_SsdMobilenetv1_minConfidence, maxResults: this.FaceDetector_SsdMobilenetv1_maxResults});
          }
          catch (error)
            {
              notify_user_errors("SsdMobilenetv1Options set to default mode. " + error);
            }
        }
        if ( this.FaceDetector ===  'tinyFaceDetector' )
        {
          if (this.FaceDetector_tinyFaceDetector_inputSize % 32 !== 0)
          {
            notify_user_errors("TinyFaceDetectorOptions inputSize of " + this.FaceDetector_tinyFaceDetector_inputSize + " not divisible by 32. Using default value of 416");
            this.FaceDetector_tinyFaceDetector_inputSize = 416;
          }
          try {
            // actual model execution for image send via msg payload
            options = new faceapi.TinyFaceDetectorOptions({ inputSize: this.FaceDetector_tinyFaceDetector_inputSize, scoreThreshold: this.FaceDetector_tinyFaceDetector_scoreThreshold});
          }
          catch (error)
            {
              notify_user_errors("TinyFaceDetectorOptions set to default mode. " + error);
            }
        }



        //setup var for eval for model execution based on user input(s)
        var model_array = [];
        //withFaceLandmarks
        if ( this.FaceLandmarks === true )
        {
          model_array.push('withFaceLandmarks');
        }
        //withFaceExpressions
        if ( this.FaceExpressions === true )
        {
          model_array.push('withFaceExpressions');
        }
        //withAgeAndGender
        if ( this.AgeAndGender === true )
        {
          model_array.push('withAgeAndGender');
        }
        //withFaceDescriptor(s)
        if ( this.FaceDescriptors === true )
        {
          if ( this.Tasks === 'detectAllFaces' )
          {
            if ( this.FaceLandmarks === false )
            {
              notify_user_errors('Tasks Error: must enable withFaceLandmarks to use withFaceDescriptor(s)');
            }
            else
            {
              model_array.push('withFaceDescriptors');
            }
          }
          if ( this.Tasks === 'detectSingleFace' )
          {
            if ( this.FaceLandmarks === false )
            {
              notify_user_errors('Tasks Error: must enable withFaceLandmarks to use withFaceDescriptor(s)');
            }
            else
            {
              model_array.push('withFaceDescriptor');
            }
          }
        }

        if ( tensor )
        {
          var model_array_length = model_array.length;
          var result;
          if ( model_array_length === 4 )
          {
            result = await faceapi[this.Tasks](tensor, options)[model_array[0]]()[model_array[1]]()[model_array[2]]()[model_array[3]]();
          }
          if ( model_array_length === 3 )
          {
            result = await faceapi[this.Tasks](tensor, options)[model_array[0]]()[model_array[1]]()[model_array[2]]();
          }
          if ( model_array_length === 2 )
          {
            result = await faceapi[this.Tasks](tensor, options)[model_array[0]]()[model_array[1]]();
          }
          if ( model_array_length === 1 )
          {
            result = await faceapi[this.Tasks](tensor, options)[model_array[0]]();
          }
          if ( model_array_length === 0 )
          {
            result = await faceapi[this.Tasks](tensor, options);
          }
          //msg.model_eval = model_eval;





          tensor.dispose();

          //check if user wants to do Face_Recognition
          //FaceRecognition for node set via node properties
          if ( this.Face_Recognition === 'Face_Recognition_enabled' )
          {
            //error check that withFaceDescriptor(s) must be enabled to use FaceRecognition
            if ( this.FaceDescriptors === false || this.FaceLandmarks === false )
            {
              notify_user_errors('FaceRecognition Error: must enable withFaceDescriptor(s) and withFaceLandmarks to use FaceRecognition');
              //send what was done
            }
            else
            {
              //see if user wants to ReInitializeFaceMatcher
              const context_FaceMatcherInitialized = nodeContext.get('FaceMatcherInitialized') || false;
              //see if previous labeledFaceDescriptors has been populated, it doesn't exist set to false
              var context_labeledFaceDescriptors = nodeContext.get('labeledFaceDescriptors') || false;

              //context_labeledFaceDescriptors false or context_FaceMatcherInitialized
              if ( context_labeledFaceDescriptors === false || context_FaceMatcherInitialized === false )
              {
                //check if example path else use user defined dirPath
                var user_path;
                if ( this.Face_Recognition_enabled_path === 'FullPathToLabeledFaces' || this.Face_Recognition_enabled_path === '/example/labeled_face' )
                {
                  user_path = path.join(__dirname, '/example/labeled_face');
                }
                else
                {
                  user_path = this.Face_Recognition_enabled_path;
                }
                var list_dirs_in_labeled_face_folder = await listDirectories(user_path).catch(error => {
                  notify_user_errors(error);
                });
                //msg.dirs = list_dirs_in_labeled_face_folder;

                // get just the names of the dirs
                var list_dirs_in_labeled_face_folder_names_only = list_dirs_in_labeled_face_folder.map(x => {
                  var n = x.lastIndexOf('/');
                  var result = x.substring(n + 1);
                  return result;
                });
                //msg.dirs_names_only =list_dirs_in_labeled_face_folder_names_only;

                const labeledFaceDescriptors = await LoadLabeledImages();


                //use helper toJSON so users can save the FaceDescriptors
                let labeledFaceDescriptors_toJson = labeledFaceDescriptors.map(x=>x.toJSON());
                nodeContext.set('labeledFaceDescriptors',labeledFaceDescriptors_toJson);
                nodeContext.set('FaceMatcherInitialized',true);
              }

              context_labeledFaceDescriptors = nodeContext.get('labeledFaceDescriptors');
              let labeledFaceDescriptors_fromJson = context_labeledFaceDescriptors.map( x=>faceapi.LabeledFaceDescriptors.fromJSON(x));
              const faceMatcher = await new faceapi.FaceMatcher(labeledFaceDescriptors_fromJson, this.Face_Recognition_distanceThreshold);





              //sort detections single/multiple faces
              if ( this.Tasks === 'detectAllFaces' )
              {
                result = result.map(fd => {
                  const the_object = fd;
                  //add the match to the object
                  the_object.match = faceMatcher.findBestMatch(fd.descriptor);

                  return the_object;
                });
              }
              if ( this.Tasks === 'detectSingleFace' )
              {
                result.match = faceMatcher.findBestMatch(result.descriptor);
              }

            }

          }
        }
        else
        {
          notify_user_errors("Input Error: buffered image sent is not of valid type. Please send a valid image");
        }




        //time to complete process
        const time_elap_millis = Date.now() - start;
        //msg.TimeToCompleteInSec = (time_elap_millis / 1000);
        var sec_to_complete = (time_elap_millis / 1000);









        //main return msg =
        msg[img_name] =
        {
          Result : result,
          sec_to_complete : sec_to_complete,
          OriginalBufferedImg : img,
          labeledFaceDescriptors : context_labeledFaceDescriptors,
          Properties:
          {
            modules:
            {
              cpu : tfjs_node_cpu_module_check,
              gpu : tfjs_node_gpu_module_check,
              tf : faceapi_tf_version_core
            },
            bindings : node.bindings,
            FaceDetector : user_selected_FaceDetector_object,
            Tasks :
            {
              [this.Tasks] :
              {
                withFaceLandmarks : this.FaceLandmarks,
                withFaceExpressions : this.FaceExpressions,
                withAgeAndGender : this.AgeAndGender,
                withFaceDescriptors : this.FaceDescriptors
              }
            }


          }
          //SystemInfo:
          //{
          //  os:
          //  {
          //    arch : system.os.arch,
          //    platform : system.os.platform,
          //    release : system.os.release,
          //    type : system.os.type
          //  },
          //  modules:
          //  {
          //    cpu : tfjs_node_cpu_module_check,
          //    gpu : tfjs_node_gpu_module_check,
          //    tf : faceapi_tf_version_core
          //
          //  }
          //}

        };








        this.status(
        {
          fill: 'blue',
          shape: 'dot',
          text: "finished"
        });
        // clear/end status msg after 1 seconds
        setTimeout(status_clear, 1000);



        send(msg);

      }

      // Once finished, call 'done'.
      // This call is wrapped in a check that 'done' exists
      // so the node will work in earlier versions of Node-RED (<1.0)
      if (done) {
          done();
      }

    });

  }

  RED.nodes.registerType("facial-recognition",facialrecognitionNode);

};
