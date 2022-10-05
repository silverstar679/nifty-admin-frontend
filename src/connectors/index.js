import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'

const POLLING_INTERVAL = 12000
const RPC_URLS = {
  1: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_MAINNET}`,
  5: `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_GOERLI}`,
  137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_POLYGON}`,
  80001: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_MUMBAI}`,
}

export const injected = new InjectedConnector({
  supportedChainIds: process.env.NEXT_PUBLIC_ETHEREUM_SUPPORTED_CHAIN_IDS,
})

export const ethereumNetwork = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 5: RPC_URLS[5] },
  defaultChainId: process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID,
  pollingInterval: POLLING_INTERVAL,
})

export const polygonNetwork = new NetworkConnector({
  urls: { 137: RPC_URLS[137], 80001: RPC_URLS[80001] },
  defaultChainId: process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID,
  pollingInterval: POLLING_INTERVAL,
})
