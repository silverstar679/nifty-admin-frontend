import axios from 'axios'

const network =
  process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
const baseURL = `https://api-admin.niftyroyale.com/drops?network=${network}`

export default async function fetchDrops() {
  try {
    const response = await axios.get(baseURL)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
