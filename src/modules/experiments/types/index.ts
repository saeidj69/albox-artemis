export type Variant<TKey extends string = string, TPayload = unknown> = {
  key: TKey
  /** Persian display name shown in the experiments debug UI. */
  label: string
  weight: number
  payload?: TPayload
}

export type ExperimentConfig<
  TKey extends string = string,
  TPayload = unknown,
> = {
  id: string
  /** Persian title shown in the experiments debug UI. */
  title: string
  /** Short Persian explanation of what this experiment changes. */
  description: string
  /** Non-empty by construction — `assignVariant`'s fallback relies on this. */
  variants: readonly [Variant<TKey, TPayload>, ...Variant<TKey, TPayload>[]]
}
