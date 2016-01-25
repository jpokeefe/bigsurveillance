var CandidateModalController = BaseShareModalController.extend({

    init: function() {
        this.render();
        this.show();
        console.log(this.model.toJSON());
    },

    render: function() {
        var overlay = this.base_render();

        overlay.firstChild.appendChild(CandidateModalView({
            name:this.model.get("name"),
            statements:this.model.get("statements")
        }));

        this.html(overlay);
    }
});
