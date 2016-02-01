var Candidate = Composer.Model.extend({

    create:function(data){
        this.set({
            name:data.name,
            image:data.image,
            statements:[],
            synopsis:"Waiting..."
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
        var synopsis = e("synopsis");
        console.log(synopsis);
        statements.push({quote:e("quote"),source:e("source")});
        if (synopsis === "" || synopsis === null){
            this.set({statements: statements});
        }
        else{
            this.set({
                statements: statements,
                synopsis: synopsis
            });

        }
    }
})

var Candidates = Composer.Collection.extend({
    findByCandidateEntry:function(entry){
        var e = function(field) {
            return entry['gsx$'+field]['$t'].trim();
        };
        var name = e('name');

        var candidate = this.find(function(item){
            return item.get('name') === name;
        });
        return candidate;
    },
    findByCandidateName:function(name){
        var candidate = this.find(function(item){
            return item.get('name') === name;
        });
        return candidate;
    }
});
