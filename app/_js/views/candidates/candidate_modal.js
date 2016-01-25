var CandidateModalView = function(data){
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
