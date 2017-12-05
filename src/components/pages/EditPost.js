import React, { Component } from 'react'
import { connect } from 'react-redux'
import GoogleMaps from '@google/maps'

let env;
if (process.env.NODE_ENV !== 'production') {
  env = require('../../../env.json');
} else {
  env = process.env;
}

// google maps
let googleMapsClient = GoogleMaps.createClient({
  key: env.GoogleServerAPI,
  Promise: Promise
});

// components
import { Textbox, Textarea, Button, Modal, Message } from '../reusables'
import { Loading, LoadingArrows, DoneCheck } from '../reusables/animatedDivs'

// redux
import { updateUserPost, createStoryAndPost, setModal } from '../../actions'

class EditPost extends Component {
  state = {
    id: null,
    userId: null,
    title: '',
    body: '',
    address: '',
    latitude: 0.0,
    longitude: 0.0,
    addToStoryline: false,
    storyTitle: '',
    storyDescription: '',
    storylineId: 0,
    messageDisplayed: '',
    loading: false 
  }

  componentDidMount = () => {
    this.setState({ address: this.props.home.address, latitude: this.props.home.lat, longitude: this.props.home.lng, ...this.props })
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ address: nextProps.home.address, latitude: nextProps.home.lat, longitude: nextProps.home.lng, ...nextProps })
  }

  handleChange = name => ev => {
    this.setState({ [name]: ev.target.value })
  }

  toggleStoryline = () => {
    this.setState({ addToStoryline: !this.state.addToStoryline })
  }

  handleUpdate = () => {
    this.props.updatePost(this.state) // fakin it ;)
    this.setState({
      messageDisplayed: 'Updating your post',
      loading: true
    }, () => {
      this.props.setModal()
      setTimeout(() => {
        this.setState({
          messageDisplayed: 'Post updated!',
          loading: false
        })
      }, 1500)
    })
  }
  handleOkClick = () => {
    this.props.setModal()
    this.props.history.push('/dashboard/myposts')
  }

  setCurrentLocation = () => {
    const showPosition = position => {
      console.log('location found, querying google maps...')
      googleMapsClient.reverseGeocode({
        latlng: [
          position.coords.latitude,
          position.coords.longitude
        ]
      })
      .asPromise()
      .then(response => {
        // currently not working with my API key (Wasif)
        console.log(('query complete! set address'))

        this.setState({
          address: response.json.results[0].formatted_address,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      })
      .catch(err => {
        this.setState({ address, latitude, longitude })
        console.log(err)
      })
    }

    // caching in case of error
    const { address, latitude, longitude } = this.state

    if (navigator.geolocation) {
      console.log('querying browser, locating...')
      this.setState({ address: 'Fetching...', latitude: '', longitude: '' })
      navigator.geolocation.getCurrentPosition(showPosition)
    }
  }

  render = () => {
    const { title, body, address, addToStoryline, storyTitle, storyDescription, storylineId, latitude, longitude, messageDisplayed, loading } = this.state
    const { handleChange, handleUpdate, toggleStoryline, setCurrentLocation, handleOkClick } = this

    return (
      <div className='add-post-container'>
        <div className='add-post'>
          <div className='add-post-inputs'>
            <Textbox
              placeHolder='Title (optional)'
              value={ title }
              className='title'
              onChange={ handleChange('title') } />
            <Textarea
              rows='30'
              placeHolder='Click or tap to write...'
              value={ body }
              onChange={ handleChange('body')} />

            <div className='current-location'>
              <Textbox
                label='Location'
                disabled={ true }
                value={ `${address || `${latitude}, ${longitude}`}` } />
              <Button
                label={ <i className='ion-ios-navigate-outline'></i> }
                className='btn inline'
                onClick={ setCurrentLocation } />
            </div>

            {/*
            <Button
              label={ !addToStoryline || !+storylineId ?
                <span><i className='ion-ios-plus-outline'></i> <span>Add to Storyline</span></span> :
                <span><i className='ion-ios-minus-outline'></i> <span>Return to Private Post</span></span> }
              onClick={ toggleStoryline }
              className='btn toggle-add-to-story' /> */}
          </div>

          {/*<div className={ `add-storyline-inputs ${ addToStoryline || !+storylineId ? 'visible' : '' }` }>
            <div className='select'>
              <select onChange={ handleChange('storylineId') } value={ storylineId }>
                <option value={ 0 }>{ !+storylineId ? 'Please select a storyline...' : 'Create a storyline...' }</option>
                { this.props.userStorylines.map(storyline =>
                  <option
                    key={ storyline.id }
                    value={ storyline.id }>{ storyline.title || storyline.description || storyline.posts[0].title || storyline.posts[0].body.slice(0, 15) }</option>) }
              </select>
            </div>

            { !+storylineId ?
              <div>
                <label>Or create a storyline</label>
                <Textbox
                  placeHolder='Story title (optional)'
                  value={ storyTitle }
                  onChange={ handleChange('storyTitle') } />
                <Textarea
                  rows='5'
                  placeHolder='Storyline description (optional)'
                  value={ storyDescription }
                  onChange={ handleChange('storyDescription') } />
              </div>
              : null }
          </div>*/}

          {/*<div className={ `add-post-button-container ${ addToStoryline ? 'visible' : '' }` }>
            <Button
              label={ addToStoryline ? 'Update' : 'Convert to Private Post' }
              onClick={ handleUpdate }
              className='btn default' />
          </div>*/}
          <div className={ `add-post-button-container ${ addToStoryline ? 'visible' : '' }` }>
            <Button
              disabled={ !body.length }
              label={ 'Update' }
              onClick={ handleUpdate }
              className={ `btn ${body.length ? 'default' : 'disabled'}` } />
          </div>
        </div>
        { this.props.modal &&
          <Modal isActive={ this.props.modal } className='modal-message'>
            <div className={ `add-edit-message-container ${loading ? '' : 'done'}` }>
              <Message body={ messageDisplayed } />
              { loading ? <LoadingArrows /> : <DoneCheck /> }
            </div>
            <Button label='Ok!' className={ `btn default ${loading ? 'hidden': ''}` } onClick={ handleOkClick }/>
          </Modal> }
      </div>
    )
  }
}

const mapState = ({ userLocations, userStorylines, userPosts, modal }, ownProps) => {
  let post = userPosts.find(post => post.id == ownProps.match.params.id) || {}

  return {
    home: userLocations.home,
    ...post,
    userStorylines,
    addToStoryline: post.storylineId ? true : false,
    modal
  }
}
const mapDispatch = (dispatch, ownProps) => ({
  updatePost(post) {
    // post.storylineId = 1*post.storylineId && post.addStoryline || null
    // if addStoryline: true
    // if storylineId, omit storyTitle and storyDescription
    // else createStoryAndPost
    // const { storyTitle, storyDescription, title, body } = post
    // if (post.addToStoryline && !post.storylineId) {
    //   dispatch(createStoryAndPost(
    //     { title: post.storyTitle, description: post.storyDescription },
    //     { title, body }
    //   ))
    //   .then(() => {
    //     // placeholder
    //     ownProps.history.push('/map')
    //   })
    // } else {
      // private post
    return dispatch(updateUserPost(post))
    // }
  },
  setModal() {
    dispatch(setModal())
  } 
})
export default connect(mapState, mapDispatch)(EditPost)