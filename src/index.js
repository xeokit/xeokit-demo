//------------------------------------------------------------------------------------------------------------------
// Import the modules we need for this example
//------------------------------------------------------------------------------------------------------------------

import {Viewer} from "../lib/xeokit/viewer/Viewer.js";
import {XKTLoaderPlugin} from "../lib/xeokit/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js";

//------------------------------------------------------------------------------------------------------------------
// Create a Viewer, arrange the camera
//------------------------------------------------------------------------------------------------------------------
document.body.onload = function () {
    const viewer = new Viewer({
        canvasId: "myCanvas",
        transparent: true
    });

    viewer.scene.camera.eye = [10.45, 17.38, -98.31];
    viewer.scene.camera.look = [43.09, 0.5, -26.76];
    viewer.scene.camera.up = [0.06, 0.96, 0.16];

    viewer.scene.selectedMaterial.fillAlpha = 0.1;

//----------------------------------------------------------------------------------------------------------------------
// Create an XKT loader plugin, load a model, fit to view
//----------------------------------------------------------------------------------------------------------------------

    const xktLoader = new XKTLoaderPlugin(viewer);

    const model = xktLoader.load({
        id: "myModel",
        src: "./../models/OTCConferenceCenter/OTCConferenceCenter.xkt",
        metaModelSrc: "./../metaModels/OTCConferenceCenter/metaModel.json", // Creates a MetaObject instances in scene.metaScene.metaObjects
        edges: true
    });


}
