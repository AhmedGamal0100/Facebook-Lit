const loginForm = document.querySelector(".login__login-form");
const emailInput = document.querySelector("#email")
const passwordInput = document.querySelector("#password")
let profiles;


// GET
async function getProfilesFromDb() {
    try {
        const response = await fetch('https://pricey-stream-makeup.glitch.me/profile')
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        return "Sorry, there was an error.";
    }
}
async function initProfiles() {
    profiles = await getProfilesFromDb();
}
initProfiles();


// Login
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = profiles.some(profile => emailInput.value == profile.email & passwordInput.value == profile.password)
    if (val == false) {
        document.querySelector(".login-error").classList.remove("hidden");
    } else {
        let loginProfile = {};
        profiles.forEach(profile => {
            if (emailInput.value == profile.email & passwordInput.value == profile.password) {
                loginProfile.id = profile.id;
                loginProfile.userName = profile.userName;
                loginProfile.imgURL = profile.imgURL
                console.log(profile);
                
                addLoginObjInSession(loginProfile);
                loginRouting();
            }
        })
    }
})

function addLoginObjInSession(loginObj) {
    sessionStorage.setItem("loginProfile", JSON.stringify(loginObj));
}

function loginRouting() {
    if (sessionStorage.getItem("loginProfile")) {
        window.open("home.html", "_self");
    }
}