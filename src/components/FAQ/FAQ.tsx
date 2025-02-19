


import React from "react";
import ResponsiveAppBar from "../AppBar/ResponsiveAppBar";
import Body from "../Body/Body";
import { CssBaseline } from "@mui/material";
import FAQBody from "./FAQBody";

function Home() {
    return (
        <div>
            <CssBaseline />
            <ResponsiveAppBar />
            <FAQBody />
        </div>
    );
}

export default Home;
