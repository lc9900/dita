const db = require( './db' );
const Sequelize = require('sequelize') 
const { or } = db.Op
const bcrypt = require('bcrypt-as-promised')
const env = require('../env')

const defineAttr = {
  name: {
      type: Sequelize.STRING,
      allowNull:false,
      validate: {
          notEmpty: true
      }
  },
  email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
          isEmail: true
      }
  },
  username: {
      type: Sequelize.STRING,
      unique:true,
      allowNull:false,
      validate: {
          len: [2,14],
          notEmpty: true,
          is: /^[a-z0-9]+$/i  //will create more advanced regex to disallow special characters
          
      }
  },
  latitude: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: { min: -90, max: 90 }
  },
  longitude: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: { min: -180, max: 180 }
  },
  password: { 
    type: db.Sequelize.STRING, 
    allowNull: false, 
    validate: { 
      notEmpty: true 
    } 
  }
  /*Or store location as array? */
    /*
    location: {
        type: Sequelize.ARRAY(Sequelize.INTEGER) --> then validate that array has both lng/lat, its valid numbers, etc.
    }
    */ 
}

const hashInstancePass = (instance) => {
  return bcrypt.hash(instance.password, env.SALTROUNDS)
    .then(hashedPassword => {
      instance.password = hashedPassword
      return instance
    })
}

const checkHash = (plainPassword, hash) => {
  return bcrypt.compare(plainPassword, hash)
}
 
const defineOptions = {
  hooks: {
    beforeCreate(instance, options) {
      return hashInstancePass(instance)
    },
    beforeUpdate(instance, options) {
      return hashInstancePass(instance)
    }
  }
}; 
 
const User = db.define('user', defineAttr, defineOptions); 

User.matchUser = function(query, password) {
  return this.findOne({
    where: {
      [or]: [
        { email: [query] },
        { username: [query] } ]
    }
  })
  .then(user => {
    if (!user) throw new Error('invalid')
    return checkHash(password, user.password)
      .then(res => {
        if (res) return user
      })
  })
}

module.exports = User; 
