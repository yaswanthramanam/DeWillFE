import React, { useState } from 'react';
import {
    TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Button, FormControl, InputLabel, Select, MenuItem,
    Fab, Box, CssBaseline, Checkbox, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Devil from '../../assets/Devil2.png';
import Angel from '../../assets/Angel.png';

import { ethers } from "ethers";
import CONTRACT_ABI from '../../assets/abi.json';

const CONTRACT_ADDRESS = "0x117808aDc1a8950638F14cE2ca57EeBCA1D2E9A6";

const Country = {
    India: "India",
    UnitedStates: "United States",
    UnitedKingdom: "United Kingdom",
    Japan: "Japan",
    Canada: "Canada",
    Australia: "Australia",
    China: "China",
    Russia: "Russia",
    Switzerland: "Switzerland",
    EU: "EU",
};

const Gender = {
    Male: "Male",
    Female: "Female",
    Others: "Others",
};

const Currency = {
    ETH: "ETH",
    Sonic: "Sonic",
    Near: "Near",
};

interface RecipientDetails {
    addr: string;
    firstName: string;
    lastName: string;
    primaryEmail: string;
    secondaryEmail?: string;
    currency: string;
    country: string;
    age?: number;
    gender?: string;
    percentage: number;
}

const DeWillBody = () => {
    const [open, setOpen] = useState(false);
    const [recipientOpen, setRecipientOpen] = useState(false);

    interface Allocation {
        recipient: string;
        percentage: number;
    }

    const [recipientDetails, setRecipientDetails] = useState<RecipientDetails>({
        addr: "",
        firstName: "",
        lastName: "",
        primaryEmail: "",
        secondaryEmail: "",
        currency: Currency.Sonic,
        country: Country.India,
        age: 0,
        gender: Gender.Male,
        percentage: 0
    });




    const [willDetails, setWillDetails] = useState<{
        text: string;
        stakingInterest: boolean;
        allocations: Allocation[];
        totalPercentage: number;
        error: string;
    }>({
        text: "",
        stakingInterest: false,
        allocations: [],
        totalPercentage: 0,
        error: ""
    });

    const [errors, setErrors] = useState<Partial<RecipientDetails>>({});


    const validateInputs = () => {
        const newErrors: Partial<Record<keyof RecipientDetails, string>> = {};

        if (!recipientDetails.addr || recipientDetails.addr.length < 7 || recipientDetails.addr.length > 100) {
            newErrors.addr = "Wallet address must be between 7 and 100 characters.";
        }

        if (!recipientDetails.firstName || recipientDetails.firstName.length > 50) {
            newErrors.firstName = "First name is required and must be less than 50 characters.";
        }

        if (!recipientDetails.lastName || recipientDetails.lastName.length > 30) {
            newErrors.lastName = "Last name is required and must be less than 30 characters.";
        }
        if (!recipientDetails.age || recipientDetails.age <= 0) {
            newErrors.age = "Age is required and must be a positive number.";
        }

        const isValidEmail = (email: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        if (!recipientDetails.primaryEmail || recipientDetails.primaryEmail.length < 6 || recipientDetails.primaryEmail.length > 50 || !isValidEmail(recipientDetails.primaryEmail)) {
            newErrors.primaryEmail = "Primary email is required, must be between 6-50 characters, and must be a valid email format.";
        }

        if (recipientDetails.secondaryEmail) {
            if (recipientDetails.secondaryEmail.length < 6 || recipientDetails.secondaryEmail.length > 50 || !isValidEmail(recipientDetails.secondaryEmail)) {
                newErrors.secondaryEmail = "Secondary email must be between 6-50 characters and in a valid format.";
            }
            if (recipientDetails.secondaryEmail === recipientDetails.primaryEmail) {
                newErrors.secondaryEmail = "Secondary email must be different from the primary email.";
            }
        }
        console.log(newErrors);
    }

    const handleSaveRecipient = () => {
        validateInputs();
        if (true) {
            console.log("Valid data:", recipientDetails);
            setRecipientOpen(false);
        }
    };

    const handleAllocationChange = (index: number, field: 'recipient' | 'percentage', value: string | number) => {
        const updatedAllocations = [...willDetails.allocations];
        updatedAllocations[index] = {
            ...updatedAllocations[index],
            [field]: field === "percentage" ? Number(value) : value,
        };
        setWillDetails({ ...willDetails, allocations: updatedAllocations });
    };

    const handleAddAllocation = () => {
        setWillDetails((prev) => ({
            ...prev,
            allocations: [...prev.allocations, { recipient: "", percentage: 0 }]
        }));
    };

    const handleSaveWill = () => {
        const totalPercentage = willDetails.allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);

        if (totalPercentage !== 100) {
            setWillDetails({ ...willDetails, error: "Total allocation percentage must be exactly 100%." });
            return;
        }

        setWillDetails({ ...willDetails, error: "" });
        console.log("Saving Will:", willDetails);
    };

    return (
        <div>
            <CssBaseline />
            <Box
                sx={{
                    bgcolor: 'transparent',
                    backgroundImage: `url(${Devil})`,
                    backgroundPosition: 'right',
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
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                        position: 'absolute',
                        left: 500,
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                >
                    <Fab
                        variant="extended"
                        onClick={() => setOpen(true)}
                        sx={{ bgcolor: 'black', color: 'white', fontWeight: 'bold' }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        Create Will
                    </Fab>

                    <Fab
                        variant="extended"
                        onClick={() => setRecipientOpen(true)}
                        sx={{ bgcolor: 'black', color: 'white', fontWeight: 'bold' }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        Add Recipient
                    </Fab>
                </Box>



                <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                    <DialogTitle>Create Will</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth label="Will Details" multiline rows={4} value={willDetails.text}
                            onChange={(e) => setWillDetails({ ...willDetails, text: e.target.value })} sx={{ mb: 2 }} />
                        <FormControlLabel control={<Checkbox checked={willDetails.stakingInterest}
                            onChange={(e) => setWillDetails({ ...willDetails, stakingInterest: e.target.checked })} />}
                            label="Interested in Staking" />
                        {willDetails.allocations.map((alloc, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <TextField fullWidth label="Recipient Address" value={alloc.recipient}
                                    onChange={(e) => handleAllocationChange(index, 'recipient', e.target.value)} />
                                <TextField fullWidth label="Percentage" type="number" value={alloc.percentage}
                                    onChange={(e) => handleAllocationChange(index, 'percentage', e.target.value)} />
                            </Box>
                        ))}
                        <Button onClick={handleAddAllocation} variant="outlined">Add Allocation</Button>
                        {willDetails.error && <p style={{ color: 'red' }}>{willDetails.error}</p>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveWill} variant="contained" color="primary">Save Will</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={recipientOpen} onClose={() => setRecipientOpen(false)} fullWidth>
                    <DialogTitle>Add Recipient</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth label="Wallet Address"
                            value={recipientDetails.addr}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, addr: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.addr}
                            helperText={errors.addr}
                        />
                        <TextField
                            fullWidth label="First Name"
                            value={recipientDetails.firstName}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, firstName: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                        />
                        <TextField
                            fullWidth label="Last Name"
                            value={recipientDetails.lastName}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, lastName: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                        />
                        <TextField
                            fullWidth label="Primary Email"
                            value={recipientDetails.primaryEmail}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, primaryEmail: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.primaryEmail}
                            helperText={errors.primaryEmail}
                        />
                        <TextField
                            fullWidth label="Secondary Email"
                            value={recipientDetails.secondaryEmail}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, secondaryEmail: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.secondaryEmail}
                            helperText={errors.secondaryEmail}
                        />
                        <TextField
                            fullWidth label="Age"
                            value={recipientDetails.age}
                            onChange={(e) => {
                                const value = e.target.value;
                                setRecipientDetails({ ...recipientDetails, age: value ? Number(value) : 0 });
                            }}
                            type="number"
                            sx={{ mb: 2 }}
                            error={!!errors.age}
                            helperText={errors.age}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRecipientOpen(false)}>Cancel</Button>
                        <Button variant="contained" color="primary">
                            Save Recipient
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
};


export default DeWillBody;
