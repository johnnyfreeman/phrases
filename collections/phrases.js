Phrases = new Meteor.Collection('phrases');

STATUS_PENDING=1;
STATUS_APPROVED=2;
STATUS_REJECTED=3;

Phrases.allow({
    insert: canPhraseById
  , update: canEditById
  , remove: canEditById
});

Phrases.deny({
  update: function(userId, phrase, fieldNames) {
    if(isAdminById(userId))
      return false;
    // may only edit the following fields:
    return (_.without(fieldNames, 'headline', 'body', 'shortUrl', 'shortTitle', 'specialties').length > 0);
  }
});

Meteor.methods({
  phrase: function(phrase){
    var headline = cleanUp(phrase.headline),
        body = cleanUp(phrase.body),
        user = Meteor.user(),
        userId = phrase.userId || user._id,
        submitted = parseInt(phrase.submitted) || new Date().getTime(),
        defaultStatus = getSetting('requirePhrasesApproval') ? STATUS_PENDING : STATUS_APPROVED,
        status = phrase.status || defaultStatus,
        timeSinceLastPhrase=timeSinceLast(user, Phrases),
        numberOfPhrasesInPast24Hours=numberOfItemsInPast24Hours(user, Phrases),
        phraseInterval = Math.abs(parseInt(getSetting('phraseInterval', 30))),
        maxPhrasesPer24Hours = Math.abs(parseInt(getSetting('maxPhrasesPerDay', 30))),
        phraseId = '';

    // check that user can phrase
    if (!user || !canPhrase(user))
      throw new Meteor.Error(601, 'You need to login or be invited to phrase new stories.');

    // check that user provided a headline
    if(!phrase.headline)
      throw new Meteor.Error(602, 'Please fill in a headline');

    if(!isAdmin(Meteor.user())){
      // check that user waits more than X seconds between phrases
      if(!this.isSimulation && timeSinceLastPhrase < phraseInterval)
        throw new Meteor.Error(604, 'Please wait '+(phraseInterval-timeSinceLastPhrase)+' seconds before phraseing again');

      // check that the user doesn't phrase more than Y phrases per day
      if(!this.isSimulation && numberOfPhrasesInPast24Hours > maxPhrasesPer24Hours)
        throw new Meteor.Error(605, 'Sorry, you cannot submit more than '+maxPhrasesPer24Hours+' phrases per day');
    }

    phrase = _.extend(phrase, {
      headline: headline,
      body: body,
      userId: userId,
      author: getDisplayNameById(userId),
      createdAt: new Date().getTime(),
      votes: 0,
      comments: 0,
      baseScore: 0,
      score: 0,
      inactive: false,
      status: status
    });

    if(status == STATUS_APPROVED){
      // if phrase is approved, set its submitted date (if phrase is pending, submitted date is left blank)
      phrase.submitted  = submitted;
    }

    Phrases.insert(phrase, function(error, result){
      if(result){
        phraseId = result;
      }
    });

    var phraseAuthor =  Meteor.users.findOne(phrase.userId);
    Meteor.call('upvotePhrase', phraseId,phraseAuthor);

    if(getSetting('newPhrasesNotifications')){
      // notify admin of new phrases
      var properties = {
        phraseAuthorName : getDisplayName(phraseAuthor),
        phraseAuthorId : phrase.userId,
        phraseHeadline : headline,
        phraseId : phraseId
      }
      var notification = getNotification('newPhrase', properties);
      // call a server method because we do not have access to admin users' info on the client
      Meteor.call('notifyAdmins', notification, Meteor.user(), function(error, result){
        //run asynchronously
      });
    }

    // add the phrase's own ID to the phrase object and return it to the client
    phrase.phraseId = phraseId;
    return phrase;
  },
  phrase_edit: function(phrase){
    //TO-DO: make phrase_edit server-side?
  },
  clickedPhrase: function(phrase){
    Phrases.update(phrase._id, { $inc: { clicks: 1 }});
  },
  deletePhraseById: function(phraseId) {
    // remove phrase comments
    if(!this.isSimulation) {
      Comments.remove({phrase: phraseId});
    }
    Phrases.remove(phraseId);
  }
});
