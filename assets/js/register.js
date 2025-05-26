let id = 0;
const registerForm = document.querySelector(".register__form");
const fullName = document.querySelector("#name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirm-password");
const picInput = document.getElementById("profile-pic");
const picPreview = document.getElementById("pic-preview");
let profiles;
let imgURL;
// ---------------------------------------------------
// General

// GET
async function getProfilesFromDb() {
    try {
        const response = await fetch('http://localhost:3000/profile')
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        data.forEach(profile => {
            if (profile.id > id) {
                id = profile.id;
            }
        })
        id++;
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

// POST
async function addProfilesFInDb(profileObj) {
    try {
        const response = await fetch('http://localhost:3000/profile', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileObj)
        })
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

// ---------------------------------------------------
picInput.addEventListener("change", function () {
    const file = picInput.files[0];
    if (file) {
        document.querySelector(".register__pic-preview").classList.remove("hidden");
        picPreview.src = `assets/images/${file.name}`;
        imgURL = `assets/images/${file.name}`;
        console.log(imgURL);
        
    }
});

// Register
registerForm.addEventListener("submit", function (e) {
    let flag = false;
    e.preventDefault();
    profiles.forEach(profile => {
        if (email.value == profile.email) {
            flag = true;
        }
    });
    if (!flag == true) {
        if (!document.querySelector(".email-error").classList.contains("hidden")) {
            document.querySelector(".email-error").classList.add("hidden");
        }
        if (password.value == confirmPassword.value) {
            if (!document.querySelector(".password-error").classList.contains("hidden")) {
                document.querySelector(".password-error").classList.add("hidden");
            }
            createProfileObj(fullName.value, email.value, password.value, imgURL);
        }
        else {
            document.querySelector(".password-error").classList.remove("hidden");
        }
    }
    else {
        document.querySelector(".email-error").classList.remove("hidden");
    }
})

function createProfileObj(fullName, email, password, imgURL) {
    const profileObj = {
        "id": id + "",
        "userName": fullName,
        "email": email,
        "password": password,
        "imgURL": imgURL
    }
    addProfilesFInDb(profileObj);
    window.open("index.html", "_self");
}