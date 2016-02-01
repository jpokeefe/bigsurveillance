/*
 @licstart  The following is the entire license notice for the
    JavaScript code in this page.

 Copyright (C) 2015 Fight for the Future
 Copyright (C) 2015 Zaki Manian

 The JavaScript code in this page is free software: you can
 redistribute it and/or modify it under the terms of the GNU
 General Public License (GNU GPL) as published by the Free Software
 Foundation, either version 3 of the License, or (at your option)
 any later version. The code is distributed WITHOUT ANY WARRANTY;
 without even the implied warranty of MERCHANTABILITY or FITNESS
 FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.

 As additional permission under GNU GPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 @licend  The above is the entire license notice
    for the JavaScript code in this page.
*/
var CandidateController = Composer.Controller.extend({

    events: {
        'click button.tweet_link': 'tweet',
        'click button.info_link': 'info',
        'click h4': 'tweet',
        'click .headshot': 'tweet',
        'click .inline_tweet': 'tweet',
        'click .peekaboo': 'click'
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

        var url = window.location.protocol + '//' + window.location.host + '?candidate=' + this.model.get('name').repalce(" ", "_");

        var txt = encodeURIComponent(name + ', something something surveillance ' + url);
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
;var CandidateModalController = BaseShareModalController.extend({

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

;var CandidatesTableController = Composer.ListController.extend({

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

;var PoliticalScoreboardController = Composer.Controller.extend({
    elements: {
        '.internet .filtered': 'good_list',
        '.surveillance .filtered': 'bad_list',
        '.unknown .filtered': 'meh_list',
        '.team.unknown': 'meh_panel',
        'select': 'select'
    },

    events: {
        'change select': 'filter'
    },

    collection: null,
    good: null,
    bad: null,
    meh: null,

    init: function() {
        this.render();

        this.good = new Composer.FilterCollection(this.collection, {
            filter: function(model) {
                return model.get('score') >= 6;
            }
        });
        this.init_list(this.good, this.good_list);

        this.bad = new Composer.FilterCollection(this.collection, {
            filter: function(model) {
                return model.get('score') < 0;
            }
        });
        this.init_list(this.bad, this.bad_list);

        this.meh = new Composer.FilterCollection(this.collection, {
            filter: function(model) {
                return model.get('score') >= 0 && model.get('score') <= 5;
            }
        });
        this.init_list(this.meh, this.meh_list);

        // hide the "unclear" section if no politicians in it
        this.with_bind(this.meh, 'reset', this.maybeHideMehPanel.bind(this));

        this.maybeHideMehPanel();
    },

    init_list: function(filterCollection, inject) {

        var masterCollection = this.collection;

        new Composer.ListController({
            collection: filterCollection,
            inject: inject,
            init: function() {
                this.track(this.collection, function(model, options) {
                    return new PoliticianController({
                        inject: this.el,
                        model: model,
                        masterCollection: masterCollection
                    });
                }.bind(this), {bind_reset: true})
            }
        });
    },

    render: function() {
        var div = PoliticalScoreboardView({state: this.collection.state});
        this.html(div);
    },

    filter: function() {
        var state = this.select.options[this.select.selectedIndex].value;

        this.collection.state = state;
        this.collection.refresh();
    },

    maybeHideMehPanel: function() {
        if (this.meh.models().length == 0) {
            this.meh_panel.classList.add('hidden');
        } else {
            this.meh_panel.classList.remove('hidden');
        }
    }
});

;var PoliticianController = Composer.Controller.extend({

    events: {
        'click button.tweet_link': 'tweet',
        'click button.info_link': 'info',
        'click h4': 'tweet',
        'click .headshot': 'tweet',
        'click .inline_tweet': 'tweet',
        'click .peekaboo': 'click'
    },

    elements: {
        '.peekaboo': 'hidden'
    },

    model: null,
    noGrade: false,
    extraInfo: false,
    masterCollection: null,

    init: function () {
        this.render();
    },

    render: function () {

        if (this.masterCollection && this.masterCollection.state)
            var state = this.masterCollection.state;
        else
            var state = null;

        var div = PoliticianView({
            state: state,
            politician: this.model.toJSON(),
            noGrade: this.noGrade,
            extraInfo: this.extraInfo
        });

        this.html(div);

        if (state == 'all' || state == 'senate' || state == 'house')
            this.el.className = 'block';
        else
            this.el.className = 'politician';
    },

    tweet: function (e) {
        e.preventDefault();

        var name = this.model.get('twitter');
        if (name) {
            // name = '@' + name;
            name = '.@' + name;
        } else {
            if (this.model.get('organization') == 'House')
                name = 'Rep. ' + this.model.get('last_name');
            else
                name = 'Sen. ' + this.model.get('last_name');
        }
        if (this.model.get('grade').charAt(0) == 'A' || this.model.get('grade').charAt(0) == 'F')
            var article = 'an';
        else
            var article = 'a';

        var url = window.location.protocol + '//' + window.location.host + '?politician='+ this.model.get('bioguide');

        // var txt = encodeURIComponent('Here\'s why '+name+' got '+article+' '+this.model.get('grade')+' on surveillance: '+url+' #StopCISA');
        var txt = encodeURIComponent(name+', please vote to #StopCISA; more data held by insecure govt agencies won\'t make us safer. '+url);
        window.open('https://twitter.com/intent/tweet?text=' + txt);
    },

    info: function (e) {
        if (e)
            e.preventDefault();

        new PoliticianModalController({model: this.model});
    },

    click: function(e) {
        if (e)
            e.preventDefault();

        if (e.target && this.hidden && e.target == this.hidden)
            this.info();
    }
});

;var PoliticianModalController = BaseShareModalController.extend({

    init: function() {
        this.render();
        this.show();
        console.log(this.model.toJSON());
    },

    render: function() {
        var overlay = this.base_render();

        overlay.firstChild.appendChild(PoliticianModalView({
            positions: this.model.get('score_criteria'),
            name: this.model.get('first_name') +" "+ this.model.get('last_name')

        }));

        this.html(overlay);
    }
});

;/**
    Politician Model
**/
var Politician = Composer.Model.extend({
    populateFromGoogle: function(entry) {

        var e = function(field) { return entry['gsx$'+field]['$t'].trim(); };

        this.set({
            first_name:      e('first'),
            last_name:       e('name'),
            image:           e('imagepleasedontedit'),
            bioguide:        e('bioguide'),
            email:           e('email'),
            phone:           e('phone'),
            organization:    e('organization'),
            state:           e('state'),
            state_short:     this.shortenState(e('state')),
            twitter:         e('twitter'),
            party:           e('partyaffiliation'),
            vote_usaf:       e('voteusaf'),
            vote_tempreauth: e('votetempreauth'),
            office1:         e('office1'),
            office1phone:    e('office1phone'),
            office1geo:      e('office1geo'),
            office2:         e('office2'),
            office2phone:    e('office2phone'),
            office2geo:      e('office2geo'),
            office3:         e('office3'),
            office3phone:    e('office3phone'),
            office3geo:      e('office3geo'),
            office4:         e('office4'),
            office4phone:    e('office4phone'),
            office4geo:      e('office4geo'),
            office5:         e('office5'),
            office5phone:    e('office5phone'),
            office5geo:      e('office5geo'),
            office6:         e('office6'),
            office6phone:    e('office6phone'),
            office6geo:      e('office6geo'),
            office7:         e('office7'),
            office7phone:    e('office7phone'),
            office7geo:      e('office7geo'),
            office8:         e('office8'),
            office8phone:    e('office8phone'),
            office8geo:      e('office8geo'),

            // meta field
            score: 0,
            score_criteria: [],

            // scorecard fields
            fisa_courts_reform_act:                                 e('fisacourtsreformact'),
            s_1551_iosra:                                           e('s1551iosra'),
            fisa_improvements_act:                                  e('fisaimprovementsact'),
            fisa_transparency_and_modernization_act:                e('fisatransparencyandmodernizationact'),
            surveillance_state_repeal_act:                          e('surveillancestaterepealact'),
            usa_freedom_prior_to_20140518:                          e('usafreedompriorto2014-05-18'),
            voted_for_conyers_amash_amendment:                      e('votedforconyersamashamendment'),
            voted_for_house_version_of_usa_freedom_act_2014:        e('votedforhouseversionofusafreedomact2014'),
            voted_for_massie_lofgren_amendment_2014:                e('votedformassielofgrenamendment2014'),
            whistleblower_protection_for_ic_employees_contractors:  e('whistleblowerprotectionforicemployeescontractors'),
            first_usaf_cloture_vote:                                e('stusafcloturevote'),
            straight_reauth:                                        e('straightreauth'),
            fisa_reform_act:                                        e('fisareformact'),
            amendment_1449_data_retention:                          e('amendment1449dataretention'),
            amendment_1450_extend_implementation_to_1yr:            e('amendment1450extendimplementationto1yr'),
            amendment_1451_gut_amicus:                              e('amendment1451gutamicus'),
            final_passage_usaf:                                     e('finalpassageusaf'),
            s_702_reforms:                                          e('reforms'),
            massie_lofgren_amendment_to_hr2685_defund_702:          e('massielofgrenamendmenttohr2685defund702'),
            massie_lofgren_amendment_to_hr4870_no_backdoors:        e('massielofgrenamendmenttohr4870nobackdoors'),
            ECPA_reform_cosponsor:e('ecpareformcosponsor'),
            house_PCNA:e('housepcna'),
            house_NCPA:e('housencpaa'),
            ECPA_reform_cosponsor:e('ecpareformcosponsor'),
            CISA_cloture_vote:e('cisacloture'),
            franken_cisa_amendment:e('frankencisaamendment'),
            wyden_cisa_amendment:e('wydencisaamendment'),
            heller_cisa_amendment:e('hellercisaamendment'),
            coons_cisa_amendment:e('coonscisaamendment'),
            coons_cisa_amendment:e('cottoncisaamendment'),
            cisa_final:e('cisafinal')
        }, {silent: true});
        this.doScore();
    },

    doScore: function() {
        var score = 0;
        var score_criteria = [];

        if (this.get('fisa_courts_reform_act') == 'X') {
            var inc = 3;
            score_criteria.push({
                score:  inc,
                info:   'Supported the FISA Courts Reform Act',
                url: 'http://www.ibtimes.com/nsa-fisa-surveillance-obama-likely-back-secret-court-reform-senator-says-1368781'
            });
            score += inc;
        }
        if (this.get('s_1551_iosra') == 'X') {
            var inc = 4;
            score_criteria.push({
                score:  inc,
                info:   'Supported the Intelligence Oversight and Surveillance Reform Act',
                url:   'https://cdt.org/blog/bills-offer-clear-choice-end-bulk-collection-of-americans%E2%80%99-data-or-endorse-it/'
            });
            score += inc;
        }
        if (this.get('fisa_improvements_act') == 'X') {
            var inc = -4;
            score_criteria.push({
                score:  inc,
                info:   'Supported the FISA Improvements Act',
                url:'http://www.theguardian.com/world/2013/nov/15/feinstein-bill-nsa-warrantless-searches-surveillance'
            });
            score += inc;
        }
        if (this.get('fisa_transparency_and_modernization_act') == 'X') {
            var inc = -4;
            score_criteria.push({
                score:  inc,
                info:   'Supported the FISA Transparency and Modernization Act',
                url:'https://www.eff.org/deeplinks/2014/04/nsa-reform-bill-intelligence-community-written-intelligence-community-and'
            });
            score += inc;
        }
        if (this.get('surveillance_state_repeal_act') == 'X') {
            var inc = 4;
            score_criteria.push({
                score:  inc,
                info:   'Supported the Surveillance State Repeal Act',
                url:'http://www.restorethe4th.com/blog/go-big-or-go-home-pass-the-new-surveillance-state-repeal-act/'
            });
            score += inc;
        }
        if (this.get('usa_freedom_prior_to_20140518') == 'X') {
            var inc = 2;
            score_criteria.push({
                score:  inc,
                info:   'Supported the original USA Freedom Act (prior to May 18th, 2014)',
                url:' https://www.eff.org/deeplinks/2014/07/new-senate-usa-freedom-act-first-step-towards-reforming-mass-surveillance'
            });
            score += inc;
        }
        if (this.get('voted_for_conyers_amash_amendment') == 'X') {
            var inc = 4;
            score_criteria.push({
                score:  inc,
                info:   'Voted for Conyers Amash Amendment',
                url: ' http://americablog.com/2013/07/amash-conyers-anti-nsa-amendment-lost-by-12-votes-205-217.html'
            });
            score += inc;
        }
        if (this.get('voted_for_house_version_of_usa_freedom_act_2014') == 'X') {
            var inc = -2;
            score_criteria.push({
                score:  inc,
                info:   'Voted for gutted House version of USA Freedom Act of 2014',
                url: 'https://www.eff.org/deeplinks/2014/05/eff-dismayed-houses-gutted-usa-freedom-act'
            });
            score += inc;
        }
        if (this.get('voted_for_massie_lofgren_amendment_2014') == 'X') {
            var inc = 3;
            score_criteria.push({
                score:  inc,
                info:   'Voted for Massie-Lofgren Amendment (2014)',
                url:' http://www.huffingtonpost.com/2014/12/10/nsa-surveillance-spending-bill_n_6304834.html'
            });
            score += inc;
        }
        if (this.get('whistleblower_protection_for_ic_employees_contractors') == 'X') {
            var inc = 4;
            score_criteria.push({
                score:  inc,
                info:   'Supported whistleblower protection measures for Intelligence employees and contractors',
                url:'http://whistleblower.org/blog/121230-49-orgs-call-congress-restore-whistleblower-rights-intelligence-contractors'
            });
            score += inc;
        }
        if (this.get('first_usaf_cloture_vote') == 'GOOD') {
            var inc = 4;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on reauthorizing the PATRIOT Act *and* NO on cloture for the first Senate USA Freedom Act',
                url:'http://www.thewhir.com/web-hosting-news/senate-votes-to-invoke-cloture-on-usa-freedom-act-advancing-it-to-an-amendment-process'

            });
            score += inc;
        }
        else if (this.get('first_usaf_cloture_vote') == 'OK') {
            var inc = -1;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on reauthorizing the PATRIOT Act *and* YES on cloture for the first Senate USA Freedom Act',
                url:'http://www.thewhir.com/web-hosting-news/senate-votes-to-invoke-cloture-on-usa-freedom-act-advancing-it-to-an-amendment-process'
            });
            score += inc;
        }
        else if (this.get('first_usaf_cloture_vote') == 'BAD') {
            var inc = -4;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on reauthorizing the PATRIOT Act and NO on the first USA Freedom Act cloture vote',
                url:'http://thehill.com/policy/national-security/242173-mcconnell-introduces-short-term-nsa-bill'
            });
            score += inc;
        }
        if (this.get('straight_reauth') == 'GOOD') {
            var inc = 3;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on reauthorizing the PATRIOT Act',
                url:'http://thehill.com/policy/national-security/242173-mcconnell-introduces-short-term-nsa-bill'
            });
            score += inc;
        }
        else if (this.get('straight_reauth') == 'BAD') {
            var inc = -3;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on reauthorizing the PATRIOT Act',
                url:'https://cdt.org/insight/oppose-senator-feinsteins-fisa-reform-act-of-2015/'
            });
            score += inc;
        }
        if (this.get('fisa_reform_act') == 'X') {
            var inc = -3;
            score_criteria.push({
                score:  inc,
                info:   'Supported the FISA Reform Act',
                url:'https://www.eff.org/deeplinks/2015/06/eff-opposes-amendments-weakening-usa-freedom-act'
            });
            score += inc;
        }
        if (this.get('amendment_1449_data_retention') == 'GOOD') {
            var inc = 1;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on USA Freedom data retention amendment (1449)',
                url: 'https://www.eff.org/deeplinks/2015/06/eff-opposes-amendments-weakening-usa-freedom-act'
            });
            score += inc;
        }
        else if (this.get('amendment_1449_data_retention') == 'BAD') {
            var inc = -3;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on USA Freedom data retention amendment (1449)',
                url: 'https://www.eff.org/deeplinks/2015/06/eff-opposes-amendments-weakening-usa-freedom-act'
            });
            score += inc;
        }
        if (this.get('amendment_1450_extend_implementation_to_1yr') == 'GOOD') {
            var inc = 1;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on amendment 1450 extending implementation of USA Freedom Act by 1 year',
                url:'https://www.eff.org/deeplinks/2015/06/eff-opposes-amendments-weakening-usa-freedom-act'
            });
            score += inc;
        }
        else if (this.get('amendment_1450_extend_implementation_to_1yr') == 'BAD') {
            var inc = -2;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on amendment 1450 extending implementation of USA Freedom Act by 1 year',
                url:'https://www.eff.org/deeplinks/2015/06/eff-opposes-amendments-weakening-usa-freedom-act'
            });
            score += inc;
        }
        if (this.get('amendment_1451_gut_amicus') == 'GOOD') {
            var inc = 1;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on amendment 1451 to gut amicus proceedings',
                url: 'https://www.eff.org/deeplinks/2015/06/eff-opposes-amendments-weakening-usa-freedom-act'
            });
            score += inc;
        }
        else if (this.get('amendment_1451_gut_amicus') == 'BAD') {
            var inc = -3;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on amendment 1451 to gut amicus proceedings',
                url: 'https://www.eff.org/deeplinks/2015/06/eff-opposes-amendments-weakening-usa-freedom-act'
            });
            score += inc;
        }
        if (this.get('final_passage_usaf') == 'GOOD') {
            var inc = 4;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on USA Freedom Act (final passage)',
                url:"http://www.restorethe4th.com/blog/most-reps-voting-for-usa-freedom-were-opponents-of-surveillance-reform/"
            });
            score += inc;
        }
        else if (this.get('final_passage_usaf') == 'OK') {
            var inc = -1;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on reforming bulk collection via USAF',
                url:'https://www.eff.org/deeplinks/2015/05/usa-freedom-act-passes-what-we-celebrate-what-we-mourn-and-where-we-go-here'
            });
            score += inc;
        }
        else if (this.get('final_passage_usaf') == 'BAD') {
            var inc = -4;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on USA Freedom Act (final passage) and YES on extending the PATRIOT Act',
                url:"http://www.restorethe4th.com/blog/most-reps-voting-for-usa-freedom-were-opponents-of-surveillance-reform/"
            });
            score += inc;
        }
        if (this.get('s_702_reforms') == 'X') {
            var inc = 4;
            score_criteria.push({
                score:  inc,
                info:   'Supported bills reforming Section 702 of FISA',
                url:undefined
            });
            score += inc;
        }
        if (this.get('massie_lofgren_amendment_to_hr2685_defund_702') == 'GOOD') {
            var inc = 3;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on Massie-Lofgren Amendment to HR2685: Defund Section 702 surveillance',
                url:'https://demandprogress.org/letter-of-support-for-massie-lofgren-amendment-to-the-department-of-defense-appropriations-act-of-2016-h-r-2685/'
            });
            score += inc;
        }
        else if (this.get('massie_lofgren_amendment_to_hr2685_defund_702') == 'BAD') {
            var inc = -3;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on Massie-Lofgren Amendment to HR2685: Defund Section 702 surveillance',
                url:'https://demandprogress.org/letter-of-support-for-massie-lofgren-amendment-to-the-department-of-defense-appropriations-act-of-2016-h-r-2685/'
            });
            score += inc;
        }
        if (this.get('massie_lofgren_amendment_to_hr4870_no_backdoors') == 'GOOD') {
            var inc = 3;
            score_criteria.push({
                score:  inc,
                info:   'Voted YES on Massie-Lofgren Amendment to HR4870: Ban encryption backdoors',
                url: 'https://shutthebackdoor.net/'
            });
            score += inc;
        }
        else if (this.get('massie_lofgren_amendment_to_hr4870_no_backdoors') == 'BAD') {
            var inc = -3;
            score_criteria.push({
                score:  inc,
                info:   'Voted NO on Massie-Lofgren Amendment to HR4870: Ban encryption backdoors',
                url: 'https://shutthebackdoor.net/'
            });
            score += inc;
        }
        if (this.get('ECPA_reform_cosponsor') == 'GOOD') {
            console.log("ECPA")
            var inc = 2;
            score_criteria.push({
                score:  inc,
                info:   'Co-Sponsor of Electronic Commmunication Privacy Act Reform',
                url: 'https://www.eff.org/deeplinks/2015/09/senate-judiciary-committee-finally-focuses-ecpa-reform'
            });
            score += inc;
        }
        if (this.get('CISA_cloture_vote') == 'BAD') {
            var inc = -4;
            score_criteria.push({
                score:  inc,
                info:   'Voted for CISA Cloture Vote',
                url: 'http://www.slate.com/articles/technology/future_tense/2015/10/stopcisa_the_cybersecurity_information_sharing_act_is_a_disaster.html'
            });
            score += inc;
        }
        else if (this.get('CISA_cloture_vote') == 'GOOD') {
            var inc = 4;

            score_criteria.push({
                score: inc,
                info:   'Voted against CISA Cloture Vote',
                url: 'http://www.slate.com/articles/technology/future_tense/2015/10/stopcisa_the_cybersecurity_information_sharing_act_is_a_disasteecpareformcosponsorr.html'
            });
            score += inc;
        }
        if (this.get('house_NCPA') == 'BAD') {
            var inc = -2;
            score_criteria.push({
                score:  inc,
                info:   'Voted for National Cybersecurity Protection Advancement Act',
                url: 'http://techcrunch.com/2015/04/23/house-passes-complementary-cyber-information-sharing-bill/'
            });
            score += inc;
        }
        else if (this.get('house_NCPA') == 'GOOD') {
            var inc = 2;

            score_criteria.push({
                score: inc,
                info:   'Voted against National Cybersecurity Protection Advancement Act',
                url: 'http://techcrunch.com/2015/04/23/house-passes-complementary-cyber-information-sharing-bill/'
            });
            score += inc;
        }
        if (this.get('house_PCNA') == 'BAD') {
            var inc = -3;
            score_criteria.push({
                score:  inc,
                info:   'Voted for The Protecting Cyber Networks Act ',
                url: 'https://www.eff.org/deeplinks/2015/04/eff-congress-stop-cybersurveillance-bills'
            });
            score += inc;
        }
        else if (this.get('house_PCNA') == 'GOOD') {
            var inc = 3;

            score_criteria.push({
                score: inc,
                info:   'Voted against The Protecting Cyber Networks Act ',
                url: 'https://www.eff.org/deeplinks/2015/04/eff-congress-stop-cybersurveillance-bills'
            });
            score += inc;
        }
        if (this.get('franken_cisa_amendment') == 'BAD') {
            var inc = -1;
            score_criteria.push({
                score:  inc,
                info:   'Voted against the Franken CISA amendment',
                url: 'http://www.newsweek.com/senate-passes-controversial-cisa-bill-companies-share-cyber-security-387785'
            });
            score += inc;
        }
        else if (this.get('franken_cisa_amendment') == 'GOOD') {
            var inc = 2;

            score_criteria.push({
                score: inc,
                info:   'Voted for the Franken CISA amendment ',
                url: 'http://www.newsweek.com/senate-passes-controversial-cisa-bill-companies-share-cyber-security-387785'
            });
            score += inc;
        }
        if (this.get('wyden_cisa_amendment') == 'BAD') {
            var inc = -1;
            score_criteria.push({
                score:  inc,
                info:   'Voted against the Wyden CISA amendment',
                url: 'http://www.freedomworks.org/content/key-vote-yes-wyden-amendment-strengthen-privacy-protections-cisa'
            });
            score += inc;
        }
        else if (this.get('wyden_cisa_amendment') == 'GOOD') {
            var inc = 2;

            score_criteria.push({
                score: inc,
                info:   'Voted for the Wyden CISA amendment ',
                url: 'http://www.freedomworks.org/content/key-vote-yes-wyden-amendment-strengthen-privacy-protections-cisa'
            });
            score += inc;
        }
        if (this.get('heller_cisa_amendment') == 'BAD') {
            var inc = -1;
            score_criteria.push({
                score:  inc,
                info:   'Voted against the Heller CISA amendment',
                url: 'https://cdt.org/blog/guide-to-cybersecurity-information-sharing-act-amendments/'
            });
            score += inc;
        }
        else if (this.get('heller_cisa_amendment') == 'GOOD') {
            var inc = 1;

            score_criteria.push({
                score: inc,
                info:   'Voted for the Heller CISA amendment ',
                url: 'https://cdt.org/blog/guide-to-cybersecurity-information-sharing-act-amendments/'
            });
            score += inc;
        }
        if (this.get('coons_cisa_amendment') == 'BAD') {
            var inc = -1;
            score_criteria.push({
                score:  inc,
                info:   'Voted against the Coons CISA amendment',
                url: 'https://cdt.org/blog/guide-to-cybersecurity-information-sharing-act-amendments/'
            });
            score += inc;
        }
        else if (this.get('coons_cisa_amendment') == 'GOOD') {
            var inc = 1;

            score_criteria.push({
                score: inc,
                info:   'Voted for the Coons CISA amendment ',
                url: 'https://cdt.org/blog/guide-to-cybersecurity-information-sharing-act-amendments/'
            });
            score += inc;
        }
        if (this.get('cotton_cisa_amendment') == 'BAD') {
            var inc = -2;
            score_criteria.push({
                score:  inc,
                info:   'Voted for the Cotton CISA amendment',
                url: 'https://cdt.org/blog/guide-to-cybersecurity-information-sharing-act-amendments/'
            });
            score += inc;
        }
        else if (this.get('cotton_cisa_amendment') == 'GOOD') {
            var inc = 1;

            score_criteria.push({
                score: inc,
                info:   'Voted against the Cotton CISA amendment ',
                url: 'https://cdt.org/blog/guide-to-cybersecurity-information-sharing-act-amendments/'
            });
            score += inc;
        }
        if (this.get('cisa_final') == 'BAD') {
            var inc = -4;
            score_criteria.push({
                score:  inc,
                info:   'Voted for CISA in the final vote',
                url: 'http://www.vox.com/platform/amp/2015/10/21/9587190/cisa-senate-privacy-nsa'
            });
            score += inc;
        }
        else if (this.get('cisa_final') == 'GOOD') {
            var inc = 4;

            score_criteria.push({
                score: inc,
                info:   'Voted against CISA in the final vote ',
                url: 'http://www.vox.com/platform/amp/2015/10/21/9587190/cisa-senate-privacy-nsa'
            });
            score += inc;
        }
        if(score >= 15){
            var grade="A+"
        }
        else if(score >= 12){
            var grade="A"
        }
        else if(score >= 10){
            var grade="A-"
        }
        else if(score >= 9){
            var grade="B+"
        }
        else if(score >= 8){
            var grade="B"
        }
        else if(score >= 7){
            var grade="B-"
        }
        else if(score >= 6){
            var grade="B-"
        }
        else if(score >= 5){
            var grade="C+"
        }
        else if(score >= 3){
            var grade="C"
        }
        else if(score >= 0){
            var grade="C-"
        }
        else if(score >= -2){
            var grade="D+"
        }
        else if(score >= -7){
            var grade="D"
        }
        else if(score >= -9){
            var grade="D-"
        }
        else if (this.get('last_name') == 'McConnell') {
            var grade="F-"
        }
        else{
            var grade="F"
        }
        this.set({
            score: score,
            grade: grade,
            score_criteria: score_criteria
        });
    },

    shortenState: function(state) {
        for (var key in STATES)
            if (STATES.hasOwnProperty(key))
                if (STATES[key] == state)
                    return key;
    }
});

