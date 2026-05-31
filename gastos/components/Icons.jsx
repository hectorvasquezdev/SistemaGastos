export default function Icon({ name, size = 20, stroke = 1.75, color = 'currentColor', fill = 'none', style, ...rest }) {
  const paths = {
    home:     'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5',
    plus:     'M12 5v14M5 12h14',
    wallet:   'M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2H3Zm0 0v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M16 12h4v4h-4a2 2 0 0 1 0-4Z',
    list:     'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    target:   'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.2a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z',
    cash:     'M2.5 7.5h19v9h-19zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5.5 7.5v9M18.5 7.5v9',
    upload:   'M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    report:   'M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm9 0v5h5M9 13h6M9 17h4',
    trophy:   'M7 4h10v3a5 5 0 0 1-10 0V4ZM7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 14.5h6M12 11v4M9.5 20.5h5M10 17.5h4',
    bell:     'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 19a2 2 0 0 0 4 0',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.5-3a8.5 8.5 0 0 0-.13-1.45l1.7-1.3-1.7-3-2 .8a8 8 0 0 0-2.5-1.45L15.5 2.5h-3l-.37 2.1a8 8 0 0 0-2.5 1.45l-2-.8-1.7 3 1.7 1.3a8.5 8.5 0 0 0 0 2.9l-1.7 1.3 1.7 3 2-.8a8 8 0 0 0 2.5 1.45L12.5 21.5h3l.37-2.1a8 8 0 0 0 2.5-1.45l2 .8 1.7-3-1.7-1.3c.08-.48.13-.96.13-1.45Z',
    logout:   'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h11',
    moon:     'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z',
    sun:      'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M5 5l1.5 1.5M17.5 17.5 19 19M2 12h2M20 12h2M5 19l1.5-1.5M17.5 6.5 19 5',
    search:   'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
    edit:     'M4 20h4L19 9a2 2 0 0 0-3-3L5 17v3ZM14.5 6.5l3 3',
    trash:    'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    check:    'M5 13l4 4L19 7',
    x:        'M6 6l12 12M18 6 6 18',
    chevL:    'M14 6l-6 6 6 6',
    chevR:    'M10 6l6 6-6 6',
    chevD:    'M6 9l6 6 6-6',
    arrowUp:  'M12 19V5m0 0-6 6m6-6 6 6',
    arrowDown:'M12 5v14m0 0 6-6m-6 6-6-6',
    bulb:     'M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.6.5-1 1.2-1 2v.1H9.5v-.1c0-.8-.4-1.5-1-2A6 6 0 0 1 12 3Z',
    pie:      'M12 3v9h9a9 9 0 1 0-9 9 9 9 0 0 0 9-9',
    bars:     'M5 21V11M12 21V4M19 21v-7',
    coins:    'M9 8.5a5 4 0 1 0 0-1.5M15 15.5a5 4 0 1 0-6-3.9M4 8.5v6c0 1.4 2.2 2.5 5 2.5M10 11.6v6c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-6',
    calendar: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4 9.5h16M8 3v4M16 3v4',
    tag:      'M4 12V5a1 1 0 0 1 1-1h7l8 8-8 8-8-8Zm4-4.5h.01',
    user:     'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
    lock:     'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1ZM8 11V8a4 4 0 0 1 8 0v3',
    mail:     'M3 6h18v12H3zM3 7l9 6 9-6',
    eye:      'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    download: 'M12 4v10m0 0 4-4m-4 4-4-4M5 18h14',
    menu:     'M4 7h16M4 12h16M4 17h16',
    info:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-9v4m0-7.5h.01',
    sparkle:  'M12 3v6M12 15v6M3 12h6M15 12h6M6.5 6.5l3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3',
  };
  const d = paths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flex:'none', display:'block', ...style }} {...rest}>
      <path d={d} />
    </svg>
  );
}
