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
import fetchEthereumABI from '../../services/fetchEthereumABI'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import { useEthereumNetworkContract, usePolygonNetworkContract } from '../../hooks/useContract'
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
  const { account } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const [values, setValues] = useState({
    name: '',
    address: '',
    polygonContractAddress: '',
    queueId: '',
    battleStatus: 0,
    tokenIds: '',
  })

  const [battleDate, setBattleDate] = useState(new Date(Date.now()).toISOString())

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])

  useEffect(() => {
    let mounted = true

    async function getABI() {
      const abi = await fetchEthereumABI(values.address)
      if (mounted) {
        setEthereumAbi(abi)
      }
    }
    if (values.address) {
      getABI()
    }

    return () => {
      mounted = false
    }
  }, [values.address])

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

  const ethereumContract = useEthereumNetworkContract(values.address, ethereumAbi, true)
  const polygonContract = usePolygonNetworkContract(values.polygonContractAddress, polygonAbi, true)

  useEffect(() => {
    let mounted = true

    async function getCollectionBattleInfo() {
      Promise.all([ethereumContract.name()]).then(([name]) => {
        if (mounted) {
          setValues((prevValues) => ({
            ...prevValues,
            name: name.split(':')[1],
          }))
        }
      })
    }
    if (ethereumContract && ethereumContract.provider && ethereumAbi.length !== 0) {
      getCollectionBattleInfo()
    }
    return () => {
      mounted = false
    }
  }, [ethereumContract, ethereumAbi])

  useEffect(() => {
    let mounted = true
    async function getQueueId() {
      Promise.all([polygonContract.battleQueueLength()]).then(([queueId]) => {
        if (mounted) {
          setValues((prevValues) => ({
            ...prevValues,
            queueId: BigNumber.from(queueId).toNumber(),
          }))
        }
      })
    }
    if (polygonContract && polygonContract.provider && polygonAbi.length !== 0) {
      getQueueId()
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

  const handleClose = () => {
    setIsToast(false)
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
        queueId: values.queueId,
        tokenIds: values.tokenIds,
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

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      <form autoComplete="off" noValidate {...props}>
        <Card>
          <CardHeader
            subheader="The information can be edited"
            title="New CollectionBattle Details"
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="CollectionBattle Name"
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
            <Button color="primary" variant="contained" onClick={handleCreateCollectionBattle}>
              Create CollectionBattle
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
