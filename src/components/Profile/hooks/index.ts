import { useAtom } from 'jotai'

import { showProfileModalAtom } from '../atoms'

const useProfileModal = () => {
  const [showProfileModal, setShowProfileModal] = useAtom(showProfileModalAtom)

  return {
    showProfileModal,
    setShowProfileModal,
  }
}

export default useProfileModal
