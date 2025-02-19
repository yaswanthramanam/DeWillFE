import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Devil from '../../assets/Devil.png';
import { CssBaseline, Typography } from "@mui/material";
import DevilBody from '../../assets/BodyLogo.png';
import Slogan from '../../assets/Slogan2.png';

function Body() {
    return (
        <div>
            <CssBaseline/>
            <Box
                sx={{
                    bgcolor: 'transparent',
                    backgroundImage: `url(${Devil})`,
                    backgroundPosition: 'left',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    minHeight: '100vh',
                    width: '100vw',
                    margin: '0',
                    padding: '0',
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 0,
                    }}
                />

                <Container maxWidth="lg">
                    <Typography
                        variant="h1"
                        sx={{ 
                            color: 'white',
                            textAlign: 'center', 
                            position: 'relative', 
                            zIndex: 1,
                            paddingTop: '40vh',
                            paddingLeft: "14vw",
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
                        }} 
                    >
                        <img src={DevilBody} height = "300px"/>
                        <img src= {Slogan}  height = "120px"/>
                    </Typography>
                </Container>
            </Box>
        </div>
    );
}

export default Body;