/**
    Politicians Collection
**/
var Politicians = Composer.Collection.extend({
    sortfn: function(a, b) {

        if (a.get('state_short') < b.get('state_short'))
            return - 1;
        else if (a.get('state_short') > b.get('state_short'))
            return 1;
        else
            if (a.get('last_name') < b.get('last_name'))
                return -1;
            if (a.get('last_name') > b.get('last_name'))
                return 1;
            return 0;

    },
});

var PoliticiansFilter = Composer.FilterCollection.extend({

    state: 'MA',

    filter: function(model) {
        var state = this.state;

        if (state == 'all')
            return true;
        else if (state == 'house')
            return model.get('organization') == 'House';
        else if (state == 'senate')
            return model.get('organization') == 'Senate';
        else
            return model.get('state_short') == this.state;
    }
});

;var Candidate = Composer.Model.extend({

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

;var CandidateView = function(data) {
    var
        div = $c('div'),
        headshot = $c('div'),
        img = $c('i'),            // JL NOTE ~ chrome bug fix, remove after issue is gone
        tweetLink = $c('button'),
        infoLink = $c('button'),
        name = $c('h4'),
        synopsis = $c('p'),
        rollover = $c('div');


    headshot.classList.add('headshot');

    img.classList.add('congressional-head', data.image.replace('.jpg', ''));
    headshot.appendChild(img);

    div.appendChild(headshot);

    name.textContent = data.name;
    div.appendChild(name);
    synopsis.textContent = data.synopsis;
    div.appendChild(synopsis)

    rollover.classList.add('rollover');

    tweetLink.classList.add('tweet_link');
    rollover.appendChild(tweetLink);

    infoLink.classList.add('info_link');
    infoLink.textContent = 'i';
    rollover.appendChild(infoLink);

    div.appendChild(rollover);

    return div;
};

;var CandidateModalView = function(data){
    var
        modal = $c('div'),
        close = $c('button'),
        title = $c('h2'),
        quoteList = $c('ul');

    modal.classList.add('modal', 'candidate_modal');
    close.classList.add('close');
    close.textContent = '⨉';
    title.textContent = data.name+' On Mass Surveillance';

    modal.appendChild(close);
    modal.appendChild(title);
    console.log(data);


    for (var i = 0; i < data.statements.length; i++) {
        var quote = $c('li');
        var link = $c('a');
        link.textContent = data.statements[i].quote
        link.href = data.statements[i].source
        quote.appendChild(link);
        quoteList.appendChild(quote);
    }

    modal.appendChild(quoteList);

    return modal;


}

;var PoliticalScoreboardView = function (data) {
    var
        container = $c('div'),
        politicians = $c('div'),
        good = $c('div'),
        bad = $c('div'),
        meh = $c('div'),
        goodPoliticians = $c('div'),
        badPoliticians = $c('div'),
        mehPoliticians = $c('div'),
        label = $c('label'),
        select = $c('select'),
        chamberOptGroup = $c('optgroup'),
        stateOptGroup = $c('optgroup'),
        allCongress = $c('option'),
        senate = $c('option'),
        house = $c('option'),
        goodHeadline = $c('h3'),
        badHeadline = $c('h3'),
        mehHeadline = $c('h3'),
        goodSubHead = $c('em'),
        badSubHead = $c('em');

    label.textContent = 'Choose view:';
    label.htmlFor = '_ps_choose_state';
    container.appendChild(label);

    select.id = '_ps_choose_state';

    chamberOptGroup.label = 'View by Chamber';

    allCongress.value = 'all';
    allCongress.textContent = 'All Congress';
    chamberOptGroup.appendChild(allCongress);

    senate.value = 'senate';
    senate.textContent = 'Senate';
    chamberOptGroup.appendChild(senate);

    house.value = 'house';
    house.textContent = 'House';
    chamberOptGroup.appendChild(house);

    select.appendChild(chamberOptGroup);

    stateOptGroup.label = 'View by state';

    for (var key in STATES)
        if (STATES.hasOwnProperty(key)) {
            var state = $c('option');
            state.value = key;
            state.textContent = STATES[key];
            if (key === data.state)
                state.selected = true;
            stateOptGroup.appendChild(state);
        }
    select.appendChild(stateOptGroup);

    container.appendChild(select);

    politicians.className = 'politicians';
    container.appendChild(politicians);

    good.className = 'team internet';

    goodHeadline.textContent = 'Team Internet';
    good.appendChild(goodHeadline);

    goodSubHead.textContent = 'These politicians are standing up for the free Internet and oppose mass surveillance.';
    good.appendChild(goodSubHead);

    goodPoliticians.className = 'filtered';
    good.appendChild(goodPoliticians);

    politicians.appendChild(good);

    bad.className = 'team surveillance';

    badHeadline.textContent = 'Team NSA';
    bad.appendChild(badHeadline);

    badSubHead.textContent = 'These politicians are working with monopolies to control the Internet for power and profit.';
    bad.appendChild(badSubHead);

    badPoliticians.className = 'filtered';
    bad.appendChild(badPoliticians);

    politicians.appendChild(bad);

    meh.className = 'team unknown';

    mehHeadline.textContent = 'Unclear';
    meh.appendChild(mehHeadline);

    mehPoliticians.className = 'filtered';
    meh.appendChild(mehPoliticians);

    container.appendChild(meh);

    return container;
};

;var PoliticianView = function(data) {
    var
        div = $c('div'),
        headshot = $c('div'),
        img = $c('i'),            // JL NOTE ~ chrome bug fix, remove after issue is gone
        tweetLink = $c('button'),
        infoLink = $c('button'),
        name = $c('h4'),
        grade = $c('h3'),
        rollover = $c('div');

    // JL NOTE ~ removed headshot background due to chrome bug. maybe re-add someday?
    /* headshot.style.backgroundImage = 'url(congress/' + data.politician.image + ')'; */
    headshot.classList.add('headshot');

    if (data.politician.score >= 6) {
        div.classList.add('good');
    } else if (data.politician.score >= 0) {
        div.classList.add('neutral');
    } else {
        div.classList.add('bad');
    }

    // JL NOTE ~ added this to fix chrome bug, bah -----------------------------
    img.classList.add('congressional-head', data.politician.image.replace('.jpg', ''));
    headshot.appendChild(img);
    // -------------------------------------------------------------------------

    div.appendChild(headshot);

    name.textContent = data.politician.last_name;
    div.appendChild(name);

    if (!data.noGrade) {
        grade.classList.add('grade');
        grade.textContent = data.politician.grade;
        div.appendChild(grade);
    }

    rollover.classList.add('rollover');

    tweetLink.classList.add('tweet_link');
    rollover.appendChild(tweetLink);

    infoLink.classList.add('info_link');
    infoLink.textContent = 'i';
    rollover.appendChild(infoLink);

    div.appendChild(rollover);

    if (data.extraInfo) {
        var ul = $c('ul');
        ul.classList.add('extra_info');
        console.log('owl');

        if (data.politician.twitter) {
            var li = $c('li'),
                a = $c('a');
            a.classList.add('inline_tweet');
            a.href = '#';
            a.textContent = '@' + data.politician.twitter;
            li.appendChild(a)
            ul.appendChild(li);
        }
        if (data.politician.phone) {
            var li = $c('li'),
                a = $c('a');
            a.href = 'tel://'+data.politician.phone;
            a.textContent = data.politician.phone;
            li.appendChild(a)
            ul.appendChild(li);
        }
        div.appendChild(ul);
    }

    if (data.state == 'all' || data.state == 'senate' || data.state == 'house'){

        var block = $c('div');
        if (data.politician.state_short)
            block.textContent = data.politician.state_short;
        else
            block.textContent = '?';
        if (data.politician.score >= 6) {
            block.classList.add('good');
        } else if (data.politician.score >= 0) {
            block.classList.add('neutral');
        } else {
            block.classList.add('bad');
        }
        var hidden = $c('div');
        hidden.className = 'peekaboo';
        var politician = $c('div');
        politician.className = 'politician';
        politician.appendChild(div)
        hidden.appendChild(politician);
        block.appendChild(hidden);


        return block;
    } else
        return div;
};

;var PoliticianModalView = function (data) {
    var
        modal = $c('div'),
        close = $c('button'),
        title = $c('h2'),
        voteList = $c('ul');

    modal.classList.add('modal', 'politician_modal');
    close.classList.add('close');
    close.textContent = '⨉';
    title.textContent = 'How '+data.name+' Voted…';

    modal.appendChild(close);
    modal.appendChild(title);
    console.log(data);


    for (var i = 0; i < data.positions.length; i++) {
        var position = $c('li');
        if (data.positions[i].score < 0) {
            position.className = 'bad';
        } else {
            position.className = 'good';
        }
        if (data.positions[i].url === undefined){
            position.textContent = data.positions[i].info;
            voteList.appendChild(position);
        }
        else {
            var position_link = $c('a');
            position_link.href = data.positions[i].url;
            position_link.target = "_blank";
            position_link.textContent = data.positions[i].info;

            position.appendChild(position_link);
            voteList.appendChild(position);

        }
    }

    modal.appendChild(voteList);

    return modal;
};

;if (!util) var util = {};

util.generateSpinner = function() {
    var spinContainer = $c('div');
    spinContainer.className = 'spinnerContainer';

    var spinner = $c('div');
    spinner.className = 'spinner';
    spinContainer.appendChild(spinner);

    for (var i = 1; i <= 12; i++) {
        var blade = $c('div');
        blade.className = 'blade d' + (i < 10 ? '0'+i : i);

        var subdiv = $c('div');
        blade.appendChild(subdiv);

        spinner.appendChild(blade);
    }
    return spinContainer;
};

;var TWEET_BLASTER_URL = 'https://tweet-congress.herokuapp.com';
//var TWEET_BLASTER_URL = 'http://metacube:9000';
var SPREADSHEET_URL = 'https://spreadsheets.google.com/feeds/list/1rTzEY0sEEHvHjZebIogoKO1qfTez2T6xNj0AScO6t24/default/public/values?alt=json';


var CANDIDATE_STATEMENTS_URL = 'https://spreadsheets.google.com/feeds/list/1lA6PkgSh68UudARJSjN2tE786J0l01N2siMWQLqp1KU/default/public/values?alt=json'

var DEFAULT_TWEETS = [
    '#StopCISA—the largest mass surveillance bill since the PATRIOT Act www.decidethefuture.org',
    'please vote to #StopCISA—this bill is bad for cybersecurity and human rights. www.decidethefuture.org',
    '#StopCISA! Keep our private data out of the hands of insecure government agencies www.decidethefuture.org',
    '#StopCISA! Don\'t give companies immunity for violating their privacy policies. www.decidethefuture.org',
    '#StopCISA—Don\'t trade our privacy for a law that won\'t even fix our cybersecurity www.decidethefuture.org',
    '#CISA erodes user privacy and consumer trust in American tech businesses. Vote NO www.decidethefuture.org',
    'People hate #CISA. Tech companies hate #CISA. Privacy matters. Respect it! www.decidethefuture.org',
    'Supporting #CISA is a good way to show you have no idea how to protect us—vote NO www.decidethefuture.org',
    'Don\'t give companies immunity for getting hacked and leaking my data. #StopCISA! www.decidethefuture.org',
    '#CISA allows government to secretly investigate people for minor crimes. Vote NO! www.decidethefuture.org',
]

var STATES = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming',
};

var CANDIDATES=[
{
    name:"Chris Christie",
    image:"images/pres_candidates/chris_christie.jpg"
},
{
    name:"Carly Fiorina",
    image:"images/pres_candidates/carly_fiorina.jpg"
},
{
    name:"Jeb Bush",
    image:"images/pres_candidates/jeb_bush.jpg"
},
{
    name:"Ben Carson",
    image:"images/pres_candidates/ben_carson.jpg"
},
{
    name:"Ted Cruz",
    image:"images/pres_candidates/ted_cruz.jpg"
},
{
    name:"Mike Huckabee",
    image:"images/pres_candidates/mike_huckabee.jpg"
},
{
    name:"Rand Paul",
    image:"images/pres_candidates/rand_paul.jpg"
},
{
    name:"Marco Rubio",
    image:"images/pres_candidates/marco_rubio.jpg"
},
{
    name:"Rick Santorum",
    image:"images/pres_candidates/rick_santorum.jpg"
},
{
    name:"Donald Trump",
    image:"images/pres_candidates/donald_trump.jpg"
},
{
    name:"John Kasich",
    image:"images/pres_candidates/john_kasich.jpg"
},
{
    name:"Hillary Clinton",
    image:"images/pres_candidates/hilary_clinton.jpg"
},
{
    name:"Bernie Sanders",
    image:"images/pres_candidates/bernie_sanders.jpg"
},
{
    name:"Martin O'Malley",
    image:"images/pres_candidates/bernie_sanders.jpg"
}
];

var politicians = new Politicians();
var unfilteredPoliticians = new Politicians();
var geocode = null;

// get the spreadsheet from google
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        var res = JSON.parse(xhr.response);
        for (var i = 0; i < res.feed.entry.length; i++) {
            var entry = res.feed.entry[i];
            var politician = new Politician();
            politician.populateFromGoogle(entry);
            politicians.add(politician);
            unfilteredPoliticians.add(politician);
        }

        // convert to a filter collection (which allows us to filter on state)
        politicians = new PoliticiansFilter(politicians);

        checkIfFinishedWithXHRs();
    }
};
xhr.open("get", SPREADSHEET_URL, true);
xhr.send();

