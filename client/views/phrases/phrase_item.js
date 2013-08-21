Template.phrase_item.preserve({
  '.phrase': function (node) {return node.id; }
});


Template.phrase_item.helpers({
  phraseLink: function(){
    return !!this.url ? this.url : "/phrases/"+this._id;
  },
  rank: function() {
    return this._rank + 1;
  },
  showRank: function(){
    return Session.get('isPhrasesList');
  },
  domain: function(){
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
  current_domain: function(){
    return "http://"+document.domain;
  },
  can_edit: function(){
    return canEdit(Meteor.user(), this);
  },
  authorName: function(){
    return getAuthorName(this);
  },
  short_score: function(){
    return Math.floor(this.score*1000)/1000;
  },
  body_formatted: function(){
    var converter = new Markdown.Converter();
    var html_body=converter.makeHtml(this.body);
    return html_body.autoLink();
  },
  ago: function(){
    // if phrase is approved show submission time, else show creation time. 
    time = this.status == STATUS_APPROVED ? this.submitted : this.createdAt;
    return moment(time).fromNow();
  },
  timestamp: function(){
    time = this.status == STATUS_APPROVED ? this.submitted : this.createdAt;
    return moment(time).format("MMMM Do, h:mm:ss a");
  },
  voted: function(){
    var user = Meteor.user();
    if(!user) return false; 
    return _.include(this.upvoters, user._id);
  },
  userAvatar: function(){
    if(author=Meteor.users.findOne(this.userId))
      return getAvatarUrl(author);
  },
  inactiveClass: function(){
    return (isAdmin(Meteor.user()) && this.inactive) ? "inactive" : "";
  },
  specialtyLink: function(){
    return getSpecialtyUrl(this.slug);
  },
  commentsDisplayText: function(){
    return this.comments == 1 ? 'comment' : 'comments';
  },
  pointsUnitDisplayText: function(){
    return this.votes == 1 ? 'point' : 'points';
  }
});

Template.phrase_item.rendered = function(){
  // animate phrase from previous position to new position
  var instance = this;
  var rank = instance.data._rank;
  var $this = $(this.firstNode);
  var previousPosition = 0;
  var newPosition = 0;
  for(var i=1; i<=rank; i++){
    newPosition += $('.phrase-'+i).height();
  }

 // if element has a currentPosition (i.e. it's not the first ever render)
 if(previousPosition = instance.currentPosition){
    // calculate difference between old position and new position and send element here
    var delta = previousPosition - newPosition;
    $this.css("top", delta + "px");
  }

  Meteor.defer(function() {
    instance.currentPosition = newPosition;
    // bring element back to its new original position
    $this.addClass('animate').css("top",  "0px");
  }); 
};

Template.phrase_item.events = {
  'click .upvote-link': function(e, instance){
    var phrase = this;
    e.preventDefault();
      if(!Meteor.user()){
        Meteor.Router.to('/signin');
        throwError("Please log in first");
      }
      Meteor.call('upvotePhrase', phrase._id, function(error, result){
        trackEvent("phrase upvoted", {'_id': phrase._id});
      });
  },
  'click .share-link': function(e){
      var $this = $(e.target).parents('.phrase-share').find('.share-link');
      var $share = $this.parents('.phrase-share').find('.share-options');
      e.preventDefault();
      $('.share-link').not($this).removeClass("active");
      $(".share-options").not($share).addClass("hidden");
      $this.toggleClass("active");
      $share.toggleClass("hidden");
      $share.find('.share-replace').sharrre(SharrreOptions);
  },
  'click .phrase-title': function(e){
    Meteor.call('clickedPhrase', this, function(error, result){
      if(error)
        console.log(error);
    });
  }
};