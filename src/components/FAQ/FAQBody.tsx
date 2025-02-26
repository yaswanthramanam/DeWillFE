import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from "@mui/material/Box";
import Devil from '../../assets/Devil2.png';
import Angel from '../../assets/Angel.png';
import { CssBaseline } from "@mui/material";

const FAQBody = () => {
    const faqData = [
        { question: "What is DEWill?", answer: "DEWill is a decentralised Will to recover digital assets from lost wallets. It also help people who are technically not good with blockchain to get back their assets, aknowledging 90% of the world's population .  It also helps investors to stake their tokens to maximize their returns. " },
        { question: "What is unique about DEWill?", answer: "We are contributing to one of the biggest challenges the Web 3 space face today, the lost assets across different blockchains. Nearly 13% of Bitcoin estimated of 100 billion USDT is lost because of forgotten private keys, non existance of wills to the assets, and other factors. We want to give a vote of confidence to the investors , and web 3 enthusiasts across blockchains by building a solution for this ever existing problem.  " },
        { question: "What are the supported Networks for DEWill?", answer: "WE support sonic blockchain as of now." },
        { question: "Whats interesting about the application?", answer: "We share a unique philosophy to serve the blockchain community. We aknowledge the human limitations of memory and a chance of mistake, and give them a choice to get back their assets. We have fictional character called 'angels' interacting with the users as they use this platform. While a lost account makes the assets unrecoverable, angels come to the user's rescue. To help investors, the angels often fight a devil called 'oblivion',  by making them agree up on a decentralised Will, that favors the users. This helps users retain the lost assets with a very minimal transaction fee to pay. " },
    ];

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
                    paddingLeft: '40vw',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ marginBottom: 2, color: 'white', textAlign: 'center' }}>
                        Frequently Asked Questions
                    </Typography>
                    <Divider sx={{ bgcolor: 'white', marginBottom: 2 }} />
                    {faqData.map((item, index) => (
                        <Accordion key={index} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', marginBottom: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} >
                                <Typography sx={{ color: 'white' }}>{item.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography sx={{ color: 'white' }}>{item.answer}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Container>
            </Box>
        </div>
    );
};

export default FAQBody;
