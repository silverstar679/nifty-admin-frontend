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
    const response = await axios.delete(`${baseURL}/drop/${id}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function updateDrop(id, data) {
  try {
    const response = await axios.put(`${baseURL}/drop/${id}`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function createDrop(data) {
  try {
    const response = await axios.post(`${baseURL}/drops`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