// grab the user's location
var xhr2 = new XMLHttpRequest();
xhr2.onreadystatechange = function () {
    if (xhr2.readyState === 4) {
        var res = JSON.parse(xhr2.response);

        geocode = res;
        checkIfFinishedWithXHRs();
    }
};
xhr2.open("get", 'https://fftf-geocoder.herokuapp.com', true);
xhr2.send();


//Setup the collection of candidates
var candidates = new Candidates();

for (var index = 0; index < CANDIDATES.length; index++) {
    var candidate = new Candidate();
    candidate.create(CANDIDATES[index]);
    candidates.add(candidate);
}


var xhr_candidates = new XMLHttpRequest();

xhr_candidates.onreadystatechange= function(){
    if (xhr_candidates.readyState === 4) {
        var res = JSON.parse(xhr_candidates.response)
        for (var i = 0; i < res.feed.entry.length; i++) {
            var entry = res.feed.entry[i];
            var can = candidates.findByCandidateEntry(entry)
            if(can){
                can.populateFromGoogle(entry);
            }
            else{
                console.log("candidate not found")
                console.log(entry)
            }
            }
        var name_param = util.getParameterByName('candidate');
        if (name_param) {
            name_param = name_param.replace("_"," ");
            var model = candidates.findByCandidateName(name_param);
            if (model){
                new CandidateModalController({model: model});
            }
        }

        new CandidatesTableController({
            inject:"#candidates",
            collection:candidates
        });


    }
}
//TODO Write handlers to handle the view of the collections
xhr_candidates.open("get",CANDIDATE_STATEMENTS_URL);
xhr_candidates.send();



