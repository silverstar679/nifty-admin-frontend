import { Card, CardContent, Grid, Typography } from '@mui/material'
import { getAllDrops } from '../../services/apis'
import { useState, useEffect } from 'react'

export const TotalDrops = (props) => {
  const [length, setLength] = useState(null)

  useEffect(() => {
    async function getDrops() {
      const drops = await getAllDrops()
      setLength(drops.length)
    }
    getDrops()
  }, [])

  if (length === null) return null

  return (
    <Card {...props}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              Total Drops
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {length}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
