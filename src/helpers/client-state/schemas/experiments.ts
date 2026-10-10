import { z } from 'zod'

export const experimentAssignmentSchema = z.object({
  variant: z.string(),
  assignedAt: z.number().int().nonnegative(),
  /** True when set manually (support/QA override) instead of by the hash-based bootstrap. */
  overridden: z.boolean().default(false),
})

export const experimentsStateSchema = z.record(
  z.string(),
  experimentAssignmentSchema,
)

export type ExperimentAssignment = z.infer<typeof experimentAssignmentSchema>
export type ExperimentsState = z.infer<typeof experimentsStateSchema>
