import type { GlobalFilterOption, InferSubmitValues } from './types'

export function cloneSubmitValues<O extends readonly GlobalFilterOption[]>(
  values: InferSubmitValues<O>,
): InferSubmitValues<O> {
  return structuredClone(values) as InferSubmitValues<O>
}
