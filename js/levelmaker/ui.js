document.getElementById("shapes").addEventListener('click', shapesdown);
function shapesdown(e) {
    if (document.getElementById('shapesdiv').childNodes[0].classList == 'shapes shapesdown ubuntu-light') {
        document.getElementById('shapesdiv').childNodes[0].classList = 'shapes ubuntu-light'
        document.getElementById('shapesdiv').childNodes[2].classList = 'nbox ubuntu-light'
        document.getElementById('shapesdiv').childNodes[2].disabled = 'true'
    } else {
        document.getElementById('shapesdiv').childNodes[0].classList = 'shapes shapesdown ubuntu-light'
        document.getElementById('shapesdiv').childNodes[2].classList = 'nbox shapesdown1 ubuntu-light'
        document.getElementById('shapesdiv').childNodes[2].disabled = 'false'
    }
}
