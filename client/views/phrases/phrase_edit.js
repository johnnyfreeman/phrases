// Template.phrase_edit.preserve(['#title', '#url', '#editor', '#sticky']);

// Template.phrase_edit.preserve({
//   // 'input[id]': function (node) { return node.id; }
//    '[name]': function(node) { return node.getAttribute('name');}
// });

Template.phrase_edit.helpers({
  phrase: function(){
    return Phrases.findOne(Session.get('selectedPhraseId'));
  },
  created: function(){
    var phrase= Phrases.findOne(Session.get('selectedPhraseId'));
    return moment(phrase.createdAt).format("MMMM Do, h:mm:ss a");
  },
  specialties: function(){
    var phrase = this;
    return Specialties.find().map(function(specialty) {
      specialty.checked = _.contains(_.pluck(phrase.specialties, '_id'), specialty._id) ? 'checked' : '';
      return specialty;
    });
  },
  isApproved: function(){
    return this.status == STATUS_APPROVED;
  },
  isSticky: function(){
    return this.sticky ? 'checked' : '';
  },
  isSelected: function(){
    // console.log('isSelected?')
    var phrase= Phrases.findOne(Session.get('selectedPhraseId'));
    return phrase && this._id == phrase.userId ? 'selected' : '';
  },
  submittedDate: function(){
    return moment(this.submitted).format("MM/DD/YYYY");
  },
  submittedTime: function(){
    return moment(this.submitted).format("HH:mm");
  },
  users: function(){
    return Meteor.users.find().fetch();
  },
  userName: function(){
    return getDisplayName(this);
  },
  hasStatusPending: function(){
    return this.status == STATUS_PENDING ? 'checked' : '';
  },
  hasStatusApproved: function(){
    return this.status == STATUS_APPROVED ? 'checked' : '';
  },
  hasStatusRejected: function(){
    return this.status == STATUS_REJECTED ? 'checked' : '';
  }
});

Template.phrase_edit.rendered = function(){
  var phrase= Phrases.findOne(Session.get('selectedPhraseId'));
  if(phrase && !this.editor){

    this.editor= new EpicEditor(EpicEditorOptions).load();
    this.editor.importFile('editor',phrase.body);

    $('#submitted_date').datepicker();

  }

  $("#phraseUser").selectToAutocomplete();

}

Template.phrase_edit.events = {
  'click input[type=submit]': function(e, instance){
    e.preventDefault();
    if(!Meteor.user()){
      throwError('You must be logged in.');
      return false;
    }

    var selectedPhraseId=Session.get('selectedPhraseId');
    var phrase = Phrases.findOne(selectedPhraseId);
    var specialties = [];
    var url = $('#url').val();
    var shortUrl = $('#short-url').val();
    var status = parseInt($('input[name=status]:checked').val());

    $('input[name=specialty]:checked').each(function() {
      var specialtyId = $(this).val();
      if(specialty = Specialties.findOne(specialtyId))
        specialties.push(specialty);
    });

    var properties = {
      headline:         $('#title').val(),
      shortUrl:         shortUrl,
      body:             instance.editor.exportFile(),
      specialties:       specialties,
    };

    if(url){
      properties.url = (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") ? url : "http://"+url;
    }

    if(isAdmin(Meteor.user())){
      if(status == STATUS_APPROVED){
        if(!phrase.submitted){
          // this is the first time we are approving the phrase
          properties.submitted = new Date().getTime();
        }else if($('#submitted_date').exists()){
          properties.submitted = parseInt(moment($('#submitted_date').val()+$('#submitted_time').val(), "MM/DD/YYYY HH:mm").valueOf());
        }
      }
      adminProperties = {
        sticky:     !!$('#sticky').attr('checked'),
        userId:     $('#phraseUser').val(),
        status:     status,
      };
      properties = _.extend(properties, adminProperties);
    }

    Phrases.update(selectedPhraseId,
    {
        $set: properties
      }
    ,function(error){
      if(error){
        console.log(error);
        throwError(error.reason);
      }else{
        trackEvent("edit phrase", {'phraseId': selectedPhraseId});
        Meteor.Router.to("/phrases/"+selectedPhraseId);
      }
    }
    );
  },
  'click .delete-link': function(e){
    e.preventDefault();
    if(confirm("Are you sure?")){
      var selectedPhraseId=Session.get('selectedPhraseId');
      Meteor.call("deletePhraseById", selectedPhraseId, function(error) {
        if (error) {
          console.log(error);
          throwError(error.reason);
        } else {
          Meteor.Router.to("/phrases/deleted");
        }
      });
    }
  }
};
