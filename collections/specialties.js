Specialties = new Meteor.Collection('specialties');

Specialties.allow({
  insert: isAdminById
, update: isAdminById
, remove: isAdminById
});

Meteor.methods({
  specialty: function(specialty){
    if (!Meteor.user() || !isAdmin(Meteor.user()))
      throw new Meteor.Error('You need to login and be an admin to add a new specialty.') 
    var specialtyId=Specialties.insert(specialty);
    return specialty.name;
  }
});