// only initialize scoreboard if the spreadsheet & location have loaded via XHR
var checkIfFinishedWithXHRs = function () {
    if (politicians.models().length && geocode)
        initializeScoreboard();
};

var renderTopStateSelector = function() {
    document.getElementById('placeholder_state_name').style.display = 'none';
    var select = $c('select');
    for (var state in STATES) {
        if (STATES.hasOwnProperty(state)) {
            var option = $c('option');
            option.textContent = STATES[state];
            option.value = state;
            if (politicians.state == state)
                option.selected = true;
            select.appendChild(option)
        }
    }
    select.onchange = function() {
        var state = this.options[this.options.selectedIndex].value;
        var sbState = document.getElementById('_ps_choose_state');
        for (var i = 0; i < sbState.options.length; i++) {
            if (sbState.options[i].value == state)
                sbState.options[i].selected = true;
        }
        var event = new UIEvent("change", {
            "view": window,
            "bubbles": true,
            "cancelable": true
        });
        sbState.dispatchEvent(event);
        setTimeout(function() {
            loadTopPoliticiansByState();
        }, 10);
    }
    select.onclick = function() {
        document.getElementById('just_state').checked = true;
        handleTweetSelectorLabels();
    }
    document.getElementById('state_selector').appendChild(select);
}

