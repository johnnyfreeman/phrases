Template.comment_reply.phrase = function(){
  var selectedComment = Comments.findOne(Session.get('selectedCommentId'));
  return selectedComment && Phrases.findOne(selectedComment.phrase);
};

Template.comment_reply.helpers({
	comment: function(){
		var comment = Comments.findOne(Session.get('selectedCommentId'));
		return comment;
	}
});