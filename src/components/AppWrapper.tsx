import React, {useState, useEffect, useRef} from 'react';
//import axios from 'axios';
//import Login from '../components/Login'
import { createRoot } from 'react-dom/client'
//import jwtDecode from "jwt-decode";
import SendToUsers from './SendToUsers';
import {Snackbar} from '@mui/material';


function useOutsideAlerter(ref, setOpen) {
    console.log("useOutsideAlerter");
    useEffect(() => {
        console.log("OUTSIDE - EFFECT");
        function handleClickOutside(event) {
            console.log("OUTSIDE - CLICK");
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

const AppWrapper = () => {
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef(null)
    useOutsideAlerter(wrapperRef, setOpen)
    const [snack, setSnackBar] = useState(false);
    const [snackError, setSnackError] = useState(false);

    const handleSubmit = (to, body) => {
        console.log("firing");
        console.log(to);
        console.log(body);
        const message = {
                id: "PostSharedLink",
                body:{
                    recipientHandle: to,
                    messageBody: body, 
                }
        }
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
                if(event.altKey && event.key == 's'){
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
    

    return (
        <>
            <SendToUsers openModal={open} handleSubmit={handleSubmit} refContext={wrapperRef}></SendToUsers>
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