var topPoliticians = [null, null];
var hasTweeted = false;

var generateTweetTextFromTopPoliticians = function() {
    var tweet = '';

    if (topPoliticians[0].model.get('twitter'))
        tweet += '.@'+topPoliticians[0].model.get('twitter')+', ';
    else
        tweet += 'Sen. '+topPoliticians[0].model.get('last_name')+', ';

    if (topPoliticians[1].model.get('twitter'))
        tweet += '@'+topPoliticians[1].model.get('twitter')+' ';
    else
        tweet += 'Sen. '+topPoliticians[1].model.get('last_name')+' ';

    tweet += document.getElementById('tweet_text').value;

    // tweet += ' http://decidethefuture.org';

    console.log('tweet:', tweet);
    return tweet;
}

var loadTopPoliticiansByState = function() {
    var senators = politicians.select({organization: 'Senate'});
    for (var i=0; i < senators.length; i++) {
        if (topPoliticians[i])
            topPoliticians[i].release();

        topPoliticians[i] = new PoliticianController({
            model: senators[i],
            noGrade: true,
            extraInfo: true,
            inject: '#targets .side'+i
        });
    }
}

var handleTweetSelectorLabels = function() {
    if (document.getElementById('EVERYONE').checked) {
        document.getElementById('EVERYONE_label').className = 'sel';
        document.getElementById('just_state_label').className = '';
        document.getElementById('tweet_blaster_frame').style.display = 'block';
        document.getElementById('tweet_your_state').style.display = 'none';
    } else {
        document.getElementById('EVERYONE_label').className = '';
        document.getElementById('just_state_label').className = 'sel';
        document.getElementById('tweet_blaster_frame').style.display = 'none';
        document.getElementById('tweet_your_state').style.display = 'block';
    }
}

