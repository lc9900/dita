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
import { Textbox, Textarea, Button } from '../reusables'

// redux
import { addUserPost, createStoryAndPost } from '../../actions'

class AddPost extends Component {
  state = {
    title: '',
    body: '',
    address: '',
    latitude: 0.0,
    longitude: 0.0,
    addToStoryline: false,
    storyTitle: '',
    storyDescription: '',
    storylineId: 0
  }

  componentDidMount = () => {
    this.setState({ address: this.props.home.address, latitude: this.props.home.lat, longitude: this.props.home.lng })
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ address: nextProps.home.address, latitude: nextProps.home.lat, longitude: nextProps.home.lng })
  }

  handleChange = name => ev => {
    this.setState({ [name]: ev.target.value })
  }

  toggleStoryline = () => {
    this.setState({ addToStoryline: !this.state.addToStoryline })
  }

  handlePost = () => {
    this.props.addPost(this.state)  
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
    const { title, body, address, addToStoryline, storyTitle, storyDescription, storylineId } = this.state
    const { handleChange, handlePost, toggleStoryline, setCurrentLocation } = this

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
                value={ `${address}` } />
              <Button
                label={ <i className='ion-ios-navigate-outline'></i> }
                className='btn inline'
                onClick={ setCurrentLocation } />
            </div>

            <Button
              label={ !addToStoryline ?
                <span><i className='ion-ios-plus-outline'></i> <span>Add to Storyline</span></span> :
                <span><i className='ion-ios-minus-outline'></i> <span>Return to Private Post</span></span> }
              onClick={ toggleStoryline }
              className='btn toggle-add-to-story' /> 
          </div>

          <div className={ `add-storyline-inputs ${ addToStoryline ? 'visible' : '' }` }>
            <div className='select'>
              <select onChange={ handleChange('storylineId') } value={ storylineId }>
                <option value={ 0 }>Please select a storyline...</option>
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
          </div>

          <div className={ `add-post-button-container ${ addToStoryline ? 'visible' : '' }` }>
            <Button
              label={ addToStoryline ? 'Post and Share' : 'Add Private Post' }
              onClick={ handlePost }
              className='btn default' />
          </div>
        </div>
      </div>
    )
  }
}

const mapState = ({ userLocations, userStorylines }) => ({
  home: userLocations.home,
  userStorylines
})
const mapDispatch = (dispatch, ownProps) => ({
  addPost(post) {
    post.storylineId = 1*post.storylineId || null
    // if addStoryline: true
    // if storylineId, omit storyTitle and storyDescription
    // else createStoryAndPost
    const { storyTitle, storyDescription, title, body } = post
    if (post.addToStoryline && !post.storylineId) {
      dispatch(createStoryAndPost(
        { title: post.storyTitle, description: post.storyDescription },
        { title, body }
      ))
      .then(() => {
        // placeholder
        ownProps.history.push('/map')
      })
    } else {
      // private post
      dispatch(addUserPost(post))
      .then(() => {
        // placeholder
        ownProps.history.push('/dashboard')
      })
    }
  }
})
export default connect(mapState, mapDispatch)(AddPost)