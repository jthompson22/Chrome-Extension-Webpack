import React, {useState} from 'react'
import {TextField, DialogContent, DialogTitle, InputAdornment, Button, Dialog, ListItemButton, MenuList, MenuItem, ListItemText} from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import FormatAlignLeftTwoToneIcon from '@mui/icons-material/FormatAlignLeftTwoTone';


const SendToUsers = ({handleSubmit, openModal, refContext, friends} : any) => {
    const [to, setTo] = useState("");
    const [filterList, setFilterList] = useState([]);

    const [body, setBody] = useState("");

    const dialogStyle = {
        display: "flex",
        flexDirection: "column",
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
            marginTop: '15px'
        },
        "& div#SendAdornment":{
            marginTop: '15px',
            opacity: '40%',
        },
        "& label#SendAdornment":{
            marginTop: '15px',
            opacity: '40%',
        },
        "& div#BodyAdornment":{
            marginTop: '15px',
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
        <Dialog open={openModal} sx={{dialogStyle}}
            PaperProps={{sx:{overflowY: 'unset'}}}
        >
            <div ref={refContext}>
                <DialogTitle>Share The Web</DialogTitle>
                <DialogContent>
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
                            <MenuList sx={listStyles}>
                                {
                                    filterList.map(friend => {
                                            console.log(friend)
                                            return (
                                            <MenuItem id={friend} key={friend}> 
                                                <ListItemButton onClick={() => handleListItemClick(friend)}>
                                                    <ListItemText> 
                                                        {friend}
                                                    </ListItemText>
                                                </ListItemButton>
                                            </MenuItem>)
                                    })
                                }
                            </MenuList>
                    }
                        <TextField sx={textFieldStyle}
                            multiline
                            id="standard-basic"
                            variant="standard"
                            placeholder= "... P.S. I love you."
                            label="Body: ..."
                            InputLabelProps={{sx:{marginTop: '10px'}}}
                            fullWidth
                            value={body}
                            onChange={(e) => (setBody(e.target.value))}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment id="SendAdornment" position="end">
                                        <Button color="primary" onClick={() =>  (handleSubmit(to, body), setBody(""), setTo(""))} endIcon={<SendTwoToneIcon />}> SEND </Button>
                                    </InputAdornment>
                                ),
                                startAdornment: (
                                    <InputAdornment id="BodyAdornment" position="start">
                                        <FormatAlignLeftTwoToneIcon/> 
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