var handleRemainingTweetText = function() {
    var remaining = 105 - document.getElementById('tweet_text').value.length;
    document.getElementById('remaining').textContent = remaining;
    if (remaining <= 10)
        document.getElementById('remaining').className = 'danger';
    else
        document.getElementById('remaining').className = '';
}

var initializeScoreboard = function () {

    // select the state if the geocoder didn't give us something bogus
    if (
        geocode.subdivisions
        &&
        geocode.subdivisions.length
        &&
        geocode.subdivisions[0].iso_code
        &&
        STATES.hasOwnProperty(geocode.subdivisions[0].iso_code)
    )
        politicians.state = geocode.subdivisions[0].iso_code;

    politicians.refresh();
    renderTopStateSelector();
    loadTopPoliticiansByState();

    if (util.getParameterByName('autotweet')) {
        var tweetText = generateTweetTextFromTopPoliticians();
        window.location.replace('https://twitter.com/intent/tweet?text='+encodeURIComponent(tweetText));
    }


    var spinner = document.querySelector('#scoreboard_data .spinnerContainer');

    if (spinner)
        spinner.remove();

    new PoliticalScoreboardController({
        collection: politicians,
        inject: '#scoreboard_data'
    });

    var bioguide = util.getParameterByName('politician');
    if (bioguide) {
        var model = unfilteredPoliticians.select_one({bioguide: bioguide});
        if (model)
            new PoliticianModalController({model: model});
        window.location.replace('#scoreboard');
    }

};

