import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField } from '@mui/material'
import fetchEthereumABI from '../../services/fetchEthereumABI'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import {
  useEthereumWeb3React,
  usePolygonNetworkWeb3React,
  useEthereumNetworkWeb3React,
} from '../../hooks'
import {
  useEthereumContract,
  usePolygonNetworkContract,
  useEthereumNetworkContract,
} from '../../hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'

const states = [
  {
    value: 'alabama',
    label: 'Alabama',
  },
  {
    value: 'new-york',
    label: 'New York',
  },
  {
    value: 'san-francisco',
    label: 'San Francisco',
  },
]

export const ContractInteraction = (props) => {
  const battleAddress = props.drop.address
  const polygonContractAddress = props.drop.polygonContractAddress

  const { active, account, chainId } = useEthereumWeb3React()

  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])
  const [owner, setOwner] = useState('')

  const [values, setValues] = useState({
    price: 0,
    startingTime: Date.now(),
    baseURI: '',
    defaultTokenURI: '',
    prizeTokenURI: '',
    maxSupply: 0,
    unitsPerTransaction: 0,
    winnerTokenId: 0,
    ethAmount: 0,
    erc20Amount: 0,
  })

  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  useEffect(() => {
    async function getABI() {
      const abi = await fetchEthereumABI(battleAddress)
      setEthereumAbi(abi)
    }
    if (battleAddress) {
      getABI()
    }
  }, [battleAddress])

  useEffect(() => {
    async function getABI() {
      const abi = await fetchPolygonABI(polygonContractAddress)
      setPolygonAbi(abi)
    }
    if (polygonContractAddress) {
      getABI()
    }
  }, [polygonContractAddress])

  const provider = new ethers.providers.InfuraProvider(
    parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID),
    process.env.NEXT_PUBLIC_INFURA_API_KEY
  )
  const ethereumContract = useEthereumNetworkContract(battleAddress, ethereumAbi, true)
  const polygonContract = usePolygonNetworkContract(polygonContractAddress, polygonAbi, true)

  const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider)
  // const ethereumInjectedContract = useEthereumContract(battleAddress, ethereumAbi, true)
  const ethereumContractWithSigner = wallet && ethereumContract && ethereumContract.connect(wallet)

  useEffect(() => {
    async function getBattleInfo() {
      Promise.all([
        ethereumContract.price(),
        ethereumContract.startingTime(),
        ethereumContract.baseURI(),
        ethereumContract.prizeTokenURI(),
        ethereumContract.maxSupply(),
        ethereumContract.unitsPerTransaction(),
        ethereumContract.owner(),
      ]).then(
        ([price, startingTime, baseURI, prizeTokenURI, maxSupply, unitsPerTransaction, owner]) => {
          setValues({
            ...values,
            price: Number(ethers.utils.formatEther(BigNumber.from(price).toBigInt())),
            startingTime: BigNumber.from(startingTime).toNumber(),
            baseURI,
            prizeTokenURI,
            maxSupply: BigNumber.from(maxSupply).toNumber(),
            unitsPerTransaction: BigNumber.from(unitsPerTransaction).toNumber(),
          })
          setOwner(owner)
        }
      )
    }
    if (
      ethereumContract &&
      ethereumContract.provider &&
      polygonContract &&
      polygonContract.provider
    ) {
      getBattleInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereumContract, polygonContract])

  const startEthBattle = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.startBattle()
      await tx.wait()
      console.log('Battle Started: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const endEthBattle = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.endBattle(values.winnerTokenId)
      await tx.wait()
      console.log('Battle Ended: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const withdrawEth = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.withdrawETH(values.ethAmount)
      await tx.wait()
      console.log('Battle Ended: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const withdrawERC20 = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.withdrawERC20Token(
        battleAddress,
        values.erc20Amount
      )
      await tx.wait()
      console.log('Battle Ended: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updateNFTPrice = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.setPrice(ethers.utils.parseEther(values.price))
      await tx.wait()
      console.log('Updated NFT Price: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updateBaseURI = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.setBaseURI(values.baseURI)
      await tx.wait()
      console.log('Updated Base URI: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updateDefaultTokenURI = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.setDefaultTokenURI(values.defaultTokenURI)
      await tx.wait()
      console.log('Updated Default Token URI: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updatePrizeTokenURI = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.setPrizeTokenURI(values.prizeTokenURI)
      await tx.wait()
      console.log('Updated Prize Token URI: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updateMaxSupply = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.setMaxSupply(values.maxSupply)
      await tx.wait()
      console.log('Updated Max Supply: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updateUnitsPerTransaction = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.setUnitsPerTransaction(values.unitsPerTransaction)
      await tx.wait()
      console.log('Updated Units per Transaction: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updateDropTime = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.setStartingTime(values.startingTime)
      await tx.wait()
      console.log('Updated Drop Time: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  return (
    <Grid container spacing={1}>
      <Grid item md={6}>
        <Card>
          <CardHeader title="Ethereum Contract Functionalities" />
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Start Battle" sx={{ py: 1 }} />
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={startEthBattle}>
              Start
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="End Battle" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Winner Token ID"
              name="winnerTokenId"
              onChange={handleInputChange}
              value={values.winnerTokenId}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={endEthBattle}>
              End
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Withdraw Eth" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Eth Amount"
              name="ethAmount"
              onChange={handleInputChange}
              value={values.ethAmount}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={withdrawEth}>
              Withdraw ETH
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Withdraw ERC20" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="ERC20 Amount"
              name="erc20Amount"
              onChange={handleInputChange}
              value={values.erc20Amount}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={withdrawERC20}>
              Withdraw ERC20
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Price" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="NFT Price"
              name="price"
              onChange={handleInputChange}
              value={values.price}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={updateNFTPrice}>
              Update
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Time for Drop" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Drop Time"
              name="startingTime"
              onChange={handleInputChange}
              value={values.startingTime}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={updateDropTime}>
              Update
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Base URI" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Base URI"
              name="baseURI"
              onChange={handleInputChange}
              value={values.baseURI}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={updateBaseURI}>
              Update
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Default Token URI" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Default URI"
              name="defaultTokenURI"
              onChange={handleInputChange}
              value={values.defaultTokenURI}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={updateDefaultTokenURI}>
              Update
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Prize Token URI" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Prize URI"
              name="prizeTokenURI"
              onChange={handleInputChange}
              value={values.prizeTokenURI}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={updatePrizeTokenURI}>
              Update
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Maximum Purchaseable Amount" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Max Purchaseable Amount"
              name="maxSupply"
              onChange={handleInputChange}
              value={values.maxSupply}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={updateMaxSupply}>
              Update
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Units per Transaction" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Units per Transaction"
              name="unitsPerTransaction"
              onChange={handleInputChange}
              value={values.unitsPerTransaction}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={updateUnitsPerTransaction}>
              Update
            </Button>
          </Box>
        </Card>
      </Grid>
      <Grid item md={6}>
        <Card>
          <CardHeader title="Polygon Contract Functionalities" />
        </Card>
        <Box sx={{ py: 1 }} />

      </Grid>
    </Grid>
  )
}
