// build find query object
selectPhrases = function(properties){
  var find = {};

  // Status
  if(properties.status)
    find = _.extend(find, {status: properties.status});

  // Slug
  if(properties.slug)
    find = _.extend(find, {'specialties.slug': properties.slug});
  
  // Date
  if(properties.date){
    find = _.extend(find, {submitted: 
      {
        $gte: moment(properties.date).startOf('day').valueOf(), 
        $lt: moment(properties.date).endOf('day').valueOf()
      }
    });
  }

  return find;
}

// build sort query object
sortPhrases = function(sortProperty){
  var sort = {sort: {sticky: -1}};
  sort.sort[sortProperty] = -1;
  sort.sort._id = 1;
  return sort;
}

selectDigest = function(mDate) {
  return _.extend({
    submitted: {
      $gte: mDate.startOf('day').valueOf(), 
      $lt: mDate.endOf('day').valueOf()
    }
  }, selectPhrases({status: STATUS_APPROVED}));
}

sortDigest = function() {
  return {sort: {baseScore: -1, _id: 1}};
}

findDigestPhrases = function(mDate) {
  return Phrases.find(selectDigest(mDate), sortDigest());
}
