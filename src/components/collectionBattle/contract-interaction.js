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
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'

export const ContractInteraction = (props) => {
  const { active, account, chainId } = useWeb3React()

  const collectionContractAddress = props.collectionBattle && props.collectionBattle.address
  const polygonContractAddress =
    props.collectionBattle && props.collectionBattle.polygonContractAddress
  const queueId = props.collectionBattle && parseInt(props.collectionBattle.queueId, 10)
  const prizeContractAddress = props.collectionBattle && props.collectionBattle.prizeContractAddress
  const prizeTokenId = props.collectionBattle && parseInt(props.collectionBattle.prizeTokenId, 10)
  const tokenIds = props.collectionBattle && props.collectionBattle.tokenIds

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [ethereumAbiForPrize, setEthereumAbiForPrize] = useState([])
  const [ethereumAbiForCollection, setEthereumAbiForCollection] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])
  const [battleState, setBattleState] = useState(null)
  const [owner, setOwner] = useState('')
  const [ownerPolygon, setOwnerPolygon] = useState('')
  const [winnerTokenId, setWinnerTokenId] = useState(0)

  const [intervalTime, setIntervalTime] = useState(0)
  const [eliminatedTokenCount, setEliminatedTokenCount] = useState(0)

  const handleClose = () => {
    setIsToast(false)
  }

  const handleWinnerTokenIdChange = (event) => {
    setWinnerTokenId(event.target.value)
  }

  const handleIntervalTimeChange = (event) => {
    setIntervalTime(event.target.value)
  }

  const handleEliminatedTokenCountChange = (event) => {
    setEliminatedTokenCount(event.target.value)
  }

  useEffect(() => {
    let mounted = true
    async function getABI() {
      const abi = await fetchEthereumABI(prizeContractAddress)
      if (mounted) {
        setEthereumAbiForPrize(abi)
      }
    }
    if (prizeContractAddress) {
      getABI()
    }

    return () => {
      mounted = false
    }
  }, [prizeContractAddress])

  useEffect(() => {
    let mounted = true
    async function getABI() {
      const abi = await fetchEthereumABI(collectionContractAddress)
      if (mounted) {
        setEthereumAbiForCollection(abi)
      }
    }
    if (collectionContractAddress) {
      getABI()
    }

    return () => {
      mounted = false
    }
  }, [collectionContractAddress])

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
  const polygonContract = usePolygonNetworkContract(polygonContractAddress, polygonAbi, true)
  const ethereumInjectedContractForPrize = useEthereumContract(
    prizeContractAddress,
    ethereumAbiForPrize,
    true
  )
  const ethereumContractForCollection = useEthereumNetworkContract(
    collectionContractAddress,
    ethereumAbiForCollection,
    true
  )

  const polygonInjectedContract = usePolygonContract(polygonContractAddress, polygonAbi, true)

  useEffect(() => {
    async function getCollectionBattleInfo() {
      if (
        ethereumInjectedContractForPrize &&
        ethereumInjectedContractForPrize.provider &&
        ethereumAbiForPrize.length !== 0 &&
        polygonContract &&
        polygonContract.provider &&
        polygonAbi.length !== 0
      ) {
        Promise.all([
          polygonContract.owner(),
          ethereumInjectedContractForPrize.owner(),
          polygonContract.battleQueue(queueId),
        ]).then(([ownerPolygon, owner, battleInfo]) => {
          setOwnerPolygon(ownerPolygon)
          setOwner(owner)
          setIntervalTime(BigNumber.from(battleInfo.intervalTime).toNumber())
          setEliminatedTokenCount(BigNumber.from(battleInfo.eliminatedTokenCount).toNumber())
          setBattleState(battleInfo.battleState)
          setWinnerTokenId(battleInfo.winnerTokenId)
        })

        polygonContract.removeAllListeners('BattleEnded')

        polygonContract.on('BattleEnded', (gameAddr, winnerTokenId, battleState, event) => {
          setWinnerTokenId(parseInt(winnerTokenId, 10))
          setBattleState(battleState)
        })
      }
    }
    getCollectionBattleInfo()

    return () => {
      if (polygonContract && polygonContract.provider) {
        polygonContract.removeListener('BattleEnded')
      }
    }
  }, [polygonContract, polygonAbi, ethereumInjectedContractForPrize, ethereumAbiForPrize, queueId])

  const toastInProgress = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.PROGRESS })
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

  const transferToken = async () => {
    if (chainId === parseInt(process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID)) {
      if (account === owner) {
        toastInProgress()
        const to = await ethereumContractForCollection.ownerOf(prizeTokenId)
        const tx = await ethereumInjectedContractForPrize.safeTransferFrom(
          account,
          to,
          winnerTokenId
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
                <TextField fullWidth label="Token IDs" value={tokenIds} variant="outlined" />
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
              <Grid item xs={12}>
                <TextField fullWidth label="Token IDs" value={tokenIds} variant="outlined" />
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
              disabled={battleState !== 1 ? true : false}
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
              disabled={battleState !== 1 ? true : false}
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
              disabled={battleState !== 1 ? true : false}
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
              disabled={battleState !== 1 ? true : false}
            >
              Update
            </Button>
          </Box>
        </Card>
      </Grid>
    </>
  )
}