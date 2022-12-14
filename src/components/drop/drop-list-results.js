import { useState, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { format } from 'date-fns'
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import NextLink from 'next/link'
import { deleteDrop } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { getAllDrops } from '../../services/apis'
import _ from 'lodash'
import { useWeb3React } from '../../hooks'

const TYPES = {
  old: 'Old',
  replace: 'Replace Prize',
  noPrize: 'External Prize',
  mint: 'Minting Prize',
  random: 'Random',
  erc721a: 'ERC721A',
  presale: 'Presale',
}

const STATUS = ['Initialized', 'Started', 'Ended']

export const DropListResults = () => {
  const { account } = useWeb3React()

  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [drops, setDrops] = useState([])

  useEffect(() => {
    let mounted = true
    async function getDrops() {
      const drops = await getAllDrops()
      const sortedDrops = _.reverse(_.sortBy(drops, ['created_at']))
      if (mounted) {
        setDrops(sortedDrops)
      }
    }
    getDrops()
    return () => {
      mounted = false
    }
  }, [])

  const handleClickOpen = (id) => {
    setOpenDialog(true)
    setSelectedId(id)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleClose = () => {
    setIsToast(false)
  }

  const handleDeleteDrop = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      setOpenDialog(false)

      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_DELETING })
      const deletedDrop = await deleteDrop(selectedId)
      if (!!deletedDrop) {
        const filteredDrops = _.filter(drops, function (o) {
          return o._id !== selectedId
        })
        setDrops(filteredDrops)

        setIsToast(false)
        setIsToast(true)
        setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_DELETED })
      } else {
        setIsToast(false)
        setIsToast(true)
        setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.FAILED })
      }
    } else {
      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
    }
  }

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }
  if (drops === []) return null
  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      <Card>
        <PerfectScrollbar>
          <Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Presale Date</TableCell>
                  <TableCell>Drop Date</TableCell>
                  <TableCell>Battle Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drops.slice(page * limit, page * limit + limit).map((drop, index) => (
                  <TableRow hover key={drop._id}>
                    <TableCell>{page * limit + index + 1}</TableCell>
                    <TableCell>
                      <Typography color="textPrimary" variant="body1">
                        {drop.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{TYPES[drop.type]}</TableCell>
                    <TableCell>
                      {drop.presaleDate && format(new Date(drop.presaleDate), 'MM/dd/yyyy-hh:mm')}
                    </TableCell>
                    <TableCell>{format(new Date(drop.dropDate), 'MM/dd/yyyy-hh:mm')}</TableCell>
                    <TableCell>{format(new Date(drop.battleDate), 'MM/dd/yyyy-hh:mm')}</TableCell>
                    <TableCell>{STATUS[drop.battleStatus]}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <NextLink
                          href={{
                            pathname: '/drops/[id]',
                            query: { id: drop._id },
                          }}
                        >
                          <IconButton size="small">
                            <EditIcon fontSize="small" color="primary" />
                          </IconButton>
                        </NextLink>

                        <IconButton size="small" onClick={() => handleClickOpen(drop._id)}>
                          <DeleteForeverIcon fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </PerfectScrollbar>
        <TablePagination
          component="div"
          count={drops.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure to delete this drop permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteDrop} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
