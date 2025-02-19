


import React from "react";
import ResponsiveAppBar from "../AppBar/ResponsiveAppBar";
import Body from "../Body/Body";
import { CssBaseline } from "@mui/material";
import DeWillBody from "./DeWillBody";

function DeWill() {
    return (
        <div>
            <CssBaseline />
            <ResponsiveAppBar />
            <DeWillBody />
        </div>
    );
}

export default DeWill;
