const forms = document.querySelectorAll("form");
const mode = document.querySelector(".header__settings .fa-circle-half-stroke");
const inputValues = document.querySelector(".posts__input textarea");
const addBtn = document.querySelector(".posts__main-form button");
const bellNotificationBtn = document.querySelector(".fa-bell");
let id = 0;
let DataInLocalStorage = {
    modeFlag: false, // False: Light, True: Dark
    NotificationNumirator: 0
}

// ----------------------------------------------------------------
//  General
window.addEventListener('beforeunload', function () {
    scrollToTop();
});
function scrollToTop() {
    window.scrollTo(0, 0);
}

forms.forEach(form => {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
    })
})

// Mode & Notification Enumirator
if (localStorage.getItem("data")) {
    if (JSON.parse(localStorage.getItem("data")).modeFlag == true) {
        document.querySelector('html').classList.add("dark-mode");
        DataInLocalStorage.modeFlag = true;
    }
    if (JSON.parse(localStorage.getItem("data")).NotificationNumirator > 0) {
        document.querySelector(".header__bell-noitce").classList.remove("hidden");
        DataInLocalStorage.NotificationNumirator = document.querySelector(".header__bell-noitce").innerHTML = JSON.parse(localStorage.getItem("data")).NotificationNumirator;
    }
}

