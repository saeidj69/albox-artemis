import axios, { type AxiosError, type AxiosInstance } from 'axios'

const mapsiClient: AxiosInstance = axios.create({
  baseURL: process.env.MAPSI_BASE_URL,
  timeout: 30_000,
})

export const mapsiMutator = <T>(
  url: string,
  config?: Record<string, unknown>,
): Promise<T> => {
  const data = config?.body ?? config?.data

  return mapsiClient({ url, data, ...config }).then((response) => response as T)
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
