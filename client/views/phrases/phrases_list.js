Template.phrases_top.topPhrasesHandle = function() { 
  return topPhrasesHandle;
}
Template.phrases_new.newPhrasesHandle = function() { 
  return newPhrasesHandle;
}
Template.phrases_best.bestPhrasesHandle = function() { 
  return bestPhrasesHandle;
}
Template.phrases_pending.pendingPhrasesHandle = function() { 
  return pendingPhrasesHandle;
}

Template.phrases_list.helpers({
  phrases: function() {
    return this.fetch();
  },
  phrasesReady: function() {
    return this.ready();
  },
  allPhrasesLoaded: function(){
    allPhrasesLoaded = this.fetch().length < this.loaded();
    Session.set('allPhrasesLoaded', allPhrasesLoaded);
    return allPhrasesLoaded;  
  }
});

Template.phrases_list.rendered = function(){
  var distanceFromTop = 0;
  $('.phrase').each(function(){
    distanceFromTop += $(this).height();
  });
  Session.set('distanceFromTop', distanceFromTop);
  $('body').css('min-height',distanceFromTop+160);
}

Template.phrases_list.events({
  'click .more-link': function(e) {
    e.preventDefault();
    Session.set('currentScroll',$('body').scrollTop());
    this.loadNextPage();
  }
});

