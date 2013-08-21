// database migrations
// http://stackoverflow.com/questions/10365496/meteor-how-to-perform-database-migrations
Migrations = new Meteor.Collection('migrations');

Meteor.startup(function () {


 // migration updatePostStatus: make sure posts have a status
  if (!Migrations.findOne({name: "updatePostStatus"})) {
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//    Starting updatePostStatus Migration    //-----------//")
    console.log("//----------------------------------------------------------------------//")
    Posts.find({status: {$exists : false}}).forEach(function (post) {
        Posts.update(post._id, {$set: {status: 2}});

        // START CONSOLE LOGS
        console.log("---------------------")
        console.log("Post: "+post.headline);
        console.log("Updating status to approved");
        // END CONSOLE LOGS
      
    });
    Migrations.insert({name: "updatePostStatus"});
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//     Ending updatePostStatus Migration     //-----------//")
    console.log("//----------------------------------------------------------------------//")
  }




 // migration updateSpecialties: make sure specialties have slugs
  if (!Migrations.findOne({name: "updateSpecialties"})) {
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//    Starting updateSpecialties Migration    //-----------//")
    console.log("//----------------------------------------------------------------------//")
    Specialties.find().forEach(function (Specialty) {
      if(typeof Specialty.slug === "undefined"){
        var slug = slugify(Specialty.name);
        Specialties.update(Specialty._id, {$set: {slug: slug}});

        // START CONSOLE LOGS
        console.log("---------------------")
        console.log("Specialty: "+Specialty.name);
        console.log("Updating Specialty with new slug: "+slug);
        // END CONSOLE LOGS
      }
    });
    Migrations.insert({name: "updateSpecialties"});
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//     Ending updateSpecialties Migration     //-----------//")
    console.log("//----------------------------------------------------------------------//")
  }




  // migration updateSpecialties: store full Specialty object in post instead of just the name
  if (!Migrations.findOne({name: "updatePostSpecialties"})) {
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//  Starting updatePostSpecialties Migration  //-----------//")
    console.log("//----------------------------------------------------------------------//")
    Posts.find().forEach(function (post) {
      var oldSpecialties = post.specialties;
      var newSpecialties = [];
      var Specialty = {};
      var updating = false; // by default, assume we're not going to do anything

      // iterate over the post.specialties array
      // if the post has no specialties then nothing will happen
      _.each(oldSpecialties, function(value, key, list){
        // make sure the specialties are strings
        if((typeof value === "string") && (Specialty = Specialties.findOne({name: value}))){
          // if value is a string, then look for the matching Specialty object
          // and if it exists push it to the newSpecialties array
          updating = true; // we're updating at least one Specialty for this post
          newSpecialties.push(Specialty);
        }else{
          // if Specialty A) is already an object, or B) it's a string but a matching Specialty object doesn't exist
          // just keep the current value
          newSpecialties.push(value);
        }
      });

      if(updating){
        // update specialties property on post
        Posts.update(post._id, {$set: {specialties: newSpecialties}});
      }

      // START CONSOLE LOGS
      console.log("---------------------")
      console.log("Post: "+post.headline);
      if(updating){
        console.log(oldSpecialties.length+" specialties: "+oldSpecialties)
        console.log("Updating specialties array to: ");
        console.log(newSpecialties);
      }else{
        console.log("No updates");
      }
      // END CONSOLE LOGS

    });
    Migrations.insert({name: "updatePostSpecialties"});
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//     Ending updateSpecialties Migration     //-----------//")
    console.log("//----------------------------------------------------------------------//")
  }



});