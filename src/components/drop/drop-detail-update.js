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
  FormControlLabel,
  Checkbox,
  MenuItem,
  Switch,
  Typography,
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { updateDrop } from 'src/services/apis'
import { TransactionInfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useEthereumWeb3React } from '../../hooks'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import fetchEthereumABI from '../../services/fetchEthereumABI'
import { useEthereumNetworkContract, usePolygonNetworkContract } from '../../hooks/useContract'
import { getAllDrops } from '../../services/apis'
import { useRouter } from 'next/router'

const networks = [
  {
    value: 'mainnet',
    label: 'Mainnet',
  },
  {
    value: 'rinkeby',
    label: 'Rinkeby',
  },
]

const types = [
  {
    value: 'old',
    label: 'Old Version',
  },
  {
    value: 'replace',
    label: 'BattleRoyale',
  },
  {
    value: 'mint',
    label: 'BattleRoyaleMintingNew',
  },
  {
    value: 'random',
    label: 'BattleRoyaleRandomPart',
  },
]

export const DropDetailUpdate = () => {
  const { active, account, chainId } = useEthereumWeb3React()
  const router = useRouter()
  const { address } = router.query
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const [values, setValues] = useState({
    name: '',
    artist: '',
    creator: '',
    address: address,
    type: '',
    polygonContractAddress: '',
    queueId: '',
    defaultMetadata: '',
    prizeMetadata: '',
    defaultNFTUri: '',
    description: '',
    threshold: '',
    previewMedia: '',
    created_at: '',
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDropEnded: false,
    isBattleEnded: false,
    isDefaultNFTImage: false,
    isFutureDrop: false,
  })

  const [dropDate, setDropDate] = useState(new Date(Date.now()))
  const [battleDate, setBattleDate] = useState(new Date(Date.now()))

  useEffect(() => {
    let mounted = true
    async function getDrops() {
      const drops = await getAllDrops()
      const drop = _.find(drops, { address: address })
      if (mounted) {
        setValues({
          name: drop.name,
          artist: drop.artist,
          creator: drop.creator,
          address: address,
          type: drop.type,
          polygonContractAddress: drop.polygonContractAddress,
          queueId: drop.queueId,
          defaultMetadata: drop.defaultMetadata,
          prizeMetadata: drop.prizeMetadata,
          defaultNFTUri: drop.defaultNFTUri,
          description: drop.description,
          threshold: drop.threshold,
          previewMedia: drop.previewMedia,
          created_at: drop.created_at,
        })
        setCheckboxValues({
          isDropEnded: drop.isDropEnded,
          isBattleEnded: drop.isBattleEnded,
          isDefaultNFTImage: drop.isDefaultNFTImage,
          isFutureDrop: drop.isFutureDrop,
        })
        setDropDate(drop.dropDate)
        setBattleDate(drop.battleDate)
      }
    }
    getDrops()
    return () => {
      mounted = false
    }
  }, [address])

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])

  const [recommendedQueueId, setRecommendedQueueId] = useState(null)

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

  const [battleState, setBattleState] = useState(null)
  useEffect(() => {
    let mounted = true

    async function getQueueId() {
      Promise.all([polygonContract.battleQueueLength(), ethereumContract.battleState()]).then(
        ([queueId, battleState]) => {
          if (mounted) {
            setRecommendedQueueId(parseInt(queueId, 10))
            setBattleState(battleState)
          }
        }
      )
    }
    if (
      ethereumContract &&
      ethereumContract.provider &&
      ethereumAbi.length !== 0 &&
      polygonContract &&
      polygonContract.provider &&
      polygonAbi.length !== 0
    ) {
      getQueueId()
    }
    return () => {
      mounted = false
    }
  }, [polygonContract, ethereumContract, polygonAbi, ethereumAbi])

  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  const handleCheckboxChange = (event) => {
    setCheckboxValues({
      ...checkboxValues,
      [event.target.name]: event.target.checked,
    })
  }

  const handleDropDateChange = (newDate) => {
    setDropDate(newDate)
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
  const handleUpdateDrop = async () => {
    if (account === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT) {
      const data = {
        name: values.name,
        artist: values.artist,
        creator: values.creator,
        address: values.address,
        type: values.type,
        network: ethNetwork,
        polygonContractAddress: values.polygonContractAddress,
        queueId: values.queueId,
        description: values.description,
        defaultMetadata: values.defaultMetadata,
        prizeMetadata: values.prizeMetadata,
        defaultNFTUri: values.defaultNFTUri,
        previewMedia: JSON.parse(values.previewMedia ? values.previewMedia : '{}'),
        threshold: values.threshold,

        created_at: values.created_at,

        isDropEnded: checkboxValues.isDropEnded,
        isBattleEnded: checkboxValues.isBattleEnded,
        isDefaultNFTImage: checkboxValues.isDefaultNFTImage,
        isFutureDrop: checkboxValues.isFutureDrop,

        dropDate,
        battleDate,
      }
      toastInProgress()
      const updatedDrop = await updateDrop(_id, data)
      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_UPDATED })
    } else {
      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
    }
  }

  if (recommendedQueueId === null) return null

  return (
    <>
      <TransactionInfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />
      <form autoComplete="off">
        <Card>
          <CardHeader subheader="The information can be edited" title="Drop Details" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
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
                  label="Select Battle Type"
                  name="type"
                  onChange={handleInputChange}
                  select
                  value={values.type}
                  variant="outlined"
                >
                  {types.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
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
                  error={
                    battleState === 0 && recommendedQueueId !== parseInt(values.queueId)
                      ? true
                      : false
                  }
                  fullWidth
                  label="Queue ID for polygon contract"
                  name="queueId"
                  onChange={handleInputChange}
                  value={values.queueId}
                  helperText={
                    battleState === 0 &&
                    recommendedQueueId !== parseInt(values.queueId) &&
                    `* Please update queue ID with ${recommendedQueueId}`
                  }
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
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isDropEnded"
                        checked={checkboxValues.isDropEnded}
                        onChange={handleCheckboxChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label="Drop Ended?"
                  />
                </FormGroup>
              </Grid>
              <Grid item md={6} xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isBattleEnded"
                        checked={checkboxValues.isBattleEnded}
                        onChange={handleCheckboxChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label="Battle Ended?"
                  />
                </FormGroup>
              </Grid>
              <Grid item md={6} xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isFutureDrop"
                        checked={checkboxValues.isFutureDrop}
                        onChange={handleCheckboxChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label="Only show on Future Drop, not on Drop and Battle List page?"
                  />
                </FormGroup>
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Minimum NFT counts to start battle"
                  name="threshold"
                  onChange={handleInputChange}
                  value={values.threshold}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography>Video</Typography>
                  <Switch
                    name="isDefaultNFTImage"
                    checked={checkboxValues.isDefaultNFTImage}
                    onChange={handleCheckboxChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                  <Typography>Image ** Default NFT Media File Type</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default NFT Media URI for home, drop list and battle list page"
                  name="defaultNFTUri"
                  onChange={handleInputChange}
                  value={values.defaultNFTUri}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Description"
                  name="description"
                  rows={3}
                  onChange={handleInputChange}
                  value={values.description}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Object of Media files for random version"
                  helperText="It can be used for heavy video files to show in home, drop list and battle list pages"
                  name="previewMedia"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.previewMedia}
                  variant="outlined"
                  placeholder='{"white": "https://niftyroyale.mypinata.cloud/ipfs/QmRb7A3cEyDqscqf1bN4aBXtDDQan7hpKr9zJAr4QkY116"}'
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
            <Button color="primary" variant="contained" onClick={handleUpdateDrop}>
              Update details
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
