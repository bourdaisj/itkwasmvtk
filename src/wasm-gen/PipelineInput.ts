import IOTypes from './IOTypes'

interface PipelineInput {
  // Backwards compatibility with IOTypes -- remove?
  path?: string
  type: (typeof IOTypes)[keyof typeof IOTypes]
  data: Uint8Array
}

export default PipelineInput
