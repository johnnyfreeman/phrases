Template.toolbox.events= {
  'click .update-specialties':function(){
  var phrases=Phrases.find().fetch();
  $.each(phrases, function(index, element){

    if(element.specialties){
      console.log('Found specialties for phrase "'+element.headline+'"');
      $.each(element.specialties)
    Phrases.update(element._id,{$set:{userId:element.user_id}}, function(error){
      console.log(error);
    });

    console.log(element);
    }
  });
  }
}