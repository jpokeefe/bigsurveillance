var CandidateController = Composer.Controller.extend({

    events: {
        // 'click button.tweet_link': 'tweet',
        // 'click button.info_link': 'info',
        // 'click h4': 'tweet',
        'click .candidate_shot': 'info'
        // 'click .inline_tweet': 'tweet',
        // 'click .peekaboo': 'click'
    },

    elements: {
        '.peekaboo': 'hidden'
    },

    model: null,

    init: function() {
        this.render();
    },

    render: function() {
        var div = CandidateView({
            name: this.model.get("name"),
            synopsis: this.model.get("synopsis"),
            image: this.model.get("image")
        });
        this.html(div);

    },

    tweet: function(e) {
        e.preventDefault();

        var handle = this.model.get('twitter');
        if (handle) {
            handle = '.@' + handle;
        }

        var url = window.location.protocol + '//' + window.location.host + '?candidate=' + this.model.get('name').replace(" ", "_");

        var txt = encodeURIComponent(handle + ', something something surveillance ' + url);
        window.open('https://twitter.com/intent/tweet?text=' + txt);
    },

    info: function(e) {
        if (e)
            e.preventDefault();

        new CandidateModalController({
            model: this.model
        });
    },

    click: function(e) {
        if (e)
            e.preventDefault();

        if (e.target && this.hidden && e.target == this.hidden)
            this.info();
    }
});
