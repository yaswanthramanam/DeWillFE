import React, { useState, useEffect } from 'react';
import { TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container, Divider, Fab } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import Devil from '../../assets/Devil.png';
import { CssBaseline } from "@mui/material";

const FAQBody = () => {
    const [willText, setWillText] = useState("");
    const [open, setOpen] = useState(false);

    // Load stored will on mount
    useEffect(() => {
        const savedWill = localStorage.getItem("userWill");
        if (savedWill) setWillText(savedWill);
    }, []);

    // Save will to localStorage
    const handleSaveWill = () => {
        localStorage.setItem("userWill", willText);
        setOpen(false);
    };

    return (
        <div>
            <CssBaseline />
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                {/* Dark overlay */}
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

                <Fab
                    variant="extended"
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'black',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        padding: '12px 35px',
                        borderRadius: '50px',
                        textTransform: 'none',
                        transition: '0.3s',
                        boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                            transform: 'translate(-50%, -50%) scale(1.1)',
                            boxShadow: '0px 6px 15px rgba(255, 255, 255, 0.4)',
                        },
                        '&:active': {
                            bgcolor: 'rgba(0, 0, 0, 0.8)',
                            boxShadow: '0px 2px 5px rgba(255, 255, 255, 0.1)',
                        }
                    }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Create Will
                </Fab>

                {/* Dialog for Creating a Will */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                    <DialogTitle>Create Your Will</DialogTitle>
                    <DialogContent>
                        <TextField
                            multiline
                            rows={6}
                            fullWidth
                            variant="outlined"
                            label="Write your will here..."
                            value={willText}
                            onChange={(e) => setWillText(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveWill} variant="contained" color="primary">Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
};

export default FAQBody;
