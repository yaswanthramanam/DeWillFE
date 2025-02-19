import * as React from 'react';
import { BrowserProvider, Eip1193Provider, ethers } from 'ethers';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Devil from './../../assets/Devil.png';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    ethereum?:  Eip1193Provider;
  }
}

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  async function connectWallet(): Promise<void> {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        console.log("session storage: ",  sessionStorage);

        console.log("Connected Wallet Address:", address);

        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();

        console.log("Connected ChainId :", chainId);

        sessionStorage.setItem("walletAddress", address);
      } catch (error) {
        console.error("Wallet connection failed:", error);
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log(address);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  }

  function disconnectWallet(): void {
    setWalletAddress(null);
  
    sessionStorage.removeItem("walletAddress");
    localStorage.removeItem("walletAddress");

    console.log("Wallet disconnected. Reconnect will require user action.");
  }
  
  

  return (
    <AppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <img src={Devil} height="70px" />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DeWill
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <MenuItem key="Home" onClick={() => navigate('/')}>
              <Typography sx={{ textAlign: 'center' }}>Home</Typography>
            </MenuItem>
            <MenuItem key="DE_Wills" onClick={() => navigate('/dewill')}>
              <Typography sx={{ textAlign: 'center' }}>DE Wills</Typography>
            </MenuItem>
            <MenuItem key="FAQ" onClick={() => navigate('/faq')}>
              <Typography sx={{ textAlign: 'center' }}>FAQ</Typography>
            </MenuItem>
            <MenuItem key="chat" onClick={() => navigate('/faq')}>
              <Typography sx={{ textAlign: 'center' }}>Chat With An Angel</Typography>
            </MenuItem>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {walletAddress ? (
                <>
                  <MenuItem key="wallet">
                    <Typography sx={{ textAlign: 'center' }}>
                      Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </Typography>
                  </MenuItem>
                  <MenuItem key="disconnect" onClick={disconnectWallet}>
                    <Typography sx={{ textAlign: 'center' }}>Disconnect Wallet</Typography>
                  </MenuItem>
                </>
              ) : (
                <MenuItem key="connect" onClick={connectWallet}>
                  <Typography sx={{ textAlign: 'center' }}>Connect Wallet</Typography>
                </MenuItem>
              )}
              <MenuItem key="logout" onClick={disconnectWallet}>
                <Typography sx={{ textAlign: 'center' }}>LogOut</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
