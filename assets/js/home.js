const forms = document.querySelectorAll("form");
const mode = document.querySelector(".header__settings .fa-circle-half-stroke");
const inputValues = document.querySelector(".posts__input textarea");
const addBtn = document.querySelector(".posts__main-form button");
const bellNotificationBtn = document.querySelector(".fa-bell");
const searchInout = document.querySelector(".header__search input");
let id = 0;
let DataInLocalStorage = {
    modeFlag: false, // False: Light, True: Dark
    NotificationNumirator: 0,
    isClosedChatPortal: false // False: Opened, True: Closed
}
let editingCommentElement = null;
const GEMINI_API_KEY = "AIzaSyAS0uSxL6yeZO5_1oLH3Rzet7RZQIu5mgQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const chatHistory = [];
const geminiInputBtn = document.querySelector(".fa-paper-plane");
const chatPortal = document.querySelector(".chatport__header button");
const geminiCloseBtn = document.querySelector(".chatport");
const geminiRevealBtn = document.querySelector(".chatport-btn");
const postsBody = document.querySelector(".posts");
let profile = {};

// ----------------------------------------------------------------
//  General

// Gets the logged in profile informations and use them
profile = JSON.parse(sessionStorage.getItem("loginProfile"));
document.querySelector(".header__profile-dropdown h3").innerHTML = profile.userName;
document.querySelector(".header__profile-img img").setAttribute("src", `${profile.imgURL}`)

// When refreshing the page scroll to the top of it
window.addEventListener('beforeunload', function () {
    scrollToTop();
});

function scrollToTop() {
    window.scrollTo(0, 0);
}

// Forms stop propagation
forms.forEach(form => {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
    })
})

// Mode & Notification Enumirator & ChatPortal
if (localStorage.getItem("data")) {
    if (JSON.parse(localStorage.getItem("data")).modeFlag == true) {
        document.querySelector('html').classList.add("dark-mode");
        DataInLocalStorage.modeFlag = true;
    }
    if (JSON.parse(localStorage.getItem("data")).NotificationNumirator > 0) {
        document.querySelector(".header__bell-noitce").classList.remove("hidden");
        DataInLocalStorage.NotificationNumirator = document.querySelector(".header__bell-noitce").innerHTML = JSON.parse(localStorage.getItem("data")).NotificationNumirator;
    }
    if (JSON.parse(localStorage.getItem("data")).isClosedChatPortal == true) {
        closeChatPort();
        DataInLocalStorage.isClosedChatPortal = true;
    } else {
        openChatPort();
        DataInLocalStorage.isClosedChatPortal = false;
    }
}

