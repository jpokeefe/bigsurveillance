var CandidateView = function(data) {
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
