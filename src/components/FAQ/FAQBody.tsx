import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from "@mui/material/Box";
import Devil from '../../assets/Devil.png';
import { CssBaseline } from "@mui/material";

const FAQBody = () => {
    const faqData = [
        { question: "What is your return policy?", answer: "You can return any item within 30 days." },
        { question: "How long does shipping take?", answer: "Shipping typically takes 3-5 business days." },
        { question: "Do you ship internationally?", answer: "Yes, we ship to many countries worldwide." },
        // Add more FAQs here
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
                    padding: '0',
                    position: 'relative',
                    display: 'flex', // Flexbox for centering
                    alignItems: 'center', // Vertical centering
                    justifyContent: 'center', // Horizontal centering
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
                {/* FAQ content */}
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
