import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useEagerConnect, useInactiveListener } from '../../hooks'
import { NetworkContextName } from '../../constants'
import { network } from '../../connectors'

export default function Web3ReactManager({ children }) {
  const { active: networkActive, activate: activateNetwork } = useWeb3React(NetworkContextName)

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect is active, activate polygon network
  useEffect(() => {
    if (triedEager && !networkActive) {
      activateNetwork(network)
    }
  }, [activateNetwork, networkActive, triedEager])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }
  return children
}
