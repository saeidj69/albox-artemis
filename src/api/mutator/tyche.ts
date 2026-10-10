import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

import { getErrorMessageFromErrorResponse } from './utils/error-message'
import { normalizeArrayParams, normalizeBooleanParams } from './utils/params'

const axiosInstance = axios.create({
  baseURL: process.env.TYCHE_API_URL,
  timeout: 2 * 60 * 1000,
  withCredentials: true,
})

const onRequest = (config: InternalAxiosRequestConfig) => {
  config.headers.set('X-Auth-Scope', 'client')

  return config
}

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error)
}

const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response
}

const onResponseError = async (error: AxiosError): Promise<AxiosError> => {
  const errorResponse = error?.response?.data

  const errorMessage = getErrorMessageFromErrorResponse(errorResponse)

  if (
    errorResponse &&
    typeof errorResponse === 'object' &&
    error.response?.status !== 401
  ) {
    toast.error(errorMessage)
  }

  return Promise.reject(error)
}

function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError)
  axiosInstance.interceptors.response.use(onResponse, onResponseError)
  return axiosInstance
}

const client = setupInterceptorsTo(axiosInstance)

export const mutator = <T>(
  url: string,
  config?: Record<string, unknown>,
): Promise<T> => {
  const data = config?.body
  const normalizedUrl = normalizeBooleanParams(normalizeArrayParams(url))

  const promise = client({ url: normalizedUrl, data, ...config }).then(
    (response) => response.data as T,
  )

  return promise
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
