import axios from 'axios'

const network =
  process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
const polygonNetwork =
  process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID === '137' ? 'polygon' : 'mumbai'

const baseURL = `https://api-admin.niftyroyale.com`

export async function getAllDrops() {
  try {
    const response = await axios.get(
      `${baseURL}/drops?network=${network}&polygonNetwork=${polygonNetwork}`
    )
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

export async function getAllCollections() {
  try {
    const response = await axios.get(`${baseURL}/collections?network=${network}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function deleteCollection(id) {
  try {
    const response = await axios.delete(`${baseURL}/collection/${id}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function updateCollection(id, data) {
  try {
    const response = await axios.put(`${baseURL}/collection/${id}`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function createCollection(data) {
  try {
    const response = await axios.post(`${baseURL}/collections`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function getAllCollectionBattles() {
  try {
    const response = await axios.get(`${baseURL}/collectionBattles?network=${network}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function deleteCollectionBattle(id) {
  try {
    const response = await axios.delete(`${baseURL}/collectionBattle/${id}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function updateCollectionBattle(id, data) {
  try {
    const response = await axios.put(`${baseURL}/collectionBattle/${id}`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function createCollectionBattle(data) {
  try {
    const response = await axios.post(`${baseURL}/collectionBattles`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
