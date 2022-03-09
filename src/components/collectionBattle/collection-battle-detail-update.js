import { useState } from 'react'
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
import { updateCollectionBattle } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useWeb3React } from '../../hooks'

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

export const CollectionBattleDetailUpdate = (props) => {
  const { account } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const [values, setValues] = useState({
    name: props.collectionBattle.name,
    address: props.collectionBattle.address,
    polygonContractAddress: props.collectionBattle.polygonContractAddress,
    queueId: props.collectionBattle.queueId,
    prizeContractAddress: props.collectionBattle.prizeContractAddress,
    prizeTokenId: props.collectionBattle.prizeTokenId,
    battleStatus: props.collectionBattle.battleStatus,
    tokenIds: props.collectionBattle.tokenIds.join(','),
    created_at: props.collectionBattle.created_at,
  })

  const [battleDate, setBattleDate] = useState(props.collectionBattle.battleDate)

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  const handleBattleDateChange = (newDate) => {
    setBattleDate(newDate)
  }

  const handleClose = () => {
    setIsToast(false)
  }
  const toastInProgress = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.DROP_UPDATE_PROGRESS })
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
  const notAdminToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
  }

  const handleUpdateCollectionBattle = async () => {
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
        prizeContractAddress: values.prizeContractAddress,
        prizeTokenId: values.prizeTokenId,
        tokenIds: values.tokenIds.split(','),
        battleDate,
        created_at: values.created_at,
      }
      toastInProgress()
      const updatedCollectionBattle = await updateCollectionBattle(props.collectionBattle._id, data)
      if (!!updatedCollectionBattle) successToast()
      else failedToast()
    } else {
      notAdminToast()
    }
  }

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />
      <form autoComplete="off">
        <Card>
          <CardHeader subheader="The information can be edited" title="CollectionBattle Details" />
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
                  label="Queue ID for polygon contract"
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Token ids"
                  name="tokenIds"
                  rows={3}
                  onChange={handleInputChange}
                  value={values.tokenIds}
                  variant="outlined"
                />
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
            <Button color="primary" variant="contained" onClick={handleUpdateCollectionBattle}>
              Update details
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
