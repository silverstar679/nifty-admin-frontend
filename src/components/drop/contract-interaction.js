import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Link,
} from '@mui/material'
import fetchEthereumABI from '../../services/fetchEthereumABI'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import { useEthereumWeb3React } from '../../hooks'
import {
  useEthereumNetworkContract,
  useEthereumContract,
  usePolygonNetworkContract,
} from '../../hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'
import _ from 'lodash'
import { TransactionInfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { displayAddress } from '../../utils/displayAddress'

export const ContractInteraction = (props) => {
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? '' : 'rinkeby.'
  const polyNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID === '137' ? '' : 'mumbai.'
  const battleAddress = props.drop.address
  const polygonContractAddress = props.drop.polygonContractAddress
  const queueId = props.drop.queueId
  const type = props.drop.type
  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})
  const { active, account, chainId } = useEthereumWeb3React()

  const [loading, setLoading] = useState(false)

  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])
  const [battleState, setBattleState] = useState(null)
  const [owner, setOwner] = useState('')
  const [inPlay, setInPlay] = useState([])
  const [isBattleAdded, setIsBattleAdded] = useState(false)
  const [isBattleEnded, setIsBattleEnded] = useState(false)
  const [defaultTokenInfo, setDefaultTokenInfo] = useState([])

  const [dropDate, setDropDate] = useState(new Date(Date.now()))

  const [values, setValues] = useState({
    price: 0,
    baseURI: '',
    defaultTokenURI: '',
    defaultTokenURIRandom: '',
    defaultTokenCountRandom: 0,
    removableTokenIndex: 0,
    defaultTokenURIRandomUpdate:
      defaultTokenInfo.length !== 0 ? defaultTokenInfo[0].defaultTokenURI : '',
    defaultTokenCountRandomUpdate:
      defaultTokenInfo.length !== 0 ? defaultTokenInfo[0].defaultTokenCount : 0,
    prizeTokenURI: '',
    maxSupply: 0,
    unitsPerTransaction: 0,
    ethAmountEthNet: 0,
    erc20AmountEthNet: 0,
    erc20TokenAddressEthNet: '',
    ethAmountPolyNet: 0,
    erc20AmountPolyNet: 0,
    erc20TokenAddressPolyNet: '',
  })
  const [txHashes, setTxHashes] = useState({
    startBattleEth: '',
    price: '',
    dropTime: '',
    baseURI: '',
    defaultTokenURI: '',
    prizeTokenURI: '',
    maxSupply: '',
    prizeTokenURI: '',
    maxSupply: '',
    unitsPerTransaction: '',
    withdrawEthEthNet: '',
    withdrawErc20EthNet: '',
    withdrawEthPolyNet: '',
    withdrawErc20PolyNet: '',
    intervalTime: '',
    eliminatedTokenCount: '',
  })
  const [startBattlePolyTx, setStartBattlePolyTx] = useState('')

  const [intervalTime, _setIntervalTime] = useState(0)
  const [eliminatedTokenCount, _setEliminatedTokenCount] = useState(0)

  const intervalTimeRef = useRef(intervalTime)
  const setIntervalTime = (x) => {
    intervalTimeRef.current = x // keep updated
    _setIntervalTime(x)
  }

  const eliminatedTokenCountRef = useRef(eliminatedTokenCount)
  const setEliminatedTokenCount = (x) => {
    eliminatedTokenCountRef.current = x // keep updated
    _setEliminatedTokenCount(x)
  }

  const handleClose = () => {
    setIsToast(false)
  }
  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }
  const handleIntervalTimeChange = (event) => {
    setIntervalTime(event.target.value)
  }
  const handleEliminatedTokenCountChange = (event) => {
    setEliminatedTokenCount(event.target.value)
  }

  const handleDropDateChange = (newDate) => {
    setDropDate(newDate)
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
  const polygonProvider = new ethers.providers.AlchemyProvider(
    parseInt(process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID),
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  )
  const ethereumContract = useEthereumNetworkContract(battleAddress, ethereumAbi, true)
  const polygonContract = usePolygonNetworkContract(polygonContractAddress, polygonAbi, true)

  const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider)
  const polygonWallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, polygonProvider)
  // const ethereumInjectedContract = useEthereumContract(battleAddress, ethereumAbi, true)
  const ethereumContractWithSigner = wallet && ethereumContract && ethereumContract.connect(wallet)
  const polygonContractWithSigner =
    wallet && polygonContract && polygonContract.connect(polygonWallet)

  useEffect(() => {
    async function getDefaultTokenURIs(_ethereumContract, _index) {
      return _ethereumContract.defaultTokenURI(_index)
    }
    async function getDefaultTokenCount(_ethereumContract, _defaultTokenURI) {
      return _ethereumContract.tokenURICount(_defaultTokenURI)
    }
    async function getMetadataInfo(_ethereumContract, _baseURI, _totalDefaultNFTTypeCount) {
      let defaultTokenInfo = []
      await Promise.all(
        [...Array(_totalDefaultNFTTypeCount).keys()].map(async (index) => {
          let defaultTokenURI = await getDefaultTokenURIs(_ethereumContract, index)
          let defaultTokenCount = await getDefaultTokenCount(_ethereumContract, defaultTokenURI)
          defaultTokenInfo.push({ defaultTokenURI, defaultTokenCount })
        })
      ).then((_) => {
        setDefaultTokenInfo(defaultTokenInfo)
      })
    }
    async function getDropInfo() {
      Promise.all([
        ethereumContract.battleState(),
        ethereumContract.price(),
        ethereumContract.startingTime(),
        ethereumContract.baseURI(),
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
          prizeTokenURI,
          maxSupply,
          unitsPerTransaction,
          owner,
        ]) => {
          setOwner(owner)
          setBattleState(battleState)
          if (battleState !== 0 && queueId) {
            Promise.all([polygonContract.battleQueue(queueId)]).then(([battleInfo]) => {
              setIntervalTime(BigNumber.from(battleInfo.intervalTime).toNumber())
              setEliminatedTokenCount(BigNumber.from(battleInfo.eliminatedTokenCount).toNumber())
            })
          }
          if (type === 'random') {
            Promise.all([ethereumContract.totalDefaultNFTTypeCount()]).then(
              ([totalDefaultNFTTypeCount]) => {
                ;(async () =>
                  await getMetadataInfo(
                    ethereumContract,
                    baseURI,
                    parseInt(totalDefaultNFTTypeCount, 10)
                  ))().then((e) => {
                  setValues({
                    ...values,
                    price: Number(ethers.utils.formatEther(BigNumber.from(price).toBigInt())),
                    baseURI,
                    prizeTokenURI,
                    maxSupply: BigNumber.from(maxSupply).toNumber(),
                    unitsPerTransaction: BigNumber.from(unitsPerTransaction).toNumber(),
                  })
                  setDropDate(
                    new Date(BigNumber.from(startingTime).mul(1000).toNumber()).toISOString()
                  )
                })
              }
            )
          } else {
            Promise.all([ethereumContract.defaultTokenURI()]).then(([defaultTokenURI]) => {
              setValues({
                ...values,
                price: Number(ethers.utils.formatEther(BigNumber.from(price).toBigInt())),
                baseURI,
                defaultTokenURI,
                prizeTokenURI,
                maxSupply: BigNumber.from(maxSupply).toNumber(),
                unitsPerTransaction: BigNumber.from(unitsPerTransaction).toNumber(),
              })
              setDropDate(new Date(BigNumber.from(startingTime).mul(1000).toNumber()).toISOString())
            })
          }
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
          ;(async () => {
            const tx = await polygonContractWithSigner.addToBattleQueue(
              battleAddressEmitted,
              intervalTimeRef.current,
              inPlayEmitted,
              eliminatedTokenCountRef.current
            )
            setStartBattlePolyTx(tx.hash)
            await tx.wait()

            toastCompleted()
          })().then((e) => {})
          setInPlay(inPlayEmitted)
          setBattleState(1)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereumContract, polygonContract])

  const toastInProgress = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.PROGRESS })
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

  const startBattle = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.startBattle()
      setTxHashes({
        ...txHashes,
        startBattleEth: tx.hash,
      })
      await tx.wait()
    } else {
      toastNotOwner()
    }
  }

  const withdrawEthEthNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.withdrawETH(values.erc20AmountEthNet)
      setTxHashes({
        ...txHashes,
        withdrawEthEthNet: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const withdrawERC20EthNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.withdrawERC20Token(
        values.erc20TokenAddressEthNet,
        values.erc20AmountEthNet
      )
      setTxHashes({
        ...txHashes,
        withdrawErc20EthNet: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const withdrawEthPolyNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.withdrawETH(values.erc20AmountPolyNet)
      setTxHashes({
        ...txHashes,
        withdrawEthPolyNet: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const withdrawERC20PolyNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.withdrawERC20Token(
        values.erc20TokenAddressPolyNet,
        values.erc20AmountPolyNet
      )
      setTxHashes({
        ...txHashes,
        withdrawErc20PolyNet: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateNFTPrice = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.setPrice(ethers.utils.parseEther(values.price))
      setTxHashes({
        ...txHashes,
        price: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateBaseURI = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.setBaseURI(values.baseURI)
      setTxHashes({
        ...txHashes,
        baseURI: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateDefaultTokenURI = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.setDefaultTokenURI(values.defaultTokenURI)
      setTxHashes({
        ...txHashes,
        defaultTokenURI: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updatePrizeTokenURI = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.setPrizeTokenURI(values.prizeTokenURI)
      setTxHashes({
        ...txHashes,
        prizeTokenURI: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateMaxSupply = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.setMaxSupply(values.maxSupply)
      setTxHashes({
        ...txHashes,
        maxSupply: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateUnitsPerTransaction = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.setUnitsPerTransaction(values.unitsPerTransaction)
      setTxHashes({
        ...txHashes,
        unitsPerTransaction: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateDropTime = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.setStartingTime(
        Date.parse(new Date(dropDate)) / 1000
      )
      setTxHashes({
        ...txHashes,
        dropTime: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateIntervalTime = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await polygonContractWithSigner.setBattleIntervalTime(
        queueId,
        intervalTimeRef.current
      )
      setTxHashes({
        ...txHashes,
        intervalTime: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateEliminatedTokenCount = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await polygonContractWithSigner.setEliminatedTokenCount(
        queueId,
        eliminatedTokenCountRef.current
      )
      setTxHashes({
        ...txHashes,
        eliminatedTokenCount: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const addDefaultToken = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.addTokenURI(
        values.defaultTokenURIRandom,
        values.defaultTokenCountRandom
      )
      setTxHashes({
        ...txHashes,
        addDefaultTokenURI: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const removeDefaultToken = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.removeTokenURI(values.removableTokenIndex)
      setTxHashes({
        ...txHashes,
        removeDefaultTokenURI: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateDefaultTokenCount = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumContractWithSigner.addTokenURI(
        values.defaultTokenURIRandomUpdate,
        values.defaultTokenCountRandomUpdate
      )
      setTxHashes({
        ...txHashes,
        updateDefaultTokenCount: tx.hash,
      })
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  return (
    <>
      <TransactionInfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

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
                    type="number"
                    value={queueId}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Interval Time"
                    name="intervalTime"
                    type="number"
                    onChange={handleIntervalTimeChange}
                    value={intervalTimeRef.current}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Eliminated Token Count"
                    name="eliminatedTokenCount"
                    type="number"
                    onChange={handleEliminatedTokenCountChange}
                    value={eliminatedTokenCountRef.current}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  p: 2,
                }}
              >
                {txHashes.startBattleEth && (
                  <Link
                    href={`https://${ethNetwork}etherscan.io/tx/${txHashes.startBattleEth}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mr: 5 }}
                  >
                    Ethereum: {displayAddress(txHashes.startBattleEth)}
                  </Link>
                )}
                {startBattlePolyTx && (
                  <Link
                    href={`https://${polyNetwork}polygonscan.com/tx/${startBattlePolyTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Polygon: {displayAddress(startBattlePolyTx)}
                  </Link>
                )}
              </Box>
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Drop Date"
                  value={dropDate}
                  onChange={handleDropDateChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
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
          {type !== 'random' ? (
            <>
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
            </>
          ) : (
            <>
              <Box sx={{ py: 1 }} />

              <Card>
                <CardHeader title="Add Default Token" sx={{ py: 1 }} />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Default Token URI"
                        name="defaultTokenURIRandom"
                        onChange={handleInputChange}
                        value={values.defaultTokenURIRandom}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Default Token Count"
                        name="defaultTokenCountRandom"
                        onChange={handleInputChange}
                        value={values.defaultTokenCountRandom}
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
                  <Button color="primary" variant="contained" onClick={addDefaultToken}>
                    Add
                  </Button>
                </Box>
              </Card>

              <Box sx={{ py: 1 }} />

              <Card>
                <CardHeader title="Remove Default Token URI" sx={{ py: 1 }} />
                <Divider />
                <CardContent>
                  <TextField
                    fullWidth
                    label="Default Token Index"
                    name="removableTokenIndex"
                    onChange={handleInputChange}
                    value={values.removableTokenIndex}
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
                  <Button color="primary" variant="contained" onClick={removeDefaultToken}>
                    Remove
                  </Button>
                </Box>
              </Card>

              <Box sx={{ py: 1 }} />

              <Card>
                <CardHeader title="Update Default Token Count" sx={{ py: 1 }} />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Default Token URI"
                        name="defaultTokenURIRandomUpdate"
                        onChange={handleInputChange}
                        value={values.defaultTokenURIRandomUpdate}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Default Token Count"
                        name="defaultTokenCountRandomUpdate"
                        onChange={handleInputChange}
                        value={values.defaultTokenCountRandomUpdate}
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
                  <Button color="primary" variant="contained" onClick={updateDefaultTokenCount}>
                    Update
                  </Button>
                </Box>
              </Card>
            </>
          )}

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
                type="number"
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
                type="number"
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
                type="number"
                InputProps={{
                  readOnly: true,
                }}
                value={queueId}
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
                type="number"
                onChange={handleIntervalTimeChange}
                value={intervalTimeRef.current}
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
                value={eliminatedTokenCountRef.current}
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
    </>
  )
}
