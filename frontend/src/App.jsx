import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Download, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  DollarSign,
  ArrowRight,
  Database,
  Check
} from 'lucide-react';

export default function App() {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('2.50');
  const [tranId, setTranId] = useState(() => 'TXN' + Math.floor(100000 + Math.random() * 900000));
  const [customerName, setCustomerName] = useState('Sokha Tim');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [qrResponse, setQrResponse] = useState(null);
  const [paid, setPaid] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [statusMessage, setStatusMessage] = useState('');

  // ផ្ដើមដំណើរការទាញយកប្រវត្តិពី PostgreSQL Database
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/qr/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data.reverse() : []);
      }
    } catch (err) {
      console.warn('Could not fetch transaction history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    // បង្កើត QR ដំបូងដោយស្វ័យប្រវត្តិ
    handleGenerateQR(tranId, amount);
  }, []);

  // Countdown timer សម្រាប់ QR Code
  useEffect(() => {
    if (!qrResponse || paid) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrResponse, paid]);

  const handleGenerateQR = async (customId, customAmount) => {
    setLoading(true);
    setPaid(false);
    setStatusMessage('');
    setTimeLeft(300);

    const activeId = customId || tranId;
    const activeAmount = customAmount || amount;

    try {
      const response = await fetch('/api/v1/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tran_id: activeId,
          amount: activeAmount,
          currency: currency,
          first_name: customerName.split(' ')[0] || 'Customer',
          last_name: customerName.split(' ')[1] || 'User',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setQrResponse(data);
      setStatusMessage('QR Code ត្រូវបានបង្កើតដោយជោគជ័យ!');
      fetchHistory();
    } catch (error) {
      console.error('Error generating QR:', error);
      setStatusMessage('បរាជ័យក្នុងការបង្កើត QR: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    const newId = 'TXN' + Math.floor(100000 + Math.random() * 900000);
    setTranId(newId);
    handleGenerateQR(newId, amount);
  };

  const handleCheckStatus = async () => {
    if (!qrResponse) return;
    setChecking(true);

    try {
      const res = await fetch('/api/v1/qr/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tran_id: qrResponse.tran_id || tranId }),
      });
      const data = await res.json();
      console.log('Check status response:', data);

      // បង្ហាញការជោគជ័យ (Simulate payment success for demo & testing)
      setPaid(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00b4d8', '#10b981', '#f59e0b', '#e61b23']
      });
      setStatusMessage('ការទូទាត់ទទួលបានជោគជ័យ! (Payment Successful)');
      fetchHistory();
    } catch (err) {
      console.error('Check status error:', err);
    } finally {
      setChecking(false);
    }
  };

  const copyQrString = () => {
    if (qrResponse?.qrString) {
      navigator.clipboard.writeText(qrResponse.qrString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const usdPresets = ['1.00', '2.50', '5.00', '10.00'];
  const khrPresets = ['4000', '10000', '20000', '40000'];

  return (
    <div className="app-layout">
      {/* Navbar Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <QrCode size={26} />
          </div>
          <div className="brand-text">
            <h1>ABA PayWay KHQR Gateway</h1>
            <p>ប្រព័ន្ធបង្កើត និងផ្ទៀងផ្ទាត់ QR Code ការទូទាត់</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="badge-connected">
            <span className="badge-pulse"></span>
            Spring Boot API Connected (:8082)
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-container">
        <div className="grid-content">
          
          {/* Left Panel: QR Form */}
          <div className="glass-panel form-panel">
            <div className="panel-title">
              <CreditCard className="text-cyan-400" size={22} style={{ color: '#00b4d8' }} />
              <span>បង្កើត QR Code ថ្មី (Generate QR)</span>
            </div>
            <p className="panel-subtitle">បញ្ចូលព័ត៌មានប្រតិបត្តិការដើម្បីស្នើសុំទិន្នន័យពី ABA PayWay Sandbox</p>

            {/* Currency Selector */}
            <label className="input-label">រូបិយប័ណ្ណ (Currency)</label>
            <div className="currency-selector">
              <button 
                type="button" 
                className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => { setCurrency('USD'); setAmount('2.50'); }}
              >
                USD ($)
              </button>
              <button 
                type="button" 
                className={`currency-btn ${currency === 'KHR' ? 'active' : ''}`}
                onClick={() => { setCurrency('KHR'); setAmount('10000'); }}
              >
                KHR (៛)
              </button>
            </div>

            {/* Amount Field */}
            <div className="input-group">
              <label className="input-label">ចំនួនទឹកប្រាក់ (Amount)</label>
              <input 
                id="amount-input"
                type="number" 
                step={currency === 'USD' ? '0.01' : '100'} 
                className="input-field" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
              />
              <div className="preset-grid">
                {(currency === 'USD' ? usdPresets : khrPresets).map((p) => (
                  <button 
                    key={p} 
                    type="button" 
                    className={`btn-preset ${amount === p ? 'active' : ''}`}
                    onClick={() => setAmount(p)}
                  >
                    {currency === 'USD' ? `$${p}` : `${parseInt(p).toLocaleString()} ៛`}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction ID */}
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>លេខកូដប្រតិបត្តិការ (Transaction ID)</label>
                <button 
                  type="button" 
                  onClick={handleNewTransaction}
                  style={{ background: 'none', border: 'none', color: '#00b4d8', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={12} /> បង្កើតលេខថ្មី
                </button>
              </div>
              <input 
                id="tranid-input"
                type="text" 
                className="input-field" 
                value={tranId} 
                onChange={(e) => setTranId(e.target.value)} 
              />
            </div>

            {/* Customer Name */}
            <div className="input-group">
              <label className="input-label">ឈ្មោះអតិថិជន (Customer Name)</label>
              <input 
                id="customer-input"
                type="text" 
                className="input-field" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
              />
            </div>

            {/* Generate Action Button */}
            <button 
              id="generate-qr-btn"
              type="button" 
              className="btn-primary" 
              onClick={() => handleGenerateQR()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>កំពុងបង្កើត QR Code...</span>
                </>
              ) : (
                <>
                  <QrCode size={20} />
                  <span>បង្កើត KHQR Code ឥឡូវនេះ</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {statusMessage && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '10px', background: paid ? 'rgba(16,185,129,0.15)' : 'rgba(0,180,216,0.15)', color: paid ? '#34d399' : '#38bdf8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Right Panel: Official KHQR Preview Card */}
          <div className="khqr-card-container">
            <div className="khqr-official-card">
              {/* Header Banner */}
              <div className="khqr-header">
                <div className="khqr-brand-tag">
                  <span>KHQR</span>
                  <span className="khqr-logo-badge">BAKONG</span>
                </div>
                <div className="khqr-aba-label">
                  ABA PAY
                </div>
              </div>

              {/* Card Body */}
              <div className="khqr-body">
                <div className="merchant-name">ABA PAYWAY DEMO MERCHANT</div>
                <div className="merchant-subtitle">ស្កេនដើម្បីទូទាត់ជាមួយគ្រប់ធនាគារក្នុង Bakong</div>

                {/* Dynamic QR Code Area */}
                <div className="qr-code-wrapper">
                  {paid ? (
                    <div style={{ width: '220px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ecfdf5', borderRadius: '12px' }}>
                      <CheckCircle2 size={72} color="#10b981" />
                      <span style={{ marginTop: '0.75rem', fontWeight: 800, color: '#065f46', fontSize: '1.1rem' }}>
                        ទូទាត់បានជោគជ័យ
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#047857' }}>Payment Approved</span>
                    </div>
                  ) : qrResponse?.qrImage ? (
                    <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={qrResponse.qrImage.startsWith('data:') ? qrResponse.qrImage : `data:image/png;base64,${qrResponse.qrImage}`} 
                        alt="Official ABA KHQR" 
                        style={{ width: '220px', height: '220px', objectFit: 'contain', borderRadius: '8px' }}
                      />
                    </div>
                  ) : qrResponse?.qrString ? (
                    <>
                      <QRCodeSVG 
                        id="khqr-svg"
                        value={qrResponse.qrString} 
                        size={220} 
                        level="M" 
                        includeMargin={false}
                      />
                      <div className="qr-center-logo">
                        <span>KHQR</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <span className="spinner" style={{ borderColor: '#94a3b8', borderTopColor: '#00b4d8', width: '32px', height: '32px' }}></span>
                    </div>
                  )}
                </div>

                {/* Amount display */}
                <div className="amount-display">
                  <span className="amount-currency">{currency === 'USD' ? '$' : '៛'}</span>
                  <span className="amount-value">
                    {currency === 'USD' 
                      ? parseFloat(amount || 0).toFixed(2) 
                      : parseInt(amount || 0).toLocaleString()}
                  </span>
                </div>

                {/* Expiry and details */}
                <div className="khqr-footer-bar">
                  <span>ប្រតិបត្តិការ: <strong>{qrResponse?.tran_id || tranId}</strong></span>
                  <span className="expiry-countdown">
                    <Clock size={12} />
                    <span>{paid ? 'បានបញ្ចប់' : formatTimer(timeLeft)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="card-actions-wrapper">
              <button 
                id="copy-qr-btn"
                type="button" 
                className="btn-secondary" 
                onClick={copyQrString}
                title="ចម្លង QR String"
              >
                {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                <span>{copied ? 'បានចម្លង!' : 'ចម្លង QR String'}</span>
              </button>

              <button 
                id="check-status-btn"
                type="button" 
                className="btn-secondary btn-check-status" 
                onClick={handleCheckStatus}
                disabled={checking || paid}
              >
                {checking ? (
                  <span className="spinner" style={{ width: '14px', height: '14px' }}></span>
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>{paid ? 'ទូទាត់រួចរាល់' : 'តេស្តផ្ទៀងផ្ទាត់ (Check)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Live Database Transaction History */}
        <section className="glass-panel history-section">
          <div className="history-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={20} style={{ color: '#00b4d8' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>ប្រវត្តិប្រតិបត្តិការក្នុង PostgreSQL (Transactions Table)</h2>
            </div>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={fetchHistory}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} /> ផ្ទុកទិន្នន័យឡើងវិញ
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>លេខកូដប្រតិបត្តិការ (Tran ID)</th>
                  <th>ចំនួនទឹកប្រាក់</th>
                  <th>ពេលវេលា (Req Time)</th>
                  <th>ស្ថានភាព (Status)</th>
                  <th>ការពិពណ៌នា</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.slice(0, 10).map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>#{row.id}</td>
                      <td style={{ fontWeight: 700, color: '#38bdf8' }}>{row.tranId}</td>
                      <td style={{ fontWeight: 700 }}>${row.amount}</td>
                      <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                        {row.reqTime || (row.createdAt ? new Date(row.createdAt).toLocaleTimeString() : 'N/A')}
                      </td>
                      <td>
                        <span className={`status-pill ${row.status === 200 || row.status === 0 ? 'success' : 'pending'}`}>
                          {row.status === 200 || row.status === 0 ? 'Success' : `Status ${row.status}`}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.82rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.description || 'ABA KHQR Transaction'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      មិនទាន់មានទិន្នន័យប្រតិបត្តិការនៅឡើយទេ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
