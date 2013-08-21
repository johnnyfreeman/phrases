serveAPI = function(limitSegment){
  var phrases = [];
  var limit = 100; // default limit: 100 phrases
  
  if(this.request.query.limit){
    // first, try getting the limit from the request (i.e. ?limit=100)
    limit = this.request.query.limit;
  }else if(typeof limitSegment !== 'undefined'){
    // else, get it from the URL segment
    limit = limitSegment;
  }

  Phrases.find({status: STATUS_APPROVED}, {sort: {submitted: -1}, limit: limit}).forEach(function(phrase) {
    var url = (phrase.url ? phrase.url : getPhraseUrl(phrase._id));
    var properties = {
     headline: phrase.headline,
     author: phrase.author,
     date: phrase.submitted,
     url: url,
     guid: phrase._id
    };

    if(phrase.body)
      properties['body'] = phrase.body;

    if(phrase.url)
      properties['domain'] = getDomain(url);

    if(twitterName = getTwitterNameById(phrase.userId))
      properties['twitterName'] = twitterName;

    phrases.push(properties);
  });

  return JSON.stringify(phrases); 
}

Meteor.Router.add({
  '/feed.xml': function() {
    var feed = new RSS({
      title: getSetting('title'),
      description: getSetting('tagline'),
      feed_url: Meteor.absoluteUrl()+'feed.xml',
      site_url: Meteor.absoluteUrl(),
      image_url: Meteor.absoluteUrl()+'img/favicon.png',
    });
    
    Phrases.find({status: STATUS_APPROVED}, {sort: {submitted: -1}, limit: 20}).forEach(function(phrase) {
      feed.item({
       title: phrase.headline,
       description: phrase.body+'</br></br> <a href="'+getPhraseUrl(phrase._id)+'">Comments</a>',
       author: phrase.author,
       date: phrase.submitted,
       url: (phrase.url ? phrase.url : getPhraseUrl(phrase._id)),
       guid: phrase._id
      });
    });
    
    return feed.xml();
  },
  
  '/api': serveAPI,
  
  '/api/:limit': serveAPI

});
