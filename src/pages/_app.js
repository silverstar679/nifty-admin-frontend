import Head from 'next/head'
import { CacheProvider } from '@emotion/react'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { createEmotionCache } from '../utils/create-emotion-cache'
import { theme } from '../theme'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import getLibrary from '../utils/getLibrary'
import { NetworkContextName } from '../constants'
import Web3ReactManager from '../components/Web3ReactManager'

const clientSideEmotionCache = createEmotionCache()

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>Nifty Royale Admin</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Web3ReactManager>{getLayout(<Component {...pageProps} />)}</Web3ReactManager>
            </ThemeProvider>
          </LocalizationProvider>
        </CacheProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  )
}

export default App
