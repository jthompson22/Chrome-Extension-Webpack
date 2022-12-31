
//Load Bearer Token Upon Every Page
chrome.runtime.sendMessage({id: "LoadBearerToken"}, {}, (token) => {
    const TAppIdToken = `Bearer ${token}`;
    localStorage.setItem('TAppIdToken', TAppIdToken);
})


