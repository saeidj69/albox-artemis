import { z } from 'zod'

import {
  clientStateSchemas,
  type ClientStateSchemaKey,
  type ClientStateValue,
} from './schemas'

function getClientStateSchema<K extends ClientStateSchemaKey>(
  schemaKey: K,
): z.ZodType<ClientStateValue<K>> {
  return clientStateSchemas[schemaKey] as unknown as z.ZodType<
    ClientStateValue<K>
  >
}

export function parseClientStateValue<K extends ClientStateSchemaKey>(
  schemaKey: K,
  raw: string | null | undefined,
): ClientStateValue<K> | null {
  if (raw == null) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    const result = getClientStateSchema(schemaKey).safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function serializeClientStateValue<K extends ClientStateSchemaKey>(
  schemaKey: K,
  value: ClientStateValue<K>,
): string | null {
  const result = getClientStateSchema(schemaKey).safeParse(value)
  return result.success ? JSON.stringify(result.data) : null
}
