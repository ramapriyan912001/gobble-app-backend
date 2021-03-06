const firebase = require("firebase");
const {admin} = require("../utils/admin");
const functions = require('firebase-functions')
const { config } = require("../utils/config");
const fetcher = require('node-fetch')

// firebase.initializeApp(config);

exports.DIETARY_ARRAYS = {//was Bug
  "Vegetarian": ["Strictly Vegetarian", "Vegetarian", "Any", "Halal"],
  "Strictly Vegetarian": ["Strictly Vegetarian", "Vegetarian", "Any"],
  "Halal": ["Strictly Halal", "Halal", "Any", "Vegetarian"],
  "Strictly Halal": ["Strictly Halal", "Halal", "Any"],
  "Any": ["Any", "Halal", "Vegetarian"],
}

exports.ALL_DIETS = ["Strictly Vegetarian", "Vegetarian", "Strictly Halal", "Halal", "Any"]

const DIET_SCORE_CALCULATION = {
  "Vegetarian": {
    "Strictly Vegetarian": 5,
    "Vegetarian": 5, 
    "Any": 5, 
    "Halal": 3
  },
  "Strictly Vegetarian": {
    "Strictly Vegetarian": 5,
    "Vegetarian": 5,
    "Any": 5
  },
  "Halal": {
    "Strictly Halal": 5, 
    "Halal": 5, 
    "Any": 5, 
    "Vegetarian": 3
  },
  "Strictly Halal": {
    "Strictly Halal": 5, 
    "Halal": 5, 
    "Any": 5, 
  },
  "Any": {
    "Strictly Vegetarian": 4,
    "Halal": 5,
    "Strictly Halal": 4,
    "Vegetarian": 5, 
    "Any": 5
  }
}

const CUISINE_SCORE_CALCULATION = {
  "Indian": {
    "Indian": 4,
    "Any": 4,
    "Asian": 3,
    "Food Court": 3,
    "Western": 3
  },
  "Asian": {
    "Indian": 3,
    "Any": 4,
    "Asian": 4,
    "Food Court": 3,
    "Western": 3
  },
  "Food Court": {
    "Indian": 3,
    "Any": 4,
    "Asian": 3,
    "Food Court": 4,
    "Western": 3
  },
  "Western": {
    "Indian": 3,
    "Any": 4,
    "Asian": 3,
    "Food Court": 3,
    "Western": 4
  },
  "Any": {
    "Indian": 4,
    "Any": 4,
    "Asian": 4,
    "Food Court": 4,
    "Western": 4
  }
}


const getUserCollection = (id, success, failure) => id != null
                                                ? userRef(id)
                                                  .once('value')
                                                  .then(success)
                                                  .catch(failure)
                                                : failure({code: 'auth/invalid-id', message: 'Invalid UID provided'});
/**
   * Getter for user details
   * @param {*} id user id
   * @returns user object
   */
exports.getUserDetails = (id) => {
    return getUserCollection(id, snapshot => snapshot.val(), err => console.log(err))
}

/**
   * Get the reference to object within the GobbleRequests object within the database
   * @param {*} params id of object
   * @returns reference
   */
exports.gobbleRequestsRef = () => {
    return admin.database().ref(`GobbleRequests`)
}

/**
   * Get the reference to user object within the users object within the database
   * @param {*} params id of object
   * @returns reference
   */
const userRef = (params) => {
    return admin.database().ref(`Users/${params}`);
}

  /**
   * Converts the date object into a readable string
   * So that it can be stored in the database easily
   * @param {*} date Date object
   * @returns String of date
   */
exports.makeDateString = (date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

exports.isGobbleTimeClose = (date) => {
  let now = new Date()
  date = new Date(date);
  const TIME_TOO_CLOSE = 3600000
  return (date - now) <= TIME_TOO_CLOSE;
}

exports.makeDateTimeString = (date) => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}

  /**
   * Get coordinates of the user's location
   * @param {*} request match request sent by user searching for gobble
   * @returns 
   */
exports.getCoords = (request) => {
    return request['location']['coords']
}

  /**
   * Get datetime string from request sent by user
   * @param {*} request match request sent by user searching for gobble
   * @returns 
   */
exports.getDatetime = (request) => {
    console.log(request)
    return new Date(request['datetime'])
}

exports.getPendingTime = (request) => {
  return new Date(request['pendingTime'])
}

  /**
   * Get preferred distance for meal from request sent by user
   * @param {*} request match request sent by user searching for gobble
   * @returns 
   */
exports.getDistance = (request) => {
    return request['distance']
}

  /**
   * Convert time into minutes to easily evaluate time difference
   * @param {*} date date object
   * @returns 
   */
exports.convertTimeToMinutes = (date) => {
    return date.getHours()*60 + date.getMinutes()
}

exports.getDatetimeArray = () => {
  let date = new Date();
  let minutes = date.getMinutes();
  date.setDate(date.getDate() +1)
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  let arr = [this.makeDateTimeString(date)]
  if(minutes > 15) {
    date.setMinutes(15)
    arr.push(this.makeDateTimeString(date))
  }
  if(minutes > 30) {
    date.setMinutes(30)
    arr.push(this.makeDateTimeString(date))
  }
  if(minutes > 45) {
    date.setMinutes(45)
    arr.push(this.makeDateTimeString(date))
  }
  return arr;
}

exports.isBlocked = async(uid, otherUid) => {
    let x = false;
    x = await admin.database().ref(`Users/${uid}/blockedUsers/${otherUid}`)
    .once("value")
    .then(snapshot => {
      return snapshot.val() ? true : false}
      )
    .catch(err => console.log(err)
    )
    return x;
}

