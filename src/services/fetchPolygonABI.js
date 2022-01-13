import axios from 'axios'

const network =
  process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID === '137' ? 'mainnet' : 'mumbai'
const polygonscanBaseAPI = `https://api.niftyroyale.com/polygonscan`

export default async function fetchPolygonABI(address) {
  try {
    const response = await axios.get(`${polygonscanBaseAPI}/${network}/contract-abi/${address}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
