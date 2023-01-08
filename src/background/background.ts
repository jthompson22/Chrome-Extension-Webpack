import axios from 'axios';
import fetchAdaptor from '@vespaiach/axios-fetch-adapter'; 
import jwtDecode from 'jwt-decode'; 
var events = require('events');
var eventEmitter = new events.EventEmitter();

//SETUP
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/twizzly-application/us-central1/api',
    adapter: fetchAdaptor
})
let friends = [];




//LOGGED IN USER ACTIONS
async function postSharedLink(message){
    try{
        const response = await axiosInstance.post('/sharelink', message);
        return true; 
    }catch(error){
        console.log(error.response.data)
        return false; 
    }
}

async function SetFriends(){
    try{
        const response = await axiosInstance.get('/getFriends');
        friends = response.data.friends 
    }catch(error){
        console.log(error.response.data)
    }
}
async function GetAndSetNotifications(){
    try{
        const response = await axiosInstance.get('/getNotifications');
        return String(response.data.notifications.length); 
    }catch(error){
        console.log(error.response.data)
    }
}

//AUTHORIZATION USER ACTIONS
function setAuthorizationHeader(token){;
    const TAppIdToken = `Bearer ${token}`;
    axiosInstance.defaults.headers.common['Authorization'] = TAppIdToken;//In this instance use Axios global and set the header;
};

async function GetCredentialsAdmin(){
    try{
        //background has not gone idle
        if(axiosInstance.defaults.headers.common['Authorization']){
            return true; 
        }else{
            const TAppIdToken = (await chrome.storage.local.get(["TAppIdToken"])).TAppIdToken;
            if(TAppIdToken){
                let decoded: any = jwtDecode(TAppIdToken)
                if(decoded.exp *1000 < Date.now()){
                    let token = await getLoginBearerToken();
                    return token ? (setAuthorizationHeader(token), true) : false
                }else{
                    //App token is good
                    return true
                }
            }else{
                let token = await getLoginBearerToken();
                return token ? (setAuthorizationHeader(token), true) : false
            }
        }
    }catch(error){
        console.log(error);
        return false;
    }
}

async function getLoginBearerToken(){
    try{
    console.log("Getting Bearer By Login")
    const email = (await chrome.storage.local.get(["Email"])).Email;
    const password = (await chrome.storage.local.get(["Password"])).Password;
    if(email && password){
        const response = await axiosInstance.post('/login', {"email": email, "password": password})
        await chrome.storage.local.set({"TAppIdToken": response.data.token});
        return response.data.token;
    }else{
        await SetBadgeText("OFF");
        return false; 
    }
    }catch(error){
        console.log(error)
        return false;
    }
}


async function SetBadgeText(on){
    if(on==="ON"){
        chrome.action.setBadgeText({text: ""}, ()=>{
            chrome.alarms.create(
                "GetNotifications",
                {periodInMinutes: 2, when: Date.now()}
            )
        })
    }else{
        chrome.action.setBadgeText({text: "OFF"})
    }
}


//EVENT LISTENERS
chrome.action.onClicked.addListener(async (tab) => {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const state = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    if(state === "OFF"){
        await chrome.scripting.executeScript({
            files: ["login.js"],
            target: { tabId: tab.id },
            });
    }else{
        chrome.tabs.update({url: "http://localhost:3000/"});
    } 
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch(msg.id){
        case "SaveCredentialsOnLogin":
            console.log("Saving Credentials")
            chrome.storage.local.set({"Email": msg.credentials.email, "Password": msg.credentials.password}).then(() => GetCredentialsAdmin()).then((tokenIsSet)=>{
                if(tokenIsSet){
                    console.log("Dispatching Logged in event!");
                    SetBadgeText("ON");
                    eventEmitter.emit('LoggedIn')
                    sendResponse(tokenIsSet);
                }else{
                    console.log("Uh oh, something went wrong")
                    sendResponse(tokenIsSet);
                }
                
                return true; 
            });
            return true; 
        case "LoadBearerToken":
            console.log("Loading Token")
            GetCredentialsAdmin().then((tokenIsSet) => {
                sendResponse(tokenIsSet)                
            }); 
            return true
        case "PostSharedLink":
            console.log("Posting")
            const messageBody = {...msg.body, url: sender.url}
            postSharedLink(messageBody).then((success)=> {
                sendResponse(success);
            })
            return true; 
        case "GetFriends":
            console.log("Getting Friends")
            if(friends.length === 0){
                SetFriends().then(()=> {
                    console.log("Got friends from API:")
                    sendResponse(friends)
                })
            }else{
                console.log("Got friends from Local")
                sendResponse(friends)
            }
            return true; 
        case "SetupLoginListener":
            console.log("Not logged in setting up login listener...")
            eventEmitter.on('LoggedIn', () => sendResponse())
            return true; 
        default:
            sendResponse("Front the background Script");   
    }
})

chrome.alarms.onAlarm.addListener(async (alarm)=>{
    if(alarm.name === "GetNotifications"){
        let notifications  = await GetAndSetNotifications()
        if(notifications){
            chrome.action.setBadgeText({text: notifications})
        }
    }
})

chrome.runtime.onInstalled.addListener(async (tab) => {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const email = (await chrome.storage.local.get(["Email"])).Email;
    const password = (await chrome.storage.local.get(["Password"])).Password;
    if(!email && !password){
        SetBadgeText("OFF"); 
    }
});

