import axios from 'axios';
import fetchAdaptor from '@vespaiach/axios-fetch-adapter'; 
import jwtDecode from 'jwt-decode'; 
//SETUP

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/twizzly-application/us-central1/api',
    adapter: fetchAdaptor
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(msg.id);
    console.log(sender);
    switch(msg.id){
        case "SaveCredentialsOnStartup":
            console.log("Saving Credentials")
            chrome.storage.local.set({"Email": msg.credentials.email, "Password": msg.credentials.password}).then(() => chrome.action.setBadgeText({text: "ON"})).then(() => {
                GetCredentialsAdmin(); 
            }).then((token)=>{
                setAuthorizationHeader(token);
                sendResponse("Set Token Successfully");
            });
            return true; 
        case "LoadBearerToken":
            console.log("Loading Token")
            GetCredentialsAdmin().then((token) => {
                if(token){
                    setAuthorizationHeader(token);
                    sendResponse("Load Token Successfully");
                }else{
                    sendResponse('User needs to login in.');
                    //Add tool tip here for user to login.
                } 
            }); 
            return true
        case "PostSharedLink":
            console.log("Posting")
            const messageBody = {...msg.body, url: sender.url}
            postSharedLink(messageBody).then((success)=> {
                sendResponse(success);
            })
            return true; 
        default:
            sendResponse("Front the background Script");   
    }
})

async function postSharedLink(message){
    try{
        const response = await axiosInstance.post('/sharelink', message);
        return true; 
    }catch(error){
        console.log(error.response.data)
        return false; 
    }
}


function setAuthorizationHeader(token){;
    const TAppIdToken = `Bearer ${token}`;
    axiosInstance.defaults.headers.common['Authorization'] = TAppIdToken;//In this instance use Axios global and set the header;
};

async function GetCredentialsAdmin(){
    try{
        const TAppIdToken = (await chrome.storage.local.get(["TAppIdToken"])).TAppIdToken;
        if(TAppIdToken){
            let decoded: any = jwtDecode(TAppIdToken)
            if(decoded.exp *1000 < Date.now()){
                return await getLoginBearerToken(); 
            }else{
                return TAppIdToken; //optionally added Bearer here
            }
        }else{
            return await getLoginBearerToken(); 
        }
    }catch(error){
        console.log(error);
    }
}

async function getLoginBearerToken(){
    try{
    console.log("Getting Bearer")
    const email = (await chrome.storage.local.get(["Email"])).Email;
    const password = (await chrome.storage.local.get(["Password"])).Password;
    if(email && password){
        const response = await axiosInstance.post('/login', {"email": email, "password": password})
        await chrome.storage.local.set({"TAppIdToken": response.data.token});
        return response.data.token;
    }else{
        await chrome.action.setBadgeText({
            text: "OFF",
        });
        return false; 
    }
    }catch(error){
        console.log(error)
    }
}


chrome.runtime.onInstalled.addListener(() => {
    //Add getter here since it happens on page reload.
    chrome.action.setBadgeText({
        text: "OFF",
    });
});