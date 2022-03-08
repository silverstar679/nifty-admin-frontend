import { useState } from 'react'
import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField } from '@mui/material'
import { updateCollection } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useWeb3React } from '../../hooks'

export const CollectionDetailUpdate = (props) => {
  const { account } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const [values, setValues] = useState({
    name: props.collection.name,
    address: props.collection.address,
    whitelist: props.collection.whitelist,
    created_at: props.collection.created_at,
  })

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
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

  const handleUpdateCollection = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      const data = {
        name: values.name,
        address: values.address,
        whitelist: values.whitelist,
        network: ethNetwork,
        created_at: values.created_at,
      }
      toastInProgress()
      const updatedCollection = await updateCollection(props.collection._id, data)
      if (!!updatedCollection) successToast()
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
          <CardHeader subheader="The information can be edited" title="Collection Details" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Name"
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Whitelist Address"
                  name="whitelist"
                  onChange={handleInputChange}
                  value={values.whitelist}
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
            <Button color="primary" variant="contained" onClick={handleUpdateCollection}>
              Update details
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
