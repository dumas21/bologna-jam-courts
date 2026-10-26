const LoginPurposeInfo = () => (
  <div className="mb-6 border-2 border-primary/60 rounded-lg p-3 bg-background/60">
    <p className="font-press-start text-[10px] text-primary mb-2">A COSA SERVE L'ACCESSO?</p>
    <p className="text-xs text-muted-foreground mb-2">
      Puoi consultare campi, mappa e meteo senza account. Il login serve solo per:
    </p>
    <ul className="text-xs text-foreground space-y-1">
      <li>💬 Scrivere nella chat dei campi</li>
      <li>⭐ Dare le stelle ai campi</li>
      <li>📍 Segnare la tua presenza al campo</li>
      <li>📝 Segnalare modifiche all'admin (luci, correzioni)</li>
    </ul>
  </div>
);

export default LoginPurposeInfo;