// GET
async function getPostsFromDB() {
    document.querySelector(".posts__posts-container").innerHTML = "";
    await fetch('https://pricey-stream-makeup.glitch.me/post')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (!data.length <= 0) {
                data.forEach(obj => {
                    displayPost(obj.postText, obj.id, obj.like, obj.author, obj.imgURL);
                    if (+obj.id > id) {
                        id = obj.id;
                    }
                    if (obj.comments.length > 0) {
                        const postContainer = document.querySelector(`[postId = "${obj.id}"]`);
                        const commentBtn = postContainer.querySelector(`[btnFunctionality = "comment"]`);
                        const commentContainer = postContainer.querySelector(".comments-container");
                        previewCommentWindowOnLoad(commentBtn, commentContainer, obj.comments, obj.id);
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
    await fetch('https://pricey-stream-makeup.glitch.me/post', {
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

// PATCH
async function updatePostInDB(postId, postObj) {
    await fetch(`https://pricey-stream-makeup.glitch.me/post/${postId}`, {
        method: 'PATCH',
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

// Delete
async function deletePostInDB(postId) {
    await fetch(`https://pricey-stream-makeup.glitch.me/post/${postId}`, {
        method: 'DELETE',
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
    });
}

// ----------------------------------------------------------------
// Navbar

// Dark and light mode & save its flag inside the local storage
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

// Get the number of the liked posts and set its enumirator in the page & local storage
function addNotificationNumirator() {
    if (DataInLocalStorage.NotificationNumirator > 0) {
        document.querySelector(".header__bell-noitce").classList.remove("hidden");
        document.querySelector(".header__bell-noitce").innerHTML = DataInLocalStorage.NotificationNumirator;
        localStorage.setItem("data", JSON.stringify(DataInLocalStorage));
    }
}

// Remove the enumirator in the page
function removeNotificationNumirator() {
    if (DataInLocalStorage.NotificationNumirator <= 0 | DataInLocalStorage.NotificationNumirator == "") {
        document.querySelector(".header__bell-noitce").innerHTML = DataInLocalStorage.NotificationNumirator = "";
        document.querySelector(".header__bell-noitce").classList.add("hidden");
    }
    else {
        document.querySelector(".header__bell-noitce").innerHTML = DataInLocalStorage.NotificationNumirator;
    }
    localStorage.setItem("data", JSON.stringify(DataInLocalStorage));
}

// Ainmation when press like
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

bellNotificationBtn.addEventListener("click", animateLikeNotification);

// Search event
searchInout.addEventListener("input", function (e) {
    const searchValue = e.target.value.toLowerCase();
    let postsArray = Array.from(document.querySelectorAll(".posts__post"))
    postsArray.filter(post => {
        const paragraphs = Array.from(post.querySelectorAll("p"))
        const match = paragraphs.some(paragraph =>
            paragraph.innerHTML.toLowerCase().includes(searchValue)
        );
        if (searchValue && !match) {
            post.classList.add("hidden");
        } else {
            post.classList.remove("hidden");
        }
    })
})

// Logging Out
function logOut() {
    sessionStorage.removeItem("loginProfile");
    window.open("index.html", "_self")
}

// ----------------------------------------------------------------
// Posts Section

// Set the image of creating the post
document.querySelector(".posts__img img").setAttribute("src", `${profile.imgURL}`)

// Add new post event
addBtn.addEventListener("click", function (e) {
    if (inputValues.value) {
        let inputValue = inputValues.value;
        createPostObj(inputValue);
        displayPost(inputValue, id - 1, false, profile.userName, profile.imgURL);
        inputValues.value = "";
    }
})

// Creating new object of the post and add it in the db
function createPostObj(val) {
    const postObj = {
        "id": id + "",
        "title": "User",
        "author": profile.userName,
        "profileId": profile.id,
        "like": false,
        "postText": val,
        "comments": [],
        "imgURL": profile.imgURL
    }
    addPostInDB(postObj)
    id++;
}

// Add new comment data in the post object inside the db
function addCommentToPostObj(postId, comments) {
    const postObj = {
        "comments": comments
    }
    updatePostInDB(postId, postObj)
}

// General function to display posts
function displayPost(val, id, likeStatus, userName, URL) {
    let container = document.querySelector(".posts__posts-container");
    let postBody = document.createElement("li");
    postBody.setAttribute("class", "posts__post")
    postBody.setAttribute("postId", id)
    postBody.setAttribute("isLike", likeStatus)

    postBody.innerHTML = `            
            <div class="posts__post-header">
                <div class="posts__post-img">
                    <img src=${URL} alt="Profile image">
                </div>
                <h3>${userName}</h3>
            </div>
            <div class="posts__post__edit hidden">
                <textarea placeholder="What is on your mind?"></textarea>
            </div>
            <p class="posts__content">${val}</p>
            <div class="error hidden">Youre editing this post, you must write content!</div>`;

    postActionBtns = document.createElement("div");
    postActionBtns.setAttribute("class", "posts__post-actions");

    likeAction = document.createElement("button");
    likeAction.setAttribute("class", "blue-btn");
    if (likeStatus == true | likeStatus == "true") {
        likeAction.innerHTML = "Unlike";
    }
    else if (likeStatus == false | likeStatus == "false") {
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

    commentAction = document.createElement("button");
    commentAction.setAttribute("class", "blue-btn");
    commentAction.setAttribute("btnFunctionality", "comment");
    commentAction.innerHTML = "Comment";
    commentAction.addEventListener("click", async function (e) {
        commentBehaviour(this);
    })

    postActionBtns.appendChild(likeAction);
    postActionBtns.appendChild(editAction);
    postActionBtns.appendChild(doneAction);
    postActionBtns.appendChild(commentAction);
    postActionBtns.appendChild(deleteAction);
    postBody.appendChild(postActionBtns);

    commentContainer = document.createElement("ul");
    commentContainer.setAttribute("class", "comments-container hidden");

    postBody.appendChild(commentContainer);
    container.appendChild(postBody);
}

// Like button to like the post
function likeBehaviour(btn) {
    const postIsLike = btn.parentElement.parentElement.getAttribute("isLike");
    const postId = btn.parentElement.parentElement.getAttribute("postId");
    if (postIsLike == "false") {
        btn.innerHTML = "Unlike"
        const updatedPostObj = {
            "like": true,

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
            "like": false
        }
        updatePostInDB(postId, updatedPostObj);
        btn.parentElement.parentElement.setAttribute("isLike", "false");
        DataInLocalStorage.NotificationNumirator--;
        removeNotificationNumirator();
    }
}

// Edit button to edit the post
function editBehaviour(btn) {
    const postId = btn.parentElement.parentElement.getAttribute("postId");
    const revealContainer = btn.parentElement.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling;
    const revealDoneBtn = btn.parentElement.querySelector(`[btnFunctionality="done"]`);
    const valueToEdit = document.querySelector(`[postId="${postId}"] p`).innerHTML;
    revealDoneBtn.classList.remove("hidden");
    btn.classList.add("hidden");
    revealContainer.classList.remove("hidden");
    revealContainer.querySelector("textarea").innerHTML = valueToEdit;
}

// Done button to finish editing the post
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

// Delete button to delete the post
async function deleteBehaviour(btn) {
    const postId = btn.parentElement.parentElement.getAttribute("postId");
    btn.parentElement.parentElement.remove();
    await deletePostInDB(postId);
    handleNotificationWhileDeleteAndUpdate(btn)
}

// Comment button to display the new comment section in the post
function commentBehaviour(btn) {
    let comments = [];
    const commentContainer = btn.parentElement.parentElement.querySelector(".comments-container");
    const postId = btn.parentElement.parentElement.getAttribute("postId");

    let commentContainerForm;
    let commentFormAddBtn;
    let commentFormDoneBtn;
    if (commentContainer.classList.contains("hidden")) {
        commentContainer.classList.remove("hidden");
        btn.disabled = true;
    }

    commentInput = document.createElement("li");
    commentInput.setAttribute("class", "comments__input");
    commentInput.innerHTML += `
        <form>
            <input placeholder="Write your comment..." type="text"></input>
        </form>
    `
    commentFormAddBtn = document.createElement("button");
    commentFormAddBtn.setAttribute("class", "blue-btn");
    commentFormAddBtn.setAttribute("behaviour", "add");
    commentFormAddBtn.innerHTML = "add";
    commentFormAddBtn.addEventListener("click", function (e) {
        addComment(commentContainer, postId);
    });

    commentFormDoneBtn = document.createElement("button");
    commentFormDoneBtn.setAttribute("class", "blue-btn hidden");
    commentFormDoneBtn.setAttribute("behaviour", "edit");
    commentFormDoneBtn.innerHTML = "done";
    commentFormDoneBtn.addEventListener("click", function (e) {
        doneComment(commentContainer, postId, comments);
    })

    commentContainer.appendChild(commentInput);
    commentContainerForm = commentContainer.querySelector("form");
    commentContainerForm.appendChild(commentFormAddBtn);
    commentContainerForm.appendChild(commentFormDoneBtn);
    commentContainerForm.addEventListener("submit", function (e) { e.preventDefault() });
}

// Add new comment
function addComment(commentContainer, postId) {
    comments = getCommentsForDoneBtn(commentContainer);
    const inputValues = commentContainer.querySelector("input");
    if (inputValues.value) {
        let inputValue = inputValues.value;
        const commentObj = {
            authorId: profile.id,
            authorImgURL: profile.imgURL,
            text: inputValue
        };
        comments.push(commentObj);
        addCommentToPostObj(postId, comments);
        displayComment(commentContainer, commentObj);
        inputValues.value = "";
    }
}

// Done editing the comment
function doneComment(commentContainer, postId, comments) {
    const inputValues = commentContainer.querySelector("input");
    if (inputValues.value) {
        let inputValue = inputValues.value;
        if (editingCommentElement) {
            editingCommentElement.querySelector("p").innerHTML = inputValue;
            editingCommentElement = null;
        } else {
            comments.push({
                authorId: profile.id,
                authorImgURL: profile.imgURL,
                text: inputValue
            });
            displayComment(commentContainer, {
                authorId: profile.id,
                authorImgURL: profile.imgURL,
                text: inputValue
            });
        }
        addCommentToPostObj(postId, getCommentsForDoneBtn(commentContainer));
        inputValues.value = "";
    }
    commentContainer.querySelector("[behaviour = 'edit']").classList.add("hidden")
    commentContainer.querySelector("[behaviour = 'add']").classList.remove("hidden")
    commentContainer.querySelectorAll("button").forEach(btn => {
        if (!btn.getAttribute("behaviour")) {
            btn.disabled = false;
        }
    })
}

// Display the comment inside the comment list
function displayComment(commentContainer, commentObj) {
    const comment = document.createElement("li");
    comment.setAttribute("class", "comments__comment");
    comment.dataset.authorId = commentObj.authorId;
    comment.dataset.authorImgurl = commentObj.authorImgURL;
    comment.innerHTML += `
            <div class="comments__img"><img src="${commentObj.authorImgURL}"></div>
            <p>${commentObj.text}</p>
            <ul class="comments__actions">
            </ul>
        `
    commentContainer.appendChild(comment);
    const commentBtnsContainer = comment.querySelector(".comments__actions");
    const commentBtnEditContainer = document.createElement("li");
    const commentBtnEdit = document.createElement("button");
    commentBtnEdit.setAttribute("class", "blue-btn");
    commentBtnEdit.innerHTML = "edit";
    commentBtnEdit.addEventListener("click", function (e) {
        btnEditComments(e);
    })
    commentBtnEditContainer.appendChild(commentBtnEdit)
    const commentBtnDeleteContainer = document.createElement("li");
    const commentBtnDelte = document.createElement("button");
    commentBtnDelte.setAttribute("class", "red-btn");
    commentBtnDelte.innerHTML = "delete";
    commentBtnDelte.addEventListener("click", function (e) {
        deleteEditComments(e);
    })
    commentBtnDeleteContainer.appendChild(commentBtnDelte)
    commentBtnsContainer.appendChild(commentBtnEditContainer)
    commentBtnsContainer.appendChild(commentBtnDeleteContainer)

}

// Notification behaviour when delete or update the post 
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

// General preview for the comment when refresh the page
function previewCommentWindowOnLoad(commentBtn, commentContainer, inputValues, postId) {
    commentContainer.classList.remove("hidden")
    let commentContainerForm;
    let commentFormAddBtn;
    let commentFormDoneBtn;
    commentBtn.disabled = true;
    commentInput = document.createElement("li");
    commentInput.setAttribute("class", "comments__input");
    commentInput.innerHTML += `
        <form>
            <input placeholder="Write your comment..." type="text"></input>
        </form>
    `
    commentFormAddBtn = document.createElement("button");
    commentFormAddBtn.setAttribute("class", "blue-btn");
    commentFormAddBtn.setAttribute("behaviour", "add");
    commentFormAddBtn.innerHTML = "add";
    commentFormAddBtn.addEventListener("click", function (e) {
        addComment(commentContainer, postId);
    })

    commentFormDoneBtn = document.createElement("button");
    commentFormDoneBtn.setAttribute("class", "blue-btn hidden");
    commentFormDoneBtn.setAttribute("behaviour", "edit");
    commentFormDoneBtn.innerHTML = "done";
    commentFormDoneBtn.addEventListener("click", function (e) {
        doneComment(commentContainer, postId, inputValues);
    })

    commentContainer.appendChild(commentInput);
    commentContainerForm = commentContainer.querySelector("form");
    commentContainerForm.appendChild(commentFormAddBtn)
    commentContainerForm.appendChild(commentFormDoneBtn);
    commentContainerForm.addEventListener("submit", function (e) { e.preventDefault() });

    inputValues.forEach(inputValue => {
        const comment = document.createElement("li");
        comment.setAttribute("class", "comments__comment");
        comment.dataset.authorId = inputValue.authorId;
        comment.dataset.authorImgurl = inputValue.authorImgURL;
        comment.innerHTML += `
            <div class="comments__img"><img src="${inputValue.authorImgURL}"></div>
            <p>${inputValue.text}</p>
            <ul class="comments__actions">
            </ul>
        `
        commentContainer.appendChild(comment);
        const commentBtnsContainer = comment.querySelector(".comments__actions");

        const commentBtnEditContainer = document.createElement("li");
        const commentBtnEdit = document.createElement("button");
        commentBtnEdit.setAttribute("class", "blue-btn");
        commentBtnEdit.innerHTML = "edit";
        commentBtnEdit.addEventListener("click", function (e) {
            btnEditComments(e);
        })
        commentBtnEditContainer.appendChild(commentBtnEdit)

        const commentBtnDeleteContainer = document.createElement("li");
        const commentBtnDelte = document.createElement("button");
        commentBtnDelte.setAttribute("class", "red-btn");
        commentBtnDelte.innerHTML = "delete";
        commentBtnDelte.addEventListener("click", function (e) {
            deleteEditComments(e);
        })
        commentBtnDeleteContainer.appendChild(commentBtnDelte)

        commentBtnsContainer.appendChild(commentBtnEditContainer)
        commentBtnsContainer.appendChild(commentBtnDeleteContainer)
    });
}

// Getting all the comments tahat exist in the project for general uses based on the comments container
function getCommentsForDoneBtn(commentContainer) {
    let comments = [];
    commentContainer.querySelectorAll(".comments__comment").forEach(x => {
        comments.push({
            authorId: x.dataset.authorId || "",
            authorImgURL: x.dataset.authorImgurl,
            text: x.querySelector("p").innerHTML
        });
    });
    return comments;
}

// Getting all the comments tahat exist in the project for general uses based on the button
function getComments(btn) {
    let comments = [];
    btn.parentElement.nextSibling.querySelectorAll(".comments__comment").forEach(x => {
        comments.push({
            authorId: x.dataset.authorId,
            authorImgURL: x.dataset.authorImgurl,
            text: x.querySelector("p").innerHTML
        });
    })
    return comments
}

// Edit comment button & disable all the other buttons when editing
function btnEditComments(e) {
    const commentContainer = e.target.parentElement.parentElement.parentElement;
    editingCommentElement = commentContainer;
    const commentVal = commentContainer.querySelector("p").innerHTML;
    commentContainer.parentElement.querySelector("input").value = commentVal;
    if (commentContainer.parentElement.querySelector("[behaviour = 'edit']").classList.contains("hidden")) {
        commentContainer.parentElement.querySelector("[behaviour = 'edit']").classList.remove("hidden")
        commentContainer.parentElement.querySelector("[behaviour = 'add']").classList.add("hidden")
        commentContainer.parentElement.querySelectorAll("button").forEach(btn => {
            if (!btn.getAttribute("behaviour")) {
                btn.disabled = true;
            }
        })
    }
}

// Delete the comment
function deleteEditComments(e) {
    let commentsArr = [];
    const deletetdElement = e.target.parentElement.parentElement.parentElement;
    const postId = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute("postId");
    deletetdElement.classList.add("hidden");
    const comments = e.target.parentElement.parentElement.parentElement.parentElement.querySelectorAll(".comments__comment");
    const filteredCommentsArray = Array.prototype.slice.call(comments).filter(x => !x.classList.contains("hidden"));
    filteredCommentsArray.forEach(element => {
        commentsArr.push({
            authorId: element.dataset.authorId,
            authorImgURL: element.dataset.authorImgurl || 'assets/images/default-profile.png',
            text: element.querySelector("p").innerHTML
        });
    });
    deletetdElement.remove();
    addCommentToPostObj(postId, commentsArr);
}

// ----------------------------------------------------------------
// Chat Portal

// Close Gemini chat portal
geminiCloseBtn.querySelector(".fa-xmark").parentElement.addEventListener("click", function () {
    DataInLocalStorage.isClosedChatPortal = true;
    localStorage.setItem("data", JSON.stringify(DataInLocalStorage));
    closeChatPort();
})

function closeChatPort() {
    geminiCloseBtn.classList.add("hidden");
    geminiRevealBtn.classList.remove("hidden");
    postsBody.classList.add("posts-full-width")
}

// Reveal Gemini chat portal
geminiRevealBtn.querySelector("button").parentElement.addEventListener("click", function (e) {
    DataInLocalStorage.isClosedChatPortal = false;
    localStorage.setItem("data", JSON.stringify(DataInLocalStorage));
    openChatPort();
})

function openChatPort() {
    geminiCloseBtn.classList.remove("hidden");
    geminiRevealBtn.classList.add("hidden");
    postsBody.classList.remove("posts-full-width")
}

// Gemini Setup
async function generateResponse(userMessage) {
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
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*\*([^*]+)\*\*/g, "$1") || "No response";
        chatHistory.push({
            role: "model",
            parts: [{ text: geminiReply }]
        });
        return geminiReply;
    } catch (error) {
        console.error(error);
        return "Sorry, there was an error.";
    }
}

// Gemini Display functionality
geminiInputBtn.parentElement.addEventListener("click", async function (e) {
    const textInput = e.target.parentElement.parentElement.querySelector("textarea");
    const chatContainer = document.querySelector(".chatport__chat-container");

    if (textInput.value != "") {
        chatContainer.innerHTML += `<p class="chatport__user">${textInput.value}</p>`;
        const tempDiv = document.createElement("div");
        tempDiv.className = "chatport__gemini";
        tempDiv.innerHTML = `
            <div class="chatport__gemini-img rotate">
                <img src="assets/images/google-gemini-icon.svg" alt="gemini-icon">
            </div>
            <p class="chatport__chat-init">Just a sec...</p>
        `;
        chatContainer.appendChild(tempDiv);
        await new Promise(resolve => setTimeout(resolve, 600))
        const geminiReply = await generateResponse(textInput.value.trim());
        tempDiv.querySelector(".chatport__chat-init").innerHTML = (geminiReply || "No response").replace(/\n/g, "<br>");
        textInput.value = "";
    }
})