// GET
async function getPostsFromDB() {
    document.querySelector(".posts__posts-container").innerHTML = "";
    await fetch('http://localhost:3000/post')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (!data.length <= 0) {
                data.forEach(obj => {
                    displayPost(obj.postText, obj.id, obj.like);
                    if (+obj.id > id) {
                        id = obj.id;
                    }
                });
                id++;
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
getPostsFromDB()

// POST
async function addPostInDB(postObj) {
    await fetch('http://localhost:3000/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postObj)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
    });
}

// PUT 
async function updatePostInDB(postId, postObj) {
    await fetch(`http://localhost:3000/post/${postId}/`, {
        method: 'PUT',
        body: JSON.stringify(postObj)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
    });
}

// Delete
async function deletePostInDB(postId) {
    await fetch(`http://localhost:3000/post/${postId}/`, {
        method: 'DELETE',
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
    });
}
// ----------------------------------------------------------------
// Navbar
mode.parentElement.addEventListener('click', function () {
    document.querySelector('html').classList.toggle("dark-mode");
    if (!DataInLocalStorage.modeFlag) {
        DataInLocalStorage.modeFlag = true;
        localStorage.setItem("data", JSON.stringify(DataInLocalStorage))
    }
    else {
        DataInLocalStorage.modeFlag = false;
        localStorage.setItem("data", JSON.stringify(DataInLocalStorage))
    }
})


// Alert DOT Behaviour when like
function addNotificationNumirator() {
    if (DataInLocalStorage.NotificationNumirator > 0) {
        document.querySelector(".header__bell-noitce").classList.remove("hidden");
        document.querySelector(".header__bell-noitce").innerHTML = DataInLocalStorage.NotificationNumirator;
        localStorage.setItem("data", JSON.stringify(DataInLocalStorage));
    }

}

function removeNotificationNumirator() {
    if (DataInLocalStorage.NotificationNumirator <= 0 | DataInLocalStorage.NotificationNumirator == "") {
        document.querySelector(".header__bell-noitce").innerHTML = DataInLocalStorage.NotificationNumirator = "";
        console.log(document.querySelector(".header__bell-noitce"));
        document.querySelector(".header__bell-noitce").classList.add("hidden");
    }
    else {
        document.querySelector(".header__bell-noitce").innerHTML = DataInLocalStorage.NotificationNumirator;
    }
    localStorage.setItem("data", JSON.stringify(DataInLocalStorage));
}

function animateLikeNotification() {
    const popupContainer = document.querySelector(".header__popup-container");
    const popupElement = document.createElement("li");
    popupElement.setAttribute("class", "header__popup");
    popupElement.innerHTML = `You have ${DataInLocalStorage.NotificationNumirator} likes!`;
    popupContainer.appendChild(popupElement);
    setTimeout(() => {
        popupContainer.removeChild(popupElement);
    }, 5000);
}

bellNotificationBtn.addEventListener("click", animateLikeNotification)

// ----------------------------------------------------------------
// Posts Section
addBtn.addEventListener("click", function (e) {
    if (inputValues.value) {
        let inputValue = inputValues.value;
        createPostObj(inputValue);
        displayPost(inputValue, id - 1, false);
        inputValues.value = "";
    }
})

function createPostObj(val) {
    const postObj = {
        "id": id + "",
        "title": "User",
        "author": "Ahmed",
        "profileId": 1,
        "like": false,
        "postText": val
    }
    addPostInDB(postObj)
    id++;
}

// General function to display posts
function displayPost(val, id, likeStatus) {
    let container = document.querySelector(".posts__posts-container");
    let postBody = document.createElement("li");
    postBody.setAttribute("class", "posts__post")
    postBody.setAttribute("postId", id)
    postBody.setAttribute("isLike", likeStatus)

    postBody.innerHTML = `            
            <div class="posts__post-header">
                <div class="posts__post-img">
                    <img src="assets/images/serious-man-3760373.png" alt="Profile image">
                </div>
                <h3>User Name</h3>
            </div>
            <div class="posts__post__edit hidden">
                <textarea placeholder="What is on your mind?"></textarea>
            </div>
            <p>${val}</p>
            <div class="error hidden">Youre editing this post, you must write content!</div>`;

    postActionBtns = document.createElement("div");
    postActionBtns.setAttribute("class", "posts__post-actions");

    likeAction = document.createElement("button");
    likeAction.setAttribute("class", "blue-btn");
    if (likeStatus) {
        likeAction.innerHTML = "Unlike";
    }
    else if (!likeStatus) {
        likeAction.innerHTML = "Like";
    }
    likeAction.addEventListener("click", async function (e) {
        likeBehaviour(this);
    })

    editAction = document.createElement("button");
    editAction.setAttribute("class", "blue-btn");
    editAction.setAttribute("btnFunctionality", "edit");
    editAction.innerHTML = "Edit";
    editAction.addEventListener("click", async function (e) {
        editBehaviour(this);
    })

    doneAction = document.createElement("button");
    doneAction.setAttribute("class", "blue-btn");
    doneAction.setAttribute("btnFunctionality", "done");
    doneAction.classList.add("hidden");
    doneAction.innerHTML = "Done";
    doneAction.addEventListener("click", async function (e) {
        doneBehaviour(this);
    })

    deleteAction = document.createElement("button");
    deleteAction.setAttribute("class", "red-btn");
    deleteAction.innerHTML = "Delete";
    deleteAction.addEventListener("click", async function (e) {
        deleteBehaviour(this);
    })

    postActionBtns.appendChild(likeAction);
    postActionBtns.appendChild(editAction);
    postActionBtns.appendChild(doneAction);
    postActionBtns.appendChild(deleteAction);

    postBody.appendChild(postActionBtns);
    container.appendChild(postBody);
}

// Like Behaviour
function likeBehaviour(btn) {
    const postIsLike = btn.parentElement.parentElement.getAttribute("isLike");
    const postId = btn.parentElement.parentElement.getAttribute("postId");
    const postVal = btn.parentElement.previousSibling.previousSibling.previousSibling.innerHTML;
    if (postIsLike == "false") {
        btn.innerHTML = "Unlike"
        const updatedPostObj = {
            "id": postId + "",
            "title": "User",
            "author": "Ahmed",
            "profileId": 1,
            "like": true,
            "postText": postVal
        }
        updatePostInDB(postId, updatedPostObj);
        btn.parentElement.parentElement.setAttribute("isLike", "true");
        DataInLocalStorage.NotificationNumirator++;
        addNotificationNumirator();
        animateLikeNotification();
    }
    else {
        btn.innerHTML = "Like";
        const updatedPostObj = {
            "id": postId + "",
            "title": "User",
            "author": "Ahmed",
            "profileId": 1,
            "like": false,
            "postText": postVal
        }
        updatePostInDB(postId, updatedPostObj);
        btn.parentElement.parentElement.setAttribute("isLike", "false");
        DataInLocalStorage.NotificationNumirator--;
        removeNotificationNumirator();
    }
}

// Edit Behaviour
function editBehaviour(btn) {
    const ListId = btn.parentElement.parentElement.getAttribute("postId");
    const revealContainer = btn.parentElement.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling;
    const revealDoneBtn = btn.parentElement.querySelector(`[btnFunctionality="done"]`);
    const valueToEdit = document.querySelector(`[postId="${ListId}"] p`).innerHTML;
    revealDoneBtn.classList.remove("hidden");
    btn.classList.add("hidden");
    revealContainer.classList.remove("hidden");
    revealContainer.querySelector("textarea").innerHTML = valueToEdit;

}

// Done Behaviour
function doneBehaviour(btn) {
    const hideContainer = btn.parentElement.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling;
    const ListId = btn.parentElement.parentElement.getAttribute("postId");
    if (hideContainer.querySelector("textarea").value) {
        const hideEditBtn = btn.parentElement.querySelector(`[btnFunctionality="edit"]`);
        const valueToEdit = hideContainer.querySelector("textarea").value;
        btn.classList.add("hidden");
        hideEditBtn.classList.remove("hidden");
        hideContainer.classList.add("hidden");
        document.querySelector(`[postId="${ListId}"] p`).innerHTML = valueToEdit;
        if (!document.querySelector(`[postId="${ListId}"] .error`).classList.contains(".hidden")) {
            document.querySelector(`[postId="${ListId}"] .error`).classList.add("hidden");
        }
        const updatedPostObj = {
            "id": ListId + "",
            "title": "User",
            "author": "Ahmed",
            "profileId": 1,
            "like": false,
            "postText": valueToEdit
        }
        updatePostInDB(ListId, updatedPostObj);
        handleNotificationWhileDeleteAndUpdate(btn);
        btn.parentElement.parentElement.setAttribute("isLike", "false");
        btn.previousSibling.previousSibling.innerHTML = "Like";
    }
    else {
        document.querySelector(`[postId="${ListId}"] .error`).classList.remove("hidden");
        document.querySelectorAll("button").forEach(btn => {
            if (btn.innerHTML == "Edit") {
            }
        })
    }
}

// Delete Behaviour
async function deleteBehaviour(btn) {
    const postId = btn.parentElement.parentElement.getAttribute("postId");
    btn.parentElement.parentElement.remove();
    await deletePostInDB(postId);
    handleNotificationWhileDeleteAndUpdate(btn)
}

function handleNotificationWhileDeleteAndUpdate(btn) {
    if (btn.parentElement.parentElement.getAttribute("isLike") == "true") {
        DataInLocalStorage.NotificationNumirator--;
        localStorage.setItem("data", JSON.stringify(DataInLocalStorage));
        if (DataInLocalStorage.NotificationNumirator > 0) {
            document.querySelector(".header__bell-noitce").innerHTML = DataInLocalStorage.NotificationNumirator;
        }
        else {
            document.querySelector(".header__bell-noitce").classList.add("hidden");
        }
    }
}

// API Setup
const GEMINI_API_KEY = "AIzaSyAS0uSxL6yeZO5_1oLH3Rzet7RZQIu5mgQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const chatHistory = [];

async function generateResponse(userMessage) {
    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: chatHistory
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Unknown error");
        // Get Gemini's reply
        console.log((data));
        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        // Add Gemini's reply to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: geminiReply }]
        });
        console.log("Gemini:", geminiReply);
        return geminiReply;
    } catch (error) {
        console.error(error);
        return "Sorry, there was an error.";
    }
}

generateResponse("can you give me names of 5 songs for Eminem?");