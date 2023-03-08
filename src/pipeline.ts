import { runPipeline, IOTypes, InterfaceTypes } from "itk-wasm";
import { loadPipelineModule } from "./wasm-gen/runPipeline";
import runPipelineEmscripten from "./wasm-gen/runPipelineEmscripten";
import { readAsArrayBuffer } from "promise-file-reader";
import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

export async function convertToPolyData(files: File[]) {
    console.debug("convertToPolyData", files);
    const file = files[0];

    const fileArrayBuffer = await readAsArrayBuffer(file);
    const args = [file.name, file.name + ".output.json"];

    const pipelineInputs = [
      {
        path: args[0],
        type: IOTypes.Binary,
        data: new Uint8Array(fileArrayBuffer),
      },
    ];
    
    const pipelineOutputs = [
      { 
        path: args[1],
        type: IOTypes.Binary, 
      }
    ];

    const pipelineResult = await runPipeline(
      false,
      "convertToPolyData",
      args,
      pipelineOutputs,
      pipelineInputs
    )

    const reader = vtkXMLPolyDataReader.newInstance();
    reader.parseAsArrayBuffer(pipelineResult.outputs[0].data as Uint8Array);
    return reader.getOutputData();
  }

  export async function convertEnsightToPolyData(files: File[]) {
    console.debug("convertEnsightToPolyData", files);

    const caseFile = files.find((file) => file.name.includes('case'));
  
    const pipelineModule = await loadPipelineModule("convertEnsightToPolyData");
  
    // Write every file to the WASM module virtual filesystem
    files.filter((file) => !file.name.includes('case')).forEach(async (file) => {
      const fileArrayBuffer = await readAsArrayBuffer(file);
      console.log({ filepath: file.name });
      pipelineModule.fs_writeFile(file.name, new Uint8Array(fileArrayBuffer));
    });
  
    const caseFileArrayBuffer = await readAsArrayBuffer(caseFile);
    const args = [caseFile.name, caseFile.name + ".output.json"];
  
    const pipelineInputs = [
      {
        path: args[0],
        type: IOTypes.Binary,
        data: new Uint8Array(caseFileArrayBuffer),
      },
    ];
    
    const pipelineOutputs = [
      { 
        path: args[1], 
        type: IOTypes.Binary, 
      }
    ];
      
    const result = runPipelineEmscripten(
      pipelineModule, 
      args, 
      pipelineOutputs, 
      pipelineInputs
    );
    
    const reader = vtkXMLPolyDataReader.newInstance();
    reader.parseAsArrayBuffer(result.outputs[0].data);

    return reader.getOutputData();
  }