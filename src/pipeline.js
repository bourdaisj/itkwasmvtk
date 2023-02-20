import { runPipelineBrowser, IOTypes, InterfaceTypes, runPipeline } from "itk-wasm";
import { readAsArrayBuffer } from "promise-file-reader";

export async function convertToPolyData(file) {
    return await readAsArrayBuffer(file).then((arrayBuffer) => {
      const args = [file.name, file.name + ".output.json"];

      console.debug({ args });

      const pipelineOutputs = [{ path: args[1], type: InterfaceTypes.PolyData }];
      const pipelineInputs = [
        {
          path: args[0],
          type: IOTypes.Binary,
          data: new Uint8Array(arrayBuffer),
        },
      ];
      return runPipelineBrowser(
        false,
        "convertToPolyData",
        args,
        pipelineOutputs,
        pipelineInputs
      ).then(({ outputs, webWorker }) => {
        return window.vtk(outputs[0].data);
      });
    });
  }