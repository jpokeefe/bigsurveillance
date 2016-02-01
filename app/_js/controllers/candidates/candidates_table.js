var CandidatesTableController = Composer.ListController.extend({

    elements: {
        'div': 'div_list'
    },

    collection: null,

    init: function()
    {
        this.render();

        // set up tracking to inject subcontrollers into our <ul>
        this.track(this.collection, function(model, options) {
            return new CandidateController({
                inject: this.div_list,
                model: model
            });
        }.bind(this), {
            // note that fragment_on_reset is a function returning the same list
            // element we pass to the subcontroller's inject key in the create_fn
            // above
            fragment_on_reset: function() { return this.div_list; }.bind(this)
        })
    },

    render: function()
    {

        this.html('<h3>Presidential Candidates on Surveillance</h3><div class="candidates_table"></div>');
    }
});
