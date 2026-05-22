function openPack(stickers) {
	const selected = [];
	const usedIndexes = new Set();

	while (selected.length < 7) {
		const randomIndex = Math.floor(Math.random() * stickers.length);

		if (!usedIndexes.has(randomIndex)) {
			usedIndexes.add(randomIndex);
			selected.push(stickers[randomIndex]);
		}
	}
	return selected;
}

function handleOpenPack() {
	const pack = openPack(stickers);
	handleSavePack(pack);

	const container = document.getElementById('pack-result');
	container.innerHTML = '';

	pack.forEach(sticker => {
		const card = document.createElement('div');
		card.style.cssText = 'width:100px; text-align:center;';
		card.innerHTML = `
      				<img 
        			src="../../asset/${sticker.url.replace('src/asset/', '')}" 
        			alt="Figurinha ${sticker.team} ${sticker.position}"
        			style="width:100px; height:140px; object-fit:cover; border-radius:8px; border:2px solid #ccc;"
      				/>
      				<p style="margin:4px 0 0; font-size:12px; text-transform:uppercase;">
        			${sticker.team} #${sticker.position}
      				</p>
    				`;
		container.appendChild(card);
	});

	document.getElementById('modal-overlay').style.display = 'flex';
}

function fecharPacote() {
	document.getElementById('modal-overlay').style.display = 'none';

	sincAlbum();


	renderizarAlbum();
}

function handleSavePack(stickersFound) {
	const currentStickers = JSON.parse(
		localStorage.getItem('collection-stickers') || "[]"
	);

	localStorage.setItem(
		'collection-stickers',
		JSON.stringify(currentStickers.concat(stickersFound))
	);
}
