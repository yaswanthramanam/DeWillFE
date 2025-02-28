import React, { useState } from 'react';
import { ethers } from "ethers";
import {
    TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Button, FormControl, InputLabel, Select, MenuItem,
    Fab, Box, CssBaseline, Checkbox, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Devil from '../../assets/Devil2.png';
// import Angel from '../../assets/Angel.png';
// import CONTRACT_ABI from '../../assets/abi.json';

//sonic contract address
const CONTRACT_ADDRESS = {
    sonic: "0x117808aDc1a8950638F14cE2ca57EeBCA1D2E9A6",
    ethereum: "",
    near: "",

};

//available countries to use dewill offchain transactions
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

//Gender of the recipient/ parent
const Gender = {
    Male: "Male",
    Female: "Female",
    Others: "Others",
};

// Token being transferred in dewill
const Token = {
    ETH: "ETH",
    Sonic: "Sonic",
    Near: "Near",
};

// Create an interface for recipients
interface RecipientDetails {
    addr: string;
    firstName: string;
    lastName: string;
    primaryEmail: string;
    secondaryEmail?: string;
    token: string;
    country: string;
    age?: number;
    gender?: string;
    percentage: number;
}

// Create an interface for error messages
interface RecipientErrors {
    addr?: string;
    firstName?: string;
    lastName?: string;
    primaryEmail?: string;
    secondaryEmail?: string;
    age?: string;
    percentage?: string;
}

const DeWillBody = () => {
    const [openWill, setWillOpen] = useState(false);
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
        token: Token.Sonic,
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
        recipients: RecipientDetails[];
    }>({
        text: "",
        stakingInterest: false,
        allocations: [],
        totalPercentage: 0,
        error: "",
        recipients: []
    });

    // Change the type of errors state to match the error interface
    const [errors, setErrors] = useState<RecipientErrors>({});

    const validateInputs = () => {
        const newErrors: RecipientErrors = {};

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
        
        if (recipientDetails.percentage <= 0 || recipientDetails.percentage > 100) {
            newErrors.percentage = "Percentage must be greater than 0 and less than or equal to 100.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSaveRecipient = () => {
        if (validateInputs()) {
            // Add the recipient to the will's recipients list
            const updatedWillDetails = {
                ...willDetails,
                recipients: [...willDetails.recipients, {...recipientDetails}],
                allocations: [...willDetails.allocations, {
                    recipient: recipientDetails.addr,
                    percentage: recipientDetails.percentage
                }]
            };
            
            setWillDetails(updatedWillDetails);
            
            // Reset the recipient form
            setRecipientDetails({
                addr: "",
                firstName: "",
                lastName: "",
                primaryEmail: "",
                secondaryEmail: "",
                token: Token.Sonic,
                country: Country.India,
                age: 0,
                gender: Gender.Male,
                percentage: 0
            });
            
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

    const handleAddRecipientClick = () => {
        setRecipientOpen(true);
    };

    const handleSaveWill = () => {
        const totalPercentage = willDetails.allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);

        if (totalPercentage !== 100) {
            setWillDetails({ ...willDetails, error: "Total allocation percentage must be exactly 100%." });
            return;
        }

        setWillDetails({ ...willDetails, error: "" });
        console.log("Saving Will:", willDetails);
        setWillOpen(false);
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
                        onClick={() => setWillOpen(true)}
                        sx={{ bgcolor: 'black', color: 'white', fontWeight: 'bold' }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        Create Will
                    </Fab>
                </Box>

                {/* Create Will Dialog */}
                <Dialog open={openWill} onClose={() => setWillOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle>Create Will</DialogTitle>
                    <DialogContent>
                        <TextField 
                            fullWidth 
                            label="Will Details" 
                            multiline 
                            rows={4} 
                            value={willDetails.text}
                            onChange={(e) => setWillDetails({ ...willDetails, text: e.target.value })} 
                            sx={{ mb: 2, mt: 2 }} 
                        />
                        
                        <FormControlLabel 
                            control={
                                <Checkbox 
                                    checked={willDetails.stakingInterest}
                                    onChange={(e) => setWillDetails({ ...willDetails, stakingInterest: e.target.checked })} 
                                />
                            }
                            label="Interested in Staking" 
                        />
                        
                        <Box sx={{ mt: 3, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <h3 style={{ margin: 0 }}>Recipients</h3>
                                <Button 
                                    onClick={handleAddRecipientClick} 
                                    variant="contained" 
                                    startIcon={<AddIcon />}
                                >
                                    Add Recipient
                                </Button>
                            </Box>
                            
                            {willDetails.recipients.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    No recipients added yet. Click "Add Recipient" to get started.
                                </Box>
                            ) : (
                                <Box>
                                    {willDetails.recipients.map((recipient, index) => (
                                        <Box key={index} sx={{ 
                                            mb: 2, 
                                            p: 2, 
                                            border: '1px solid #e0e0e0', 
                                            borderRadius: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Box>
                                                <strong>{recipient.firstName} {recipient.lastName}</strong>
                                                <p style={{ margin: '5px 0' }}>Address: {recipient.addr}</p>
                                                <p style={{ margin: '5px 0' }}>Email: {recipient.primaryEmail}</p>
                                            </Box>
                                            <Box sx={{ minWidth: '100px' }}>
                                                <TextField
                                                    label="Percentage"
                                                    type="number"
                                                    value={willDetails.allocations[index]?.percentage || 0}
                                                    onChange={(e) => handleAllocationChange(index, 'percentage', e.target.value)}
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: <span>%</span>,
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                    <Box sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        Total: {willDetails.allocations.reduce((sum, alloc) => sum + alloc.percentage, 0)}%
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        
                        {willDetails.error && (
                            <p style={{ color: 'red' }}>{willDetails.error}</p>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setWillOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={handleSaveWill} 
                            variant="contained" 
                            color="primary"
                            disabled={willDetails.recipients.length === 0}
                        >
                            Save Will
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Add Recipient Dialog */}
                <Dialog open={recipientOpen} onClose={() => setRecipientOpen(false)} fullWidth>
                    <DialogTitle>Add Recipient</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth 
                            label="Wallet Address"
                            value={recipientDetails.addr}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, addr: e.target.value })}
                            sx={{ mb: 2, mt: 2 }}
                            error={!!errors.addr}
                            helperText={errors.addr}
                        />
                        <TextField
                            fullWidth 
                            label="First Name"
                            value={recipientDetails.firstName}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, firstName: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                        />
                        <TextField
                            fullWidth 
                            label="Last Name"
                            value={recipientDetails.lastName}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, lastName: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                        />
                        <TextField
                            fullWidth 
                            label="Primary Email"
                            value={recipientDetails.primaryEmail}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, primaryEmail: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.primaryEmail}
                            helperText={errors.primaryEmail}
                        />
                        <TextField
                            fullWidth 
                            label="Secondary Email"
                            value={recipientDetails.secondaryEmail}
                            onChange={(e) => setRecipientDetails({ ...recipientDetails, secondaryEmail: e.target.value })}
                            sx={{ mb: 2 }}
                            error={!!errors.secondaryEmail}
                            helperText={errors.secondaryEmail}
                        />
                        <TextField
                            fullWidth 
                            label="Age"
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
                        <TextField
                            fullWidth 
                            label="Allocation Percentage"
                            value={recipientDetails.percentage}
                            onChange={(e) => {
                                const value = e.target.value;
                                setRecipientDetails({ ...recipientDetails, percentage: value ? Number(value) : 0 });
                            }}
                            type="number"
                            sx={{ mb: 2 }}
                            error={!!errors.percentage}
                            helperText={errors.percentage}
                            InputProps={{
                                endAdornment: <span>%</span>,
                            }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Country</InputLabel>
                            <Select
                                value={recipientDetails.country}
                                label="Country"
                                onChange={(e) => setRecipientDetails({ ...recipientDetails, country: e.target.value })}
                            >
                                {Object.values(Country).map((country) => (
                                    <MenuItem key={country} value={country}>{country}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                value={recipientDetails.gender}
                                label="Gender"
                                onChange={(e) => setRecipientDetails({ ...recipientDetails, gender: e.target.value })}
                            >
                                {Object.values(Gender).map((gender) => (
                                    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Token</InputLabel>
                            <Select
                                value={recipientDetails.token}
                                label="Token"
                                onChange={(e) => setRecipientDetails({ ...recipientDetails, token: e.target.value })}
                            >
                                {Object.values(Token).map((token) => (
                                    <MenuItem key={token} value={token}>{token}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRecipientOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRecipient} variant="contained" color="primary">
                            Save Recipient
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
};

export default DeWillBody;