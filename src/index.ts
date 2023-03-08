import "@kitware/vtk.js";
import "@kitware/vtk.js/Rendering/Profiles/Geometry.js";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor.js";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper.js";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow.js";

import {
  convertEnsightToPolyData,
  convertToPolyData,
} from "./pipeline";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData.js";

type PipelineName = "convertToPolyData" | "convertEnsightToPolyData";

let selectedPipeline: PipelineName = "convertToPolyData";

const pipelines = {
  convertEnsightToPolyData,
  convertToPolyData
};

const createViewer = function createViewer(polyData: vtkPolyData) {
  console.debug('createViewer');

  const renderWindow = vtkFullScreenRenderWindow.newInstance();
  const mapper = vtkMapper.newInstance();
  mapper.setInputData(polyData);
  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  const renderer = renderWindow.getRenderer();
  renderer.addActor(actor);
  renderer.resetCamera();
};

window.addEventListener('load', () => {
  async function processFile(event: Event) {
    // @ts-ignore
    const files = event.target.files;

    const polyData = await pipelines[selectedPipeline](Array.from(files));
    createViewer(polyData);
  }

  // Setup UI
  const fileInput = document.querySelector("input");
  fileInput.addEventListener("change", processFile);

  const pipelineSelectionInput = document.querySelector("select");

  pipelineSelectionInput.addEventListener("change", (event) => {
    // @ts-ignore
    selectedPipeline = event.target.value;
  });
});



