import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  FormGroup,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { useWeb3React } from '../../hooks'
import {
  useEthereumNetworkContract,
  usePolygonNetworkContract,
  usePolygonContract,
  useEthereumContract,
} from '../../hooks/useContract'
import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { updateDrop } from 'src/services/apis'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

export const ERC721AContractInteraction = (props) => {
  const { active, account, chainId } = useWeb3React()

  const dropContractAddress = props.drop && props.drop.address
  const polygonContractAddress = props.drop && props.drop.polygonContractAddress
  const queueId = props.drop && props.drop.queueId
  const prizeContractAddress = props.drop && props.drop.prizeContractAddress
  const prizeTokenId = props.drop && parseInt(props.drop.prizeTokenId)
  const whitelist = props.drop.whitelist && props.drop.whitelist.split(',')
  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const ethereumAbi = props.drop && props.drop.ethereumAbi
  const polygonAbi = props.drop && props.drop.polygonAbi

  const [battleState, setBattleState] = useState(null)
  const [owner, setOwner] = useState('')
  const [price, setPrice] = useState(0)
  const [ownerPolygon, setOwnerPolygon] = useState('')
  const [winnerTokenId, setWinnerTokenId] = useState(0)
  const [baseUri, setBaseUri] = useState('')
  const [address, setAddress] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isReveal, setIsReveal] = useState(false)
  const [merkleroot, setMerkleroot] = useState('')
  const [tokenIds, setTokenIds] = useState('')

  const [intervalTime, setIntervalTime] = useState(1)
  const [eliminatedTokenCount, setEliminatedTokenCount] = useState(1)

  const handleClose = () => {
    setIsToast(false)
  }

  const handleWinnerTokenIdChange = (event) => {
    setWinnerTokenId(event.target.value)
  }

  const handleBaseUriChange = (event) => {
    setBaseUri(event.target.value)
  }

  const handlePriceChange = (event) => {
    setPrice(event.target.value)
  }

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }
  const handleAddressChange = (event) => {
    setAddress(event.target.value)
  }

  const handleIsRevealChange = (event) => {
    setIsReveal(event.target.checked)
  }

  const handleIntervalTimeChange = (event) => {
    setIntervalTime(event.target.value)
  }

  const handleTokenIdsChange = (event) => {
    setTokenIds(event.target.value)
  }

  const handleEliminatedTokenCountChange = (event) => {
    setEliminatedTokenCount(event.target.value)
  }

  const polygonContract = usePolygonNetworkContract(polygonContractAddress, polygonAbi, true)
  const polygonInjectedContract = usePolygonContract(polygonContractAddress, polygonAbi, true)
  const ethereumContractForPrize = useEthereumNetworkContract(
    prizeContractAddress,
    ethereumAbi,
    true
  )
  const ethereumInjectedContractForPrize = useEthereumContract(
    prizeContractAddress,
    ethereumAbi,
    true
  )
  const ethereumInjectedContractForBase = useEthereumContract(
    dropContractAddress,
    ethereumAbi,
    true
  )
  const ethereumContractForBase = useEthereumNetworkContract(
    dropContractAddress,
    ethereumAbi,
    true
  )

  useEffect(() => {
    // Hash leaves
    if (whitelist) {
      const leaves = whitelist.map((addr) => keccak256(addr))

      // Create tree
      const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
      const rootHash = `0x${merkleTree.getRoot().toString('hex')}`
      setMerkleroot(rootHash)
    }
  }, [whitelist])

  useEffect(() => {
    async function getDropInfo() {
      if (
        ethereumContractForBase &&
        ethereumContractForBase.provider &&
        ethereumAbi.length !== 0 &&
        ethereumContractForPrize &&
        ethereumContractForPrize.provider &&
        ethereumAbi.length !== 0 &&
        polygonContract &&
        polygonContract.provider &&
        polygonAbi.length !== 0
      ) {
        Promise.all([
          polygonContract.owner(),
          ethereumContractForPrize.owner(),
          polygonContract.battleQueue(queueId),
          ethereumContractForBase.price(),
          ethereumContractForBase.totalSupply(),
        ]).then(([ownerPolygon, owner, battleInfo, price, totalSupply]) => {
          setOwnerPolygon(ownerPolygon)
          setTokenIds([...Array(parseInt(totalSupply)).keys()].slice(1).join(','))
          setOwner(owner)
          setPrice(Number(ethers.utils.formatEther(BigNumber.from(price).toBigInt())))
          setIntervalTime(
            BigNumber.from(battleInfo.intervalTime).toNumber() === 0
              ? 1
              : BigNumber.from(battleInfo.intervalTime).toNumber()
          )
          setEliminatedTokenCount(
            BigNumber.from(battleInfo.eliminatedTokenCount).toNumber() === 0
              ? 1
              : BigNumber.from(battleInfo.eliminatedTokenCount).toNumber()
          )
          setBattleState(battleInfo.battleState)
          setWinnerTokenId(battleInfo.winnerTokenId)
        })

        polygonContract.removeAllListeners('BattleEnded')

        polygonContract.on('BattleEnded', (gameAddr, winnerTokenId, battleState, event) => {
          setWinnerTokenId(parseInt(winnerTokenId, 10))
          setBattleState(battleState)
        })
        ethereumContractForBase.removeAllListeners('Minted')

        ethereumContractForBase.on('Minted', (buyerAddress, quantity, totalSupply, event) => {
          setTokenIds([...Array(parseInt(totalSupply)).keys()].slice(1).join(','))
        })
      }
    }
    getDropInfo()

    return () => {
      if (
        polygonContract &&
        polygonContract.provider &&
        ethereumContractForBase &&
        ethereumContractForBase.provider
      ) {
        polygonContract.removeListener('BattleEnded')
        ethereumContractForBase.removeListener('Minted')
      }
    }
  }, [
    polygonContract,
    polygonAbi,
    ethereumContractForPrize,
    ethereumAbi,
    ethereumContractForBase,
    queueId,
  ])

  const toastInProgress = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.PROGRESS })
  }

  const successToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_UPDATED })
  }

  const failedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.FAILED })
  }

  const incorrectNetwork = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.INCORRECT_NETWORK })
  }

  const toastCompleted = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.COMPLETED })
  }

  const toastNotOwner = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_OWNER })
  }

  const connectedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.CONNECTED })
  }

  const notConnectedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.NOT_CONNECTED_WALLET })
  }

  useEffect(() => {
    if (active) {
      connectedToast()
    } else {
      notConnectedToast()
    }
  }, [active])

  const handleUpdateDrop = async (data) => {
    toastInProgress()
    const updatedDrop = await updateDrop(props.drop._id, data)
    if (!!updatedDrop) successToast()
    else failedToast()
  }

  const transferToken = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const to = await ethereumContractForBase.ownerOf(winnerTokenId)
        const tx = await ethereumInjectedContractForPrize.transferFrom(account, to, prizeTokenId)
        await tx.wait()
        toastCompleted()
        const data = {
          name: props.drop.name,
          address: props.drop.address,
          polygonContractAddress: props.drop.polygonContractAddress,
          queueId: props.drop.queueId,
          prizeContractAddress: props.drop.prizeContractAddress,
          prizeTokenId: props.drop.prizeTokenId,
          battleStatus: '2',
          network: props.drop.network,
          polygonNetwork: props.drop.polygonNetwork,
          battleDate: props.drop.battleDate,
          created_at: props.drop.created_at,
        }
        await handleUpdateDrop(data)
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }
  const flipPublicSaleState = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const tx = await ethereumInjectedContractForPrize.flipIsPublicSaleState()
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }
  const flipPreSaleState = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const tx = await ethereumInjectedContractForPrize.flipIsPresaleState()
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }

  const updateBaseUri = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const tx = await ethereumInjectedContractForBase.setBaseURI(baseUri, isReveal)
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }
  const updatePrice = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const tx = await ethereumInjectedContractForBase.setPrice(ethers.utils.parseEther(price))
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }
  const internalMint = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const tx = await ethereumInjectedContractForBase.internalMint(quantity, address)
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }

  const setMerkleRoot = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const tx = await ethereumInjectedContractForBase.setMerkleRoot(merkleroot)
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }

  const addTokenIds = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID)) {
      if (account === ownerPolygon) {
        toastInProgress()
        const tx = await polygonInjectedContract.addTokenIds(queueId, tokenIds.split(','))
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }
  const startBattle = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID)) {
      if (account === ownerPolygon) {
        toastInProgress()
        const tx = await polygonInjectedContract.startBattle(
          queueId,
          intervalTime,
          eliminatedTokenCount
        )
        await tx.wait()
        toastCompleted()
        const data = {
          name: props.drop.name,
          address: props.drop.address,
          polygonContractAddress: props.drop.polygonContractAddress,
          queueId: props.drop.queueId,
          prizeContractAddress: props.drop.prizeContractAddress,
          prizeTokenId: props.drop.prizeTokenId,
          battleStatus: '1',
          network: props.drop.network,
          polygonNetwork: props.drop.polygonNetwork,
          battleDate: props.drop.battleDate,
          created_at: props.drop.created_at,
        }
        await handleUpdateDrop(data)
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }

  const updateIntervalTime = async () => {
    if (chainId === parseInt(parseInt(process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID))) {
      if (account === ownerPolygon) {
        toastInProgress()
        const tx = await polygonInjectedContract.setBattleIntervalTime(queueId, intervalTime)
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }

  const updateEliminatedTokenCount = async () => {
    if (chainId === parseInt(parseInt(process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID))) {
      if (account === ownerPolygon) {
        toastInProgress()
        const tx = await polygonInjectedContract.setEliminatedTokenCount(
          queueId,
          eliminatedTokenCount
        )
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
    }
  }

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      <Grid container spacing={1}>
        <Grid item md={6}>
          <Card>
            <CardHeader title="Base Contract Functionalities" />
          </Card>

          <Box sx={{ py: 1 }} />
          <Card>
            <CardHeader title="Set Merkle Root" sx={{ py: 1 }} />
            <Divider />
            <CardContent>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    label="Merkle Root"
                    name="merkleroot"
                    value={merkleroot}
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
              <Button color="primary" variant="contained" onClick={setMerkleRoot}>
                Set
              </Button>
            </Box>
          </Card>

          <Box sx={{ py: 1 }} />

          <Card>
            <CardHeader title="Flip Pre-Sale Status" sx={{ py: 1 }} />
            <Divider />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                p: 2,
              }}
            >
              <Button color="primary" variant="contained" onClick={flipPreSaleState}>
                Flip
              </Button>
            </Box>
          </Card>
          <Box sx={{ py: 1 }} />
          <Card>
            <CardHeader title="Flip Public Sale Status" sx={{ py: 1 }} />
            <Divider />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                p: 2,
              }}
            >
              <Button color="primary" variant="contained" onClick={flipPublicSaleState}>
                Flip
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
                name="baseUri"
                onChange={handleBaseUriChange}
                value={baseUri}
                variant="outlined"
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isReveal"
                      checked={isReveal}
                      onChange={handleIsRevealChange}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="Reveal Metadata?"
                />
              </FormGroup>
            </CardContent>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                p: 2,
              }}
            >
              <Button color="primary" variant="contained" onClick={updateBaseUri}>
                Update
              </Button>
            </Box>
          </Card>
          <Box sx={{ py: 1 }} />

          <Card>
            <CardHeader title="Internal Mint" sx={{ py: 1 }} />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    onChange={handleQuantityChange}
                    value={quantity}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    onChange={handleAddressChange}
                    value={address}
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
              <Button color="primary" variant="contained" onClick={internalMint}>
                Mint
              </Button>
            </Box>
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
                onChange={handlePriceChange}
                value={price}
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
              <Button color="primary" variant="contained" onClick={updatePrice}>
                Update
              </Button>
            </Box>
          </Card>
          <Box sx={{ py: 1 }} />
          <Card>
            <CardHeader title="Prize Contract Functionalities" />
          </Card>

          <Box sx={{ py: 1 }} />

          <Card>
            <CardHeader title="Transfer prize token to the winner" sx={{ py: 1 }} />
            <Divider />
            <CardContent>
              <TextField
                fullWidth
                label="Winner Token ID"
                name="winnerTokenId"
                onChange={handleWinnerTokenIdChange}
                value={winnerTokenId}
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
              <Button color="primary" variant="contained" onClick={transferToken}>
                Transfer
              </Button>
            </Box>
          </Card>
        </Grid>
        <Grid item md={6}>
          <Card>
            <CardHeader
              title="Polygon Contract Functionalities"
              subheader="Queue ID and Token IDs must be defined in DB"
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
                value={queueId ? queueId : 'Not Set'}
                variant="outlined"
              />
            </CardContent>
          </Card>

          <Box sx={{ py: 1 }} />

          <Card>
            <CardHeader title="Add Token IDs" sx={{ py: 1 }} />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Token IDs"
                    value={tokenIds}
                    onChange={handleTokenIdsChange}
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
              <Button color="primary" variant="contained" onClick={addTokenIds}>
                Add
              </Button>
            </Box>
          </Card>

          <Box sx={{ py: 1 }} />

          <Card>
            <CardHeader title="Start Battle" sx={{ py: 1 }} />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Interval Time"
                    name="intervalTime"
                    type="number"
                    onChange={handleIntervalTimeChange}
                    value={intervalTime}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Eliminated Token Count"
                    name="eliminatedTokenCount"
                    type="number"
                    onChange={handleEliminatedTokenCountChange}
                    value={eliminatedTokenCount}
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

          <Box sx={{ py: 1 }} />

          <Card>
            <CardHeader title="Set Interval Time" sx={{ py: 1 }} />
            <Divider />
            <CardContent>
              <TextField
                fullWidth
                label="Interval Time"
                name="intervalTime"
                type="number"
                onChange={handleIntervalTimeChange}
                value={intervalTime}
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
                type="number"
                onChange={handleEliminatedTokenCountChange}
                value={eliminatedTokenCount}
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
        </Grid>
      </Grid>
    </>
  )
}
