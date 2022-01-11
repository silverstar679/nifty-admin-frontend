import { createWeb3ReactRoot } from '@web3-react/core'
import { NetworkContextName } from '../../constants'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

const Web3ProviderNetworkSSR = ({ children, getLibrary }) => {
  return <Web3ProviderNetwork getLibrary={getLibrary}>{children}</Web3ProviderNetwork>
}

export default Web3ProviderNetworkSSR
