import React, {useState} from 'react'
import {TextField, DialogContent, DialogTitle, InputAdornment, Button, Dialog, List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';


const SendToUsers = ({handleSubmit, openModal, refContext, friends} : any) => {
    const [to, setTo] = useState("");
    const [filterList, setFilterList] = useState([]);

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

    const listStyles = {
        position: 'absolute',
        zIndex: '9999999999999',
        border: "2px solid #DEDEDE",
        backgroundColor: "white",
        borderRadius: '15px'
    };

    const handleToQueryChange = (e) => {
        const results = friends.filter(friend => {
            if (e.target.value === "") return friends;
            return friend.toLowerCase().includes(e.target.value.toLowerCase());
        })
        setTo(e.target.value);
        setFilterList(results);
    }
    
    const handleListItemClick = (friend) => {
        setTo(friend);
        setFilterList([]);
    }

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
                    onChange={handleToQueryChange}
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
                    {
                        (to !== "" && filterList.length > 0) && 
                        <List sx={listStyles}>
                            {
                                filterList.map(friend => {
                                        console.log(friend)
                                        return (
                                        <ListItem id={friend} key={friend}> 
                                            <ListItemButton onClick={() => handleListItemClick(friend)}>
                                                <ListItemText> 
                                                    {friend}
                                                </ListItemText>
                                            </ListItemButton>
                                        </ListItem>)
                                })
                            }
                        </List>
                    }
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