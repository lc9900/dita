import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../../store';
import { addPost } from '../../actions/posts';
import Select from './select_box';


class PostForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: '',
      body: '',
      storylineId: null,
      userId: props.currentUser.user.id,
      // selection: [],
      // options: [],
      alert: '',
      alertStyle: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.handleSelect = this.handleSelect.bind(this);
  }

  handleChange(event) {
    const key = event.target.name, val = event.target.value;
    this.setState({ [key]: val });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.handleAdd(this.state);

    !this.state.title ? this.setState({
      alert: "Please enter title",
      alertStyle: "alert alert-danger"
    }) : 
    !this.state.body ? this.setState({
      alert: "Please enter content",
      alertStyle: "alert alert-danger"
    }) :
    this.setState({
      alert: "New post has been added!",
      alertStyle: "alert alert-success"
    })
  }

  // handleSelect(obj){
  //   this.setState({ selection: obj })
  // }

  render(){
    const { title, body, alert, alertStyle } = this.state;
    const { posts, currentUser } = this.props;
    const btnStyle = { marginTop: "10px" };
    const myPosts = posts.posts.filter(post => {
      return post.userId === currentUser.user.id
    })
       
    return (

      <div>
        <form onSubmit={ this.handleSubmit }>
          <div className="form-group">
            <input name="title" type="text" ref="title" onChange={ this.handleChange }
            className="form-control" placeholder="Please enter title" />
          </div>

          <div className="form-group">
            <textarea name="body" type="text" ref="body"
            onChange={ this.handleChange }
            className="form-control" placeholder="Please enter content" />
          </div>  
          {
          // replace this <select> with something like
          // <Select options={ this.state.options } selection={ this.handleSelect } multi={ true } create={ true } />      
          <select name="storylineId" className="form-contarol" onChange={ this.handleChange }>
            <option>Select Storyline</option>
            {
              myPosts.map(mypost => {
                return (
                  <option key={ mypost.id } value={ mypost.storyline.id }>{ mypost.storyline.title }</option>
                )         
              })
            }
          </select>
          }

          <div className="form-group">
            <button type="submit" className="btn btn-primary" style={ btnStyle }>Post Idea</button>
          </div>
          
        </form>
        { alert ? <div className={ alertStyle }>{ alert }</div> : "" }

      </div>
    )      
  }  
}

const mapStateToProps = ({ posts, currentUser }) => {
  return {
    posts,
    currentUser
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleAdd: (post) => {
      dispatch(addPost(post));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PostForm);

