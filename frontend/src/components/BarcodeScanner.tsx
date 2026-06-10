import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, ScanLine } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-scanner');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      },
      (decodedText) => {
        onScan(decodedText);
        scanner.stop().catch(() => {});
        onClose();
      },
      () => {}
    ).catch((err) => {
      setError('Camera access denied or unavailable. Please enter the code manually.');
      setScanning(false);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
      <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-black text-white font-display mb-4 flex items-center gap-2">
          <ScanLine size={18} className="text-cyan-400" />
          Scan Barcode
        </h3>

        {error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        ) : (
          <div className="relative">
            <div id="barcode-scanner" className="w-full aspect-video rounded-xl overflow-hidden bg-black/50" />
            <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1 bg-cyan-400/40 animate-pulse rounded-full" />
            <p className="text-[10px] text-gray-400 text-center mt-3">Align barcode within the frame</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs mt-4 hover:bg-white/10 transition-all"
        >
          Cancel & Enter Manually
        </button>
      </div>
    </div>
  );
}
