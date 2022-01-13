import axios from 'axios'

const network =
  process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
const etherscanBaseAPI = `https://api.niftyroyale.com/etherscan`

export default async function fetchEthereumABI(address) {
  try {
    const response = await axios.get(`${etherscanBaseAPI}/${network}/contract-abi/${address}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
