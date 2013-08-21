// Session variables
Session.set('initialLoad', true);
Session.set('currentDate', new Date());
Session.set('specialtySlug', null);
Session.set('singlePhraseReady', false);

// Settings
Meteor.subscribe('settings', function(){
  // runs once on site load
  analyticsInit();
  Session.set('settingsLoaded',true);
});

// Specialties
Meteor.subscribe('specialties');

// Users
Meteor.subscribe('currentUser');
Meteor.subscribe('allUsers');

// Notifications - only load if user is logged in
if(Meteor.userId() != null){
  Meteor.subscribe('notifications');
}

// Phrases
// We have a few subscriptions here, for the various ways we load phrases
//
// The advantage is that
//   a) we can change pages a lot quicker
//     XXX: and we can animate between them (todo)
//   b) we know when an individual page is ready

// Single Phrase
Meteor.autorun(function() {
  Meteor.subscribe('singlePhrase', Session.get('selectedPhraseId'), function(){
    Session.set('singlePhraseReady', true);
  });
});

// Digest
Meteor.autorun(function() {
  digestHandle = Meteor.subscribe('phraseDigest', Session.get('currentDate'));
});

// Phrases Lists
STATUS_PENDING=1;
STATUS_APPROVED=2;
STATUS_REJECTED=3;

// put it all together with pagination
phraseListSubscription = function(find, options, per_page) {
  var handle = Meteor.subscribeWithPagination('paginatedPhrases', find, options, per_page);
  handle.fetch = function() {
    var ourFind = _.isFunction(find) ? find() : find;
    return limitDocuments(Phrases.find(ourFind, options), handle.loaded());
  }
  return handle;
}

// note: the "name" property is for internal debugging purposes only
selectTop = function() {
  return selectPhrases({name: 'top', status: STATUS_APPROVED, slug: Session.get('specialtySlug')});
}
topPhrasesHandle = phraseListSubscription(selectTop, sortPhrases('score'), 10);

selectNew = function() {
  return selectPhrases({name: 'new', status: STATUS_APPROVED, slug: Session.get('specialtySlug')});
}
newPhrasesHandle = phraseListSubscription(selectNew, sortPhrases('submitted'), 10);  

selectBest = function() {
  return selectPhrases({name: 'best', status: STATUS_APPROVED, slug: Session.get('specialtySlug')});
}
bestPhrasesHandle = phraseListSubscription(selectBest, sortPhrases('baseScore'), 10);  

selectPending = function() {
  return selectPhrases({name: 'pending', status: STATUS_PENDING, slug: Session.get('specialtySlug')});
}
pendingPhrasesHandle = phraseListSubscription(selectPending, sortPhrases('createdAt'), 10);

// Comments
// Collection depends on selectedPhraseId and selectedCommentId session variable

Session.set('selectedPhraseId', null);

Meteor.autosubscribe(function() {
  var query = { $or : [ { phrase : Session.get('selectedPhraseId') } , { _id : Session.get('selectedCommentId') } ] };
  Meteor.subscribe('comments', query, function() {
    Session.set('singleCommentReady', true);
  });
});
