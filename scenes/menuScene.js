// ============================================================
// CLOSE THE SKY — menuScene.js
// Main menu — mode selection.
// Thin wrapper around TabletUI — menu template.
// ============================================================

class MenuScene {
  constructor(canvas, ctx, onSelect) {
    this.canvas   = canvas;
    this.ctx      = ctx;
    this.onSelect = onSelect;

    this._tablet = new TabletUI(
      canvas, ctx,
      'menu',
      {
        title:    'CLOSE THE SKY',
        subtitle: 'Hold up the shield of truth\nto stop the fiery arrows of the evil',
        footer: [
          { label: 'CAMPAIGN', style: 'primary',   action: () => onSelect('campaign') },
          { label: 'ARCADE',   style: 'primary',   action: () => onSelect('arcade')   },
          { label: 'SETTINGS', style: 'secondary', action: () => {}                   },
        ],
      }
    );
  }

  // ----------------------------------------------------------
  // LIFECYCLE — delegate to TabletUI
  // ----------------------------------------------------------
  update(dt) { this._tablet.update(dt); }
  draw(ctx)  { this._tablet.draw(ctx);  }

  destroy() {
    this._tablet.destroy();
  }
}
