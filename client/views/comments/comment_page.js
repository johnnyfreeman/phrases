Template.comment_page.phrase = function(){
  var selectedComment = Comments.findOne(Session.get('selectedCommentId'));
  return selectedComment && Phrases.findOne(selectedComment.phrase);
};

Template.comment_page.helpers({
	comment: function(){
		var comment = Comments.findOne(Session.get('selectedCommentId'));
		return comment;
	}
});