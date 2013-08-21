Template.toolbox.events= {
  'click .update-specialties':function(){
  var posts=Posts.find().fetch();
  $.each(posts, function(index, element){

    if(element.specialties){
      console.log('Found specialties for post "'+element.headline+'"');
      $.each(element.specialties)
    Posts.update(element._id,{$set:{userId:element.user_id}}, function(error){
      console.log(error);
    });

    console.log(element);
    }
  });
  }
}