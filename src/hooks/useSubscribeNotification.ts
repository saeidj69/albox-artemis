'use client'

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Enumeration of potential error codes.
 *
 * @enum {string}
 */
export enum Errors {
  ServiceWorkerAndPushManagerNotSupported = 'ServiceWorkerAndPushManagerNotSupported',
  PushManagerUnavailable = 'PushManagerUnavailable',
  ExistingSubscription = 'ExistingSubscription',
  Unknown = 'Unknown',
  VapidPublicKeyNotSet = 'VapidPublicKeyNotSet',
}

/**
 * Interface for error objects.
 *
 * @interface
 */
interface ErrorObject {
  errorCode: Errors
}

/**
 * Custom hook to manage push notifications subscription.
 */
export const useSubscribeNotification = () => {
  /**
   * Gets a push subscription for the current user.
   *
   * @async
   * @function
   * @returns {Promise<PushSubscription>} - A promise that resolves to a PushSubscription.
   * @throws {ErrorObject} - An object containing an error code.
   */
  const getSubscription = async (): Promise<PushSubscription> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw {
        errorCode: Errors.ServiceWorkerAndPushManagerNotSupported,
      } as ErrorObject
    }

    const registration = await navigator.serviceWorker.ready

    if (!registration.pushManager) {
      throw { errorCode: Errors.PushManagerUnavailable } as ErrorObject
    }

    const existingSubscription =
      await registration.pushManager.getSubscription()

    if (existingSubscription) {
      return existingSubscription
    }

    const publicKey = process.env.VAPID_PUBLIC_KEY

    if (!publicKey) {
      throw { errorCode: Errors.VapidPublicKeyNotSet } as ErrorObject
    }

    return await registration.pushManager.subscribe({
      applicationServerKey: urlBase64ToUint8Array(
        publicKey,
      ) as unknown as ArrayBuffer,
      userVisibleOnly: true,
    })
  }

  const removeSubscription = async (
    subscription: PushSubscription,
  ): Promise<boolean> => {
    if (!subscription) return false

    try {
      await subscription.unsubscribe()
      return true
    } catch (error) {
      console.error('Error unsubscribing from push', error)
      return false
    }
  }

  return { getSubscription, removeSubscription }
}