exports.findingNearestQuarterTime = (date) => {
  let minutes = date.getMinutes();
  return Math.floor(minutes/15)*15
}

exports.findNextQuarterTime = (date) => {
  let minutes = date.getMinutes();
  return (Math.ceil(minutes/15)*15)%60
}

/**
   * Calculate distance between two users using coordinates provided
   * @param {*} coords1 coordinates of first user's location
   * @param {*} coords2 coordinates of second user's location
   * @returns the distance between the two users via a number value
   */
const calculateDistance = (coords1, coords2) => {
    let lat1 = coords1['latitude']
    let lat2 = coords2['latitude']
    let lon1 = coords1['longitude']
    let lon2 = coords2['longitude']
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    const distance = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return distance;
}

exports.isWithinRange = (coords1, distance1, coords2, distance2) => {
    return (distance1 + distance2) >= calculateDistance(coords1, coords2)
}

/**
   * Evaluates if two users are compatible based on their match times
   * @param {*} time1 Preferred time of first user request
   * @param {*} time2 Preferred time of second user request
   * @returns Boolean
   */
exports.isWithinTime = (datetime1, datetime2) => {
    const ACCEPTABLE_TIME_DIFF = 1800000
    return Math.abs(datetime1 - datetime2) <= ACCEPTABLE_TIME_DIFF
}

exports.getDatetimeFromObject = (request) => {
  return request['datetime']
}

exports.measureCompatibility = (request1, request2) => {
  let compatibility = 0;
  // Diet, Cuisine, Industry
  if(request1.industryPreference == 12 || (request1.industryPreference == request2.industry)) {
    compatibility += 3;
  } else {
    compatibility += 2;
  }
  console.log("restriction 1", request1.dietaryRestriction)
  console.log("restriction 2", request2.dietaryRestriction)
  compatibility += DIET_SCORE_CALCULATION[request1.dietaryRestriction][request2.dietaryRestriction]
  compatibility += CUISINE_SCORE_CALCULATION[request1.cuisinePreference][request2.cuisinePreference]

  return compatibility;
}

exports.SATISFACTION_THRESHOLD = 10;
exports.STOP_SEARCH_THRESHOLD = 12;
exports.MINIMUM_COMPATIBILITY = 16;

function chatsRef(params) {
  return admin.database().ref(`Chats/${params}`);
}

function conversationRef(params) {
  return admin.database().ref(`Conversation/${params}`);
}

/**
   * Asynchronously create a chat for matched users
   */
exports.linkChats = async(updates, req1, req2) => {
    //Adding to Chats Table
    //If the User has never been matched before, add a new entry in each User's ref under this table
    //If they have been matched before, update matchDateTime
    let isNewMatch = false;
    await chatsRef(`${req1.userId}/${req2.userId}`)
                          .once('value', snapshot => {isNewMatch = !snapshot.exists()});

    if (isNewMatch == null){
      //Do Nothing
      console.log('Nothing is done to link chats');
    } else { 
      if (isNewMatch) {
        const conversationID = await conversationRef().push().key;  
        updates[`/Chats/${req1.userId}/${req2.userId}/metadata`] = {
                                                            _id: req1.userId,
                                                            name: req1.otherUserName,
                                                            avatar: req2.otherUserAvatar,
                                                            otherUserId: req2.userId,
                                                            industry: req2.industry,
                                                            otherUserAvatar: req1.otherUserAvatar,
                                                            lastMessage: '',
                                                            conversation: conversationID,
                                                            matchDateTime: req1.datetime,
                                                          };
        updates[`/Chats/${req2.userId}/${req1.userId}/metadata`] = {
                                                            _id: req2.userId,
                                                            name: req2.otherUserName,
                                                            avatar: req1.otherUserAvatar,
                                                            otherUserId: req1.userId,
                                                            industry: req1.industry,
                                                            otherUserAvatar: req2.otherUserAvatar,
                                                            lastMessage: '',
                                                            conversation: conversationID,
                                                            matchDateTime: req1.datetime,
                                                          };
      } else {
        updates[`/Chats/${req1.userId}/${req2.userId}/metadata/matchDateTime`] = req1.datetime;
        updates[`/Chats/${req2.userId}/${req1.userId}/metadata/matchDateTime`] = req1.datetime;
      }
    }
    return updates;
          // .then (x => x)
          // .catch(err => console.log('Linking Chats Error:', err.message));
}

exports.getPushToken = async (uid) => {
  return admin.database().ref(`PushTokens/${uid}`).once("value")
          .then(snapshot => {
              return snapshot.val();
          })
          .catch(err => {
            console.log(err.message);
            return {};
          });
};

exports.sendPushNotification = async (pushToken, message, body) => {
  try {
    if (pushToken == null) {
      return ({
        success: false,
        message: `ADMIN PUSHTOKEN ERROR: pushToken does not exist`
      });
    } else {
      let response = await fetcher('https://exp.host/--/api/v2/push/send', {
              body: JSON.stringify({
                to: pushToken,
                title: message,
                body: body,
              }),
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
          });
          return {
              success: true,
              message: response
          };
    }
  } catch (err) {
    console.log(err.message);
    return ({
      success: false,
      message: `ADMIN PUSH NOTIF ERROR: ${err.message}`
    });
  }
}

exports.sendPushNotifications = async(messages) => {
  try {
    if (messages == []) {
      return ({
        success: true,
        message: `NO MESSAGES TO SEND`
      });
    } else {
      let response = await fetcher('https://exp.host/--/api/v2/push/send', {
              body: JSON.stringify(messages),
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
          });
          return {
              success: true,
              message: response
          };
    }
  } catch (err) {
    console.log(err.message);
    return ({
      success: false,
      message: `PUSH NOTIF FAILED: ${err.message}`
    });
  }
}