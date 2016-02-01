var CandidateView = function(data) {
    var
        div = $c('div'),
        headshot = $c('div'),
        img = $c('img'),            // JL NOTE ~ chrome bug fix, remove after issue is gone
        tweetLink = $c('button'),
        infoLink = $c('button'),
        name = $c('h4'),
        synopsis = $c('p'),
        rollover = $c('div');


    headshot.appendChild(img);
    img.src = "/candidates/"+data.image;
    div.appendChild(headshot);
    name.textContent = data.name;
    div.appendChild(name);
    synopsis.textContent = data.synopsis;
    div.appendChild(synopsis)
    div.classList.add('candidate_shot');


    return div;
};
