// database migrations
// http://stackoverflow.com/questions/10365496/meteor-how-to-perform-database-migrations
Migrations = new Meteor.Collection('migrations');

Meteor.startup(function () {


 // migration updatePhraseStatus: make sure phrases have a status
  if (!Migrations.findOne({name: "updatePhraseStatus"})) {
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//    Starting updatePhraseStatus Migration    //-----------//")
    console.log("//----------------------------------------------------------------------//")
    Phrases.find({status: {$exists : false}}).forEach(function (phrase) {
        Phrases.update(phrase._id, {$set: {status: 2}});

        // START CONSOLE LOGS
        console.log("---------------------")
        console.log("Phrase: "+phrase.headline);
        console.log("Updating status to approved");
        // END CONSOLE LOGS
      
    });
    Migrations.insert({name: "updatePhraseStatus"});
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//     Ending updatePhraseStatus Migration     //-----------//")
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




  // migration updateSpecialties: store full Specialty object in phrase instead of just the name
  if (!Migrations.findOne({name: "updatePhraseSpecialties"})) {
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//  Starting updatePhraseSpecialties Migration  //-----------//")
    console.log("//----------------------------------------------------------------------//")
    Phrases.find().forEach(function (phrase) {
      var oldSpecialties = phrase.specialties;
      var newSpecialties = [];
      var Specialty = {};
      var updating = false; // by default, assume we're not going to do anything

      // iterate over the phrase.specialties array
      // if the phrase has no specialties then nothing will happen
      _.each(oldSpecialties, function(value, key, list){
        // make sure the specialties are strings
        if((typeof value === "string") && (Specialty = Specialties.findOne({name: value}))){
          // if value is a string, then look for the matching Specialty object
          // and if it exists push it to the newSpecialties array
          updating = true; // we're updating at least one Specialty for this phrase
          newSpecialties.push(Specialty);
        }else{
          // if Specialty A) is already an object, or B) it's a string but a matching Specialty object doesn't exist
          // just keep the current value
          newSpecialties.push(value);
        }
      });

      if(updating){
        // update specialties property on phrase
        Phrases.update(phrase._id, {$set: {specialties: newSpecialties}});
      }

      // START CONSOLE LOGS
      console.log("---------------------")
      console.log("Phrase: "+phrase.headline);
      if(updating){
        console.log(oldSpecialties.length+" specialties: "+oldSpecialties)
        console.log("Updating specialties array to: ");
        console.log(newSpecialties);
      }else{
        console.log("No updates");
      }
      // END CONSOLE LOGS

    });
    Migrations.insert({name: "updatePhraseSpecialties"});
    console.log("//----------------------------------------------------------------------//")
    console.log("//------------//     Ending updateSpecialties Migration     //-----------//")
    console.log("//----------------------------------------------------------------------//")
  }



});