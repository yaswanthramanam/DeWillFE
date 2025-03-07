import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers } from "ethers";
import { IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MailIcon from '@mui/icons-material/Mail';
import RedeemIcon from '@mui/icons-material/Redeem';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {
    TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Button, FormControl, InputLabel, Select, MenuItem,
    Fab, Box, CssBaseline, Checkbox, FormControlLabel, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Devil from '../../assets/Devil2.png';
import CONTRACT_ABI from '../../assets/abi.json';

export const CONTRACT_ADDRESS = {
    sonic: "0x117808aDc1a8950638F14cE2ca57EeBCA1D2E9A6",
    ethereum: "",
    near: "",
    electroneum: "0xDBdbeD1a1c18da5DCBB6de49B2a2ABb83bf2FA10"
};

export const Country = { India: "India", UnitedStates: "United States", UnitedKingdom: "United Kingdom", Japan: "Japan", Canada: "Canada", Australia: "Australia", China: "China", Russia: "Russia", Switzerland: "Switzerland", EU: "EU" };
export const Gender = { Male: "Male", Female: "Female", Others: "Others" };
export const Token = { ETH: "ETH", Sonic: "Sonic", Near: "Near", Electroneum: "Electroneum" };

export interface RecipientDetails { addr: string; firstName: string; lastName: string; primaryEmail: string; secondaryEmail?: string; token: string; country: string; age?: number; gender?: string; percentage: number; }
export interface RecipientErrors { addr?: string; firstName?: string; lastName?: string; primaryEmail?: string; secondaryEmail?: string; age?: string; percentage?: string; }
export interface Allocation { recipient: string; percentage: number; }
export interface Will { text: string; stakingInterest: boolean; allocations: Allocation[]; totalPercentage: number; error: string; recipients: RecipientDetails[]; }

const DeWillBody = () => {
    const [openWill, setWillOpen] = useState(false);
    const [recipientOpen, setRecipientOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [hasWill, setHasWill] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<string>("-1"); // Wallet balance state
    const [contractBalance, setContractBalance] = useState<string>("-1"); // Contract balance state
    const WalletToRecipients: Map<string, RecipientDetails[]> = new Map();

    const [recipientDetails, setRecipientDetails] = useState<RecipientDetails>({
        addr: "", firstName: "", lastName: "", primaryEmail: "", secondaryEmail: "",
        token: Token.Electroneum, country: Country.India, age: 0, gender: Gender.Male, percentage: 0
    });

    const [willDetails, setWillDetails] = useState<Will>({
        text: "", stakingInterest: false, allocations: [], totalPercentage: 0, error: "", recipients: []
    });

    const [errors, setErrors] = useState<RecipientErrors>({});

    useEffect(() => {
        console.log("entering check will");
        checkExistingWill();
        updateBalances(); // Fetch balances on mount
    }, []);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const validateInputs = (): boolean => {
        const newErrors: RecipientErrors = {};
        if (!ethers.isAddress(recipientDetails.addr)) newErrors.addr = "Invalid EVM wallet address.";
        if (!recipientDetails.firstName || recipientDetails.firstName.length > 50) newErrors.firstName = "First name is required and must be less than 50 characters.";
        if (!recipientDetails.lastName || recipientDetails.lastName.length > 30) newErrors.lastName = "Last name is required and must be less than 30 characters.";
        if (!recipientDetails.age || recipientDetails.age <= 0) newErrors.age = "Age is required and must be a positive number.";
        const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!recipientDetails.primaryEmail || !isValidEmail(recipientDetails.primaryEmail)) newErrors.primaryEmail = "Valid primary email is required.";
        if (recipientDetails.secondaryEmail) {
            if (!isValidEmail(recipientDetails.secondaryEmail)) newErrors.secondaryEmail = "Secondary email must be valid.";
            if (recipientDetails.secondaryEmail === recipientDetails.primaryEmail) newErrors.secondaryEmail = "Secondary email must differ from primary.";
        }
        if (recipientDetails.percentage <= 0 || recipientDetails.percentage > 100) newErrors.percentage = "Percentage must be between 1 and 100.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveRecipient = () => {
        if (validateInputs()) {
            const currentTotal = willDetails.allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
            if (currentTotal + recipientDetails.percentage > 100) {
                setErrors({ ...errors, percentage: "Total allocation exceeds 100%." });
                return;
            }
            const updatedWillDetails = {
                ...willDetails,
                recipients: [...willDetails.recipients, { ...recipientDetails }],
                allocations: [...willDetails.allocations, { recipient: recipientDetails.addr, percentage: recipientDetails.percentage }]
            };
            setWillDetails(updatedWillDetails);
            setRecipientDetails({ addr: "", firstName: "", lastName: "", primaryEmail: "", secondaryEmail: "", token: Token.Electroneum, country: Country.India, age: 0, gender: Gender.Male, percentage: 0 });
            setRecipientOpen(false);
        }
    };

    const handleAllocationChange = (index: number, field: 'recipient' | 'percentage', value: string | number) => {
        const updatedAllocations = [...willDetails.allocations];
        updatedAllocations[index] = { ...updatedAllocations[index], [field]: field === "percentage" ? Number(value) : value };
        setWillDetails({ ...willDetails, allocations: updatedAllocations });
    };

    const handleAddRecipientClick = () => setRecipientOpen(true);

    const handleSaveWill = () => {
        const totalPercentage = willDetails.allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
        if (totalPercentage !== 100) {
            setWillDetails({ ...willDetails, error: "Total allocation percentage must be exactly 100%." });
            return;
        }
        setWillDetails({ ...willDetails, error: "" });
        sendWillToContract();
    };

    const onCancel = () => {
        setWillOpen(false);
        setRecipientDetails({ addr: "", firstName: "", lastName: "", primaryEmail: "", secondaryEmail: "", token: Token.Electroneum, country: Country.India, age: 0, gender: Gender.Male, percentage: 0 });
        setWillDetails({ ...willDetails, recipients: [] });
    };

    const checkExistingWill = async () => {
        if (!window.ethereum) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWalletAddress(address);
            const contract = new ethers.Contract(CONTRACT_ADDRESS.electroneum, CONTRACT_ABI, signer);
            const recipients = await contract.getRecipients();
            console.log("Hi..");
            const will: Will = await contract.getWill();

            const formattedWill = JSON.parse(JSON.stringify(will, (key, value) =>
                typeof value === "bigint" ? value.toString() : value, 2));

            console.log(formattedWill);
            console.log(will.totalPercentage);
            console.log(will.text);
            console.log("Get Will", await contract.getWill());
            if (recipients && recipients.length > 0) {
                const formattedRecipients: RecipientDetails[] = recipients.map((r: any) => ({
                    addr: r.addr, firstName: r.firstName, lastName: r.lastName, primaryEmail: r.primaryEmail, secondaryEmail: r.secondaryEmail || "",
                    token: ["Sonic", "ETH", "Near", "Electroneum"][r.currency] || "Electroneum",
                    country: ["India", "United States", "United Kingdom", "Japan", "Canada", "Australia", "China", "Russia", "Switzerland", "EU"][r.country] || "India",
                    age: Number(r.age), gender: ["Male", "Female", "Others"][r.gender] || "Male", percentage: Number(r.percentage)
                }));
                setWillDetails({
                    ...willDetails,
                    recipients: formattedRecipients,
                    allocations: formattedRecipients.map(r => ({ recipient: r.addr, percentage: r.percentage })),
                    stakingInterest: await contract.getStaking(),
                    text: will.text
                });
                setHasWill(true);
            }
        } catch (error) {
            console.error("Failed to fetch will:", error);
        }
    };

    const sendWillToContract = async () => {
        if (!window.ethereum) {
            alert("MetaMask not installed!");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const wallet = await signer.getAddress();
            console.log("Signer:", wallet);

            const contract = new ethers.Contract(CONTRACT_ADDRESS.electroneum, CONTRACT_ABI, signer);
            const recipientsFormatted = willDetails.recipients.map(r => ({
                addr: r.addr,
                firstName: r.firstName,
                lastName: r.lastName,
                primaryEmail: r.primaryEmail,
                secondaryEmail: r.secondaryEmail || "",
                currency: { "Sonic": 0, "ETH": 1, "Near": 2, "Electroneum": 3 }[r.token] || 3,
                country: { "India": 0, "United States": 1, "United Kingdom": 2, "Japan": 3, "Canada": 4, "Australia": 5, "China": 6, "Russia": 7, "Switzerland": 8, "EU": 9 }[r.country] || 0,
                age: r.age || 0,
                gender: { "Male": 0, "Female": 1, "Others": 2 }[r.gender || "Male"] || 0,
                percentage: r.percentage
            }));

            const willFormatted = {
                text: willDetails.text || "",
                recipients: recipientsFormatted
            };

            console.log("Will Formatted:", JSON.stringify(willFormatted));
            console.log("Recipients Formatted:", JSON.stringify(recipientsFormatted));

            const tx1 = await contract.addRecipients(willFormatted, { gasLimit: 500000 });
            console.log("Recipients Tx Hash:", tx1.hash);
            await tx1.wait();
            console.log("Recipients confirmed!");

            console.log("Get Will", await contract.getWill());

            const tx2 = await contract.setStaking(willDetails.stakingInterest, { gasLimit: 100000 });
            console.log("Staking Tx Hash:", tx2.hash);
            await tx2.wait();
            console.log("Staking confirmed!");

            WalletToRecipients.set(wallet, willDetails.recipients);
            setHasWill(true);
            setWillOpen(false);
            updateBalances(); // Update balances after saving will
        } catch (error) {
            console.error("Contract call failed:", error);
            if (error instanceof Error && "reason" in error) {
                alert(`Transaction failed: ${error.reason}`);
            } else {
                alert("Transaction failed. Check console for details.");
            }
        }
    };

    const handleDeleteWill = async () => {
        if (!window.ethereum) {
            alert("MetaMask not installed!");
            return;
        }
        try {
            setWillDetails({ text: "", stakingInterest: false, allocations: [], totalPercentage: 0, error: "", recipients: [] });
            setHasWill(false);
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const wallet = await signer.getAddress();
            console.log("Signer:", wallet);

            const contract = new ethers.Contract(CONTRACT_ADDRESS.electroneum, CONTRACT_ABI, signer);
            await contract.removeRecipients();
            console.log(await contract.getRecipients());
            updateBalances(); // Update balances after deleting will
        } catch (error) {
            console.error("Delete will failed:", error);
        }
    };

    async function refreshWill(): Promise<void> {
        if (!window.ethereum) {
            alert("MetaMask not installed!");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const wallet = await signer.getAddress();
            console.log("Signer:", wallet);

            const contract = new ethers.Contract(CONTRACT_ADDRESS.electroneum, CONTRACT_ABI, signer);
            const balance = await provider.getBalance(wallet);
            const balanceInEth = Number(ethers.formatEther(balance));

            let gasPrice: bigint | null = (await provider.getFeeData()).gasPrice;
            if (gasPrice == null) {
                gasPrice = BigInt(0);
            } 
            const gasLimit = 300000n;
            const gasCost = gasPrice * gasLimit;
            const gasCostInEth = Number(ethers.formatEther(gasCost));
            const afterGasBalance = balanceInEth - gasCostInEth;

            if (afterGasBalance <= 0) {
                alert("Insufficient balance to cover gas fees.");
                return;
            }

            const tx = await contract.addBalance(3, {
                value: ethers.parseEther(afterGasBalance.toFixed(18)),
                gasLimit: gasLimit,
            });
            console.log("Transaction sent:", tx.hash);
            await tx.wait();
            console.log("Transaction confirmed!");

            updateBalances(); // Update balances after adding funds
        } catch (error: any) {
            console.error("Refresh will failed:", error);
            alert(`Failed to add balance: ${error.message || "Unknown error"}`);
        }
    }

    async function getWalletBalance(): Promise<string> {
        if (!window.ethereum) {
            return "-1";
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const balance = await provider.getBalance(signer.address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error("Fetch wallet balance failed:", error);
            return "-1";
        }
    }

    async function getContractBalance(): Promise<string> {
        if (!window.ethereum) {
            return "-1";
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS.electroneum, CONTRACT_ABI, signer);
            const balance = await contract.getBalance(3);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error("Fetch contract balance failed:", error);
            return "-1";
        }
    }

    async function updateBalances(): Promise<void> {
        const walletBal = await getWalletBalance();
        const contractBal = await getContractBalance();
        setWalletBalance(walletBal);
        setContractBalance(contractBal);
    }

    async function withdrawAllFunds(): Promise<void> {
        if (!window.ethereum) {
            alert("MetaMask not installed!");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const wallet = await signer.getAddress();
            console.log("Signer:", wallet);

            const contract = new ethers.Contract(CONTRACT_ADDRESS.electroneum, CONTRACT_ABI, signer);
            
            const fullBalanceWei = await contract.getBalance(3);
            if (fullBalanceWei <= 0n) {
                alert("No funds available to withdraw.");
                return;
            }

            const gasPrice = (await provider.getFeeData()).gasPrice || ethers.parseUnits("20", "gwei");
            const gasLimit = BigInt(50000);
            const gasCost = gasPrice * gasLimit;

            if (fullBalanceWei <= gasCost) {
                alert("Insufficient balance to cover gas fees.");
                return;
            }

            const amountToWithdraw = fullBalanceWei - gasCost;

            const tx = await contract.withdrawBalance(3, amountToWithdraw, {
                gasLimit: 50000,
            });
            console.log("Withdraw transaction sent:", tx.hash);
            await tx.wait();
            console.log("Withdraw transaction confirmed!");

            const newBalance = await getContractBalance();
            setContractBalance(newBalance); // Update contract balance
            setWalletBalance(await getWalletBalance()); // Update wallet balance
            alert(`Successfully withdrew ${ethers.formatEther(amountToWithdraw)} ETH`);
        } catch (error: any) {
            console.error("Withdraw all funds failed:", error);
            alert(`Failed to withdraw funds: ${error.message || "Unknown error"}`);
        }
    }

    return (
        <Box sx={{ bgcolor: '#000000', backgroundImage: `url(${Devil})`, backgroundPosition: 'right', backgroundRepeat: 'no-repeat', backgroundSize: 'contain', minHeight: '100vh', width: '100vw', m: 0, p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: 'Inter, Roboto, sans-serif' }} onMouseMove={handleMouseMove}>
            <CssBaseline />
            <Box sx={{ position: 'absolute', width: '40px', height: '40px', bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', pointerEvents: 'none', transform: 'translate(-50%, -50%)', left: `${mousePosition.x}px`, top: `${mousePosition.y}px`, boxShadow: '0 0 20px 10px rgba(255, 255, 255, 0.15)', zIndex: 1 }} />
            {/* Balance Display in Top-Left */}
            <Box sx={{ position: 'absolute', top: 16, left: 16, color: 'white', zIndex: 2, paddingTop: "100px" }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Wallet Balance: {walletBalance} ETN
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Contract Balance: {contractBalance} ETN
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingRight: "250px", gap: 3, zIndex: 2 }}>
                {!hasWill ? (
                    <Fab variant="extended" onClick={() => setWillOpen(true)} sx={{ bgcolor: 'transparent', color: 'white', border: '1px solid white', fontWeight: 'bold', fontSize: '1.1rem', px: 3, py: 1, textTransform: 'uppercase', '&:hover': { bgcolor: 'grey.800', borderColor: 'white' }, transition: 'all 0.3s ease' }}>
                        <AddIcon sx={{ mr: 1 }} />
                        Create Will
                    </Fab>
                ) : (
                    <Box sx={{ bgcolor: '#1a1a1a', p: 4, borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)', maxWidth: '500px', color: 'white' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 2, textAlign: 'center' }}>Your Will</Typography>
                            <Box>
                                <IconButton onClick={refreshWill} color="primary">
                                    <RefreshIcon />
                                </IconButton>
                                <IconButton href='/send'>
                                    <RedeemIcon color="primary" />
                                </IconButton>
                                <IconButton onClick={withdrawAllFunds} color="primary">
                                    <AccountBalanceWalletIcon />
                                </IconButton>
                            </Box>
                        </Box>
                        <Typography sx={{ mb: 1 }}>Details: {willDetails.text || "Not specified"}</Typography>
                        <Typography sx={{ mb: 1 }}>Staking Interest: {willDetails.stakingInterest ? "Yes" : "No"}</Typography>
                        <Typography sx={{ mb: 2 }}>Recipients:</Typography>
                        {willDetails.recipients.map((r, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#2a2a2a', borderRadius: 1 }}>
                                <Typography>{r.firstName} {r.lastName} ({r.percentage}%)</Typography>
                                <Typography sx={{ color: 'grey.400', fontSize: '0.9rem' }}>{r.addr}</Typography>
                                <Typography sx={{ color: 'grey.400', fontSize: '0.9rem' }}>{r.primaryEmail}</Typography>
                            </Box>
                        ))}
                        <Button startIcon={<DeleteIcon />} onClick={handleDeleteWill} sx={{ mt: 2, color: '#FF6F61', '&:hover': { color: '#FF8F81' }, textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Delete Will
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Create Will Dialog */}
            <Dialog open={openWill} onClose={() => setWillOpen(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ bgcolor: '#000000', color: 'white', fontWeight: 700, py: 1, textTransform: 'uppercase', fontFamily: 'Inter, Roboto, sans-serif', fontSize: '1.2rem' }}>Create Your Will</DialogTitle>
                <DialogContent sx={{ bgcolor: '#000000', color: 'white', p: 3 }}>
                    <TextField fullWidth label="Will Details" multiline rows={1} value={willDetails.text} onChange={(e) => setWillDetails({ ...willDetails, text: e.target.value })} sx={{ mb: 3, mt: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 0, color: 'white' } }} />
                    <FormControlLabel control={<Checkbox checked={willDetails.stakingInterest} onChange={(e) => setWillDetails({ ...willDetails, stakingInterest: e.target.checked })} sx={{ color: 'white' }} />} label="Interested in Staking" sx={{ color: 'white', mb: 3 }} />
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <h3 style={{ margin: 0, color: 'white', fontWeight: 700, textTransform: 'uppercase', fontSize: '1.1rem' }}>Recipients</h3>
                            <Button onClick={handleAddRecipientClick} variant="outlined" startIcon={<AddIcon />} sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'grey.300', color: 'grey.300' } }}>Add Recipient</Button>
                        </Box>
                        {willDetails.recipients.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 2, bgcolor: '#1a1a1a', color: 'grey.400' }}>No recipients added yet. Click "Add Recipient" to begin.</Box>
                        ) : (
                            <Box>
                                {willDetails.recipients.map((recipient, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#1a1a1a', display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                                        <Box>
                                            <strong>{recipient.firstName} {recipient.lastName}</strong>
                                            <p style={{ margin: '5px 0', color: 'grey.300' }}>Address: {recipient.addr}</p>
                                            <p style={{ margin: '5px 0', color: 'grey.300' }}>Email: {recipient.primaryEmail}</p>
                                        </Box>
                                        <Box sx={{ minWidth: '120px' }}>
                                            <TextField label="Percentage" type="number" value={willDetails.allocations[index]?.percentage || 0} onChange={(e) => handleAllocationChange(index, 'percentage', e.target.value)} fullWidth InputProps={{ endAdornment: <span style={{ color: 'white' }}>%</span>, sx: { color: 'white', bgcolor: '#2a2a2a', borderRadius: 0 } }} sx={{ label: { color: 'grey.400' } }} />
                                        </Box>
                                    </Box>
                                ))}
                                <Box sx={{ textAlign: 'right', fontWeight: 700, color: 'white' }}>Total: {willDetails.allocations.reduce((sum, alloc) => sum + alloc.percentage, 0)}%</Box>
                            </Box>
                        )}
                    </Box>
                    {willDetails.error && <p style={{ color: '#FF6F61' }}>{willDetails.error}</p>}
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#000000', py: 2 }}>
                    <Button onClick={onCancel} sx={{ color: 'white', '&:hover': { color: 'grey.300' } }}>Cancel</Button>
                    <Button onClick={handleSaveWill} variant="contained" disabled={willDetails.recipients.length === 0} sx={{ bgcolor: 'white', color: '#000000', '&:hover': { bgcolor: 'grey.300', color: '#000000' }, px: 3 }}>Save Will</Button>
                </DialogActions>
            </Dialog>

            {/* Add Recipient Dialog */}
            <Dialog open={recipientOpen} onClose={() => setRecipientOpen(false)} fullWidth>
                <DialogTitle sx={{ bgcolor: '#000000', color: 'white', fontWeight: 700, py: 1, textTransform: 'uppercase', fontFamily: 'Inter, Roboto, sans-serif', fontSize: '1.2rem' }}>Add Recipient</DialogTitle>
                <DialogContent sx={{ bgcolor: '#000000', color: 'white', p: 3 }}>
                    <TextField fullWidth label="Wallet Address" value={recipientDetails.addr} onChange={(e) => setRecipientDetails({ ...recipientDetails, addr: e.target.value })} sx={{ mb: 2, mt: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 0 } }} error={!!errors.addr} helperText={errors.addr} />
                    <TextField fullWidth label="First Name" value={recipientDetails.firstName} onChange={(e) => setRecipientDetails({ ...recipientDetails, firstName: e.target.value })} sx={{ mb: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 0 } }} error={!!errors.firstName} helperText={errors.firstName} />
                    <TextField fullWidth label="Last Name" value={recipientDetails.lastName} onChange={(e) => setRecipientDetails({ ...recipientDetails, lastName: e.target.value })} sx={{ mb: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 0 } }} error={!!errors.lastName} helperText={errors.lastName} />
                    <TextField fullWidth label="Primary Email" value={recipientDetails.primaryEmail} onChange={(e) => setRecipientDetails({ ...recipientDetails, primaryEmail: e.target.value })} sx={{ mb: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 0 } }} error={!!errors.primaryEmail} helperText={errors.primaryEmail} />
                    <TextField fullWidth label="Secondary Email" value={recipientDetails.secondaryEmail} onChange={(e) => setRecipientDetails({ ...recipientDetails, secondaryEmail: e.target.value })} sx={{ mb: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 0 } }} error={!!errors.secondaryEmail} helperText={errors.secondaryEmail} />
                    <TextField fullWidth label="Age" value={recipientDetails.age} onChange={(e) => setRecipientDetails({ ...recipientDetails, age: e.target.value ? Number(e.target.value) : 0 })} type="number" sx={{ mb: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 0 } }} error={!!errors.age} helperText={errors.age} />
                    <TextField fullWidth label="Allocation Percentage" value={recipientDetails.percentage} onChange={(e) => setRecipientDetails({ ...recipientDetails, percentage: e.target.value ? Number(e.target.value) : 0 })} type="number" sx={{ mb: 2, input: { color: 'white' }, label: { color: 'grey.400' } }} InputProps={{ endAdornment: <span style={{ color: 'white' }}>%</span>, sx: { bgcolor: '#1a1a1a', borderRadius: 0 } }} error={!!errors.percentage} helperText={errors.percentage} />
                    <FormControl fullWidth sx={{ mb: 2 }}><InputLabel sx={{ color: 'grey.400' }}>Country</InputLabel><Select value={recipientDetails.country} label="Country" onChange={(e) => setRecipientDetails({ ...recipientDetails, country: e.target.value })} sx={{ color: 'white', bgcolor: '#1a1a1a', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.700' } }}>{Object.values(Country).map((country) => (<MenuItem key={country} value={country} sx={{ color: 'white', bgcolor: '#1a1a1a' }}>{country}</MenuItem>))}</Select></FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}><InputLabel sx={{ color: 'grey.400' }}>Gender</InputLabel><Select value={recipientDetails.gender} label="Gender" onChange={(e) => setRecipientDetails({ ...recipientDetails, gender: e.target.value })} sx={{ color: 'white', bgcolor: '#1a1a1a', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.700' } }}>{Object.values(Gender).map((gender) => (<MenuItem key={gender} value={gender} sx={{ color: 'white', bgcolor: '#1a1a1a' }}>{gender}</MenuItem>))}</Select></FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}><InputLabel sx={{ color: 'grey.400' }}>Token</InputLabel><Select value={recipientDetails.token} label="Token" onChange={(e) => setRecipientDetails({ ...recipientDetails, token: e.target.value })} sx={{ color: 'white', bgcolor: '#1a1a1a', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.700' } }}>{Object.values(Token).map((token) => (<MenuItem key={token} value={token} sx={{ color: 'white', bgcolor: '#1a1a1a' }}>{token}</MenuItem>))}</Select></FormControl>
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#000000', py: 2 }}>
                    <Button onClick={() => setRecipientOpen(false)} sx={{ color: 'white', '&:hover': { color: 'grey.300' } }}>Cancel</Button>
                    <Button onClick={handleSaveRecipient} variant="contained" sx={{ bgcolor: 'white', color: '#000000', '&:hover': { bgcolor: 'grey.300', color: '#000000' }, px: 3 }}>Save Recipient</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeWillBody;