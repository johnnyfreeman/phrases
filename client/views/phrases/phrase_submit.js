Template.phrase_submit.helpers({
  specialties: function(){
    return Specialties.find();
  },
  users: function(){
    return Meteor.users.find();
  },
  userName: function(){
    return getDisplayName(this);
  },
  isSelected: function(){
    var phrase=Phrases.findOne(Session.get('selectedPhraseId'));
    return phrase && this._id == phrase.userId;
  }
});

Template.phrase_submit.rendered = function(){
  Session.set('selectedPhraseId', null);
  if(!this.editor && $('#editor').exists())
    this.editor= new EpicEditor(EpicEditorOptions).load();
  $('#submitted').datepicker().on('changeDate', function(ev){
    $('#submitted_hidden').val(moment(ev.date).valueOf());
  });

  $("#phraseUser").selectToAutocomplete();

}

Template.phrase_submit.events = {
  'click input[type=submit]': function(e, instance){
    e.preventDefault();

    $(e.target).addClass('disabled');

    if(!Meteor.user()){
      throwError('You must be logged in.');
      return false;
    }

    var title= $('#title').val();
    var url = $('#url').val();
    var shortUrl = $('#short-url').val();
    var body = instance.editor.exportFile();
    var specialties=[];
    var sticky=!!$('#sticky').attr('checked');
    var submitted = $('#submitted_hidden').val();
    var userId = $('#phraseUser').val();
    var status = parseInt($('input[name=status]:checked').val());

    $('input[name=specialty]:checked').each(function() {
      specialties.push(Specialties.findOne($(this).val()));
     });

    var properties = {
        headline: title
      , body: body
      , shortUrl: shortUrl
      , specialties: specialties
      , sticky: sticky
      , submitted: submitted
      , userId: userId
      , status: status
    };
    if(url){
      var cleanUrl = (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") ? url : "http://"+url;
      properties.url = cleanUrl;
    }

    Meteor.call('phrase', properties, function(error, phrase) {
      if(error){
        throwError(error.reason);
        clearSeenErrors();
        $(e.target).removeClass('disabled');
        if(error.error == 603)
          Meteor.Router.to('/phrases/'+error.details);
      }else{
        trackEvent("new phrase", {'phraseId': phrase.phraseId});
        if(phrase.status === STATUS_PENDING)
          throwError('Thanks, your phrase is awaiting approval.')
        Meteor.Router.to('/phrases/'+phrase.phraseId);
      }
    });
  }

  ,'click .get-title-link': function(e){
    e.preventDefault();
    var url=$("#url").val();
    $(".get-title-link").addClass("loading");
    if(url){
      $.get(url, function(response){
          if ((suggestedTitle=((/<title>(.*?)<\/title>/m).exec(response.responseText))) != null){
              $("#title").val(suggestedTitle[1]);
          }else{
              alert("Sorry, couldn't find a title...");
          }
          $(".get-title-link").removeClass("loading");
       });
    }else{
      alert("Please fill in an URL first!");
      $(".get-title-link").removeClass("loading");
    }
  }

};
