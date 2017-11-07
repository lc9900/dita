import axios from 'axios';

// ***** ACTION TYPES *****
export const SET_USER_POSTS = 'SET_USER_POSTS'

// ***** ACTION CREATORS *****
export const setUserPosts = userPosts => ({ type: SET_USER_POSTS, userPosts })

export const fetchUserPosts = () => dispatch =>
  axios.get('/api/posts/myposts')
    .then(res => dispatch(setUserPosts(res.data)))