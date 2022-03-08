import { useState, useEffect } from 'react'
import { Card, CardContent, Grid, TextField } from '@mui/material'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

export const MerkleRootGenerator = (props) => {
  const whitelist = props.whitelist.whitelist.split(',')
  const [merkleroot, setMerkleroot] = useState('')
  useEffect(() => {
    // Hash leaves
    const leaves = whitelist.map((addr) => keccak256(addr))

    // Create tree
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    const rootHash = `0x${merkleTree.getRoot().toString('hex')}`
    setMerkleroot(rootHash)
  }, [whitelist])

  return (
    <>
      <Card>
        <CardContent>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label="Merkle Root"
                name="merkleroot"
                value={merkleroot}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}
