Comments = new Meteor.Collection('comments');

Comments.allow({
    insert: canCommentById
  , update: canEditById
  , remove: canEditById
});

Comments.deny({
  update: function(userId, phrase, fieldNames) {
    if(isAdminById(userId))
      return false;
    // may only edit the following fields:
    return (_.without(fieldNames, 'text').length > 0);
  }
});

Meteor.methods({
  comment: function(phraseId, parentCommentId, text){
    var user = Meteor.user(),
        phrase=Phrases.findOne(phraseId),
        phraseUser=Meteor.users.findOne(phrase.userId),
        timeSinceLastComment=timeSinceLast(user, Comments),
        cleanText= cleanUp(text),
        commentInterval = Math.abs(parseInt(getSetting('commentInterval',15))),
        properties={
          'commentAuthorId': user._id,
          'commentAuthorName': getDisplayName(user),
          'commentExcerpt': trimWords(stripMarkdown(cleanText),20),
          'phraseId': phraseId,
          'phraseHeadline' : phrase.headline
        };

    // check that user can comment
    if (!user || !canComment(user))
      throw new Meteor.Error('You need to login or be invited to phrase new comments.');
    
    // check that user waits more than 15 seconds between comments
    if(!this.isSimulation && (timeSinceLastComment < commentInterval))
      throw new Meteor.Error(704, 'Please wait '+(commentInterval-timeSinceLastComment)+' seconds before commenting again');

    // Don't allow empty comments
    if (!cleanText)
      throw new Meteor.Error(704,'Your comment is empty.');
          
    var comment = {
        phrase: phraseId,
        body: cleanText,
        userId: user._id,
        submitted: new Date().getTime(),
        author: getDisplayName(user)
    };
    
    if(parentCommentId)
      comment.parent = parentCommentId;

    var newCommentId=Comments.insert(comment);

    Phrases.update(phraseId, {$inc: {comments: 1}});

    Meteor.call('upvoteComment', newCommentId);

    properties.commentId = newCommentId;

    if(!this.isSimulation){
      if(parentCommentId){
        // child comment
        var parentComment=Comments.findOne(parentCommentId);
        var parentUser=Meteor.users.findOne(parentComment.userId);

        properties.parentCommentId = parentCommentId;
        properties.parentAuthorId = parentComment.userId;
        properties.parentAuthorName = getDisplayName(parentUser);

        // do not notify users of their own actions (i.e. they're replying to themselves)
        if(parentUser._id != user._id)
          Meteor.call('createNotification','newReply', properties, parentUser, user);

        // if the original phraseer is different from the author of the parent comment, notify them too
        if(phraseUser._id != user._id && parentComment.userId != phrase.userId)
          Meteor.call('createNotification','newComment', properties, phraseUser, user);

      }else{
        // root comment
        // don't notify users of their own comments
        if(phraseUser._id != user._id)
          Meteor.call('createNotification','newComment', properties, phraseUser, Meteor.user());
      }
    }
    return properties;
  },
  removeComment: function(commentId){
    var comment=Comments.findOne(commentId);
    // decrement phrase comment count
    Phrases.update(comment.phrase, {$inc: {comments: -1}});
    // note: should we also decrease user's comment karma ?
    Comments.remove(commentId);
  }
});
