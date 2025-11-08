function displayLanguage(value) {
	if (value === 'tam') {
		var tamLine = document.querySelectorAll('[id=tamLine]');
		tamLine.forEach(node => {node.classList.add('display')})
		tamLine.forEach(node => {node.classList.remove('hide')})
		var engLine = document.querySelectorAll('[id=engLine]');
		engLine.forEach(node => {node.classList.add('hide')})
		engLine.forEach(node => {node.classList.remove('display')})
	} else if (value === 'eng') {
		var tamLine = document.querySelectorAll('[id=tamLine]');
		tamLine.forEach(node => {node.classList.add('hide')})
		tamLine.forEach(node => {node.classList.remove('display')})
		var engLine = document.querySelectorAll('[id=engLine]');
		engLine.forEach(node => {node.classList.add('display')})
		engLine.forEach(node => {node.classList.remove('hide')})
	} else {
		var tamLine = document.querySelectorAll('[id=tamLine]');
		tamLine.forEach(node => {node.classList.add('display')})
		tamLine.forEach(node => {node.classList.remove('hide')})
		var engLine = document.querySelectorAll('[id=engLine]');
		engLine.forEach(node => {node.classList.add('display')})
		engLine.forEach(node => {node.classList.remove('hide')})
	}

}