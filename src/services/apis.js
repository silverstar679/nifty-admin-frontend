import axios from 'axios'

const network =
  process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
const baseURL = `https://api-admin.niftyroyale.com`

export async function getAllDrops() {
  try {
    const response = await axios.get(`${baseURL}/drops?network=${network}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function deleteDrop(id) {
  try {
    const response = await axios.delete(`${baseURL}/drop/${id}`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function updateDrop(id, data) {
  try {
    const response = await axios.put(`${baseURL}/${id}`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