var alreadyBlasted = false;

window.onhashchange = function () {
    if (window.location.hash == '#blast' && alreadyBlasted == false) {
        document.getElementById('tweet_blaster_frame').src = TWEET_BLASTER_URL+'/blast?tweet='+encodeURIComponent(document.getElementById('tweet_text').value);
        window.location.hash = '#';
        alreadyBlasted = true;
        popCallModal(true);
    }
}


// Org coin toss
if (!util.getParameterByName('org')) {
    var coinToss = Math.random();

    if (coinToss > .1)
        window.org = 'fftf';
    else
        window.org = 'rt4';
}
var org = util.getParameterByName('org') || window.org;

if (org == 'rt4')
    window.DONATE_URL = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=245ZSF2CHHYXN';
else
    window.DONATE_URL = 'https://donate.fightforthefuture.org/?tag=decidethefuture';

var popCallModal = function(tweeted) {
    new CallModalController({
        headline:   (tweeted ? 'Thanks for tweeting! Now can you call Congress?' : 'Can you call Congress to #StopCISA?'),
        campaign:   'cisa-cloture-fax',
        cta:        'Congress needs to understand that CISA is a dirty mass surveillance bill that won\'t protect us from cyber attacks. Enter your phone number and we\'ll connect you to Congress, or dial 1-985-222-CISA on your phone.',
        callScript: 'Please oppose CISA, the Cybersecurity Information Sharing Act. CISA won\'t fix the cybersecurity problems we face in the U.S.—it will only lead to more warrantless mass surveillance of millions of Americans. We need real cybersecurity legislation, and it\'s not CISA.',
        shareText:  'We\'re up against some of the most powerful corporate lobbyists in the country, but that hasn\'t stopped us before. If a critical mass of citizens speak out against CISA, our voices will be impossible to ignore.',
    });
}

