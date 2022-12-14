import { useMemo } from 'react'
import { useWeb3React, useEthereumNetworkWeb3React, usePolygonNetworkWeb3React } from './index'
import getContract from '../utils/getContract'

// returns null on errors
export function useEthereumContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = useWeb3React()

  return useMemo(() => {
    try {
      if (ABI.length === 0) return null
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function usePolygonContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = useWeb3React()

  return useMemo(() => {
    try {
      if (ABI.length === 0) return null
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useEthereumNetworkContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = useEthereumNetworkWeb3React()

  return useMemo(() => {
    try {
      if (address.length !== 42 || ABI.length === 0) return null
      else
        return getContract(
          address,
          ABI,
          library,
          withSignerIfPossible && account ? account : undefined
        )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function usePolygonNetworkContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = usePolygonNetworkWeb3React()

  return useMemo(() => {
    try {
      if (!address || address.length !== 42 || ABI.length === 0) return null
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}
