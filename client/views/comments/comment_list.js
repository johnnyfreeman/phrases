Template.comment_list.helpers({
  has_comments: function(){
    var phrase = Phrases.findOne(Session.get('selectedPhraseId'));
    if(phrase){
      return Comments.find({phrase: phrase._id, parent: null}).count() > 0;
    }
  },
  child_comments: function(){
    var phrase = Phrases.findOne(Session.get('selectedPhraseId'));
    return Comments.find({phrase: phrase._id, parent: null}, {sort: {score: -1, submitted: -1}});
  }
})