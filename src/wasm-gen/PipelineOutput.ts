import IOTypes from './IOTypes'

interface PipelineOutput {
  path?: string
  type:
  | (typeof IOTypes)[keyof typeof IOTypes]
  data?: Uint8Array
}

export default PipelineOutput
