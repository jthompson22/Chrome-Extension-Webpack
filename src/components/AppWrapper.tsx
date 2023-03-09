import React, {useState, useEffect, useRef} from 'react';
//import axios from 'axios';
import Login from './Login'
import { createRoot } from 'react-dom/client'
//import jwtDecode from "jwt-decode";
import SendToUsers from './SendToUsers';
import {Snackbar} from '@mui/material';
import { CLIENT_ROOT } from '../environment';

function useOutsideAlerter(ref, setOpen) {
    console.log("useOutsideAlerter");
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                // eslint-disable-next-line no-restricted-globals
                console.log("FALSE");
                setOpen(false)
            }
        }
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [ref])
  }

function getBearer(){
    console.log("Executing get Bearer");
    useEffect(()=>{

    }, [])
}

const AppWrapper = () => {
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef(null)
    useOutsideAlerter(wrapperRef, setOpen)
    const [snack, setSnackBar] = useState(false);
    const [snackError, setSnackError] = useState(false);
    const [friends, setFriends] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleSubmit = (to, body) => {
        console.log("firing");
        console.log(to);
        console.log(body);
        const message = {
                id: "PostSharedLink",
                body:{
                    recipientHandle: to,
                    messageBody: body,
                    url: window.location.href,
                }
        }
        console.log(message);
        setOpen(false);
        chrome.runtime.sendMessage(message, (postResponse) => {
            if(!postResponse){
                setSnackError(false)
            }
            setSnackBar(true)
        })
    }

    const snackbarClose = () =>{
        setSnackBar(false);
        setSnackError(false);
    }
    useEffect(() => {
        console.log("handleKeyBoardShortcut")
        function handleKeyBoardShortcut(event) {
            if(open === false){
                if(event.altKey && event.key == 'c'){
                    console.log("TRUE");
                    setOpen(true);
                }
            }
        }
        document.addEventListener('keydown', handleKeyBoardShortcut)
        return () => {
        document.removeEventListener('keydown', handleKeyBoardShortcut)
        }
    }, [open])
    
    useEffect(()=>{
        //Load Bearer Token Upon Every Page
        chrome.runtime.sendMessage({id: "LoadBearerToken"}, {}, (token) => {
            //We know we're logged in, go get friends;
            console.log("Token", token)
            if(window.location.href === `${CLIENT_ROOT}`){
                chrome.runtime.sendMessage({id: "LoginToHomePage"}, {}, (bearer) =>{
                    console.log("Token", bearer);
                    localStorage.setItem('TAppIdToken', bearer);
                })
            }
            if(token){
                if(window.location.href === `${CLIENT_ROOT}/login`){
                    chrome.runtime.sendMessage({id: "LoginToHomePage"}, {}, (bearer) =>{
                        console.log("Token", bearer);
                        localStorage.setItem('TAppIdToken', bearer);
                        window.location.reload(); 
                    })
                }

                //Set background.js login details
                setLoggedIn(true);
                chrome.runtime.sendMessage({id: "GetFriends"}, {}, (friends) => {
                    console.log(friends);
                    setFriends(friends);
                })
            }else{
                chrome.runtime.sendMessage({id: "SetupLoginListener"}, {}, () => {
                    setLoggedIn(true);
                    chrome.runtime.sendMessage({id: "GetFriends"}, {}, (friends) => {
                        console.log(friends);
                        setFriends(friends);
                    })
                })
            }
        })
    }, [])

    return (
        <>  {loggedIn ? 
                <SendToUsers openModal={open} handleSubmit={handleSubmit} refContext={wrapperRef} friends = {friends}></SendToUsers>
                :
                <Login modalControl={open} refContext={wrapperRef}></Login>
            }
            
            <Snackbar open={snack} autoHideDuration={4000} onClose={snackbarClose} message={snackError ? "Error - ensure you are signed in." : "Success"} anchorOrigin={{vertical: "bottom", horizontal: "left"}}></Snackbar>
        </>
    )
}


const appContainer = document.createElement("div")
appContainer.id = "TwizzlyAppId"
const appStyles = document.createElement("style");
appStyles.innerHTML = `
  #${appContainer.id} {
  position: fixed;
  right: 0px;
  top: 0px; 
  z-index: 999;
  }
`;
document.body.appendChild(appStyles);
document.body.appendChild(appContainer);

const root = createRoot(appContainer);
root.render(<AppWrapper/>);
