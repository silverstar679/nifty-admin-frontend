import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />
})

const Transition = (props) => {
  return <Slide {...props} direction="left" />
}

export const InfoToast = (props) => {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    props.handleClose()
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={props.isToast}
      autoHideDuration={6000}
      onClose={handleClose}
      sx={{ mt: 6 }}
      TransitionComponent={Transition}
    >
      <Alert onClose={handleClose} severity={props.info.severity} sx={{ width: '100%' }}>
        {props.info.message}
      </Alert>
    </Snackbar>
  )
}

export const TransactionInfoToast = (props) => {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    props.handleClose()
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={props.isToast}
      onClose={handleClose}
      sx={{ mt: 6 }}
      TransitionComponent={Transition}
    >
      <Alert onClose={handleClose} severity={props.info.severity} sx={{ width: '100%' }}>
        {props.info.message}
      </Alert>
    </Snackbar>
  )
}
