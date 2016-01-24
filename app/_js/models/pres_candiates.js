var Candidate = Composer.Model.extend({

    create:function(data){
        this.set({
            name:data.name,
            image:data.image,
            statements:[]
        });
    },


    populateFromGoogle: function(entry){
        var e = function(field) {
            return entry['gsx$'+field]['$t'].trim();
        };
        if (this.get('name') !== e('name')){
            return;
            }
        var statements = this.get("statements");
        statements.push({quote:e("quote"),source:e("source")});
        this.set({statements: statements});
    }
})

var Candidates = Composer.Collection.extend({
    findByCandidateName:function(entry){
        var e = function(field) {
            return entry['gsx$'+field]['$t'].trim();
        };
        var name = e('name');

        var candidate = this.find(function(item){
            return item.get('name') === name;
        });
        return candidate;

    }
});
