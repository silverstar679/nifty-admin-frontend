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
  MenuItem,
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { createCollectionBattle } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useWeb3React } from '../../hooks'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import { usePolygonNetworkContract, usePolygonContract } from '../../hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'

const STATUS = [
  {
    value: 0,
    label: 'Initialized',
  },
  {
    value: 1,
    label: 'Started',
  },
  {
    value: 2,
    label: 'Ended',
  },
]

export const CollectionBattleCreate = (props) => {
  const { active, account, chainId } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'goerli'
  const [values, setValues] = useState({
    name: '',
    address: '',
    polygonContractAddress: '',
    queueId: '',
    prizeContractAddress: '',
    prizeTokenId: '',
    battleStatus: '0',
    tokenIds: [],
    defaultMetadata: '',
    prizeMetadata: '',
  })
  const [dropDate, setDropDate] = useState(new Date(Date.now()).toISOString())
  const [battleDate, setBattleDate] = useState(new Date(Date.now()).toISOString())
  const [ownerPolygon, setOwnerPolygon] = useState('')

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [polygonAbi, setPolygonAbi] = useState([])

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

  const toastInProgress = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.DROP_CREATE_PROGRESS })
  }
  const failedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.FAILED })
  }

  const successToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_CREATED })
  }
  const notAdminToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
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

  useEffect(() => {
    if (active) {
      connectedToast()
    } else {
      notConnectedToast()
    }
  }, [active])

  useEffect(() => {
    let mounted = true

    async function getABI() {
      const abi = await fetchPolygonABI(values.polygonContractAddress)
      if (mounted) {
        setPolygonAbi(abi)
      }
    }
    if (values.polygonContractAddress) {
      getABI()
    }
    return () => {
      mounted = false
    }
  }, [values.polygonContractAddress])

  const polygonContract = usePolygonNetworkContract(values.polygonContractAddress, polygonAbi, true)
  const polygonInjectedContract = usePolygonContract(
    values.polygonContractAddress,
    polygonAbi,
    true
  )

  useEffect(() => {
    let mounted = true
    async function getPolygonInfo() {
      Promise.all([polygonContract.battleQueueLength(), polygonContract.owner()]).then(
        ([queueId, ownerAddress]) => {
          if (mounted) {
            setValues((prevValues) => ({
              ...prevValues,
              queueId: BigNumber.from(queueId).toNumber(),
            }))
            setOwnerPolygon(ownerAddress)
          }
        }
      )
    }
    if (polygonContract && polygonContract.provider && polygonAbi.length !== 0) {
      getPolygonInfo()
    }

    return () => {
      mounted = false
    }
  }, [polygonContract, polygonAbi])

  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  const handleBattleDateChange = (newDate) => {
    setBattleDate(new Date(newDate).toISOString())
  }

  const handleDropDateChange = (newDate) => {
    setDropDate(new Date(newDate).toISOString())
  }

  const handleClose = () => {
    setIsToast(false)
  }

  const handleCreateCollectionBattle = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      const data = {
        name: values.name,
        address: values.address,
        battleStatus: values.battleStatus,
        network: ethNetwork,
        polygonContractAddress: values.polygonContractAddress,
        prizeContractAddress: values.prizeContractAddress,
        prizeTokenId: values.prizeTokenId,
        queueId: values.queueId,
        tokenIds: values.tokenIds,
        defaultMetadata: values.defaultMetadata,
        prizeMetadata: values.prizeMetadata,
        dropDate,
        battleDate,
        created_at: values.created_at,
      }
      toastInProgress()
      const createdCollectionBattle = await createCollectionBattle(data)
      if (!!createdCollectionBattle) successToast()
      else failedToast()
    } else {
      notAdminToast()
    }
  }

  const handleCreateCollectionBattleContract = async () => {
    if (chainId === parseInt(parseInt(process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID))) {
      if (account === ownerPolygon) {
        toastInProgress()
        const tx = await polygonInjectedContract.initializeBattle(
          values.address,
          values.prizeContractAddress,
          values.prizeTokenId
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

      <form autoComplete="off" noValidate {...props}>
        <Card>
          <CardHeader title="New Collection Battle Details" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Collection Battle Name"
                  name="name"
                  onChange={handleInputChange}
                  value={values.name}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Ethereum Contract Address"
                  name="address"
                  onChange={handleInputChange}
                  value={values.address}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Polygon Contract Address"
                  name="polygonContractAddress"
                  onChange={handleInputChange}
                  value={values.polygonContractAddress}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Queue ID"
                  name="queueId"
                  onChange={handleInputChange}
                  value={values.queueId}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Prize Contract Address"
                  name="prizeContractAddress"
                  onChange={handleInputChange}
                  value={values.prizeContractAddress}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Prize Token Id"
                  name="prizeTokenId"
                  onChange={handleInputChange}
                  value={values.prizeTokenId}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Default Token Metadata"
                  name="defaultMetadata"
                  onChange={handleInputChange}
                  value={values.defaultMetadata}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Prize Token Metadata"
                  name="prizeMetadata"
                  onChange={handleInputChange}
                  value={values.prizeMetadata}
                  variant="outlined"
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Drop Date"
                    value={dropDate}
                    onChange={handleDropDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Battle Date"
                    value={battleDate}
                    onChange={handleBattleDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Select Battle Status"
                  name="battleStatus"
                  onChange={handleInputChange}
                  select
                  value={values.battleStatus}
                  variant="outlined"
                >
                  {STATUS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          >
            <Box sx={{ pr: 2 }}>
              <Button
                color="primary"
                variant="contained"
                onClick={handleCreateCollectionBattleContract}
              >
                Initialize Battle on Contract
              </Button>
            </Box>
            <Box>
              <Button color="primary" variant="contained" onClick={handleCreateCollectionBattle}>
                Create Battle on DB
              </Button>
            </Box>
          </Box>
        </Card>
      </form>
    </>
  )
}
