const firebase = require("firebase");
const {admin} = require("../utils/admin");
const functions = require('firebase-functions')
const { config } = require("../utils/config");
const fetcher = require('node-fetch')

firebase.initializeApp(config);

exports.DIETARY_ARRAYS = {//was Bug
    "Vegetarian": ["Vegetarian", 'Vegan', "ANY"],
    "Halal": ["Halal", "ANY", "Vegetarian", "Vegan"],
    "Vegan": ["Vegan", "ANY"],
    "ANY": ["VEGAN", "VEGETARIAN", "HALAL", "ANY"],
    "Any": ["VEGAN", "VEGETARIAN", "HALAL", "ANY"]
}


exports.getUserCollection = (id, success, failure) => id != null
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
exports.userRef = (params) => {
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

exports.measureCompatibility = (request1, request2) => {
    let compatibility = 0;
    if(request1.cuisinePreference == request2.cuisinePreference) {
      compatibility += 5;
    }
    if(request1.industryPreference == 12 || (request1.industryPreference == request2.industry)) {
      compatibility += 5;
    }
    return compatibility;
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

/**
   * Calculate distance between two users using coordinates provided
   * @param {*} coords1 coordinates of first user's location
   * @param {*} coords2 coordinates of second user's location
   * @returns the distance between the two users via a number value
   */
exports.calculateDistance = async(coords1, coords2) => {
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
exports.isWithinTime = (time1, time2) => {
    return (Math.abs(time1-time2) <= 30)   
}

/**
   * Threshold for when matching algorithm can stop and return
   * This is supposed to be dynamic
   * Will be improved in phase 3
   * @param {*} request request sent by user
   * @returns a score number value
   */
exports.getThreshold = (request) => {
    // Will have a threshold function to mark how low a score we are willing to accept for a match
    // Nearer to the schedule time, the lower the threshold
    // This is for milestone 3
    // For now we just have a threshold of 18 points
    return 18;
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

/**
   * Get the reference to object within the chats object within the database
   * @param {*} params id of object
   * @returns reference
   */
function chatsRef(params) {
    return admin.database().ref(`Chats/${params}`);
}

/**
   * Get the reference to chat object within the conversation object within the database
   * @param {*} params id of object
   * @returns reference
   */
function conversationRef(params) {
    return admin.database().ref(`Conversation/${params}`);
}