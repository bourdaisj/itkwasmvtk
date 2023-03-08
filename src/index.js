import "@kitware/vtk.js";
import "@kitware/vtk.js/Rendering/Profiles/Geometry.js";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor.js";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper.js";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow.js";

import {
  convertEnsightToPolyData,
  convertToPolyData,
} from "./pipeline.js";
console.log('loading')

window.addEventListener('load', () => {
  async function processFile(event) {
    const dataTransfer = event.dataTransfer;
    const files = event.target.files || dataTransfer.files;
    // const file = files[0];

    // console.log({ file });
  
    // const polyData = await convertToPolyData(file);
    const polyData = await convertEnsightToPolyData(Array.from(files));
  
    createViewer(polyData);
  }
  function createViewer(polyData) {
    console.debug('createViewer');
    const renderWindow = vtkFullScreenRenderWindow.newInstance();
    const mapper = vtkMapper.newInstance();
    mapper.setInputData(polyData);
    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    const renderer = renderWindow.getRenderer();
    renderer.addActor(actor);
    renderer.resetCamera();
  }
  const fileInput = document.querySelector("input");
  fileInput.addEventListener("change", processFile);
});



