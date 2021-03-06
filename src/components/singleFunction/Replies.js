import React, {Component} from 'react'
import {connect} from 'react-redux'
import * as d3 from 'd3'
import { withRouter } from 'react-router-dom'
import PostReply from './postReply'

class Replies extends Component{
    constructor(props){
        super(props)
        this.snapScroll = this.snapScroll.bind(this)
    }
    snapScroll = () => {
        this.node.scrollIntoView({ behavior: "smooth" })
    }
    componentDidUpdate(){
        this.snapScroll()        
    }
    render(){
        const {replies, currentUser,post, handleUserDashboard} = this.props
        return (
            <div className='replyContainer'>
                <div className="replyGroup">
                    {
                        replies.map((reply) => (
                            <div key={ reply.id } className="singleReply">
                                <div className='userInfo'>
                                    <span onClick={() => handleUserDashboard(reply)} style={{backgroundImage:`url(${reply.user.profilePic})`}} className="userProfilePic"></span>
                                </div>
                                <div className={`replyBody ${post.user.id === reply.user.id ? 'myPost' : currentUser.user.id === reply.user.id ? 'signedIn' : ''}`}>
                                    <div className="postedBy">
                                        <p onClick={() => handleUserDashboard(reply)} className={`userName ${post.user.id === reply.user.id ? 'myPost' : currentUser.user.id === reply.user.id ? 'signedIn' : ''}`}>{reply.user.name}</p>
                                        <small className='timePosted'>{d3.timeFormat('%m/%d')(new Date(reply.createdAt)) + ' ' + d3.timeFormat('%I:%M% %p')(new Date(reply.createdAt))}</small>                            
                                    </div>
                                    <p>{reply.body}</p>
                                </div>
                            </div>
                        ))
                    }
                    <div ref={node => { this.node = node; }}></div>
                </div>
            <PostReply post={post} snapScroll={this.snapScroll}/>
            </div>
        )
    }
}

const mapStateToProps = ({posts,currentUser}, props) => {
  return {
    replies: props.postId ? posts.find((post) => post.id === props.postId).replies.sort((a,b) => a.id - b.id) : [],
    post:posts.find((post) => post.id === props.postId),
    currentUser,
  }
}

export default withRouter(connect(mapStateToProps)(Replies))