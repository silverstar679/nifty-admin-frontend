import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField } from '@mui/material'
import fetchEthereumABI from '../../services/fetchEthereumABI'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import { useWeb3React } from '../../hooks'
import {
  useEthereumContract,
  usePolygonContract,
  useEthereumNetworkContract,
  usePolygonNetworkContract,
} from '../../hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'
import _ from 'lodash'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'

export const ContractInteraction = (props) => {
  const battleAddress = props.drop.address

  const polygonContractAddress = props.drop && props.drop.polygonContractAddress
  const queueId = props.drop && parseInt(props.drop.queueId, 10)
  const type = props.drop && props.drop.type
  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})
  const { active, account, chainId } = useWeb3React()

  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])
  const [battleState, setBattleState] = useState(null)
  const [owner, setOwner] = useState('')
  const [ownerPolygon, setOwnerPolygon] = useState('')
  const [isBattleAdded, setIsBattleAdded] = useState(false)
  const [isBattleEnded, setIsBattleEnded] = useState(false)
  const [defaultTokenInfo, setDefaultTokenInfo] = useState([])
  const [inPlay, setInPlay] = useState('')

  const [dropDate, setDropDate] = useState(new Date(Date.now()).toISOString())
  const [winnerTokenId, setWinnerTokenId] = useState(0)
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

  const [intervalTime, setIntervalTime] = useState(0)
  const [eliminatedTokenCount, setEliminatedTokenCount] = useState(0)

  const handleClose = () => {
    setIsToast(false)
  }
  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }
  const handleWinnerTokenIdChange = (event) => {
    setWinnerTokenId(event.target.value)
  }
  const handleInPlayChange = (event) => {
    setInPlay(event.target.value)
  }

  const handleIntervalTimeChange = (event) => {
    setIntervalTime(event.target.value)
  }

  const handleEliminatedTokenCountChange = (event) => {
    setEliminatedTokenCount(event.target.value)
  }

  const handleDropDateChange = (newDate) => {
    setDropDate(new Date(newDate).toISOString())
  }

  useEffect(() => {
    let mounted = true
    async function getABI() {
      const abi = await fetchEthereumABI(battleAddress)
      if (mounted) {
        setEthereumAbi(abi)
      }
    }
    if (battleAddress) {
      getABI()
    }

    return () => {
      mounted = false
    }
  }, [battleAddress])

  useEffect(() => {
    let mounted = true

    async function getABI() {
      const abi = await fetchPolygonABI(polygonContractAddress)
      if (mounted) {
        setPolygonAbi(abi)
      }
    }
    if (polygonContractAddress) {
      getABI()
    }
    return () => {
      mounted = false
    }
  }, [polygonContractAddress])
  const ethereumContract = useEthereumNetworkContract(battleAddress, ethereumAbi, true)
  const polygonContract = usePolygonNetworkContract(polygonContractAddress, polygonAbi, true)
  const ethereumInjectedContract = useEthereumContract(battleAddress, ethereumAbi, true)
  const polygonInjectedContract = usePolygonContract(polygonContractAddress, polygonAbi, true)

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
        polygonContract.owner(),
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
          ownerPolygon,
        ]) => {
          setOwner(owner)
          setOwnerPolygon(ownerPolygon)
          setBattleState(parseInt(battleState, 10))
          if (
            parseInt(battleState, 10) !== 0 &&
            queueId &&
            new Date(props.drop.battleDate) < new Date(Date.now() + 100000)
          ) {
            Promise.all([polygonContract.battleQueue(queueId)]).then(([battleInfo]) => {
              setIntervalTime(BigNumber.from(battleInfo.intervalTime).toNumber())
              setEliminatedTokenCount(BigNumber.from(battleInfo.eliminatedTokenCount).toNumber())
              setIsBattleEnded(battleInfo.battleState)
              setWinnerTokenId(battleInfo.winnerTokenId)
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
                  setValues((prevValues) => ({
                    ...prevValues,
                    price: Number(ethers.utils.formatEther(BigNumber.from(price).toBigInt())),
                    baseURI,
                    prizeTokenURI,
                    maxSupply: BigNumber.from(maxSupply).toNumber(),
                    unitsPerTransaction: BigNumber.from(unitsPerTransaction).toNumber(),
                  }))
                  setDropDate(
                    new Date(BigNumber.from(startingTime).mul(1000).toNumber()).toISOString()
                  )
                })
              }
            )
          } else {
            Promise.all([ethereumContract.defaultTokenURI()]).then(([defaultTokenURI]) => {
              setValues((prevValues) => ({
                ...prevValues,
                price: Number(ethers.utils.formatEther(BigNumber.from(price).toBigInt())),
                baseURI,
                defaultTokenURI,
                prizeTokenURI,
                maxSupply: BigNumber.from(maxSupply).toNumber(),
                unitsPerTransaction: BigNumber.from(unitsPerTransaction).toNumber(),
              }))
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
      polygonContract.provider &&
      polygonAbi.length !== 0 &&
      ethereumAbi.length !== 0
    ) {
      getDropInfo()

      ethereumContract.on('BattleStarted', (battleAddressEmitted, inPlayEmitted, event) => {
        if (battleAddress === battleAddressEmitted) {
          setInPlay(inPlayEmitted.join(','))
          setBattleState(1)
        }
      })
      ethereumContract.removeAllListeners('BattleEnded')

      ethereumContract.on(
        'BattleEnded',
        (battleAddressEmitted, winnerTokenId, prizeTokenURI, event) => {
          if (battleAddress === battleAddressEmitted) {
            setBattleState(2)
          }
        }
      )
      polygonContract.removeAllListeners('BattleAdded')

      polygonContract.on('BattleAdded', (battle, event) => {
        if (battleAddress === battle.gameAddr) {
          setIsBattleAdded(true)
        }
      })
      polygonContract.removeAllListeners('BattleEnded')

      polygonContract.on('BattleEnded', (finished, gameAddr, winnerTokenId, battleState, event) => {
        if (battleAddress === gameAddr) {
          setWinnerTokenId(parseInt(winnerTokenId, 10))
          setIsBattleEnded(true)
        }
      })
    }

    return () => {
      if (
        ethereumContract &&
        polygonContract &&
        ethereumContract.provider &&
        polygonContract.provider
      ) {
        polygonContract.removeListener('BattleEnded')
        polygonContract.removeListener('BattleAdded')
        ethereumContract.removeListener('BattleEnded')
        ethereumContract.removeListener('BattleStarted')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereumContract, polygonContract, polygonAbi, ethereumAbi])

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
      const tx = await ethereumInjectedContract.startBattle()
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }
  const startBattlePolygon = async () => {
    if (account === ownerPolygon) {
      toastInProgress()
      const tx = await polygonInjectedContract.addToBattleQueue(
        battleAddress,
        intervalTime,
        inPlay.split(','),
        eliminatedTokenCount
      )
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const withdrawEthEthNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.withdrawETH(values.erc20AmountEthNet)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const withdrawERC20EthNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.withdrawERC20Token(
        values.erc20TokenAddressEthNet,
        values.erc20AmountEthNet
      )
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const withdrawEthPolyNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.withdrawETH(values.erc20AmountPolyNet)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const withdrawERC20PolyNet = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.withdrawERC20Token(
        values.erc20TokenAddressPolyNet,
        values.erc20AmountPolyNet
      )
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateNFTPrice = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.setPrice(ethers.utils.parseEther(values.price))
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const endBattle = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.endBattle(winnerTokenId)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateBaseURI = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.setBaseURI(values.baseURI)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateDefaultTokenURI = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.setDefaultTokenURI(values.defaultTokenURI)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updatePrizeTokenURI = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.setPrizeTokenURI(values.prizeTokenURI)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateMaxSupply = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.setMaxSupply(values.maxSupply)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateUnitsPerTransaction = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.setUnitsPerTransaction(values.unitsPerTransaction)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateDropTime = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.setStartingTime(
        Date.parse(new Date(dropDate)) / 1000
      )
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateIntervalTime = async () => {
    if (account === ownerPolygon) {
      toastInProgress()
      const tx = await polygonInjectedContract.setBattleIntervalTime(queueId, intervalTime)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateEliminatedTokenCount = async () => {
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
  }

  const addDefaultToken = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.addTokenURI(
        values.defaultTokenURIRandom,
        values.defaultTokenCountRandom
      )
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const removeDefaultToken = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.removeTokenURI(values.removableTokenIndex)
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  const updateDefaultTokenCount = async () => {
    if (account === owner) {
      toastInProgress()
      const tx = await ethereumInjectedContract.updateTokenURICount(
        values.defaultTokenURIRandomUpdate,
        values.defaultTokenCountRandomUpdate
      )
      await tx.wait()
      toastCompleted()
    } else {
      toastNotOwner()
    }
  }

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

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
              <Button
                color="primary"
                variant="contained"
                onClick={startBattle}
                disabled={battleState !== 0 || battleState === null ? true : false}
              >
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
                onChange={handleWinnerTokenIdChange}
                value={winnerTokenId}
                variant="outlined"
                disabled={isBattleEnded === false || battleState === 2 ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={endBattle}
                disabled={isBattleEnded === false || battleState === 2 ? true : false}
              >
                End
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
                onChange={handleInputChange}
                value={values.price}
                variant="outlined"
                disabled={battleState !== 0 ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={updateNFTPrice}
                disabled={battleState !== 0 ? true : false}
              >
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
              <Button
                color="primary"
                variant="contained"
                onClick={updateDropTime}
                disabled={battleState !== 0 ? true : false}
              >
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
                disabled={battleState !== 0 ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={updateBaseURI}
                disabled={battleState !== 0 ? true : false}
              >
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
                    disabled={battleState !== 0 ? true : false}
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
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={updateDefaultTokenURI}
                    disabled={battleState !== 0 ? true : false}
                  >
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
                        disabled={battleState !== 0 ? true : false}
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
                        disabled={battleState !== 0 ? true : false}
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
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={addDefaultToken}
                    disabled={battleState !== 0 ? true : false}
                  >
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
                    disabled={battleState !== 0 ? true : false}
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
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={removeDefaultToken}
                    disabled={battleState !== 0 ? true : false}
                  >
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
                        disabled={battleState !== 0 ? true : false}
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
                        disabled={battleState !== 0 ? true : false}
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
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={updateDefaultTokenCount}
                    disabled={battleState !== 0 ? true : false}
                  >
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
                disabled={battleState !== 0 ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={updatePrizeTokenURI}
                disabled={battleState !== 0 ? true : false}
              >
                Update
              </Button>
            </Box>
          </Card>
          {type !== 'random' && (
            <>
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
                    disabled={battleState !== 0 ? true : false}
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
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={updateMaxSupply}
                    disabled={battleState !== 0 ? true : false}
                  >
                    Update
                  </Button>
                </Box>
              </Card>
            </>
          )}
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
                disabled={battleState !== 0 ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={updateUnitsPerTransaction}
                disabled={battleState !== 0 ? true : false}
              >
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
              <TextField fullWidth label="Queue ID" value={queueId} variant="outlined" />
            </CardContent>
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
                    disabled={battleState === 2 || isBattleAdded ? true : false}
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
                    disabled={battleState === 2 || isBattleAdded ? true : false}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Token IDs"
                    name="inPlay"
                    onChange={handleInPlayChange}
                    value={inPlay}
                    variant="outlined"
                    disabled={battleState === 2 || isBattleAdded ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={startBattlePolygon}
                disabled={battleState === 2 || isBattleAdded ? true : false}
              >
                Start
              </Button>
            </Box>
          </Card>

          <Box sx={{ py: 1 }} />

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
                disabled={battleState === 2 ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={updateIntervalTime}
                disabled={battleState === 2 ? true : false}
              >
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
                disabled={battleState === 2 ? true : false}
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
              <Button
                color="primary"
                variant="contained"
                onClick={updateEliminatedTokenCount}
                disabled={battleState === 2 ? true : false}
              >
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
