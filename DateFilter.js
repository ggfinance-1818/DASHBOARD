import React, { useState } from 'react';

export default function DateFilter({ onApply }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const apply = () => onApply(start, end);
  const clear = () => { setStart(''); setEnd(''); onApply('', ''); };

  return (
    <div className="date-filter">
      <label>FROM</label>
      <input type="date" value={start} onChange={e => setStart(e.target.value)} />
      <label>TO</label>
      <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
      <button className="btn-apply" onClick={apply}>Apply</button>
      <button className="btn-clear" onClick={clear}>Clear</button>
    </div>
  );
}
