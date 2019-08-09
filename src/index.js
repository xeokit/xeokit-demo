//------------------------------------------------------------------------------------------------------------------
// Import the modules we need for this example
//------------------------------------------------------------------------------------------------------------------

import {Viewer} from "../lib/xeokit/viewer/Viewer.js";
import {XKTLoaderPlugin} from "../lib/xeokit/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js";
import {NavCubePlugin} from "../lib/xeokit/plugins/NavCubePlugin/NavCubePlugin.js";
import {Mesh} from "../lib/xeokit/viewer/scene/mesh/Mesh.js";
import {ReadableGeometry} from "../lib/xeokit/viewer/scene/geometry/ReadableGeometry.js";
import {buildPlaneGeometry} from "../lib/xeokit/viewer/scene/geometry/builders/buildPlaneGeometry.js";
import {PhongMaterial} from "../lib/xeokit/viewer/scene/materials/PhongMaterial.js";

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
    viewer.scene.camera.perspective.fov = 40;

    viewer.scene.camera.zoom(25);

    viewer.scene.highlightMaterial.fill = false;
    viewer.scene.highlightMaterial.fillAlpha = 0.3;
    viewer.scene.highlightMaterial.edgeColor = [1, 1, 0];

    var lastEntity = null;

    viewer.scene.input.on("mousemove", function (coords) {
        var hit = viewer.scene.pick({
            canvasPos: coords
        });
        if (hit) {
            if (!lastEntity || hit.entity.id !== lastEntity.id) {
                if (lastEntity) {
                    lastEntity.highlighted = false;
                }
                lastEntity = hit.entity;
                hit.entity.highlighted = true;
            }
        } else {
            if (lastEntity) {
                lastEntity.highlighted = false;
                lastEntity = null;
            }
        }
    });

    // Ground plane

    new Mesh(viewer.scene, {
        geometry: new ReadableGeometry(viewer.scene, buildPlaneGeometry({
            xSize: 3500,
            zSize: 3500
        })),
        material: new PhongMaterial(viewer.scene, {
            diffuse: [0.2, 0.7, 0.2],
            backfaces: true
        }),
        position: [0, -8, 0],
        pickable: false,
        collidable: false
    });

    const navCube = new NavCubePlugin(viewer, {
        canvasId: "myNavCubeCanvas",
        visible: true,           // Initially visible (default)
        cameraFly: true,       // Fly camera to each selected axis/diagonal
        cameraFitFOV: 65,        // How much field-of-view the scene takes once camera has fitted it to view
        cameraFlyDuration: 0.5 // How long (in seconds) camera takes to fly to each new axis/diagonal
    });

    const xktLoader = new XKTLoaderPlugin(viewer);

    const model = xktLoader.load({
        id: "myModel",
        src: "data/models/xkt/OTCConferenceCenter/OTCConferenceCenter.xkt",
        metaModelSrc: "data/metaModels/OTCConferenceCenter/metaModel.json",
        edges: true
    });

    //------------------------------------------------------------------------------------------------------------------
    // When model loaded, create a tree view that toggles object xraying
    //------------------------------------------------------------------------------------------------------------------

    const t0 = performance.now();

    //  document.getElementById("time").innerHTML = "Loading model...";

    model.on("loaded", function () {

        const t1 = performance.now();
        // document.getElementById("time").innerHTML = "Model loaded in " + Math.floor(t1 - t0) + " milliseconds<br>Objects: " + model.numEntities + "<br>Triangles: " + model.numTriangles;

        // Builds tree view data from MetaModel
        var createData = function (metaModel) {
            const data = [];

            function visit(expand, data, metaObject) {
                if (!metaObject) {
                    return;
                }
                var child = {
                    id: metaObject.id,
                    text: metaObject.name
                };
                data.push(child);
                const children = metaObject.children;
                if (children) {
                    child.children = [];
                    for (var i = 0, len = children.length; i < len; i++) {
                        visit(true, child.children, children[i]);
                    }
                }
            }

            visit(true, data, metaModel.rootMetaObject);
            return data;
        };

        // Get MetaModel we loaded for our model
        const modelId = model.id;
        const metaModel = viewer.metaScene.metaModels[modelId];

        // Create the tree view
        var treeView = new InspireTree({
            selection: {
                autoSelectChildren: true,
                autoDeselect: true,
                mode: 'checkbox'
            },
            checkbox: {
                autoCheckChildren: true
            },
            data: createData(metaModel)
        });

        new InspireTreeDOM(treeView, {
            target: document.getElementById("treePanel")
        });

        // Initialize the tree view once loaded
        treeView.on('model.loaded', function () {

            treeView.select();

            treeView.model.expand();
            treeView.model[0].children[0].expand();
            treeView.model[0].children[0].children[0].expand();

            treeView.on('node.checked', function (event, node) {
                const objectId = event.id;
                viewer.scene.setObjectsXRayed(objectId, false);
                viewer.scene.setObjectsCollidable(objectId, true);
                viewer.scene.setObjectsPickable(objectId, true);
            });

            treeView.on('node.unchecked', function (event, node) {
                const objectId = event.id;
                viewer.scene.setObjectsXRayed(objectId, true);
                viewer.scene.setObjectsCollidable(objectId, false);
                viewer.scene.setObjectsPickable(objectId, false);
            });
        });
    });
};