import axios from 'axios';
import fetchAdaptor from '@vespaiach/axios-fetch-adapter'; 
import jwtDecode from 'jwt-decode'; 
var events = require('events');
var eventEmitter = new events.EventEmitter();
var baseUrl; 
chrome.management.get(chrome.runtime.id, function (extensionInfo) {
    if (extensionInfo.installType === 'development') {
      console.log("DevelopmentMode");
      baseUrl = 'http://localhost:5001/twizzly-application/us-central1/api'
    }else{
        console.log("Production Mode");
        baseUrl="https://us-central1-twizzly-application.cloudfunctions.net/api"
    }
});
//SETUP
const axiosInstance = axios.create({
    baseURL: baseUrl,
    adapter: fetchAdaptor
})
let friends = [];




//LOGGED IN USER ACTIONS
async function postSharedLink(message){
    try{
        const response = await axiosInstance.post('/sharelink', message);
        return true; 
    }catch(error){
        if(error.data.error === "Unauthorized"){

        }
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
        console.log("Got Notifications from API");
        console.log(response.data.length);
        console.log(response.data);
        return response.data.length; 
    }catch(error){
        console.log(error.response)
    }
}

//AUTHORIZATION USER ACTIONS
function setAuthorizationHeader(token){
    console.log("Setting auth header");
    const TAppIdToken = `Bearer ${token}`;
    axiosInstance.defaults.headers.common['Authorization'] = TAppIdToken;//In this instance use Axios global and set the header;
};

async function GetCredentialsAdmin(){
    try{
        console.log("Getting credentials");
        //background has not gone idle
        const TAppIdToken = (await chrome.storage.local.get(["TAppIdToken"])).TAppIdToken;
        if(TAppIdToken){
            console.log("Token load from local storage");
            let decoded: any = jwtDecode(TAppIdToken)
            if(decoded.exp *1000 < Date.now()){
                let token = await getLoginBearerToken();
                if(token) {setAuthorizationHeader(token); return true;}
                return false; 
            }else{
                //App token is good
                setAuthorizationHeader(TAppIdToken);
                return true
            }
        }else{
            console.log("Getting token from API")
            let token = await getLoginBearerToken();
            if(token) {setAuthorizationHeader(token); return true;}
            return false; 
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
            console.log("Notifications alarm set.")
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
        case "LoginToHomePage":
            sendResponse(axiosInstance.defaults.headers.common['Authorization'])
            return true;  
        default:
            sendResponse("Front the background Script");   
    }
})

chrome.alarms.onAlarm.addListener(async (alarm)=>{
    console.log("Getting and setting notifications!")
    if(alarm.name === "GetNotifications"){
        let notifications  = await GetAndSetNotifications()
        console.log("The number of notification is:", notifications);
        if(notifications > 0){
            chrome.action.setBadgeText({text: String(notifications)})
        }else{
            chrome.action.setBadgeText({text: ""})
        }
    }
})

chrome.runtime.onInstalled.addListener(async (tab) => {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const email = (await chrome.storage.local.get(["Email"])).Email;
    const password = (await chrome.storage.local.get(["Password"])).Password;
    console.log(email)
    console.log(password)
    if(!email && !password){
        SetBadgeText("OFF"); 
    }else{
        console.log("ON");
        let tokenIsSet = await GetCredentialsAdmin();
        console.log("Credentials loaded on install...")
        tokenIsSet ? SetBadgeText("ON") : console.log("On install error");
        
    }
});

