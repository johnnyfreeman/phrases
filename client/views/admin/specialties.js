Template.specialties.helpers({
  specialties: function(){
    return Specialties.find();
  }
});

Template.specialties.events({
  'click input[type=submit]': function(e){
    e.preventDefault();

    var name = $('#name').val();
    var slug = slugify(name);
    
    Meteor.call('specialty', {
      name: name,
      slug: slug
    }, function(error, specialtyName) {
      if(error){
        console.log(error);
        throwError(error.reason);
        clearSeenErrors();
      }else{
        $('#name').val('');
        // throwError('New specialty "'+specialtyName+'" created');
      }
    });
  }
})