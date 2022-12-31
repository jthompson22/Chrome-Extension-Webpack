import React, {useState} from 'react'
import {TextField, DialogContent, DialogTitle, InputAdornment, Button, Dialog} from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';


const SendToUsers = ({handleSubmit, openModal, refContext} : any) => {
    const [to, setTo] = useState("");
    const [body, setBody] = useState("");

    const dialogStyle = {
        display: "flex",
        flexDirection: "column"
      };
    const textFieldStyle = {
        border: "none",
        "& input#standard-basic":{
            border: "none",
            boxShadow: "none"
        },
        "& textarea#standard-basic":{
            border: "none",
            boxShadow: "none",
        },
        "& div#SendAdornment":{
            position: 'relative',
            top: '42px',
            opacity: '40%',
        }
      };

    return (
        <Dialog open={openModal} sx={{dialogStyle}}>
            <div ref={refContext}>
                <DialogTitle>Sharing</DialogTitle>
                <DialogContent >
                    <TextField sx={textFieldStyle}
                    autoFocus
                    margin="dense"
                    label="To: User Handle..."
                    fullWidth
                    value={to}
                    onChange={(e) => (setTo(e.target.value))}
                    variant="standard" 
                    id="standard-basic"                   
                    InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchTwoToneIcon/> 
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField sx={textFieldStyle}
                        multiline
                        id="standard-basic"
                        variant="standard"
                        placeholder= "... P.S. I love you."
                        fullWidth
                        rows={5}
                        value={body}
                        onChange={(e) => (setBody(e.target.value))}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment id="SendAdornment" position="end">
                                    <Button color="primary" onClick={() =>  (handleSubmit(to, body), setBody(""), setTo(""))} endIcon={<SendTwoToneIcon />}> SEND </Button>
                                </InputAdornment>
                            )
                        }}
                    />
                </DialogContent>
            </div>
        </Dialog>
  )
}


export default SendToUsers;