var onDomContentLoaded = function() {

    if (politicians.models().length == 0) {
        var spinner = util.generateSpinner();
        document.getElementById('scoreboard_data').appendChild(spinner);
    }

    document.querySelector('.action a.tweet').addEventListener('click', function(e){
        e.preventDefault();
        if (!topPoliticians[0])
            return alert('Hold on, still loading your senators :)');

        var tweetText = generateTweetTextFromTopPoliticians();
        var win = window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(tweetText), 'zetsubou_billy', 'width=500, height=300, toolbar=no, status=no, menubar=no');

        var pollTimer = window.setInterval(function() {
            if (win.closed !== false) { // !== is required for compatibility with Opera
                window.clearInterval(pollTimer);
                if (hasTweeted == false)
                    popCallModal(true);
                hasTweeted = true;
            }
        }, 200);
    });


    handleTweetSelectorLabels();
    document.getElementById('EVERYONE').addEventListener('change', function() {
        handleTweetSelectorLabels();
    });
    document.getElementById('just_state').addEventListener('change', function() {
        handleTweetSelectorLabels();
    });

    document.getElementById('tweet_text').addEventListener('change', function() {
        handleRemainingTweetText();
    });
    document.getElementById('tweet_text').addEventListener('keyup', function() {
        handleRemainingTweetText();
    });
    document.getElementById('call_congress').addEventListener('click', function(e) {
        e.preventDefault();
        popCallModal();
    });
    if (util.getParameterByName('call')) {
        popCallModal();
    }
    var random_tweet = DEFAULT_TWEETS[Math.floor(Math.random()*DEFAULT_TWEETS.length)];
    document.getElementById('tweet_text').value = random_tweet;

    handleRemainingTweetText();

    if ($el('dumbcalltool')) {
        $el('dumbcalltool').addEventListener('submit', function(e) {
            e.preventDefault();

            if (!util.validatePhone($el('dumbphonenumber').value)) {
                alert('Please enter a valid phone number!');
                return false;
            }

            var data = new FormData();
            data.append('campaignId', 'nn-cisa-2');

            data.append('userPhone', util.validatePhone($el('dumbphonenumber').value));

            var url = 'https://call-congress.fightforthefuture.org/create';

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('sent!', xhr.response);
                }
            }.bind(this);
            xhr.open("post", url, true);
            xhr.send(data);

            new CallScriptModalController({
                callHeadline: 'Awesome! We\'re calling your phone!',
                callInstruction: 'Please be polite and tell your lawmaker:',
                callScript: 'Please don\'t vote for the Omnibus budget bill if it contains legislation like CISA. The version of CISA in the budget has all its privacy protections stripped out and would allow for wholesale mass surveillance and incarceration. Tacking this onto the budget without debate is undemocratic, and Congress should not approve this bill.',
            });

            return false;
        });
    }



    (function (doc, win) {
        "use strict";

        var
            viewMoreLinks = doc.getElementsByClassName('expand-me'),
            links = viewMoreLinks.length;

// -------------------------------------------------------------------------
// This is here until the links that make up each company on the Corporate
// scoreboard are ready to turn into tweets.

        var
            i, j,
            corporateScoreboard = doc.getElementById('scoreboard_corporate').getElementsByTagName('table'),
            tableLinks;

        i = corporateScoreboard.length;
        while (i--) {

            tableLinks = corporateScoreboard[i].getElementsByTagName('a');
            j = tableLinks.length;

            while (j--) {
                tableLinks[j].addEventListener('click', function (e) {
                    e.preventDefault();
                });
            }
        }

// -------------------------------------------------------------------------

        function expandArticle(e) {
            e.preventDefault();

            console.log('derp');

            var
                href = e.target.getAttribute('href').replace(/#/, '');
            doc.getElementById(href).classList.add('expanded');
        }

        while (links--) {
            viewMoreLinks[links].addEventListener('click', expandArticle);
        }
    })(document, window);
};

// Wait for DOM content to load.
if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
    onDomContentLoaded();
} else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', onDomContentLoaded, false);
}

//# sourceMappingURL=core.js.map