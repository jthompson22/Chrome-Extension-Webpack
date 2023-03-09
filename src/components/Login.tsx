import React, {useRef, useEffect} from 'react';
import {TextField, Button,Typography, InputAdornment, Grid, Avatar, Dialog, Link} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { LOGIN, SIGN_UP } from '../environment'

interface modalOverride {
    modalControl?: boolean
    refContext?: any
}

function loginBoundedOutsideAlerter(ref, setModal) {
    console.log("login bound outsider alerter");
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                // eslint-disable-next-line no-restricted-globals
                setModal(false)
            }
        }
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [ref])
  }




const Login = ({modalControl, refContext}: modalOverride) => {
    const [email, setEmail] = React.useState("");
    const loginWrapperRef = useRef(null);
    const [password, setPassword] = React.useState("");
    const [modal, setModal] = React.useState(true);
    const [error, setError] = React.useState("");
    (modalControl === null ) && loginBoundedOutsideAlerter(loginWrapperRef, setModal);
    (modalControl === null ) ? console.log("Coming in through click") : console.log("Coming in through modal");

    const handleSubmit = () => {
        try{
            const message = {
                id: "SaveCredentialsOnLogin",
                credentials: {
                    email: email,
                    password: password
                }
            }
            
            chrome.runtime.sendMessage(message, {}, (tokenIsSet) => {
                if(tokenIsSet){
                    if(modalControl === null){
                        setModal(false);
                    }
                    setError("");
                }else{
                    setError("Bad email or password, try again!")
                }     
            });
        }
        catch(error)
        {
            console.log(error.response)
        }
    }

    const paperStyle={padding: '20px', width:'300px', margin:"20px auto"}
    const avatarStyle={backgroundColor:'#1bbd7e'}
    const btnstyle={margin:'8px 0'}
    const linkStyle={cursor: 'pointer'}


return(
    <Dialog open={(modalControl === null) ? modal : modalControl}>
    <div ref={(refContext === null) ? loginWrapperRef : refContext}>
        <Grid sx={paperStyle}>
            <Grid container direction="column" justifyContent="center" alignItems="center">
                 <Avatar sx={avatarStyle}><LockOutlinedIcon/></Avatar>
                <h2>Sign In</h2>
            </Grid>
            <TextField 
            value={email}
            onChange={(e) => (setEmail(e.target.value))}
            error={error.length > 0}
            label='Email' placeholder='Enter email' sx={btnstyle} fullWidth required
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <PersonIcon/> 
                    </InputAdornment>
                )
            }}
            />
            <TextField label='Password' placeholder='Enter password' sx={btnstyle} type='password' fullWidth required
            value={password}
            onChange={(e) => (setPassword(e.target.value))}
            error={error.length > 0}
            helperText={error.length > 0 ? error : ""}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <LockOutlinedIcon/> 
                    </InputAdornment>
                )
            }}
            />
            <Button onClick={handleSubmit} type='submit' color='primary' variant="contained" sx={btnstyle} fullWidth>Sign in</Button>
            <Typography >
                 <Link href={SIGN_UP} sx={linkStyle}>
                    Forgot password?
            </Link>
            </Typography>
            <Typography > Do you have an account? 
                 <Link href={LOGIN} sx={linkStyle}>
                    Sign Up 
            </Link>
            </Typography>
        </Grid>
    </div>
    </Dialog>
    );
}


export default Login; 