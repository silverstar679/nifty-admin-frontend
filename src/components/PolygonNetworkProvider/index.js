import { createWeb3ReactRoot } from '@web3-react/core'
import { PolygonNetworkContextName } from '../../constants'

const Web3ProviderPolygonNetwork = createWeb3ReactRoot(PolygonNetworkContextName)

const Web3ProviderPolygonNetworkSSR = ({ children, getLibrary }) => {
  return <Web3ProviderPolygonNetwork getLibrary={getLibrary}>{children}</Web3ProviderPolygonNetwork>
}

export default Web3ProviderPolygonNetworkSSR
