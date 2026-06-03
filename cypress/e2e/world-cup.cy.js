const bracketsPath = '/src/pages/brackets/index.html';
const albumPath = '/src/pages/album/index.html';

describe('World Cup sticker album', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('loads the bracket page and navigates to the album', () => {
    cy.visit(bracketsPath);

    cy.contains('h1', 'Copa do mundo de 2022').should('be.visible');
    cy.get('.champion-text').should('contain.text', 'Campeão');
    cy.contains('a', 'Ir para o Album').click();

    cy.url().should('include', albumPath);
    cy.contains('button', 'Abrir pacote').should('be.visible');
  });

  it('opens a deterministic pack and saves seven stickers to localStorage', () => {
    cy.visit(albumPath);

    cy.window().then((win) => {
      const stickers = win.stickers;
      expect(stickers).to.have.length.greaterThan(7);

      const values = stickers.slice(0, 7).map((_, index) => (index + 0.1) / stickers.length);
      let callCount = 0;

      cy.stub(win.Math, 'random').callsFake(() => values[callCount++]);
    });

    cy.contains('button', 'Abrir pacote').click();

    cy.get('#modal-overlay').should('have.css', 'display', 'flex');
    cy.get('#pack-result img').should('have.length', 7);
    cy.get('#pack-result p').first().should('contain.text', 'sen #1');

    cy.window().then((win) => {
      const savedStickers = JSON.parse(win.localStorage.getItem('collection-stickers') || '[]');

      expect(savedStickers).to.have.length(7);
      expect(savedStickers[0]).to.include({ team: 'sen', position: '1' });
      expect(savedStickers[6]).to.include({ team: 'sen', position: '7' });
    });

    cy.contains('#modal-overlay button', '✕').click();
    cy.get('#modal-overlay').should('have.css', 'display', 'none');
  });

  it('renders saved Senegal stickers in the album grid', () => {
    cy.visit(albumPath);

    cy.window().then((win) => {
      const stickers = win.stickers.slice(0, 7);
      win.localStorage.setItem('collection-stickers', JSON.stringify(stickers));
    });

    cy.visit(`${albumPath}?pais=sen`);

    cy.get('#appContainer').should('have.attr', 'style').and('contain', 'fundo-senegal.webp');
    cy.get('#albumGrid img').should('have.length', 7);
    cy.get('#albumGrid .selecao img').should('have.attr', 'alt', 'Figurinha 1');
  });
});