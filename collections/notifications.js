Notifications = new Meteor.Collection('notifications');

Notifications.allow({
    insert: function(userId, doc){
      // new notifications can only be created via a Meteor method
      return false;
    }
  , update: canEditById
  , remove: canEditById
});

getNotification = function(event, properties, context){
  var notification = {};
  // the default context to display notifications is the notification sidebar
  var context = typeof context === 'undefined' ? 'sidebar' : context;
  var p = properties;
  switch(event){
    case 'newReply':
      notification.subject = 'Someone replied to your comment on "'+p.phraseHeadline+'"';
      notification.text = p.commentAuthorName+' has replied to your comment on "'+p.phraseHeadline+'": '+getPhraseCommentUrl(p.phraseId, p.commentId);
      notification.html = '<p><a href="'+getUserUrl(p.commentAuthorId)+'">'+p.commentAuthorName+'</a> has replied to your comment on "<a href="'+getPhraseCommentUrl(p.phraseId, p.commentId)+'" class="action-link">'+p.phraseHeadline+'</a>"</p>';
      if(context === 'email')
        notification.html += '<p>'+p.commentExcerpt+'</p><a href="'+getPhraseCommentUrl(p.phraseId, p.commentId)+'" class="action-link">Read more</a>';
    break;

    case 'newComment':
      notification.subject = 'A new comment on your phrase "'+p.phraseHeadline+'"';
      notification.text = 'You have a new comment by '+p.commentAuthorName+' on your phrase "'+p.phraseHeadline+'": '+getPhraseCommentUrl(p.phraseId, p.commentId);
      notification.html = '<p><a href="'+getUserUrl(p.commentAuthorId)+'">'+p.commentAuthorName+'</a> left a new comment on your phrase "<a href="'+getPhraseCommentUrl(p.phraseId, p.commentId)+'" class="action-link">'+p.phraseHeadline+'</a>"</p>';
      if(context === 'email')
        notification.html += '<p>'+p.commentExcerpt+'</p><a href="'+getPhraseCommentUrl(p.phraseId, p.commentId)+'" class="action-link">Read more</a>';
    break;

    case 'newPhrase':
      notification.subject = p.phraseAuthorName+' has created a new phrase: "'+p.phraseHeadline+'"';
      notification.text = p.phraseAuthorName+' has created a new phrase: "'+p.phraseHeadline+'" '+getPhraseUrl(p.phraseId);
      notification.html = '<a href="'+getUserUrl(p.phraseAuthorId)+'">'+p.phraseAuthorName+'</a> has created a new phrase: "<a href="'+getPhraseUrl(p.phraseId)+'" class="action-link">'+p.phraseHeadline+'</a>".';      
    break;

    case 'accountApproved':
      notification.subject = 'Your account has been approved.';
      notification.text = 'Welcome to '+getSetting('title')+'! Your account has just been approved.';
      notification.html = 'Welcome to '+getSetting('title')+'!<br/> Your account has just been approved. <a href="'+Meteor.absoluteUrl()+'">Start phraseing.</a>';      
    break;

    default:
    break;
  }
  return notification;
}

Meteor.methods({
  markAllNotificationsAsRead: function() {
    Notifications.update(
      {userId: Meteor.userId()},
      {
        $set:{
          read: true
        }
      },
      {multi: true}
    );
  }
});