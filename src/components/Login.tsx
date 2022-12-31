import React, {useState} from 'react';
import '../assets/tailwind.css'
import {TextField, Button,Typography, Grid, ThemeProvider, createTheme} from '@mui/material';
import axios from 'axios';
import { createRoot } from 'react-dom/client'

const theme = createTheme({
    components:{
        MuiTypography: {
            variants:[
                {
                    props: {
                        variant: "h2"
                    },
                    style: {
                        fontSize: 11
                    }
                }
            ]
        }
    }
  })
  
const Login = () => {
        const [email, setEmail] = React.useState("");
        const [password, setPassword] = React.useState("");
        axios.defaults.baseURL = "http://localhost:5001/twizzly-application/us-central1/api"

        const handleSubmit = async(event) => {
            try{
                console.log("Submitting");
                event.preventDefault();
                let userData = {
                    email: email,
                    password: password
                }

                let response = await axios.post('/login', userData);
                const message = {
                    id: "SaveCredentials",
                    credentials: {
                        email: userData.email,
                        password: userData.password
                    }
                }
                console.log(response);
                
                
                chrome.runtime.sendMessage(message, (chromeResponse) => {
                    console.log(chromeResponse)
                });
                chrome.action.setBadgeText({
                    text: "ON",
                });;
                
                //May not Need This.
                let token = response.data.token; 
                const TAppIdToken = `Bearer ${token}`;
                localStorage.setItem('TAppIdToken', TAppIdToken)
                axios.defaults.headers.common['Authorization'] = TAppIdToken;
            }
            catch(error)
            {
                console.log(error.response)
            }
        }


    return(
        <ThemeProvider theme={theme}>
            <Grid container >
                <Grid item sm></Grid>
                <Grid item sm>
                <Typography variant="h2" >
                    Boobs
                </Typography>
                <form noValidate onSubmit={handleSubmit}>
                    <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => (setEmail(e.target.value), console.log("YA"))}
                    fullWidth
                    ></TextField>
                    <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                    fullWidth
                    ></TextField>
                    <Button type="submit" variant="contained" color="primary" />
                </form>
                </Grid>
                <Grid item sm></Grid>
            </Grid>
        </ThemeProvider>
        );
}

export default Login; 
