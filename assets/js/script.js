const forms = document.querySelectorAll("form");
const mode = document.querySelector(".header__settings .fa-circle-half-stroke");
const inputValues = document.querySelector(".posts__input textarea");
const addBtn = document.querySelector(".posts__main-form button");
let postsList = [];
let id = 0;
//  General
forms.forEach(form => {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
    })
})

async function getPostsFromDB() {
    await fetch('http://localhost:3000/posts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (!data.length <= 0) {
                data.forEach(obj => {
                    displayPost(obj.postText);
                    if (obj.id > id) {
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

// Navbar
window.addEventListener('beforeunload', scrollToTop);

function scrollToTop() {
    window.scrollTo(0, 0);
}

mode.parentElement.addEventListener('click', function () {
    document.querySelector('html').classList.toggle("dark-mode");
})

// Posts
addBtn.addEventListener("click", function (e) {
    if (inputValues.value) {
        let inputValue = inputValues.value;
        createPostObj(inputValue);
        displayPost(inputValue);
    }
})

function createPostObj(val) {
    const postObj = {
        "id": id,
        "title": "User",
        "author": "Ahmed",
        "profileId": 1,
        "like": false,
        "postText": val
    }
    postsList.push(postObj)
    addPostInDB(postObj)
    id++;
}

async function addPostInDB(postObj) {
    await fetch('http://localhost:3000/posts', {
        method: 'POST',
        body: JSON.stringify(postObj)
    }).then(data => console.log('Success Post:', data));
}

function displayPost(val) {
    let container = document.querySelector(".posts__posts-container");
    let postBody = document.createElement("li");
    postBody.setAttribute("class", "posts__post")

    postBody.innerHTML = `            
            <div class="posts__post-header">
                <div class="posts__post-img">
                    <img src="assets/images/serious-man-3760373.png" alt="Profile image">
                </div>
                <h3>User Name</h3>
            </div>
            <div class="posts__post__edit">
                <textarea placeholder="What is on your mind?"></textarea>
            </div>
            <p>${val}</p>`;

    postActionBtns = document.createElement("div");
    postActionBtns.setAttribute("class", "posts__post-actions");

    likeAction = document.createElement("button");
    likeAction.setAttribute("class", "blue-btn");
    likeAction.innerHTML = "Like";
    likeAction.addEventListener("click", function (e) {
        likeBehaviour(this);
    })

    editAction = document.createElement("button");
    editAction.setAttribute("class", "blue-btn");
    editAction.innerHTML = "Edit";
    editAction.addEventListener("click", function (e) {
        editBehaviour(this);
    })

    deleteAction = document.createElement("button");
    deleteAction.setAttribute("class", "red-btn");
    deleteAction.innerHTML = "Delete";
    deleteAction.addEventListener("click", function (e) {
        deleteBehaviour(this);
    })

    postActionBtns.appendChild(likeAction);
    postActionBtns.appendChild(editAction);
    postActionBtns.appendChild(deleteAction);

    postBody.appendChild(postActionBtns);
    container.appendChild(postBody);
    inputValues.value = "";
}

// Like Behaviour
function likeBehaviour(btn) {

}

// Edit Behaviour
function editBehaviour(btn) {

}

// Delete Behaviour
function deleteBehaviour(btn) {

}