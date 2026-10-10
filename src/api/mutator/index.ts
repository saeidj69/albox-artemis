import { environmentManager } from '@/config/environment'
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

import { getErrorMessageFromErrorResponse } from './utils/error-message'
import { normalizeArrayParams, normalizeBooleanParams } from './utils/params'
import { reportApiError } from './utils/report-api-error'

const axiosInstance = axios.create({
  baseURL: environmentManager.getApiUrl(),
  timeout: 2 * 60 * 1000,
  withCredentials: true,
})

/** Orval forwards this as each hook's `request` option (`SecondParameter<typeof mutator>`). */
export type MutatorConfig = RequestInit & { skipErrorToast?: boolean }

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
  const status = error.response?.status

  const errorMessage = getErrorMessageFromErrorResponse(errorResponse)

  reportApiError(error)

  if (status === 401 || status === 429) {
    return Promise.reject(error)
  }

  if (errorResponse && typeof errorResponse === 'object') {
    const config = error.config as MutatorConfig

    if (config?.skipErrorToast !== true) {
      toast.error(errorMessage)
    }
  }

  return Promise.reject(error)
}

function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError)
  axiosInstance.interceptors.response.use(onResponse, onResponseError)
  return axiosInstance
}

const client = setupInterceptorsTo(axiosInstance)

export const mutator = <T>(url: string, config?: MutatorConfig): Promise<T> => {
  const data = config?.body
  const normalizedUrl = normalizeBooleanParams(normalizeArrayParams(url))

  const promise = client({
    url: normalizedUrl,
    data,
    ...config,
  } as AxiosRequestConfig).then((response) => response.data as T)

  return promise
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
