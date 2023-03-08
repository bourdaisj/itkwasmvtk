import config from '../../itkConfig.js'
import loadEmscriptenModuleMainThread from './loadEmscriptenModuleMainThread'
import PipelineEmscriptenModule from './PipelineEmscriptenModule'

const pipelineToModule: Map<string, PipelineEmscriptenModule> = new Map()

export async function loadPipelineModule (
    pipelinePath: string | URL
  ): Promise<PipelineEmscriptenModule> {
    let moduleRelativePathOrURL: string | URL = pipelinePath as string
    let pipeline = pipelinePath as string
    if (typeof pipelinePath !== 'string') {
      moduleRelativePathOrURL = new URL(pipelinePath.href)
      pipeline = moduleRelativePathOrURL.href
    }
    if (pipelineToModule.has(pipeline)) {
      return pipelineToModule.get(pipeline) as PipelineEmscriptenModule
    } else {
      const pipelineModule = (await loadEmscriptenModuleMainThread(
        pipelinePath,
        config.pipelinesUrl
      )) as PipelineEmscriptenModule
      pipelineToModule.set(pipeline, pipelineModule)
      return pipelineModule
    }
  }