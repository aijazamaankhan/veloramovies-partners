import { Modal } from '../ui';

const GROUPS: { title: string; rows: [string[], string][] }[] = [
  {
    title: 'Navigate',
    rows: [
      [['←', '↑', '↓', '→'], 'Move focus (also the TV remote D-pad)'],
      [['Enter'], 'Select / open'],
      [['Esc'], 'Back / close'],
      [['/'], 'Search'],
      [['Alt', '1–8'], 'Jump to a section'],
      [['T'], 'Toggle TV layout'],
      [['?'], 'Show this help'],
    ],
  },
  {
    title: 'Player',
    rows: [
      [['Space', 'K'], 'Play / pause'],
      [['←', '→'], 'Seek 10 seconds (controls hidden)'],
      [['J', 'L'], 'Seek back / forward 10 seconds'],
      [['↑', '↓'], 'Show controls'],
      [['-', '+'], 'Volume'],
      [['M'], 'Mute'],
      [['C'], 'Subtitles on / off'],
      [['F'], 'Fullscreen'],
      [['N', 'P'], 'Next / previous episode'],
    ],
  },
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard & remote shortcuts" description="Everything in VibeVault works with a keyboard or a TV remote." size="md">
      <div className="shortcuts">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3 className="eyebrow">{g.title}</h3>
            <dl>
              {g.rows.map(([keys, label]) => (
                <div key={label} className="shortcuts__row">
                  <dt>
                    {keys.map((k) => (
                      <kbd key={k} className="kbd">
                        {k}
                      </kbd>
                    ))}
                  </dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Modal>
  );
}
