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
  
const Test = () => {
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
                    id: "SaveCredentialsOnStartup",
                    credentials: {
                        email: userData.email,
                        password: userData.password
                    }
                }
                console.log(response);
                
                
                chrome.runtime.sendMessage(message, {}, (token) => {
                    console.log(token);
                    console.log("Do Something here");
                });
                
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
        
        /*         useEffect(() => {
            chrome.action.getBadgeText((badge) => {
                if(badge !== "OFF"){
                    setLoggedIn(true);
                }
            })
        }, []) */

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


const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)
root.render(<Test/>)
