// "secret" server code to recalculate scores

updateScore = function (collection, id, forceUpdate) {
  var forceUpdate = typeof forceUpdate !== 'undefined' ? forceUpdate : false;
  // For performance reasons, the database is only updated if the difference between the old score and the new score
  // is meaningful enough. To find out, we calculate the "power" of a single vote after n days.
  // We assume that after n days, a single vote will not be powerful enough to affect phrases' ranking order.
  // Note: sites whose phrases regularly get a lot of votes can afford to use a lower n. 

  // n =  number of days after which a single vote will not have a big enough effect to trigger a score update
  //      and phrases can become inactive
  var n = 30;
  // x = score increase amount of a single vote after n days (for n=100, x=0.000040295)
  var x = 1/Math.pow(n*24+2,1.3);
  // time decay factor
  var f = 1.3;

  var object = collection.findOne(id);

  // use submitted timestamp if available, else (for pending phrases) calculate score using createdAt
  var age = object.submitted || object.createdAt;

  // use baseScore if defined, if not just use the number of votes
  // note: for transition period, also use votes if there are more votes than baseScore
  // var baseScore = Math.max(object.votes || 0, object.baseScore || 0);
  var baseScore = object.baseScore;

  // now multiply by 'age' exponentiated
  // FIXME: timezones <-- set by server or is getTime() ok?
  var ageInHours = (new Date().getTime() - age) / (60 * 60 * 1000);

  // HN algorithm
  var newScore = baseScore / Math.pow(ageInHours + 2, f);

  // Note: before the first time updateScore runs on a new item, its score will be at 0
  var scoreDiff = Math.abs(object.score - newScore);

  // only update database if difference is larger than x to avoid unnecessary updates
  if (forceUpdate || scoreDiff > x){
    collection.update(id, {$set: {score: newScore, inactive: false}});
    return 1;
  }else if(ageInHours > n*24){
    // only set a phrase as inactive if it's older than n days
    collection.update(id, {$set: {inactive: true}});
  }
  return 0;
};

Meteor.startup(function () {
  var scoreInterval = getSetting("scoreUpdateInterval") || 30;
  if(scoreInterval>0){

    // active items get updated every N seconds
    intervalId=Meteor.setInterval(function () {
      var updatedPhrases = 0;
      var updatedComments = 0;
      // console.log('tick ('+scoreInterval+')');
      Phrases.find({'inactive': {$ne : true}}).forEach(function (phrase) {
        updatedPhrases += updateScore(Phrases, phrase._id);
      });
      Comments.find({'inactive': {$ne : true}}).forEach(function (comment) {
        updatedComments += updateScore(Comments, comment._id);
      });
      // console.log("Updated "+updatedPhrases+"/"+Phrases.find().count()+" Phrases")
      // console.log("Updated "+updatedComments+"/"+Comments.find().count()+" Comments")
    }, scoreInterval * 1000);

    // inactive items get updated every hour
    inactiveIntervalId=Meteor.setInterval(function () {
      var updatedPhrases = 0;
      var updatedComments = 0;
      Phrases.find({'inactive': true}).forEach(function (phrase) {
        updatedPhrases += updateScore(Phrases, phrase._id);
      });
      Comments.find({'inactive': true}).forEach(function (comment) {
        updatedComments += updateScore(Comments, comment._id);
      });
    }, 3600 * 1000);

  }
});
