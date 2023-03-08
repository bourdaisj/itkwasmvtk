import IOTypes from './IOTypes'

import PipelineEmscriptenModule from './PipelineEmscriptenModule'
import PipelineInput from './PipelineInput'
import PipelineOutput from './PipelineOutput'
import RunPipelineResult from './RunPipelineResult'

const haveSharedArrayBuffer = typeof globalThis.SharedArrayBuffer === 'function'

function readFileSharedArray (emscriptenModule: PipelineEmscriptenModule, path: string): Uint8Array {
  const opts = { flags: 'r', encoding: 'binary' }
  const stream = emscriptenModule.fs_open(path, opts.flags)
  const stat = emscriptenModule.fs_stat(path)
  const length = stat.size
  let arrayBufferData = null
  if (haveSharedArrayBuffer) {
    arrayBufferData = new SharedArrayBuffer(length) // eslint-disable-line
  } else {
    arrayBufferData = new ArrayBuffer(length)
  }
  const array = new Uint8Array(arrayBufferData)
  emscriptenModule.fs_read(stream, array, 0, length, 0)
  emscriptenModule.fs_close(stream)
  return array
}

function runPipelineEmscripten (
  pipelineModule: PipelineEmscriptenModule, 
  args: string[], 
  outputs: PipelineOutput[] | null, 
  inputs: PipelineInput[] | null
): RunPipelineResult {
  if (!(inputs == null) && inputs.length > 0) {
    inputs.forEach(function (input, index) {
      switch (input.type) {
        case IOTypes.Binary:
        {
          pipelineModule.fs_writeFile(input.path as string, input.data as Uint8Array)
          break
        }
        default:
          throw Error('Unsupported input InterfaceType')
      }
    })
  }

  pipelineModule.resetModuleStdout()
  pipelineModule.resetModuleStderr()

  let returnValue = 0
  try {
    returnValue = pipelineModule.callMain(args.slice())
  } catch (exception) {
    // Note: Module must be built with CMAKE_BUILD_TYPE set to Debug.
    // e.g.: itk-wasm build my/project -- -DCMAKE_BUILD_TYPE:STRING=Debug
    if (typeof exception === 'number') {
      console.log('Exception while running pipeline:')
      console.log('stdout:', pipelineModule.getModuleStdout())
      console.error('stderr:', pipelineModule.getModuleStderr())
      if (typeof pipelineModule.getExceptionMessage !== 'undefined') {
        console.error('exception:', pipelineModule.getExceptionMessage(exception))
      } else {
        console.error('Build module in Debug mode for exception message information.')
      }
    }
    throw exception
  }
  const stdout = pipelineModule.getModuleStdout()
  const stderr = pipelineModule.getModuleStderr()

  const populatedOutputs: PipelineOutput[] = []
  if (!(outputs == null) && outputs.length > 0 && returnValue === 0) {
    outputs.forEach(function (output, index) {
      let outputData: any = null
      switch (output.type) {
        case IOTypes.Binary:
        {
          if (typeof output.path === 'undefined') {
            throw new Error('output.path not defined')
          }
          outputData = readFileSharedArray(pipelineModule, output.path)
          break
        }
        default:
          throw Error('Unsupported output InterfaceType')
      }
      const populatedOutput = {
        type: output.type,
        data: outputData
      }
      populatedOutputs.push(populatedOutput)
    })
  }

  return { returnValue, stdout, stderr, outputs: populatedOutputs }
}

export default runPipelineEmscripten
