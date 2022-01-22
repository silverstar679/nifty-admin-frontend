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
  Switch,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { createDrop } from 'src/services/apis'
import { TransactionInfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useEthereumWeb3React } from '../../hooks'
import { getAllDrops } from '../../services/apis'
import _ from 'lodash'
import fetchEthereumABI from '../../services/fetchEthereumABI'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import { useEthereumNetworkContract, usePolygonNetworkContract } from '../../hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'

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

export const DropCreate = (props) => {
  const { active, account, chainId } = useEthereumWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const [values, setValues] = useState({
    name: '',
    artist: '',
    creator: '',
    address: '',
    defaultMetadata: '',
    prizeMetadata: '',
    defaultNFTUri: '',
    description: '',
    polygonContractAddress: '',
    queueId: '',
    type: 'replace',
    threshold: '',
    previewMedia: '',
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDropEnded: false,
    isBattleEnded: false,
    isDefaultNFTImage: false,
    isFutureDrop: false,
  })

  const [dropDate, setDropDate] = useState(new Date(Date.now()).toISOString())
  const [battleDate, setBattleDate] = useState(new Date(Date.now()).toISOString())

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [drops, setDrops] = useState([])

  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])

  useEffect(() => {
    let mounted = true
    async function getDrops() {
      const drops = await getAllDrops()
      if (mounted) {
        setDrops(drops)
      }
    }
    getDrops()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (drops.length !== 0 && values.polygonContractAddress !== '') {
      const nextQueueId =
        parseInt(
          _.last(
            _.sortBy(
              _.filter(drops, {
                polygonContractAddress: values.polygonContractAddress,
              }),
              ['queueId']
            )
          ).queueId
        ) + 1
      setValues({
        ...values,
        queueId: nextQueueId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drops, values.polygonContractAddress])

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

    async function getDropInfo() {
      Promise.all([ethereumContract.name(), ethereumContract.baseURI()]).then(([name, baseURI]) => {
        if (mounted) {
          setValues({
            ...values,
            name: name.split(':')[1],
            artist: name.split(':')[0].split('X')[1],
            creator: name.split(':')[0].split('X')[0],
          })
        }
      })
    }
    if (ethereumContract && ethereumContract.provider && ethereumAbi.length !== 0) {
      getDropInfo()
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
          setValues({
            ...values,
            queueId: BigNumber.from(queueId).toNumber(),
          })
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

  const handleCheckboxChange = (event) => {
    setCheckboxValues({
      ...checkboxValues,
      [event.target.name]: event.target.checked,
    })
  }

  const handleDropDateChange = (newDate) => {
    setDropDate(new Date(newDate).toISOString())
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

  const handleCreateDrop = async () => {
    if (account === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT) {
      const data = {
        name: values.name,
        address: values.address,
        artist: values.artist,
        creator: values.creator,
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
      const createdDrop = await createDrop(data)
      if (!!createdDrop) successToast()
      else failedToast()
    } else {
      notAdminToast()
    }
  }

  return (
    <>
      <TransactionInfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      <form autoComplete="off" noValidate {...props}>
        <Card>
          <CardHeader subheader="The information can be edited" title="New Drop Details" />
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
                  label="Minimum NFT counts to start battle"
                  name="threshold"
                  onChange={handleInputChange}
                  value={values.threshold}
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
                  name="previewMedia"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.previewMedia}
                  helperText="It can be used for heavy video files to show in home, drop list and battle list pages"
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
            <Button color="primary" variant="contained" onClick={handleCreateDrop}>
              Create Drop
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
