import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { ETHEREUM_SUPPORTED_CHAIN_IDS, DEFAULT_POLYGON_NETWORK_CHAIN_ID } from '../config'
const POLLING_INTERVAL = 12000
const RPC_URLS = {
  137: 'https://polygon-rpc.com/',
  80001: 'https://rpc-mumbai.maticvigil.com/',
}

export const injected = new InjectedConnector({
  supportedChainIds: ETHEREUM_SUPPORTED_CHAIN_IDS,
})

export const network = new NetworkConnector({
  urls: { 137: RPC_URLS[137], 80001: RPC_URLS[80001] },
  defaultChainId: DEFAULT_POLYGON_NETWORK_CHAIN_ID,
  pollingInterval: POLLING_INTERVAL,
})
