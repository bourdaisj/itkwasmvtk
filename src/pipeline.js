import { runPipeline, IOTypes, InterfaceTypes } from "itk-wasm";
import { readAsArrayBuffer } from "promise-file-reader";
import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

export async function convertToPolyData(file) {
    console.debug("convertToPolyData");
    return await readAsArrayBuffer(file).then((arrayBuffer) => {
      const args = [file.name, file.name + ".output.json"];

      const pipelineInputs = [
        {
          path: args[0],
          type: IOTypes.Binary,
          data: new Uint8Array(arrayBuffer),
        },
      ];
      
      const pipelineOutputs = [
        { 
          path: args[1], 
          type: IOTypes.Binary, 
        }
      ];

      console.debug({
        args,
        pipelineInputs,
        pipelineOutputs,
      });

      return runPipeline(
        false,
        "convertToPolyData",
        args,
        pipelineOutputs,
        pipelineInputs
      ).then(({ outputs }) => {
        const reader = vtkXMLPolyDataReader.newInstance();
        reader.parseAsArrayBuffer(outputs[0].data);
        return reader.getOutputData();
      });
    });
  }