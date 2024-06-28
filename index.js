import { postsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

if (getPostsDataFromLocalStorage() === false) {
	savePostsDataToLocalStorage(postsData)
}
render()

document.addEventListener('click', function (e) {
	if (e.target.dataset.like) {
		handleLikeClick(e.target.dataset.like)
	} else if (e.target.dataset.repost) {
		handleRepostClick(e.target.dataset.repost)
	} else if (e.target.dataset.reply) {
		handleReplyClick(e.target.dataset.reply)
	} else if (e.target.id === 'post-btn') {
		handlePostBtnClick()
	} else if (e.target.dataset.delete) {
		deletePost(e.target.dataset.delete)
	}
})

function handleLikeClick(postId) {
	const postsData = checkPostsDataInLocalStorage()

	const targetPostObj = postsData.filter(function (post) {
		return post.uuid === postId
	})[0]

	if (targetPostObj.isLiked) {
		targetPostObj.likes--
	} else {
		targetPostObj.likes++
	}

	targetPostObj.isLiked = !targetPostObj.isLiked
	savePostsDataToLocalStorage(postsData)
	render()
}

function handleRepostClick(postId) {
	const postsData = checkPostsDataInLocalStorage()

	const targetPostObj = postsData.filter(function (post) {
		return post.uuid === postId
	})[0]

	if (targetPostObj.isReposted) {
		targetPostObj.reposts--
	} else {
		targetPostObj.reposts++
	}

	targetPostObj.isReposted = !targetPostObj.isReposted
	savePostsDataToLocalStorage(postsData)
	render()
}

function handleReplyClick(replyId) {
	const postsData = getPostsDataFromLocalStorage()
	const targetPostObj = postsData.filter(function (post) {
		return post.uuid === replyId
	})[0]
	const repliedpostHtml = `
		<i id="reply-modal-close-mark"  class="fa-solid fa-xmark" data-close="close"></i>
        <div class="post border-top w100p">
            <div class="post-inner flex gap-1 align-flex-start">
                <img src="${targetPostObj.profilePic}" class="profile-pic">
                <div class="flex flex-column gap-1">
                    <p class="post-handle">${targetPostObj.handle}</p>
                    <p class="post-text">${targetPostObj.postText}</p>
					<p class="post-handle">Replying to ${targetPostObj.handle}</p>
                </div>            
            </div> 
        </div>
		<div class="reply-input-area flex gap-1 align-flex-start border-bottom">
			<img src="images/scrimbalogo.png" class="profile-pic">
			<textarea placeholder="Post your reply" id="reply-input" class="textarea w100p"></textarea>
		</div>
		<button id="reply-btn" class="btn">Reply</button>
    `
	handleModal(repliedpostHtml, replyId)
}

function handleModal(repliedpostHtml, replyId) {
	const postsData = checkPostsDataInLocalStorage()

	const targetPostObj = postsData.filter(function (post) {
		return post.uuid === replyId
	})[0]
	const replyModal = document.getElementById('reply-modal')
	const replyModalBg = document.getElementById('reply-modal-bg')

	replyModal.innerHTML = repliedpostHtml
	replyModal.classList.toggle('flex')
	replyModalBg.classList.toggle('flex')

	const replyInput = document.getElementById('reply-input')
	const replyBtn = document.getElementById('reply-btn')

	document.getElementById('reply-modal-close-mark').addEventListener('click', function () {
		replyModal.classList.toggle('flex')
		replyModalBg.classList.toggle('flex')
	})

	replyBtn.addEventListener('click', function () {
		if (replyInput.value) {
			targetPostObj.replies.unshift({
				handle: `@Scrimba`,
				profilePic: `images/scrimbalogo.png`,
				postText: replyInput.value,
			})
			replyModal.classList.toggle('flex')
			replyModalBg.classList.toggle('flex')
		}
		savePostsDataToLocalStorage(postsData)
		render()
	})
}

function handlePostBtnClick() {
	const postsData = checkPostsDataInLocalStorage()
	const postInput = document.getElementById('post-input')

	if (postInput.value) {
		postsData.unshift({
			handle: `@Scrimba`,
			profilePic: `images/scrimbalogo.png`,
			likes: 0,
			reposts: 0,
			postText: postInput.value,
			replies: [],
			isLiked: false,
			isReposted: false,
			uuid: uuidv4(),
		})

		savePostsDataToLocalStorage(postsData)
		render()
		postInput.value = ''
	}
}

function getFeedHtml() {
	let feedHtml = ``
	const postsData = checkPostsDataInLocalStorage()

	postsData.forEach(function (post) {
		let likeIconClass = ''

		if (post.isLiked) {
			likeIconClass = 'liked'
		}

		let repostIconClass = ''

		if (post.isReposted) {
			repostIconClass = 'reposted'
		}

		let repliesHtml = ''

		if (post.replies.length > 0) {
			post.replies.forEach(function (reply) {
				repliesHtml += `
                    <div class="post-reply border-top">
                        <div class="post-inner flex gap-1 align-flex-start">
                            <img src="${reply.profilePic}" class="profile-pic">
                                <div class="flex flex-column gap-1">
                                    <p class="post-handle">${reply.handle}</p>
                                    <p class="post-text">${reply.postText}</p>
                                </div>
                            </div>
                    </div>
                    `
			})
		}

		feedHtml += `
            <div class="post border-top w100p">
                <div class="post-inner flex gap-1 align-flex-start">
                    <img src="${post.profilePic}" class="profile-pic">
                    <div class="flex flex-column gap-1 w100p">
                        <div class="flex justify-space-between">
							<p class="post-handle">${post.handle}</p>
							<p class="post-delete" id="delete-${post.uuid}" data-delete="${post.uuid}">Delete</button> 
						</div>
                        <p class="post-text">${post.postText}</p>
                        <div class="post-reactions flex">
                            <span class="post-reaction flex" data-reply="${post.uuid}">
                                <i class="fa-regular fa-comment-dots"></i>
                                ${post.replies.length}
                            </span>
                            <span class="post-reaction flex ${likeIconClass}" data-like="${post.uuid}">
                                <i class="fa-solid fa-heart"></i>
                                ${post.likes}
                            </span>
                            <span class="post-reaction flex ${repostIconClass}" data-repost="${post.uuid}"><i class="fa-solid fa-retweet"></i>${post.reposts}</span>
                        </div>   
                    </div>            
                </div>
                <div id="replies-${post.uuid}">
                    ${repliesHtml}
                </div>
            </div>
        `
	})
	return feedHtml
}

function deletePost(postId) {
	let postsData = checkPostsDataInLocalStorage()
	let targetPostObj = postsData.filter(function (post) {
		return post.uuid === postId
	})[0]

	const index = postsData.indexOf(targetPostObj)

	if (postsData.length > 1) {
		postsData.splice(index, 1)
	} else {
		localStorage.removeItem('postsData')
		postsData = checkPostsDataInLocalStorage()
		savePostsDataToLocalStorage(postsData)
	}
	savePostsDataToLocalStorage(postsData)
	render()
}

function savePostsDataToLocalStorage(postsData) {
	localStorage.setItem('postsData', JSON.stringify(postsData))
}

function getPostsDataFromLocalStorage() {
	return JSON.parse(localStorage.getItem('postsData'))
}

function render() {
	document.getElementById('feed').innerHTML = getFeedHtml()
}

function checkPostsDataInLocalStorage() {
	if (getPostsDataFromLocalStorage()) {
		return getPostsDataFromLocalStorage()
	} else {
		return postsData
	}
}
