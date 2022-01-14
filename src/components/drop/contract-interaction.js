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

export const ContractInteraction = (props) => {
  const battleAddress = props.drop.address
  const polygonContractAddress = props.drop.polygonContractAddress

  const { active, account, chainId } = useEthereumWeb3React()

  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])
  const [battleState, setBattleState] = useState([])
  const [owner, setOwner] = useState('')
  const [inPlay, setInPlay] = useState([])
  const [battleStateEth, setBattleStateEth] = useState(0)
  const [isBattleAdded, setIsBattleAdded] = useState(false)
  const [isBattleEnded, setIsBattleEnded] = useState(false)

  const [values, setValues] = useState({
    price: 0,
    startingTime: Date.now(),
    baseURI: '',
    defaultTokenURI: '',
    prizeTokenURI: '',
    maxSupply: 0,
    unitsPerTransaction: 0,
    ethAmountEthNet: 0,
    erc20AmountEthNet: 0,
    erc20TokenAddressEthNet: '',
    ethAmountPolyNet: 0,
    erc20AmountPolyNet: 0,
    erc20TokenAddressPolyNet: '',
    intervalTime: 5,
    eliminatedTokenCount: 1,
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
  const polygonContractWithSigner = wallet && polygonContract && polygonContract.connect(wallet)

  useEffect(() => {
    async function getDropInfo() {
      Promise.all([
        ethereumContract.battleState(),
        ethereumContract.price(),
        ethereumContract.startingTime(),
        ethereumContract.baseURI(),
        ethereumContract.defaultTokenURI(),
        ethereumContract.prizeTokenURI(),
        ethereumContract.maxSupply(),
        ethereumContract.unitsPerTransaction(),
        ethereumContract.owner(),
      ]).then(
        ([
          battleState,
          price,
          startingTime,
          baseURI,
          defaultTokenURI,
          prizeTokenURI,
          maxSupply,
          unitsPerTransaction,
          owner,
        ]) => {
          setValues({
            ...values,
            price: Number(ethers.utils.formatEther(BigNumber.from(price).toBigInt())),
            startingTime: BigNumber.from(startingTime).toNumber(),
            baseURI,
            defaultTokenURI,
            prizeTokenURI,
            maxSupply: BigNumber.from(maxSupply).toNumber(),
            unitsPerTransaction: BigNumber.from(unitsPerTransaction).toNumber(),
          })
          setOwner(owner)
          setBattleState(battleState)
        }
      )
    }
    if (
      ethereumContract &&
      ethereumContract.provider &&
      polygonContract &&
      polygonContract.provider
    ) {
      getDropInfo()
      ethereumContract.removeAllListeners('BattleStarted')

      ethereumContract.on('BattleStarted', (battleAddressEmitted, inPlayEmitted, event) => {
        if (battleAddress === battleAddressEmitted) {
          setInPlay(inPlayEmitted)
          setBattleStateEth(1)
        }
      })
      polygonContract.removeAllListeners('BattleAdded')

      polygonContract.on('BattleAdded', (battle, event) => {
        if (battleAddress === battle.gameAddr) {
          setIsBattleAdded(true)
        }
      })
      polygonContract.removeAllListeners('BattleEnded')

      polygonContract.on('BattleEnded', (finished, gameAddr, winnerTokenId, battleState, event) => {
        if (battleAddress === gameAddr) {
          ethereumContractWithSigner.endBattle(winnerTokenId).then(() => {
            setIsBattleEnded(true)
          })
        }
      })
    }
    return () => {
      try {
        if (
          ethereumContract &&
          ethereumContract.provider &&
          polygonContract &&
          polygonContract.provider
        ) {
          if (!isOldVersion) {
            ethereumContract.removeListener('BattleStarted')
            polygonContract.removeListener('BattleAdded')
          }
        }
      } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereumContract, polygonContract])

  const startBattle = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.startBattle()
      await tx.wait()
      console.log('Battle Started on Ethereum: ', tx.hash)
      if (inPlay.length !== 0) {
        const txPoly = await polygonContractWithSigner.addToBattleQueue(
          battleAddress,
          values.intervalTime,
          inPlay,
          values.eliminatedTokenCount
        )
        await txPoly.wait()
        console.log('Battle Started on Polygon: ', txPoly.hash)
      }
    } else {
      console.log('you are not contract owner')
    }
  }

  const withdrawEthEthNet = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.withdrawETH(values.erc20AmountEthNet)
      await tx.wait()
      console.log('Withdraw ETH successfully: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const withdrawERC20EthNet = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.withdrawERC20Token(
        values.erc20TokenAddressEthNet,
        values.erc20AmountEthNet
      )
      await tx.wait()
      console.log('Withdraw ERC20 successfully: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const withdrawEthPolyNet = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.withdrawETH(values.erc20AmountPolyNet)
      await tx.wait()
      console.log('Withdraw ETH successfully: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const withdrawERC20PolyNet = async () => {
    if (account === owner) {
      const tx = await ethereumContractWithSigner.withdrawERC20Token(
        values.erc20TokenAddressPolyNet,
        values.erc20AmountPolyNet
      )
      await tx.wait()
      console.log('Withdraw ERC20 successfully: ', tx.hash)
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

  const updateIntervalTime = async () => {
    if (account === owner) {
      const tx = await polygonContractWithSigner.setBattleIntervalTime(
        props.drop.queueId,
        values.intervalTime
      )
      await tx.wait()
      console.log('Updated Interval Time: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  const updateEliminatedTokenCount = async () => {
    if (account === owner) {
      const tx = await polygonContractWithSigner.setEliminatedTokenCount(
        props.drop.queueId,
        values.eliminatedTokenCount
      )
      await tx.wait()
      console.log('Updated Interval Time: ', tx.hash)
    } else {
      console.log('you are not contract owner')
    }
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            subheader="Queue ID must be defined in DB before starting"
            title="Start Battle"
            sx={{ py: 1 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Queue ID"
                  required
                  InputProps={{
                    readOnly: true,
                  }}
                  value={props.drop.queueId}
                  variant="outlined"
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Interval Time"
                  name="intervalTime"
                  onChange={handleInputChange}
                  value={values.intervalTime}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Eliminated Token Count"
                  name="eliminatedTokenCount"
                  onChange={handleInputChange}
                  value={values.eliminatedTokenCount}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={startBattle}>
              Start
            </Button>
          </Box>
        </Card>
      </Grid>

      <Grid item md={6}>
        <Card>
          <CardHeader title="Ethereum Contract Functionalities" />
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set NFT Price" sx={{ py: 1 }} />
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
          <CardHeader title="Set Drop Time" sx={{ py: 1 }} />
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

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Withdraw Eth" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Eth Amount"
              name="ethAmountEthNet"
              onChange={handleInputChange}
              value={values.ethAmountEthNet}
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
            <Button color="primary" variant="contained" onClick={withdrawEthEthNet}>
              Withdraw ETH
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Withdraw ERC20" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ERC20 Token Address"
                  name="erc20TokenAddressEthNet"
                  onChange={handleInputChange}
                  value={values.erc20TokenAddressEthNet}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ERC20 Amount"
                  name="erc20AmountEthNet"
                  onChange={handleInputChange}
                  value={values.erc20AmountEthNet}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={withdrawERC20EthNet}>
              Withdraw ERC20
            </Button>
          </Box>
        </Card>
      </Grid>
      <Grid item md={6}>
        <Card>
          <CardHeader
            title="Polygon Contract Functionalities"
            subheader="Queue ID must be defined in DB before updating"
          />
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Queue ID" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Queue ID"
              required
              InputProps={{
                readOnly: true,
              }}
              value={props.drop.queueId}
              variant="outlined"
            />
          </CardContent>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Interval Time" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Interval Time"
              name="intervalTime"
              onChange={handleInputChange}
              value={values.intervalTime}
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
            <Button color="primary" variant="contained" onClick={updateIntervalTime}>
              Update
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Set Eliminated Token Count" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Eliminated Token Count"
              name="eliminatedTokenCount"
              onChange={handleInputChange}
              value={values.eliminatedTokenCount}
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
            <Button color="primary" variant="contained" onClick={updateEliminatedTokenCount}>
              Update
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
              name="ethAmountPolyNet"
              onChange={handleInputChange}
              value={values.ethAmountPolyNet}
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
            <Button color="primary" variant="contained" onClick={withdrawEthPolyNet}>
              Withdraw ETH
            </Button>
          </Box>
        </Card>

        <Box sx={{ py: 1 }} />

        <Card>
          <CardHeader title="Withdraw ERC20" sx={{ py: 1 }} />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ERC20 Token Address"
                  name="erc20TokenAddressPolyNet"
                  onChange={handleInputChange}
                  value={values.erc20TokenAddressPolyNet}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ERC20 Amount"
                  name="erc20AmountPolyNet"
                  onChange={handleInputChange}
                  value={values.erc20AmountPolyNet}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained" onClick={withdrawERC20PolyNet}>
              Withdraw ERC20
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}
