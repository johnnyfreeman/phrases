Template.specialty_item.events({
  'click .edit-link': function(e, instance){
    e.preventDefault();
    var specialtyId = instance.data._id;
    var name = $('#name_'+specialtyId).val();
    var slug = slugify(name);
    if(name){
      Specialties.update(specialtyId,{ $set: {name: name, slug: slug}});
    }else{
      Specialties.remove(specialtyId);
    }
  }
})