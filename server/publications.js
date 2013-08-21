// Users

Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId);
});
Meteor.publish('allUsers', function() {
  if (this.userId && isAdminById(this.userId)) {
    // if user is admin, publish all fields
    return Meteor.users.find();
  }else{
    // else, filter out sensitive info
    return Meteor.users.find({}, {fields: {
      secret_id: false,
      isAdmin: false,
      emails: false,
      notifications: false,
      'profile.email': false,
      'services.twitter.accessToken': false,
      'services.twitter.accessTokenSecret': false,
      'services.twitter.id': false,
      'services.password': false,
      'services.resume': false
    }});
  }
});

// Phrases

// a single phrase, identified by id
Meteor.publish('singlePhrase', function(id) {
  return Phrases.find(id);
});

Meteor.publish('paginatedPhrases', function(find, options, limit) {
  options = options || {};
  options.limit = limit;
  return Phrases.find(find || {}, options);
});

Meteor.publish('phraseDigest', function(date) {
  var mDate = moment(date);
  return findDigestPhrases(mDate);
});

// Other Publications

Meteor.publish('comments', function(query) {
  return Comments.find(query);
});

Meteor.publish('settings', function() {
  return Settings.find();
});

Meteor.publish('notifications', function() {
  // only publish notifications belonging to the current user
  return Notifications.find({userId:this.userId});
});

Meteor.publish('specialties', function() {
  return Specialties.find();
});