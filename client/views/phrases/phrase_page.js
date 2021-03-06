Template.phrase_page.helpers({
  phrase: function(){
    console.log('phrase page')
    var phrase = Phrases.findOne(Session.get('selectedPhraseId'));
    return phrase;
  },
  body_formatted: function(){
    var converter = new Markdown.Converter();
    var html_body=converter.makeHtml(this.body);
    return html_body.autoLink();
  },
  canComment: function(){
    return canComment(Meteor.user());
  },
  canView: function(){
    return canView(Meteor.user());
  }
}); 

Template.phrase_page.rendered = function(){
  if((scrollToCommentId=Session.get('scrollToCommentId')) && !this.rendered && $('#'+scrollToCommentId).exists()){
    scrollPageTo('#'+scrollToCommentId);
    Session.set('scrollToCommentId', null);
    this.rendered=true;
  }

  document.title = Phrases.findOne(Session.get('selectedPhraseId')).headline;
}
