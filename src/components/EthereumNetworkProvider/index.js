import { createWeb3ReactRoot } from '@web3-react/core'
import { EthereumNetworkContextName } from '../../constants'

const Web3ProviderEthereumNetwork = createWeb3ReactRoot(EthereumNetworkContextName)

const Web3ProviderEthereumNetworkSSR = ({ children, getLibrary }) => {
  return (
    <Web3ProviderEthereumNetwork getLibrary={getLibrary}>{children}</Web3ProviderEthereumNetwork>
  )
}

export default Web3ProviderEthereumNetworkSSR
