Template.footer.helpers({
  footerCode: function(){
    return getSetting('footerCode');
  }, 
  distanceFromTop: function(){
    var distanceFromTop = parseInt(Session.get('distanceFromTop'))+70+20;
    if(Meteor.Router.page()!='phrases_digest' && !Session.get('allPhrasesLoaded'))
      distanceFromTop += 70;
    return distanceFromTop;
  },
  footerClass: function(){
    return Session.get('isPhrasesList') ? 'absolute' : 'static';
  }
});